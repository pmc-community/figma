require_relative "../../tools/modules/globals"
require 'nokogiri'
require 'tf-idf-similarity'
require 'matrix'

module Jekyll

    class PageListGenerator < Generator
      safe true
      priority :high

      # HEADS UP!!!
      # THIS IS HOW TO GET ACCESS TO SITE CONFIG DATA FROM AN EXTERNAL FILE
      # THE FILE IS siteConfig.yml AND IS LOCATED IN _data FOLDER
      # content.index(site.data["siteConfig"]["marker404"])
  
      def generate(site)
        doc_contents_dir = File.join(site.source, Globals::DOCS_ROOT)
        documents = []
  
        Dir.glob(File.join(doc_contents_dir, '**', '*.{md,html}')).each do |file_path|
            
          # HEADS UP!!!
          # CONTENT MAY CONTAIN LIQUID TAGS WHICH ARE NOT YET REPLACED WITH VALUES 
          # AT THE TIME WHEN THIS PLUGIN RUNS, SO IS NOT ADVISABLE TO BE USED IN THE PLUGIN LOGIC 
          content = File.read(file_path)
          front_matter = {}
          if content =~ /^(---\s*\n.*?\n?)^(---\s*$\n?)/m
            front_matter = YAML.load(Regexp.last_match[1])
          end

          title = front_matter['title']
          permalink = front_matter['permalink']
          categories = front_matter['categories']
          tags = front_matter['tags']
          excerpt = front_matter['excerpt']
          lastUpdate = File.mtime(file_path)
          createTime = File.birthtime(file_path)

          document_data = {
            'title' => title,
            'permalink' => permalink,
            'categories' => categories || [],
            'tags' => tags || [],
            'excerpt' => excerpt || "",
            'lastUpdate' => lastUpdate || "",
            'createTime' => createTime || "",
            'relatedPages' => []
          } 
          
          documents << document_data if front_matter != {} && !file_path.index("404") && front_matter['layout'] && front_matter['layout'] == "page"
        end  
        site.data['page_list'] = documents.to_json
      end

    end
    
    class RelatedPagesGenerator < Generator
      safe true
      priority :medium
  
      def generate(site)
        @site = site
        documents = []
        front_matters = {}
  
        content_dir = Globals::DOCS_ROOT
        content_files = Dir.glob(File.join(site.source, content_dir, '**', '*.{md,html}'))
  
        content_files.each do |file_path|
          content = File.read(file_path)
          relative_path = Pathname.new(file_path).relative_path_from(Pathname.new(site.source)).to_s
          front_matter, content = parse_front_matter(content)
          
          next if front_matter.nil? || front_matter.empty?
  
          # Store the front matter separately
          front_matters[relative_path] = front_matter
  
          # Render the content with Liquid tags
          rendered_content = render_page_content(site, content, front_matter)
  
          # Extract text content
          text_content = Nokogiri::HTML(rendered_content).text
  
          # Create document for tf-idf-similarity
          documents << TfIdfSimilarity::Document.new(text_content, id: relative_path)
        end
  
        # Build TF-IDF model and similarity matrix
        model = TfIdfSimilarity::TfIdfModel.new(documents)
        similarity_matrix = model.similarity_matrix
  
        # Process each document for related pages
        content_files.each do |file_path|
          relative_path = Pathname.new(file_path).relative_path_from(Pathname.new(site.source)).to_s
          page_document = documents.find { |doc| doc.id == relative_path }
  
          next if page_document.nil?
  
          related_pages = find_related_pages(content_files, relative_path, model, page_document, similarity_matrix, front_matters) 
          add_related_pages(site, relative_path, related_pages)
          
        end
      end
  
      def parse_front_matter(content)
        if content =~ /\A(---\s*\n.*?\n?)^((---|\.\.\.)\s*$\n?)/m
          front_matter = YAML.safe_load($1)
          content = $'
          [front_matter, content]
        else
          [nil, content]
        end
      end
  
      def render_page_content(site, content, front_matter)
        layout = (front_matter['layout'] && site.layouts[front_matter['layout']]) ? site.layouts[front_matter['layout']] : nil
        payload = site.site_payload.merge({ 'page' => front_matter, 'paginator' => nil })
        info = { :filters => [Jekyll::Filters], :registers => { :site => site, :page => front_matter } }
  
        content = site.liquid_renderer.file(front_matter['path']).parse(content).render!(payload, info)
        layout ? site.liquid_renderer.file(layout.path).parse(layout.content).render!(payload.merge({ 'content' => content }), info) : content
      end
  
      def find_related_pages(content_files, page_path, model, page_document, similarity_matrix, front_matters)
        related_by_tags_categories = content_files.select do |other_file|
          next if other_file == page_path
  
          other_relative_path = Pathname.new(other_file).relative_path_from(Pathname.new(@site.source)).to_s
          other_page_front_matter = front_matters[other_relative_path]
          next if other_page_front_matter.nil?
  
          common_tags = (Array(front_matters[page_document.id]['tags']) & Array(other_page_front_matter['tags'])).size
          common_categories = (Array(front_matters[page_document.id]['categories']) & Array(other_page_front_matter['categories'])).size
  
          common_tags + common_categories > 0
        end
  
        index = model.documents.index(page_document)
        related_by_text = model.documents.each_with_index.map { |doc, i| [doc, similarity_matrix[index, i]] }
        related_by_text.reject! { |doc, _| doc.id == page_path }
        related_by_text.sort_by! { |_, similarity| -similarity }
  
        # Merge and sort by relevance
        (related_by_tags_categories + related_by_text.map { |doc, _| content_files.find { |p| p == doc.id } }).uniq.compact.sort_by do |related_page|
          other_relative_path = Pathname.new(related_page).relative_path_from(Pathname.new(@site.source)).to_s
          other_front_matter = front_matters[other_relative_path]
          next unless other_front_matter
  
          -(common_tags_count(front_matters[page_document.id], other_front_matter) + 
            common_categories_count(front_matters[page_document.id], other_front_matter) + 
            text_similarity_score(model, page_document, other_relative_path, similarity_matrix))
        end.compact
      end
  
      def common_tags_count(page_front_matter, other_page_front_matter)
        (Array(page_front_matter['tags']) & Array(other_page_front_matter['tags'])).size
      end
  
      def common_categories_count(page_front_matter, other_page_front_matter)
        (Array(page_front_matter['categories']) & Array(other_page_front_matter['categories'])).size
      end
  
      def text_similarity_score(model, page_document, related_page, similarity_matrix)
        index_page = model.documents.index(page_document)
        related_page_document = model.documents.find { |doc| doc.id == related_page }
        return 0 if index_page.nil? || related_page_document.nil?
  
        index_related_page = model.documents.index(related_page_document)
        return 0 if index_related_page.nil?
  
        similarity_matrix[index_page, index_related_page]
      end
  
      def add_related_pages(site, page_path, related_pages)
        front_matter, _ = parse_front_matter(File.read(page_path)) || {}
        if (front_matter == {}) 
          return 
        end

        if (!front_matter["permalink"] || front_matter["permalink"] == "") 
          return
        end

        if (!related_pages || related_pages.length == 0 )
          return
        end

        related_pages_permalinks = []
        related_pages.each do |page|
          front_matter_rel_page, _ = parse_front_matter(File.read(page)) || {}
          permalink_rel_page = front_matter_rel_page["permalink"] || ""
          related_pages_permalinks << permalink_rel_page
        end

        related_pages_permalinks.delete(front_matter["permalink"])
        related_pages_permalinks = related_pages_permalinks.uniq.compact

        related_pages_obj = []
        related_pages_permalinks.each do |permalink|
          title = find_object_by_permalink(JSON.parse(site.data['page_list']), permalink)["title"] || ""
          rel_page_data = {
            "title" => title,
            "permalink" => permalink
          } 
          related_pages_obj << rel_page_data
        end

        pageList = JSON.parse(site.data['page_list'])
        pageList.each do |obj|
          if obj["permalink"] == front_matter["permalink"]
            obj["relatedPages"] = related_pages_obj
            break
          end
        end

        site.data['page_list'] = pageList.to_json
      end

      def find_object_by_permalink(array, permalink)
        array.find { |item| item["permalink"] == permalink }
      end

    end

  end
  