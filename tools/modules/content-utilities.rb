require 'net/http'
require 'kramdown'

module ContentUtilities

    def self.getExternalContentFromGitHub(file_info)
        raw_url = "https://raw.githubusercontent.com/#{file_info["owner"]}/#{file_info["repo"]}/#{file_info["branch"]}/#{file_info["file_path"]}"
        
        uri = URI.parse(raw_url)

        request = Net::HTTP::Get.new(uri)
        request.basic_auth(ENV["JEKYLL_GIT_USER"], ENV["JEKYLL_ACCESS_TOKEN"])

        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
            http.request(request)
        end

        if response.is_a?(Net::HTTPSuccess)
            markdown_content = file_info["ignore_wp_shortcodes"] ? 
                getContentBetweenMarkers(
                    response.body.gsub(/\[.*?\](?!\(https?:\/\/.*?\)|\(http:\/\/.*?\))/, ''), 
                    file_info["start_marker"], 
                    file_info["end_marker"]
                ).force_encoding('UTF-8') : 
                getContentBetweenMarkers(
                    response.body, 
                    file_info["start_marker"], 
                    file_info["end_marker"]
                ).force_encoding('UTF-8')
            
            html_content = Kramdown::Document.new(markdown_content).to_html
            return html_content
        else
            return "Error: #{response.code} - #{response.message} - #{raw_url}"
        end

    end

    def self.getExternalSiteContent(file_info)
        file = "#{Globals::DOCS_DIR}#{file_info["file_path"]}"
        if File.exist?(file)
            content = getContentBetweenMarkers(Globals.removeFrontMatter(File.read(file)),file_info["start_marker"], 
            file_info["end_marker"]).force_encoding('UTF-8')
            return content
          else
            return "Error getting file: #{file_info["file_path"]}"
        end
    end


    def self.getContentBetweenMarkers(content, start_marker, end_marker)
        if (start_marker == "" || end_marker == "")
            return "Start and/or End markers are wrong! Cannot return anything."
        elsif (start_marker == "fullFile" && end_marker == "fullFile")
            return content
        elsif
            regex = /#{Regexp.escape(start_marker)}(.*?)#{Regexp.escape(end_marker)}/m
            match_data = content.match(regex)
            if match_data
                return match_data[1]
              else
                return "Start and/or End markers are wrong! Cannot return anything."
            end
        end
    end

end