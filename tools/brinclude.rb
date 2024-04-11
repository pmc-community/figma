require 'jekyll'
require_relative 'modules/file-utilities'
require_relative 'modules/globals'

site_dir = ARGV[0] || 'doc-contents'

if (ARGV[1]&.downcase == 'true')
  Globals.clearConsole()
end

#Globals.clearConsole()
Globals.putsColText(Globals::GREEN,"-----------------------\nSTART BROKEN INCLUDES CHECK\n")

FileUtilities.clear_or_create_file("#{Globals::ROOT_DIR}/tools/checks/broken-includes.log")

brokeIncludes = 0
fileErrors = 0
# Loop through all Markdown files in the site directory
Dir.glob("#{site_dir}/**/*.md").each do |file_path|
  puts "checking #{file_path}"
  fileErrors = FileUtilities.check_includes(file_path, File.read(file_path), File.dirname(file_path))
  if (fileErrors >0 )
    brokeIncludes = fileErrors
  end
end

if (brokeIncludes > 0 )
  Globals.putsColText(Globals::PURPLE,"See checks/broken-includes.log")
else
  Globals.putsColText(Globals::PURPLE,"Sky clear ...")
end
Globals.putsColText(Globals::GREEN,"END BROKEN INCLUDES CHECK\n-----------------------\n")
