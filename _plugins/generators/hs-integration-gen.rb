require_relative "../../tools/modules/globals"
require_relative "../../tools/modules/file-utilities"
require 'nokogiri'
require 'tf-idf-similarity'
require 'matrix'
require 'dotenv'

Dotenv.load

module Jekyll

  class HSClientSettingsGenerator < Generator
    safe true
    priority :highest # actually can be anywhere, but the sooner, the better

    # HEADS UP!!!
    # THIS IS HOW TO GET ACCESS TO SITE CONFIG DATA FROM AN EXTERNAL FILE
    # THE FILE IS buildConfig.yml AND IS LOCATED IN _data FOLDER
    # content.index(site.data["siteConfig"]["marker404"])

    def generate(site)
      if (site.data["siteConfig"]["hsIntegration"]["enabled"])
        Globals.putsColText(Globals::PURPLE,"Generating HubSpot client settings ...")
        hsSettings = {
          "region" => site.data["buildConfig"]["hubspot"]["region"],
          "portalID" => site.data["buildConfig"]["hubspot"]["portalID"],
          "feedbackFormID" => site.data["buildConfig"]["hubspot"]["feedbackFormID"]
        }
        site.data['hs_integration'] = hsSettings.to_json
        Globals.moveUpOneLine
        Globals.clearLine
        Globals.putsColText(Globals::PURPLE,"Generating HubSpot client settings ... done")
      else
        hsSettings = {}
        site.data['hs_integration'] = hsSettings.to_json
      end
    end

  end

  class HSPortalID < Generator
    safe true
    priority :high # must after HSClientSettingsGenerator above

    def generate(site)
      if (site.data["siteConfig"]["hsIntegration"]["enabled"])
        portalID = site.data["buildConfig"]["hubspot"]["portalID"]
        site.data['hs_portal_id'] = portalID
      else
        portalID = ""
        site.data['hs_portal_id'] = portalID
      end
    end

  end

end
  