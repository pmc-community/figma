
module Jekyll
    
    module JSONStringToObject
        def json_string_to_object(input)
            begin
                JSON.parse(input)
            rescue
                puts "#{input} string is not a valid JSON"
            end
        end
    end

end
  
Liquid::Template.register_filter(Jekyll::JSONStringToObject)