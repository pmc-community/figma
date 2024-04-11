require_relative 'modules/globals'
require_relative 'modules/file-utilities'
require_relative 'modules/link-utilities'


site_dir = ARGV[0] || 'doc-contents'
clearScreen = ARGV[1]

if (ARGV[1]&.downcase == 'true')
  Globals.clearConsole()
end

Globals.putsColText(Globals::GREEN,"-----------------------\nSTART BROKEN INTERNAL LINKS CHECK\n")
Globals.putsColText(Globals::PURPLE,"HEADS UP!!! Only files containing internal links will be checked.")
FileUtilities.clear_or_create_file("#{Globals::ROOT_DIR}/tools/checks/broken-internal-links.log")

sitePermalinks = LinkUtilities.getPermalinks(site_dir).uniq
#puts sitePermalinks

originalLinksInPages = LinkUtilities.filterEmptyKeys(
    LinkUtilities.filterLinksToGetInternalOnly(
      LinkUtilities.scanFilesForLinks(site_dir)
    )
  )

brokenLinks = LinkUtilities.checkInternalLinks(originalLinksInPages, sitePermalinks)

if (brokenLinks > 0 )
  Globals.putsColText(Globals::PURPLE,"See checks/broken-internal-links.log")
else
  Globals.putsColText(Globals::PURPLE,"Sky clear ...")
end

Globals.putsColText(Globals::GREEN,"END BROKEN INTERNAL LINKS CHECK\n-----------------------\n")

