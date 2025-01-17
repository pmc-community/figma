```
<span
    siteFunction="pageHasSiteTagsBadge"
    title = "${i18next.t('page_page_info_badge_has_site_tags_title', {postProcess: 'sprintf', sprintf: [page.siteInfo.title]})}" 
    class="btn-primary shadow-none m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-primary alwaysCursorPointer"
    data-i18n="[title]page_page_info_badge_has_site_tags_title;page_page_info_tags">
    ${i18next.t('page_page_info_tags')}
</span>

```

key is
    "page_page_info_badge_has_site_tags_title": "Documentul %s are {{common.tags_s}} {{common.site_def_s}}",