require 'json'

module Jekyll

    module SitePages
        class SitePages < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        info = JSON.parse(@input)
                    end
                    rescue
                end
                context.registers[:site].data["page_list"]
            end
        end

        class PageExcerpt < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        param = Liquid::Template.parse(@input).render(context)
                        permalink = JSON.parse(param.gsub('=>', ':'))["permalink"]
                        pages = JSON.parse(context.registers[:site].data["page_list"])
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    end
                    rescue
                        puts "PageExcerpt tag got bad json string as input"
                        puts param
                end
                excerpt = matched_page["excerpt"] ? matched_page["excerpt"] : "" if matched_page
                excerpt
            end
            
        end


    end
end
  
Liquid::Template.register_tag('SitePages', Jekyll::SitePages::SitePages)
Liquid::Template.register_tag('PageExcerpt', Jekyll::SitePages::PageExcerpt)
  
