---
layout: page
title: Collection-2/X
permalink: /collection-2/x/
has_children: true
has_toc: false
---

<!-- START_EXPOSED_SECTION -->

```
Own markdown content.
```
This the content directly typed in {{ page.title }}.

```
Markdown content loaded from another md file from the same collection.
HEADS UP!
WATCH OUT THE LIMITATIONS FOR LOADING CONTENT FROM ANOTHER FILE, THE SOURCE FILE MUST BE BELOW THE DESTINATION FILE IN THE FOLDER STRUCTURE.
OTHERWISE THE CONTENT SHOULD BE LOADED CONSIDERING THE SOURCE AS EXTERNAL FILE AND USE getExternalMDContent(...) FUNCTION. 
```
{% capture included_content %}
    {% include_relative Y/y.md %}
{% endcapture %}

{% include siteIncludes/utilities.liquid fileContent=included_content %}
{{ file_content_result }}

<script>
    getExternalMDContent (
        'https://raw.githubusercontent.com/pmc-community/figma/main/ReactPluginTemplate/README.md', 
        'before',
        '{{ site.siteConfig.extContentMarkers.startExposedSection }}',
        '{{ site.siteConfig.extContentMarkers.endExposedSection }}',
        '```Markdown content generated from a part of partial which loads a part from an external md file and place it on top of the content area```',
        '',
        'doc-contents/partials/partExtFile.md'
    );
</script>
<!-- END_EXPOSED_SECTION -->