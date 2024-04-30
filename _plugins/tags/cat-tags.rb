require 'json'
require_relative "../../tools/modules/globals"

module Jekyll

    module Categories
        class CatList < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        info = JSON.parse(Liquid::Template.parse(@input).render(context))
                    end
                    rescue
                        begin
                            info = JSON.parse(@input)
                        rescue
                            Globals.putsColText(Globals::RED, "#{context['page']['url']}: CatList tag got bad json string as input\n")
                        end
                end
                puts info
                context.registers[:site].data["category_list"]
            end
        end

        class CatDetails < Liquid::Tag

            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        info = JSON.parse(Liquid::Template.parse(@input).render(context))
                    end
                    rescue
                        begin
                            info = JSON.parse(@input)
                        rescue
                            Globals.putsColText(Globals::RED, "#{context['page']['url']}: CatDetails tag got bad json string as input\n")
                        end
                end
                puts info
                context.registers[:site].data["categories_details"]
            end
        end

    end
end
  
Liquid::Template.register_tag('CatList', Jekyll::Categories::CatList)
Liquid::Template.register_tag('CatDetails', Jekyll::Categories::CatDetails)
  
