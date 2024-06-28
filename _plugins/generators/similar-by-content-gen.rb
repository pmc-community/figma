require_relative "../../tools/modules/globals"
require_relative "../../tools/modules/file-utilities"
require 'open3'

module Jekyll

    class PageSimilarByContent < Generator
      safe true
      priority :high
  
        def generate(site)

            # GENERATE SIMILAR BY CONTENT
            if (site.data['buildConfig']["pyEnable"] && site.data['buildConfig']["pySimilarPagesByContent"]["enable"])
                
                modified_files = FileUtilities.read_json_file("#{site.data['buildConfig']["rawContentFolder"]}/modified_files.json")["files"]
                return if !modified_files
                if (modified_files.length == 0)
                    Globals.putsColText(Globals::PURPLE,"Generating similar by content ... nothing to do! (no content changes)")
                    
                else

                    Globals.putsColText(Globals::PURPLE,"Generating similar by content ... because #{modified_files.length} pages changed")
                    # SUMMARIES
                    Globals.show_spinner do
                        json_input = { "pageList" => site.data['page_list'] }
                        python_script = site.data["buildConfig"]["pySimilarPagesByContent"]["script"]

                        page_similarByContent_callback = Proc.new do |python_script_response|
                            permalink = python_script_response["payload"]["payload"]["permalink"]
                            pageNo = python_script_response["outputNo"]
                            Globals.clearLine
                            Globals.putsColText( Globals::PURPLE, "- PERMALINK: #{permalink} ... done (#{pageNo})")
                        end

                        Globals.run_python_script(site, python_script, json_input, page_similarByContent_callback)
                    end
                
                    Globals.clearLine
                end
            end

            # UPDATE PAGE LIST
            autoSimilar = [];
            autoSimilar_path = "#{site.data["buildConfig"]["rawContentFolder"]}/autoSimilar.json"
            return if !File.exist?(autoSimilar_path)
            autoSimilar = File.read(autoSimilar_path)
            begin
                autoSimilar_json = JSON.parse(autoSimilar)
            rescue
                Globals.putsColText(Globals::RED, "- Cannot parse #{site.data["buildConfig"]["rawContentFolder"]}/autoSimilar.json")
            end
            pageList = JSON.parse(site.data['page_list'])
            autoSimilar = autoSimilar_json
            autoSimilar.each do |pageObj|
                pageList.each do |page|
                    if page["permalink"] == pageObj["permalink"]
                        similarPages = []
                        pageObj["similarFiles"].each do |similarPage|
                            similarPageObj =  Globals.find_object_by_multiple_key_value(
                                JSON.parse(site.data['page_list']), 
                                {"permalink" => similarPage}
                            ) || {}
                            
                            if (similarPageObj != {})
                                similarPages << {
                                    "permalink" => similarPageObj["permalink"],
                                    "title" => similarPageObj["title"]
                                }
                                
                            end
                        end
                        page["similarByContent"] = similarPages
                        break
                    end
                end
            end
            site.data['page_list'] = pageList.to_json

        end
    end

end  