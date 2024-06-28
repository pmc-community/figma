require 'jekyll'
require 'yaml'
require 'nokogiri'
require_relative "../../tools/modules/globals"
require_relative "../../tools/modules/file-utilities"
require 'text_rank'

module Jekyll

  class PageKeywordsGenerator < Generator
    safe true
    priority :high #must be after PageListGenerator from _plugins/generators/pages-gen.rb

    def generate(site)
      Globals.putsColText(Globals::PURPLE, "Generating keywords for pages ...")
      numPages = 0
      Globals.show_spinner do
        @site = site
        doc_contents_dir = File.join(site.source, Globals::DOCS_ROOT)
        doc_files = Dir.glob("#{doc_contents_dir}/**/*.{md,html}")
  
        mutex = Mutex.new # Mutex for thread-safe access to numPages and site.data['page_list']
  
        threads = doc_files.map do |file_path|
          Thread.new(file_path) do |path|
            next unless File.file?(path)
  
            content = File.read(path)
  
            if FileUtilities.valid_front_matter?(content)
              front_matter, content_body = FileUtilities.parse_front_matter(content)
  
              if front_matter['excerpt'].nil? || front_matter['excerpt'].strip.empty?
                rendered_content = FileUtilities.render_jekyll_page(site, path, front_matter, content_body)
                excerpt = generate_keywords(
                  rendered_content,
                  site.data['buildConfig']["autoExcerpt"]["keywords"],
                  site.data['buildConfig']["autoExcerpt"]["minKeywordLength"]
                )
  
                if front_matter["permalink"] && !front_matter["permalink"].empty? && excerpt.length > 0
                  mutex.synchronize do
                    pageList = JSON.parse(site.data['page_list'])
                    pageList.each do |obj|
                      if obj["permalink"] == front_matter["permalink"]
                        obj["excerpt"] = excerpt.join(", ")
                        break
                      end
                    end
                    site.data['page_list'] = pageList.to_json
                    numPages += 1
                  end
                end
                
              end
            end
          end
        end
  
        threads.each(&:join) # Wait for all threads to finish
      end
  
      Globals.moveUpOneLine
      Globals.clearLine
      Globals.putsColText(Globals::PURPLE, "Generating keywords for pages ... done (#{numPages} pages)")
    end

    private

    def generate_keywords(content, words, minLength)
      # Fully customized extraction:
      extractor = TextRank::KeywordExtractor.new(
        strategy:   :dense,  # Specify PageRank strategy (dense or sparse)
        damping:    0.95,     # The probability of following the graph vs. randomly choosing a new node
        tolerance:  0.00001,   # The desired accuracy of the results
        graph_strategy: :Coocurrence,
        tokenizers: [
          :Word,
          :Url
        ],
        rank_filters: [
          :CollapseAdjacent, 
          :NormalizeProbability, 
          :NormalizeUnitVector, 
          :SortByValue
        ],
        char_filters: [
          :AsciiFolding, 
          :Lowercase, 
          :StripHtml, 
          :StripEmail, 
          :UndoContractions
        ],
        token_filters: [
          :Stopwords, 
          TextRank::TokenFilter::PartOfSpeech.new(parts_to_keep: %w[nn nns])
        ]
      )
      
      # Perform the extraction with at most 100 iterations
      extractor.extract(content, max_iterations: 100)
        .select { |word, score| word.length > minLength }
        .sort_by { |word, score| -score }
        .first(words)
        .map(&:first)
    end
  end
end
