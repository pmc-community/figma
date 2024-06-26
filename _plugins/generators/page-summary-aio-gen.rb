require_relative "../../tools/modules/globals"
require_relative "../../tools/modules/file-utilities"
require 'open3'

module Jekyll

    class PageSummaryAllInOneStep < Generator
      safe true
      priority :high
  
        def generate(site)
            if (site.data['buildConfig']["pyEnable"] && site.data['buildConfig']["pyPageSummary"]["allInOneStep"])
                Globals.putsColText(Globals::PURPLE,"Generating summaries ... ")
                
                # RAW CONTENT
                Globals.show_spinner do
                    doc_contents_dir = File.join(site.source, Globals::DOCS_ROOT)
                    FileUtilities.create_empty_folder (site.data['buildConfig']["rawContentFolder"])
                    Globals.newLine
                    numPages = 0
                    Dir.glob(File.join(doc_contents_dir, '**', '*.{md, html}')).each do |file_path|
                        front_matter, content = FileUtilities.parse_front_matter(File.read(file_path)) || {}
                        next if front_matter == {}
                        next if front_matter.nil? || front_matter.empty?
                        next if content.nil? || content.empty?
                        next if front_matter["permalink"].nil? || front_matter["permalink"].empty?
                        next if front_matter["title"].nil? || front_matter["title"].empty?
                        page = Globals.find_object_by_multiple_key_value(JSON.parse(site.data['page_list']), {"permalink" => front_matter["permalink"]}) || {}
                        next if page.nil? || page == {}
                        Globals.moveUpOneLine
                        Globals.putsColText(Globals::PURPLE,"- Generating raw content ... #{front_matter["permalink"]}")
                        Globals.show_spinner do
                            rendered_content = FileUtilities.render_jekyll_page(site, file_path, front_matter, content)

                            text_content = Globals.text_pre_process(Nokogiri::HTML(rendered_content).text)
                            FileUtilities.overwrite_file(
                                "#{site.data["buildConfig"]["rawContentFolder"]}/#{front_matter["permalink"].gsub("/", "_")}.txt", 
                                text_content
                            )
                            numPages +=1
                        end
                        Globals.clearLine # clear whatever spinner character is still visible   
                    end
                    Globals.moveUpOneLine
                    Globals.clearLine
                    Globals.putsColText(Globals::PURPLE,"- Generating raw content ... done (#{numPages} pages)")
                end

                # SUMMARIES
                autoSummaries = [];
                Globals.show_spinner do
                    json_input = { "pageList" => site.data['page_list'] }
                    python_script = site.data["buildConfig"]["pyPageSummary"]["allInOneStepScript"]

                    page_summary_callback = Proc.new do |python_script_response|
                        permalink = python_script_response["payload"]["payload"]["permalink"]
                        pageNo = python_script_response["outputNo"]
                        summary = python_script_response["payload"]["payload"]["summary"]
                        
                        autoSummaryObj = {
                            "permalink" => permalink,
                            "summary" => summary
                        }
                        autoSummaries << autoSummaryObj

                        Globals.clearLine
                        Globals.putsColText(
                            Globals::PURPLE,
                            "- PERMALINK: #{permalink} ... done (#{pageNo})"
                        )
                    
                    end

                    Globals.run_python_script(site, python_script, json_input, page_summary_callback)

                    pageList = JSON.parse(site.data['page_list'])
                    autoSummaries.each do |summary|
                        pageList.each do |page|
                            if page["permalink"] == summary["permalink"]
                                page["autoSummary"] = summary["summary"]
                                break
                            end
                        end
                    end
                    site.data['page_list'] = pageList.to_json
                end
                Globals.clearLine
            end        
        end
    end

end  