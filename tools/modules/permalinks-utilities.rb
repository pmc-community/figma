require_relative 'globals'

module PermalinksUtilities

    def self.getPermalinks(docsFolder)
        permalinks = []
        Find.find(docsFolder) do |file|
        next unless file =~ /\.html$|\.md$/ # Only process .html or .md files
            contents = File.read(file)
            permalink = contents[/permalink: (.*)/, 1]
            permalinks << permalink if permalink
        end
        return permalinks.compact
    end

    def self.checkPermalinks(sitePermalinks, silent)
        badPermalinks = 0;
        normalizedPermalinks = Globals.removeSlashesFromArrayElements(sitePermalinks)
        duplicates = Globals.getArrayDuplicates(normalizedPermalinks)
        puts duplicates if !silent
        badPermalinks = duplicates.length > 0 ? 1 : 0
        return badPermalinks
    end


end