

module Globals
    RESET = "\e[0m"
    YELLOW = "\e[33m"
    GREEN = "\e\n[32m"
    PURPLE = "\e[35m"
    RED = "\e[31m"

    # removing last 15 chars '/tools/modules/'
    ROOT_DIR = __dir__[0..-15]
    
    def self.putsColText(col, text)
        puts col + text + RESET
    end

    def self.clearConsole()
        puts "\e[H\e[2J"
    end

    def self.removeFirstAndLastSlash(str)
        if (str[0] == '/')
            str = str[1..-1]
        end
        if str[-1] == '/'
            str = str[0..-2]
        end
        return str
    end

    def self.removeSlashesFromArrayElements(ar)
        modified_ar = ar.map do |element|
            # Modify the element here
            modified_element = removeFirstAndLastSlash(element)
            # Return the modified element
            modified_element
        end
        return modified_ar
    end
end