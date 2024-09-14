require 'json'
require_relative "../../tools/modules/globals"
require_relative "../../tools/modules/permalinks-utilities"
require_relative "../../tools/modules/col-utilities"

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
                        info = JSON.parse(Liquid::Template.parse(@input).render(context))
                        _ = info # noop to prevent warnings for not using variable. to be removed when the variable will be used

                    end
                rescue
                    begin
                        info = JSON.parse(@input)
                    rescue
                        Globals.putsColText(Globals::RED, "SitePages tag got bad json string as input\n")
                    end
                end
                context.registers[:site].data["page_list"] if context && context.registers[:site] && context.registers[:site].data
                
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
                        pages = context && context.registers[:site] && context.registers[:site].data ?
                            JSON.parse(context.registers[:site].data["page_list"]) :
                            []
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    end
                rescue
                    begin
                        param = JSON.parse(@input)
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    rescue
                        Globals.putsColText(Globals::RED, "#{context['page']['url']}: PageExcerpt tag got bad json string as input\n")
                    end
                end
                excerpt = matched_page["excerpt"] ? matched_page["excerpt"] : "" if matched_page
                excerpt
            end
            
        end

        class PageTags < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        param = Liquid::Template.parse(@input).render(context)
                        permalink = JSON.parse(param.gsub('=>', ':'))["permalink"]
                        tagExcept = JSON.parse(JSON.parse(param.gsub('=>', ':'))["except"].to_json)
                        pages = JSON.parse(context.registers[:site].data["page_list"])
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    end
                rescue
                    begin
                        param = JSON.parse(@input)
                        permalink = param["permalink"]
                        tagExcept = JSON.parse(param["except"].to_json) || []
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    rescue
                        Globals.putsColText(Globals::RED, "#{context['page']['url']}: PageTags tag got bad json string as input(#{param})\n")
                    end
                end
                tags = matched_page["tags"] ? matched_page["tags"] : [] if matched_page
                tagExcept.each do |tag|
                    tags.delete(tag)
                end
                tags.to_json
            end
            
        end

        class PageCats < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        param = Liquid::Template.parse(@input).render(context)
                        permalink = JSON.parse(param.gsub('=>', ':'))["permalink"]
                        catExcept = JSON.parse(JSON.parse(param.gsub('=>', ':'))["except"].to_json)
                        pages = JSON.parse(context.registers[:site].data["page_list"])
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    end
                rescue
                    begin
                        param = JSON.parse(@input)
                        permalink = param["permalink"]
                        catExcept = JSON.parse(param["except"].to_json) || []
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    rescue
                        Globals.putsColText(Globals::RED, "#{context['page']['url']}: PageCats tag got bad json string as input(#{param})\n")
                    end
                end
                cats = matched_page["categories"] ? matched_page["categories"] : [] if matched_page
                catExcept.each do |cat|
                    cats.delete(cat)
                end
                cats.to_json
            end
            
        end

        class PageRelated < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        param = Liquid::Template.parse(@input).render(context)
                        permalink = JSON.parse(param.gsub('=>', ':'))["permalink"]
                        relatedExcept = JSON.parse(JSON.parse(param.gsub('=>', ':'))["except"].to_json)
                        pages = JSON.parse(context.registers[:site].data["page_list"])
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    end
                rescue
                    begin
                        param = JSON.parse(@input)
                        permalink = param["permalink"]
                        relatedExcept = JSON.parse(param["except"].to_json) || []
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    rescue
                        Globals.putsColText(Globals::RED, "#{context['page']['url']}: PageRelated tag got bad json string as input(#{param})\n")
                    end
                end
                related = matched_page["relatedPages"] ? matched_page["relatedPages"] : [] if matched_page
                relatedExcept.each do |page|
                    related.delete(page)
                end
                related.to_json
            end
            
        end

        class PageSimilarByContent < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        param = Liquid::Template.parse(@input).render(context)
                        permalink = JSON.parse(param.gsub('=>', ':'))["permalink"]
                        similarExcept = JSON.parse(JSON.parse(param.gsub('=>', ':'))["except"].to_json)
                        pages = JSON.parse(context.registers[:site].data["page_list"])
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    end
                rescue
                    begin
                        param = JSON.parse(@input)
                        permalink = param["permalink"]
                        similarExcept = JSON.parse(param["except"].to_json) || []
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    rescue
                        Globals.putsColText(Globals::RED, "#{context['page']['url']}: PageSimilarByContent tag got bad json string as input(#{param})\n")
                    end
                end
                similarByContent = matched_page["similarByContent"] ? matched_page["similarByContent"] : [] if matched_page
                similarExcept.each do |page|
                    similarByContent.delete(page)
                end
                similarByContent.to_json
            end
            
        end

        class PageAutoSummary < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        param = Liquid::Template.parse(@input).render(context)
                        permalink = JSON.parse(param.gsub('=>', ':'))["permalink"]
                        pages = context && context.registers[:site] && context.registers[:site].data ?
                            JSON.parse(context.registers[:site].data["page_list"]) :
                            []
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    end
                rescue
                    begin
                        param = JSON.parse(@input)
                        matched_page = pages.find { |obj| obj["permalink"] == permalink }
                    rescue
                        Globals.putsColText(Globals::RED, "#{context['page']['url']}: PageAutoSummary tag got bad json string as input\n")   
                    end
                end
                summary = matched_page["autoSummary"] ? matched_page["autoSummary"] : "" if matched_page
                summary
            end
            
        end

        class PageCollection < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                if( !@input.nil? && !@input.empty? )
                    param = Liquid::Template.parse(@input).render(context)
                    permalink = JSON.parse(param.gsub('=>', ':'))["permalink"]
                    collections = ColUtilities.getSiteCollections(context.registers[:site])
                    collection = PermalinksUtilities.find_collection_name_by_permalink(
                        collections,
                        permalink
                    )
                    #puts "#{permalink}: #{collection}"
                end
            
                collection.nil? ? "" : collection.strip
            end
            
        end

    end
end
  
Liquid::Template.register_tag('SitePages', Jekyll::SitePages::SitePages)
Liquid::Template.register_tag('PageExcerpt', Jekyll::SitePages::PageExcerpt)
Liquid::Template.register_tag('PageTags', Jekyll::SitePages::PageTags)
Liquid::Template.register_tag('PageCats', Jekyll::SitePages::PageCats)
Liquid::Template.register_tag('PageRelated', Jekyll::SitePages::PageRelated)
Liquid::Template.register_tag('PageSimilarByContent', Jekyll::SitePages::PageSimilarByContent)
Liquid::Template.register_tag('PageAutoSummary', Jekyll::SitePages::PageAutoSummary)
Liquid::Template.register_tag('PageCollection', Jekyll::SitePages::PageCollection)
  
