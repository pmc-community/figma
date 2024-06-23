require_relative "../../tools/modules/globals"
require_relative "../../tools/modules/file-utilities"
require 'open3'

module Jekyll

    class PageSummaryAllInOneStep < Generator
      safe true
      priority :normal
  
        def generate(site)
            if (site.data['buildConfig']["pyEnable"] && site.data['buildConfig']["pyPageSummary"]["allInOneStep"])
                doc_contents_dir = File.join(site.source, Globals::DOCS_ROOT)
                FileUtilities.create_empty_folder (site.data['buildConfig']["rawContentFolder"])
                Dir.glob(File.join(doc_contents_dir, '**', '*.{md, html}')).each do |file_path|
                    front_matter, content = FileUtilities.parse_front_matter(File.read(file_path)) || {}
                    next if front_matter == {}
                    next if front_matter.nil? || front_matter.empty?
                    next if content.nil? || content.empty?
                    next if front_matter["permalink"].nil? || front_matter["permalink"].empty?
                    next if front_matter["title"].nil? || front_matter["title"].empty?
                    page = Globals.find_object_by_multiple_key_value(JSON.parse(site.data['page_list']), {"permalink" => front_matter["permalink"]}) || {}
                    next if page.nil? || page == {}
                    Globals.putsColText(Globals::PURPLE,"Generating raw content for #{front_matter["permalink"]}")
                    Globals.show_spinner do
                        rendered_content = FileUtilities.render_jekyll_page(site, file_path, front_matter, content)
                        text_content = Nokogiri::HTML(rendered_content).text
                        FileUtilities.clear_or_create_file("#{site.data["buildConfig"]["rawContentFolder"]}/#{front_matter["permalink"].gsub("/", "_")}.txt")
                        FileUtilities.write_file("#{site.data["buildConfig"]["rawContentFolder"]}/#{front_matter["permalink"].gsub("/", "_")}.txt", text_content)
                    end
                    print "\b" # clear whatever spinner character is visible
                    
                end

            end
            
        end
    end
end  