module Jekyll
    module Tags
      class CopyrightTag < Liquid::Tag
  
        def initialize(tag_name, text, context)
          super
        end
  
        def render(context)
          "Custom plugin &copy; #{Time.now.year}"
        end
      end
    end
  end
  
  Liquid::Template.register_tag('copyright', Jekyll::Tags::CopyrightTag)
  