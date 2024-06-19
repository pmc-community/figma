require_relative "../../tools/modules/globals"
require_relative "../../tools/modules/file-utilities"
require 'nokogiri'
require 'tf-idf-similarity'
require 'matrix'


module Jekyll

    class PageListGenerator < Generator
      safe true
      priority :highest

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
      priority :normal #must be after PageKeyordsGenerator from _plugins/generators/page-keywords-gen.rb
  
      def generate(site)
        @site = site
        documents = []
        front_matters = {}
  
        content_dir = Globals::DOCS_ROOT
        content_files = Dir.glob(File.join(site.source, content_dir, '**', '*.{md,html}'))
  
        content_files.each do |file_path|
          content = File.read(file_path)
          relative_path = Pathname.new(file_path).relative_path_from(Pathname.new(site.source)).to_s
          front_matter, content = FileUtilities.parse_front_matter(content)
          
          next if front_matter.nil? || front_matter.empty?
  
          # Store the front matter separately
          front_matters[relative_path] = front_matter
  
          # Render the content with Liquid tags
          rendered_content = FileUtilities.render_jekyll_page(site, file_path, front_matter, content)
  
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
  
          related_pages = find_related_pages(site, content_files, relative_path, model, page_document, similarity_matrix, front_matters) 
          add_related_pages(site, relative_path, related_pages)
          
        end
      end
    
      def find_related_pages(site, content_files, page_path, model, page_document, similarity_matrix, front_matters)
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
  
          -(
            site.data['siteConfig']["relatedPages"]["tf_idf_weigths"]["keywords"] * common_keywords_count(front_matters[page_document.id], other_front_matter) +
            site.data['siteConfig']["relatedPages"]["tf_idf_weigths"]["tags"] * common_tags_count(front_matters[page_document.id], other_front_matter) + 
            site.data['siteConfig']["relatedPages"]["tf_idf_weigths"]["cats"] * common_categories_count(front_matters[page_document.id], other_front_matter) + 
            site.data['siteConfig']["relatedPages"]["tf_idf_weigths"]["content"] * text_similarity_score(model, page_document, other_relative_path, similarity_matrix)
          )
            
        end.compact

      end
  
      def common_tags_count(page_front_matter, other_page_front_matter)
        (Array(page_front_matter['tags']) & Array(other_page_front_matter['tags'])).size
      end

      def common_keywords_count(page_front_matter, other_page_front_matter)
        page_keywords = page_front_matter['excerpt'].nil? || page_front_matter['excerpt'].strip.empty? ? 
          [] : 
          page_front_matter['excerpt'].split(", ")

        other_page_keywords = other_page_front_matter['excerpt'].nil? || other_page_front_matter['excerpt'].strip.empty? ? 
          [] : 
          other_page_front_matter['excerpt'].split(", ")

        (page_keywords & other_page_keywords).size
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
        front_matter, _ = FileUtilities.parse_front_matter(File.read(page_path)) || {}
        if (front_matter == {}) 
          return 
        end

        if (!front_matter["permalink"] || front_matter["permalink"] == "") 
          return
        end

        if (!related_pages || related_pages.length == 0 )
          return
        end

        relPageNo = site.data['siteConfig']["relatedPages"]["relPagesNo"]
        related_pages = related_pages.length > relPageNo ? related_pages.take(relPageNo) : related_pages;
        related_pages_permalinks = []
        related_pages.each do |page|
          front_matter_rel_page, _ = FileUtilities.parse_front_matter(File.read(page)) || {}
          permalink_rel_page = front_matter_rel_page["permalink"] || ""
          related_pages_permalinks << permalink_rel_page
        end

        related_pages_permalinks.delete(front_matter["permalink"])
        related_pages_permalinks = related_pages_permalinks.uniq.compact

        related_pages_obj = []
        related_pages_permalinks.each do |permalink|
          title = Globals.find_object_by_multiple_key_value(JSON.parse(site.data['page_list']), {"permalink" => permalink})["title"] || ""
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

    end

  end
  