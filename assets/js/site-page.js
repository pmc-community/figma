
// FUNCTIONS FOR EACH PAGE
// called from _includes/siteIncludes/partials/page-common/page-info.html
// pageInfo global is not available yet when this function is called from the html template
const getPageLastUpdateAndPageInfo = (pageObj = null) => {

    const pageSavedInfoBadges = (page) => {
        if (page.savedInfo === 'none') return '';
        let savedInfoBadges = '';

        if (page.savedInfo.customTags.length > 0 ) 
            savedInfoBadges += `<span title = "Page ${page.siteInfo.title} has custom tags" class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-success">Tags</span>`;
        
        if (page.savedInfo.customCategories.length > 0 ) 
            savedInfoBadges += `<span title = "Page ${page.siteInfo.title} has custom categories" class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-danger">Categories</span>`;
        
        if (page.savedInfo.customNotes.length > 0 ) 
            savedInfoBadges += `<span title = "Page ${page.siteInfo.title} has custom notes" class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-warning">Notes</span>`;

        return savedInfoBadges === '' ?
            '' :
            '<div>' + savedInfoBadges + '</div>';

    }

    const pageCategories = (page) => {

        const pageCatItem = (cat, isLast) => {

            const isNotLast = '<span class="fw-normal"> | </span>';

            const catColor = _.findIndex(globCustomCats, item => item.toLowerCase() === cat.trim().toLowerCase()) === -1 ?
                'text-danger' :
                'text-success';

            const numPages = _.findIndex(globCustomCats, item => item.toLowerCase() === cat.trim().toLowerCase()) === -1 ?
                catDetails[cat].numPages:
                getCatPages(cat);
            
            return (
                `
                    <div class="m-1 fw-medium">
                        <a
                            href="/cat-info?cat=${cat}"
                            class="${catColor}"
                            title="Click for details for category ${cat}\nPages in category: ${numPages}">
                            ${cat}
                            <span 
                                sitefunction="catBadgeOnPage" 
                                class="fw-normal border px-2 rounded bg-warning-subtle text-dark"> 
                                ${numPages} 
                        </span>
                        </a>
                    </div>
                    ${!isLast ? isNotLast : '' } 
                `
            );
        }

        const allPageCategories = [...page.siteInfo.categories || [], ...page.savedInfo.customCategories || []];
        let pageCatsHtml = '';

        allPageCategories.forEach( (cat, index) => {
            if (index === allPageCategories.length - 1) pageCatsHtml += pageCatItem(cat, true);
            else pageCatsHtml += pageCatItem(cat, false);
        });

        return pageCatsHtml;
    }

    
    const pageLastUpdateAndPageInfoContainer = (page) => {
        return (
            `
                <div id="pageLastUpdateAndPageInfo" class="container px-5 mb-4">
                    <div class="d-flex align-items-center">
                        ${pageCategories(page)}
                    </div>
                    <hr siteFunction="pageLastUpdateSeparator">
                    <div class="fw-medium fs-2 mb-2">${page.siteInfo.title}</div>
                    <div class="mb-2">${page.siteInfo.excerpt}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="d-flex align-items-center">
                                <div 
                                    class="badge 
                                    rounded-pill 
                                    text-bg-secondary 
                                    px-3 py-2 
                                    fw-medium">
                                    Last update: ${formatDate(page.siteInfo.lastUpdate)}
                                </div>
                                <div>
                                    ${pageSavedInfoBadges(page)}
                                </div>
                            </div>
                            
                        </div>
                        <div>
                            <button 
                                sitefunction="pageShowPageFullInfo" 
                                type="button" 
                                class="btn btn-sm btn-primary position-relative" 
                                title="Details for page ${page.siteInfo.title}">
                                Info
                            </button>
                        </div>
                    </div>
                    <hr siteFunction="pageLastUpdateSeparator">
                </div>
            `
        );
    }

    $(document).ready(function() {
        //console.log(pageInfo);
        if (pageInfo.siteInfo === 'none') return;
        $(settings.layouts.contentArea.contentWrapper).prepend($(pageLastUpdateAndPageInfoContainer(pageInfo)));
        $(document)
            .off('click', 'button[sitefunction="pageShowPageFullInfo"]')
            .on('click', 'button[sitefunction="pageShowPageFullInfo"]', function() {
                showPageFullInfoCanvas(pageInfo);
            });
        refreshPageAfterOffCanvasClose();
    })
}

const refreshPageAfterOffCanvasClose = () => {
    removeObservers('.offcanvas class=hiding getClass=true');
    setElementChangeClassObserver('.offcanvas', 'hiding', true, () => {
        $('div[siteFunction="pageCustomTagButton"]').remove();
        $('div[id="pageLastUpdateAndPageInfo"]').remove();
        refreshPageDynamicInfo();
    });
}


// called from _includes/siteIncludes/partials/page-common/page-tags.html
const showPageCustomTags = () => {

    const createPageTagsContainer = () => {
        return (
            `
                <div id="pageTags" class="container px-5">
                    <hr siteFunction="pageTagsSeparator">
                    <span 
                        siteFunction="pageTagsContainer" 
                        class="mr-5 fs-6 fw-medium">
                        Tags:
                    </span>
                </div>
            `
        );
    }

    const tagElement = (tag, numPages) => {
        return (
            `
                <div siteFunction="pageCustomTagButton" class="d-inline-flex align-items-center">
                    <a 
                        href="/tag-info?tag=${tag}" 
                        sitefunction="pageTagButton" 
                        type="button" 
                        class="focus-ring focus-ring-warning px-3 my-2 mr-5 btn btn-sm btn-success position-relative">
                        ${tag}
                    </a> 
                    <span 
                        sitefunction="tagBadgeOnPage" 
                        class="position-relative translate-middle badge rounded-pill text-bg-warning"> 
                        ${numPages} 
                        <span class="visually-hidden" >number of pages</span>
                    </span>
                </div>
            `
        );
    }

    $(document).ready(function() {
        //console.log(pageInfo)
        const siteTags = pageInfo.siteInfo.tags || [];
        let customTags = pageInfo.savedInfo.customTags || [];
        if (siteTags.length + customTags.length === 0 ) {
            $('#pageTags').remove();
            return;
        }

        // if the page doesn't have siteTags but has customTags
        // we need to re-create the pageTags container
        // because _/includes/siteIncludes/partials/page-common/page-tags.html template will not create it in full
        // and will create only the duv with the id=pageTags
        if ( pageInfo.siteInfo.tags.length === 0) {
            $('#pageTags').remove();
            // JTD has 2 footers, the $('footer[class="site-footer "]') is the one on the bottom of the left side bar
            // so we need to avoid that one
            $('footer[class!="site-footer"]').append(createPageTagsContainer()); 
        }
        customTags.forEach( tag => {
            const numPages = getTagPages(tag);
            $('#pageTags').append($(tagElement(tag, numPages)));
        });    
    });
};

const refreshPageDynamicInfo = () => {
    showPageCustomTags();
    getPageLastUpdateAndPageInfo();
}