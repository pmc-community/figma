require_relative "../../tools/modules/globals"
require_relative "../../tools/modules/file-utilities"
require 'open3'

module Jekyll

    class PageSummaryAllInOneStep < Generator
      safe true
      priority :normal
  
        def generate(site)
            if (site.data['buildConfig']["pyEnable"] && site.data['buildConfig']["pyPageSummary"]["allInOneStep"])
                Globals.putsColText(Globals::PURPLE,"Generating summaries ... ")
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
                        Globals.putsColText(Globals::PURPLE,"-Generating raw content ... #{front_matter["permalink"]}")
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
                    Globals.putsColText(Globals::PURPLE,"-Generating raw content ... done (#{numPages} pages)")
                end

                Globals.show_spinner do
                    json_input = { "pageList" => site.data['page_list'] }.to_json
                    python_script = "python3 tools_py/page-summary/summary-aio.py '#{json_input}'"

                    Open3.popen3(python_script) do |stdin, stdout, stderr, wait_thr|
                        stdout.each do |line|
                            begin
                                response = JSON.parse(line)
                                Globals.clearLine
                                Globals.putsColText(
                                    Globals::YELLOW,
                                    "-permalink: #{response["payload"]["permalink"]}, summary: #{response["payload"]["summary"]}"
                                )

                            rescue JSON::ParserError => e
                                puts "Failed to parse JSON returned by tools_py/page-summary/summary-aio.py: #{e.message}"
                            end
                        end
                
                        exit_status = wait_thr.value
                        unless exit_status.success?
                            puts "Error running tools_py/page-summary/summary-aio.py: #{stderr.read}"
                        end
                    end
                end
                Globals.clearLine
            end        
        end
    end

end  