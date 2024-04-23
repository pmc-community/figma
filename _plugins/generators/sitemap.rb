require 'yaml'
require_relative "../../tools/modules/globals"

module Jekyll
  class SitemapGenerator < Generator
    safe true
    priority :lowest

    def generate(site)
      doc_contents_dir = File.join(site.source, Globals::DOCS_ROOT)
      
      sitemap = []

      # Recursively iterate through the doc-contents folder and its subfolders
      Dir.glob(File.join(doc_contents_dir, '**', '*.{md,html}')).each do |file_path|
        # Read file content
        content = File.read(file_path)

        # Check if the content has front matter
        front_matter = {}
        if content =~ /^(---\s*\n.*?\n?)^(---\s*$\n?)/m
            begin
                front_matter = YAML.load(Regexp.last_match[1])
            rescue
                front_matter = {} if !front_matter.is_a?(Hash)
            end
        end

        # If the content has front matter
        if front_matter != {}
            url = file_path.sub(site.source, '').sub(/\.md$/, '.html').sub(/\.html$/, '')
            url = url.chomp('index') if url.end_with?('index')
            sitemap << {
                'url' => url,
                'lastmod' => front_matter['lastmod'] || File.mtime(file_path).strftime('%Y-%m-%d'),
                'changefreq' => front_matter['changefreq'] || 'weekly',
                'priority' => front_matter['priority'] || '0.5'
            }
        end
      end

      # Sort sitemap URLs
      sitemap.sort_by! { |page| page['lastmod'] }

      # Generate sitemap.xml content
      sitemap_content = <<~XML
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          #{sitemap.map { |page| generate_sitemap_entry(page) }.join("\n")}
        </urlset>
      XML

      # Write sitemap.xml file
      siteMapFrontMatter = "---\nlayout: null\npermalink: /sitemap.xml\n---\n"
      File.write(File.join("./_site/", 'sitemap.xml'),sitemap_content)
    end

    def generate_sitemap_entry(page)
        <<~XML
          <url>
            <loc>#{page['url']}</loc>
            <lastmod>#{page['lastmod']}</lastmod>
            <changefreq>#{page['changefreq']}</changefreq>
            <priority>#{page['priority']}</priority>
          </url>
        XML
      end

  end
end
