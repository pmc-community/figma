require_relative 'file-utilities'

module LinkUtilities

    def self.getPermalinks(docsFolder)
        permalinks = []
        Find.find(docsFolder) do |file|
        next unless file =~ /\.html$|\.md$/ # Only process .html or .md files
            contents = File.read(file)
            permalink = contents[/permalink: (.*)/, 1]
            permalinks << Globals.removeFirstAndLastSlash(permalink) if permalink
        end
        return permalinks
    end

    def self.scanFilesForLinks(folder)
        links = {}
        Find.find(folder) do |path|
          if path =~ /.*\.(html|md)$/
            links[path] = extract_links(path)
          end
        end
        return links
    end

    def self.extract_links(file)
        content = File.read(file)
        lnk = []
        content.scan(/\[([^\]]*)\]\(([^)]+)\)/) do |match|
          lnk << match[1] if match[1]
        end
        return lnk.uniq
    end

    def self.filterLinksToGetInternalOnly(links)
        links.each do |key, value|
            if value.is_a?(Array)
              value.reject! { |element| element.start_with?("https://") }
              links[key] = value
            end
        end
        return links
    end

    def self.filterLinksToRemoveSlashes(linksInPages)
        linksInPages.each do |page, links|
            modified_links = Globals.removeSlashesFromArrayElements(links)
            linksInPages[page] = modified_links.uniq
        end
        return linksInPages
    end

    def self.filterEmptyKeys(object)
        object.each do |key, value|
            if value.is_a?(Array) && value.empty?
              object.delete(key)
            end
        end
        return object
    end

    def self.checkInternalLinks(olp, spl)
        brokenLinks = 0
        olp.each do |file, links|
            puts "ckecking #{file}"
            linkPos = 0
            links.each do |link|
                linkToCheck = Globals.removeFirstAndLastSlash(link)
                found_value = spl.find { |value| value == linkToCheck }
                if (!found_value)
                    result = "#{file}: Broken link: #{link}"
                    Globals.putsColText(Globals::YELLOW, " - #{result}")
                    FileUtilities.write_file("#{Globals::ROOT_DIR}/tools/checks/broken-internal-links.log", "#{result}\n")
                    brokenLinks += 1
                end
                linkPos += 1
            end
        end
        return brokenLinks
    end

end