---
layout: page
permalink: /categories/
title: Categories
nav_order: 1
---

{% CatList %}

{% CatDetails %}

{% TagList %}

{% TagDetails %}

{% SitePages %}

[Tag1](http://localhost:4000/tag-info?tag=tag1){: .btn .btn-green }

{%assign s = "/collection1/g11/" %}
{% capture json_string %}
{
    "permalink": "{{ s }}"
}
{% endcapture %}

{% assign my_object = json_string | json_string_to_object %}
{{my_object}}

{% PageExcerpt {{ my_object }} %}
