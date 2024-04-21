require 'json'
require_relative '../tools/modules/content-utilities'

module Jekyll

    module ExtContent
      
        class ExternalRepoContent < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        fileInfo = JSON.parse(@input)
                    end
                    rescue
                end
                ContentUtilities.getExternalContentFromGitHub(fileInfo)
            end
        end

        class ExternalRepoContentMM < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        fileInfo = JSON.parse(@input)
                    end
                    rescue
                end
                ContentUtilities.getExternalContentFromGitHubMM(fileInfo)
            end
        end

        class ExternalSiteContent < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        fileInfo = JSON.parse(@input)
                    end
                    rescue
                end
                ContentUtilities.getExternalSiteContent(fileInfo)
            end
        end

        class ExternalSiteContentMM < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        fileInfo = JSON.parse(@input)
                    end
                    rescue
                end
                ContentUtilities.getExternalSiteContentMM(fileInfo)
            end
        end
    
    end

end
  
  Liquid::Template.register_tag('ExternalRepoContent', Jekyll::ExtContent::ExternalRepoContent)
  Liquid::Template.register_tag('ExternalRepoContentMM', Jekyll::ExtContent::ExternalRepoContentMM)

  Liquid::Template.register_tag('ExternalSiteContent', Jekyll::ExtContent::ExternalSiteContent)
  Liquid::Template.register_tag('ExternalSiteContentMM', Jekyll::ExtContent::ExternalSiteContentMM)
  
