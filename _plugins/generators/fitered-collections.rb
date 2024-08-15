require_relative "../../tools/modules/globals"
require 'fileutils'

module Jekyll
  class FilteredCollectionsGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      if (site.data["pageBuildConfig"]["/"]["sections"]["collections_sections"]["enabledInHome"])
        Globals.putsColText(Globals::PURPLE,"Generating collections info ... ")
        excluded_collections = site.data["pageBuildConfig"]["/"]["sections"]["collections_sections"]["except"]
        custom_names = site.config.dig('just_the_docs', 'collections') || {}
        filtered_collections = []

        site.collections.each do |name, collection|
          next unless collection.metadata['output'] && !excluded_collections.include?(name)
          custom_name = custom_names.dig(name, 'name') || name

          docs = collection.docs.map do |doc|
            file_path = doc.path

            #file_stat = File.stat(file_path)
            create_date = File.birthtime(file_path)
            last_update_date = File.mtime(file_path)

            {
              "permalink" => doc.data['permalink'] || doc.url,
              "title" => doc.data['title'],
              "create_date" => create_date,
              "last_update" => last_update_date,
              "excerpt" => Globals.find_object_key_value( 
                JSON.parse(site.data['page_list']), 
                {
                  "permalink" => doc.data['permalink'] || doc.url, 
                  "title" => doc.data["title"]
                }, 
                "excerpt"
              ) || doc.data['excerpt']
            }
          end

          sorted_docs = docs.sort_by { |doc| -doc["last_update"].to_i }
          filtered_collections << { "name" => name, "custom_name" => custom_name, "docs" => sorted_docs }
        end 
        
        #puts JSON.pretty_generate(filtered_collections)
        site.data['filtered_collections'] = filtered_collections
        Globals.moveUpOneLine
        Globals.clearLine
        Globals.putsColText( Globals::PURPLE, "Generating collections info ... done")
      end
    end
  end
end
