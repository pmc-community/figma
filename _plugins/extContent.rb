require 'json'
require_relative '../tools/modules/content-utilities'



module Jekyll
  
    module ExtContent
      class PrivateRepoExtContent < Liquid::Tag
  
        def initialize(tag_name, input, context)
          super
          @input = input
        end

        def render(context)
          
          param1 = ""
          param2 = ""
          begin
            if( !@input.nil? && !@input.empty? )
              jdata = JSON.parse(@input)
              if( jdata.key?("owner") )
                owner = jdata["owner"].strip
              end
              if( jdata.key?("repo") )
                repo = jdata["repo"].strip
              end
              if( jdata.key?("branch") )
                branch = jdata["branch"].strip
              end
              if( jdata.key?("file_path") )
                file_path = jdata["file_path"].strip
              end
            end
            rescue
          end
          ContentUtilities.getExternalContentFromGitHub(owner, repo, branch, file_path, true)
        end
      end
    end
  end
  
  Liquid::Template.register_tag('PrivateRepoExtContent', Jekyll::ExtContent::PrivateRepoExtContent)
  
