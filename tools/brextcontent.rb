require_relative 'modules/globals'
require_relative 'modules/file-utilities'
require_relative 'modules/extContent-utilities'

# pretty print objects
require 'pp'

site_dir = ARGV[0] || 'doc-contents'
clearScreen = ARGV[1]

if (ARGV[1]&.downcase == 'true')
  Globals.clearConsole()
end

Globals.putsColText(Globals::GREEN,"-----------------------\nSTART EXTERNAL CONTENTS CHECK\n")
Globals.putsColText(Globals::PURPLE,"HEADS UP!!!\n - Only files containing explicit calls for external content will be checked.")
Globals.putsColText(Globals::PURPLE," - Explicit call means that the parameters of getExternalMDContent(...) are provided as literals or are site vars, in the form {{ site.<some literal/no enums/no nested objects> }}")
FileUtilities.clear_or_create_file("#{Globals::ROOT_DIR}/tools/checks/broken-external-content.log")


results = ExtContentUtilities.replaceValuesWithYAML(
    ExtContentUtilities.findCallsForExternalContent(site_dir), Globals::CONFIG_YML
).select { |_, value| value.is_a?(Array) && !value.empty? }

pp results

brokenContent = 0
if (brokenContent > 0 )
    Globals.putsColText(Globals::PURPLE,"See checks/broken-external-content.log")
  else
    Globals.putsColText(Globals::PURPLE,"Sky clear ...")
  end
  
  Globals.putsColText(Globals::GREEN,"END EXTERNAL CONTENT CHECK\n-----------------------\n")
  
