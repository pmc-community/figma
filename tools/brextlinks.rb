require_relative 'modules/globals'
require_relative 'modules/file-utilities'
require_relative 'modules/link-utilities'


site_dir = ARGV[0] || 'doc-contents'
clearScreen = ARGV[1]

if (ARGV[1]&.downcase == 'true')
  Globals.clearConsole()
end

Globals.putsColText(Globals::GREEN,"-----------------------\nSTART BROKEN EXTERNAL LINKS CHECK\n")
Globals.putsColText(Globals::PURPLE,"HEADS UP!!! Only files containing external links will be checked.")
FileUtilities.clear_or_create_file("#{Globals::ROOT_DIR}/tools/checks/broken-external-links.log")

extLinksInPages = 
    LinkUtilities.filterEmptyKeys(
        LinkUtilities.filterLinksToGetExternalOnly(
            LinkUtilities.scanFilesForLinks(site_dir)
        )
    )

#puts extLinksInPages
brokenLinks = 0
brokenLinks = LinkUtilities.checkExternalLinks(extLinksInPages)

if (brokenLinks > 0 )
  Globals.putsColText(Globals::PURPLE,"See checks/broken-external-links.log")
else
  Globals.putsColText(Globals::PURPLE,"Sky clear ...")
end

Globals.putsColText(Globals::GREEN,"END BROKEN EXTERNAL LINKS CHECK\n-----------------------\n")

