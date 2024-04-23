
module Jekyll

    class PageListGenerator < Generator
        priority :high
        
        def generate(site)
            page_urls = []
            doc_contents_dir = File.join(site.source, 'doc-contents')
            generate_page_list(doc_contents_dir, page_urls)
            site.data['page_urls_json'] = page_urls.to_json
        end

        private

        def generate_page_list(dir, page_urls)
            Dir.foreach(dir) do |entry|
                next if entry == '.' || entry == '..'

                full_path = File.join(dir, entry)
                if File.directory?(full_path)
                    generate_page_list(full_path, page_urls)
                elsif File.extname(entry) == '.md' && valid_front_matter?(full_path)
                    page_urls << full_path.sub("#{Dir.getwd}/", '')
                end
            end
        end

        def valid_front_matter?(file_path)
            content = File.read(file_path)
            !!content.match(/^\s*---\s*\n.*?\n?(\s*---\s*$\n?)/m)
        end
    end  

end