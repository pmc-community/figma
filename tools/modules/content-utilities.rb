require 'net/http'
require 'kramdown'

module ContentUtilities

    def self.getExternalContentFromGitHub(owner, repo, branch, file_path, ignore_wp_shortcodes)
        username = ENV["JEKYLL_GIT_USER"]
        password = ENV["JEKYLL_ACCESS_TOKEN"]
        raw_url = "https://raw.githubusercontent.com/#{owner}/#{repo}/#{branch}/#{file_path}"
        
        uri = URI.parse(raw_url)

        request = Net::HTTP::Get.new(uri)
        request.basic_auth(username, password)

        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
        http.request(request)
        end

        if response.is_a?(Net::HTTPSuccess)
    
            markdown_content = ignore_wp_shortcodes ?response.body.gsub(/\[[^\]]+\]/, '') : response.body
            html_content = Kramdown::Document.new(markdown_content).to_html
            return html_content
        else
            return "Error: #{response.code} - #{response.message} - #{raw_url}"
        end



    end
end