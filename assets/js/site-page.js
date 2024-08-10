
// FUNCTIONS FOR EACH PAGE

// called from _includes/siteIncludes/partials/page-common/page-auto-summary.html
const page__getAutoSummary = () => {

    const createAutoSummaryPageContainer = (page) => {
        const autoSummary = page.siteInfo.autoSummary || [];
        
        return (
            `   
                <div id="pageAutoSummary" class="mt-4">
                    <span class="fw-medium text-secondary">
                        ${autoSummary}
                    </span>
                </div>
            `
        );
    }

    $(document).ready(function() {
        const autoSummary = pageInfo.siteInfo.autoSummary || '';
        $('#pageAutoSummary').remove();
        if (autoSummary === '') return;
        $('#pageLastUpdateAndPageInfo').append(createAutoSummaryPageContainer(pageInfo)); 

    });

}

// called from _includes/siteIncludes/partials/page-common/page-related-pages.html
const page__getRelatedPages = () => {

    const relatedPageItem = (relatedPage) => {

        const relatedPageLinkWidth = isMobileOrTablet() ? 'col-12' : 'col-4';

        return (
            `
                <a siteFunction="pageRelatedPageLink" href="${relatedPage.permalink.indexOf('/') === 0 ? relatedPage.permalink : '/'+relatedPage.permalink}" class="${relatedPageLinkWidth} p-2">
                    <div siteFunction="pageRelatedPage" class="border border-secondary border-opacity-25 my-2 card h-100 py-3 px-3 bg-body rounded bg-transparent shadow-sm">
                        <div class="h-100 align-top mb-2">
                            <span siteFunction="pageRelatedPageLinkPageTitle" class="fw-bold text-primary fs-6">${relatedPage.title}</span>
                        </div>
                        <div class="h-100 align-top mb-2">
                            <span siteFunction="pageRelatedPageLinkPageExcerpt" class="fw-medium text-secondary">${getObjectFromArray({permalink:relatedPage.permalink, title: relatedPage.title}, pageList).excerpt}</span>
                        </div>
                    </div>
                </a>
            
            `
        );
    }

    const relatedPagesHtml = (page) => {
        let html = '';
        const relatedPages = page.siteInfo.relatedPages || [];
        if (relatedPages.length === 0) return html;
        relatedPages.forEach(relatedPage => {
            html += relatedPageItem(relatedPage);
        });

        return html;
    }

    const createRelatedPageContainer = (page) => {
        const relatedPages = page.siteInfo.relatedPages || [];
        const relatedPageItemsAlign = relatedPages.length > 3 ? 'justify-content-between' : 'justify-content-start';
        
        return (
            `   
                <div id="pageRelatedPages" class="px-5">
                    <span class="fs-6 fw-medium">
                        Related:
                    </span>
                    <div siteFunction="pageRelatedPagesContainer">
                        <div
                            siteFunction="pageRelatedPagesRow"
                            class="row d-flex ${relatedPageItemsAlign}">
                            ${relatedPagesHtml(page)}
                        </div>
                    </div>
                </div>
            `
        );
    }

    $(document).ready(function() {
        const relatedPages = pageInfo.siteInfo.relatedPages || [];
        if (relatedPages.length === 0) {
            $('#pageRelatedPages').remove();
            return;
        }
        $('#pageRelatedPages').remove();
        $('footer[class!="site-footer"]').append(createRelatedPageContainer(pageInfo));

    });

}

// called from _includes/siteIncludes/partials/page-common/page-notes.html
const page__getPageNotes = () => {

    const customNoteItem = (note) => {
        return (
            `
                <div siteFunction="pageNote" class="my-2 card h-auto col-12 py-2 px-3 bg-transparent border border-secondary border-opacity-25">
                    <div class="h-100 align-top mb-2">
                        <span class="text-primary">${note.date}</span>
                    </div>
                    <div class="h-100 align-top">
                        <p class="text-secondary">${note.note}</p>
                    </div>
                </div>
            `
        );
    }

    const createNotesContainer = (page) => {
        const customNotes = _.orderBy(page.savedInfo.customNotes || [],  [obj => new Date(obj.date)], ['desc']);
        let customNotesHtml = '';
        customNotes.forEach(note => {
            customNotesHtml += customNoteItem(note);
        });

        return (
            `   
                <div id="pageNotes" class="px-5 mb-4">
                    <span class="fs-6 fw-medium">
                        Notes:
                    </span>
                    <div 
                        siteFunction="pageNotesContainer"
                        class="container-fluid">
                        <div
                            siteFunction="pageNotesRow"
                            class="row d-flex justify-content-between">
                            ${customNotesHtml}
                        </div>
                    </div>
                </div>
            `
        );
    }

    $(document).ready(function() {
        const customNotes = _.orderBy(pageInfo.savedInfo.customNotes || [],  [obj => new Date(obj.date)], ['desc']) ;
        if (customNotes.length === 0) {
            $('#pageNotes').remove();
            return;
        }
        $('#pageNotes').remove();
        $('footer[class!="site-footer"]').append(createNotesContainer(pageInfo)); 
    });
}

// called from _includes/siteIncludes/partials/page-common/page-fedback-form.html
const page__getPageFeedbackForm = () => {      
    $(document).ready(function() {
        if (settings.hsIntegration.enabled) {            
            const permalink = $('main').attr('pagePermalinkRef');
            const title = $('main').attr('pageTitleRef');
            if (!findObjectInArray({permalink:permalink, title:title}, pageList)) return;

            fedbackFormContainer__ASYNC('pageFeedbackForm')
                .then( (formContainerSelector) => {
                    createHSFeedbackForm(
                        `#${formContainerSelector}`,

                        // send page info to form iFrame
                        {
                            permalink: permalink, 
                            title: title
                        },

                        // text and class for submit button, and other settings
                        {
                            submitText: 'Let us know!',
                            submitButtonClass: 'btn btn-sm btn-outline-secondary border border-secondary border-opacity-25',
                            css: ['hs/hs.css'],
                            js: [] 
            
                        },

                        // onFormReady callback
                        // set the specific form appearance; the general appearance is set in hs-integrate
                        ($form) => {
                            feedbackFormCSSCorrection($form);
                        },
                        
                        // onBeforeFormSubmit callback
                        // can do specific data manipulation or field processing before submit
                        // general processing (as filling in email field with a default value) are made in hs-integrate
                        ($form, data) => {
                            const message = $form.find('textarea').text();
                            $form.find('textarea').text(DOMPurify.sanitize(message));
                        },

                        // onFormSubmitted callback
                        // can do some processing after the form is submitted with success
                        ($form, data) => {
                            console.log('pfff, was hard!!!')
                        },

                        // onBeforeFormInit callback
                        // can do some processing before the form is built, based on the full form settings (ctx) retrieved from HubSpot
                        (ctx) => {
                            console.log(ctx)
                        }
                        
                        )
                        .then( (formContainerSelector) => {
                            $(`${formContainerSelector}`).removeClass('d-none');
                        });
                });
        }
    });
}

const feedbackFormCSSCorrection = ($form) => {
    $form.find('input[type="submit"]').addClass('inputField');
    
    const $fields = $form.children().first();
    $fields.addClass('d-flex justify-content-between ');
    $fields.children().first().addClass('w-auto');
    $fields.children().last().css('width', '70%');

    $form.find('textarea').addClass('h-100');
    $form.find('.hs-form-required').addClass('d-none');

}

// called from _includes/siteIncludes/partials/page-common/page-info.html
const page__getPageInfo = () => {

    const pageSiteInfoBadges = (page) => {
        if (page.siteInfo === 'none') return '';
        let siteInfoBadges = '';
        
        if (page.siteInfo.tags.length > 0 ) 
            siteInfoBadges += 
                `
                    <span
                        siteFunction="pageHasSiteTagsBadge"
                        title = "Page ${page.siteInfo.title} has site tags" 
                        class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-primary alwaysCursorPointer">
                        Tags
                    </span>
                `;

        if (page.siteInfo.relatedPages.length > 0 ) 
            siteInfoBadges += 
                `
                    <span
                        siteFunction="pageHasRelatedPagesBadge"
                        title = "Page ${page.siteInfo.title} has related pages" 
                        class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-danger alwaysCursorPointer">
                        Related
                    </span>
                `;
        
        if (page.siteInfo.autoSummary !== '' ) 
            siteInfoBadges += 
                `
                    <span
                        siteFunction="pageHasAutoSummaryBadge"
                        title = "Page ${page.siteInfo.title} has auto generated summary" 
                        class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-dark alwaysCursorPointer">
                        Summary
                    </span>
                `;
        
        return siteInfoBadges === '' ?
            '' :
            '<div>' + siteInfoBadges + '</div>';
    }

    const pageSavedInfoBadges = (page) => {
        if (page.savedInfo === 'none') return '';
        let savedInfoBadges = '';

        if (page.savedInfo.customTags.length > 0 ) 
            savedInfoBadges += 
                `
                    <span
                        siteFunction="pageHasCustomTagsBadge"
                        title = "Page ${page.siteInfo.title} has custom tags" 
                        class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-success alwaysCursorPointer">
                        Tags
                    </span>
                `;
        
        if (page.savedInfo.customCategories.length > 0 ) 
            savedInfoBadges += 
                `
                    <span
                        siteFunction="pageHasCustomCategoriesBadge"
                        title = "Page ${page.siteInfo.title} has custom categories" 
                        class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-success">
                        Categories
                    </span>
                `;
        
        if (page.savedInfo.customNotes.length > 0 ) 
            savedInfoBadges += 
                `
                    <span
                        siteFunction="pageHasCustomNotesBadge"
                        title = "Page ${page.siteInfo.title} has custom notes" 
                        class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-warning alwaysCursorPointer">
                        Notes
                    </span>
                `;

        return savedInfoBadges === '' ?
            '' :
            '<div>' + savedInfoBadges + '</div>';

    }

    const pageCategories = (page) => {

        const pageCatItem = (cat, isLast) => {

            const isNotLast = '<span class="fw-normal">  </span>';

            const catColor = _.findIndex(globCustomCats, item => item.toLowerCase() === cat.trim().toLowerCase()) === -1 ?
                'text-danger' :
                'text-success';

            const numPages = _.findIndex(globCustomCats, item => item.toLowerCase() === cat.trim().toLowerCase()) === -1 ?
                catDetails[cat].numPages:
                getCatPages(cat);
            
            return (
                `
                    <div >
                        <a
                            href="/cat-info?cat=${cat}"
                            class="${catColor} fw-medium btn btn-sm border-0 shadow-none px-0 my-1 mr-3"
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

    const pageSimilarByContent = (page) => {
        pageSimilarPages = page.siteInfo.similarByContent.slice(0, settings.similarByContent.maxPages) || [];

        const similarPagesHtml = (similarPages) => {
            let html = ''
            similarPages.forEach(page => {
                const similarPageExcerpt = getObjectFromArray(
                    {
                        permalink: page.permalink, 
                        title: page.title
                    }, 
                    pageList
                ).excerpt || '';
                
                html = html + 
                    `
                        <a 
                            title="${similarPageExcerpt}" 
                            class="fw-medium text-primary badge py-2 px-3 m-1 bg-body-secondary rounded-pill" 
                            href="${page.permalink.indexOf('/') === 0 ? page.permalink : '/'+page.permalink}">
                            ${page.title}
                        </a>
                    `
            });
            return html;
        }

        return pageSimilarPages.length === 0 ?
            '' :
            (
                `
                    <div 
                        sitefunction="pageFullInfoPageGeneralSimilarPages" 
                        class="mt-2 mb-4 d-flex">
                        <span 
                            class="fw-medium align-self-center" 
                            title="Similar pages based on content"> 
                            Similar: 
                        </span>
                        <span 
                            sitefunction="pageFullInfoPageGeneralSimilarPagesText"
                            class="d-flex">
                            ${similarPagesHtml(pageSimilarPages)}           
                        </span>
                    </div>
                `
            );
    }

    const pageInfoContainer = (page) => {
        const siteCats = getObjectFromArray({permalink: page.siteInfo.permalink, title: page.siteInfo.title}, pageList).categories.length || 0;
        const customCats = getPageCats(page).length || 0;

        const catsHtml = siteCats + customCats === 0 ?
            '' :
            `
                <div class="d-flex align-items-center">
                    ${pageCategories(page)}
                </div>
            `;

        const pageSimilarPages = page.siteInfo.similarByContent.slice(0, settings.similarByContent.maxPages) || []
        return (
            `
                <div id="pageLastUpdateAndPageInfo" class="container px-5 mb-4">
                    ${catsHtml}
                    <div class="fw-medium fs-2 mb-2 mt-2">${page.siteInfo.title}</div>
                    <div class="mb-4">${page.siteInfo.excerpt}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="d-flex align-items-center">
                                <div class="badge rounded-pill text-bg-secondary px-3 py-2 fw-medium">
                                    Last update: ${formatDate(page.siteInfo.lastUpdate)}
                                </div>
                                <div class="d-flex">
                                    ${pageSavedInfoBadges(page)}
                                    ${pageSiteInfoBadges(page)}
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

                    ${pageSimilarPages.length === 0 ? '' : pageSimilarByContent(page)}                    
                </div>
            `
        );
    }

    $(document).ready(function() {        
        if (pageInfo.siteInfo === 'none') return;
        $(settings.layouts.contentArea.contentWrapper).prepend($(pageInfoContainer(pageInfo)));
        $(document)
            .off('click', 'button[sitefunction="pageShowPageFullInfo"]')
            .on('click', 'button[sitefunction="pageShowPageFullInfo"]', function() {
                showPageFullInfoCanvas(pageInfo);
            });
        setPageButtonsFunctions();
        refreshPageAfterOffCanvasClose();
        setContentSeparators();        
    })
}

// called from _includes/siteIncludes/partials/page-common/page-tags.html
const page__showPageCustomTags = () => {

    const createPageTagsContainer = () => {
        return (
            `
                <div id="pageTags" class="container px-5">
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
        const siteTags = pageInfo.siteInfo.tags || [];
        let customTags = pageInfo.savedInfo.customTags || [];
        if (siteTags.length + customTags.length === 0 ) {
            $('#pageTags').remove();
            return;
        }

        // if the page doesn't have siteTags but has customTags
        // we need to re-create the pageTags container
        // because _/includes/siteIncludes/partials/page-common/page-tags.html template will not create it in full
        // and will create only the div with the id=pageTags
        if ( pageInfo.siteInfo.tags.length === 0) {
            $('#pageTags').remove();
            // JTD has 2 footers
            // $('footer[class="site-footer "]') is the one on the bottom of the left sidebar
            // so we need to avoid that one
            $('footer[class!="site-footer"]').append(createPageTagsContainer()); 
        }
        customTags.forEach( tag => {
            const numPages = getTagPages(tag);
            $('#pageTags').append($(tagElement(tag, numPages)));
        });    
    });
};

// INTERNAL FUNCTIONS, NOT CALLED FROM HTML TEMPLATES
const refreshPageDynamicInfo = () => {
    page__showPageCustomTags();
    page__getPageInfo();
    page__getPageNotes();
    page__getRelatedPages();
    page__getAutoSummary();
    page__getPageFeedbackForm();
    
}

const setPageButtonsFunctions = () => {
    // click "Tags" badge
    $(document)
        .off('click', 'span[siteFunction="pageHasCustomTagsBadge"]')
        .on('click', 'span[siteFunction="pageHasCustomTagsBadge"]', function() {
            $('html, body').animate({
                scrollTop: $('#pageTags').offset().top
            }, 100);
        });

    $(document)
        .off('click', 'span[siteFunction="pageHasSiteTagsBadge"]')
        .on('click', 'span[siteFunction="pageHasSiteTagsBadge"]', function() {
            $('html, body').animate({
                scrollTop: $('#pageTags').offset().top
            }, 100);
        });
    
    // click "Notes" badge
    $(document)
        .off('click', 'span[siteFunction="pageHasCustomNotesBadge"]')
        .on('click', 'span[siteFunction="pageHasCustomNotesBadge"]', function() {
            $('html, body').animate({
                scrollTop: $('#pageNotes').offset().top
            }, 100);
        });

    // click "Related" badge
    $(document)
        .off('click', 'span[siteFunction="pageHasRelatedPagesBadge"]')
        .on('click', 'span[siteFunction="pageHasRelatedPagesBadge"]', function() {
            $('html, body').animate({
                scrollTop: $('#pageRelatedPages').offset().top
            }, 100);
        });

    // hover "Summary" badge
    $(document)
        .off('mouseenter', 'span[siteFunction="pageHasAutoSummaryBadge"]')
        .off('mouseleave', 'span[siteFunction="pageHasAutoSummaryBadge"]')
        .on('mouseenter', 'span[siteFunction="pageHasAutoSummaryBadge"]', function() {
            $('#pageAutoSummary').addClass('border-warning border-bottom border-opacity-25')
        })
        .on('mouseleave', 'span[siteFunction="pageHasAutoSummaryBadge"]', function() {
            $('#pageAutoSummary').removeClass('border-warning border-bottom border-opacity-25');
        });

}

const refreshPageAfterOffCanvasClose = () => {
    removeObservers('.offcanvas class=hiding getClass=true');
    setElementChangeClassObserver('.offcanvas', 'hiding', true, () => {
        $('div[siteFunction="pageCustomTagButton"]').remove();
        $('div[id="pageLastUpdateAndPageInfo"]').remove();
        refreshPageDynamicInfo();
    });
}

const setContentSeparators = () => {
    setTimeout( () => {
        if ($('hr[siteFunction="pageContentTopSeparator"]').length === 0)
            $('main').prepend('<hr siteFunction="pageContentTopSeparator" class="my-4">');
        
        if ($('hr[siteFunction="pageContentBottomSeparator"]').length === 0)
            $('main').append('<hr siteFunction="pageContentBottomSeparator" class="my-4">');
    }, 100);
}

const createHSFeedbackForm = (
    formContainerSelector, 
    page, 
    formSettings, 
    onFormReady, 
    onBeforeFormSubmit,
    onFormSubmitted,
    onBeforeFormInit
) => {
    return new Promise((resolve) => {
        hsIntegrate.hsForm(
            formContainerSelector, 
            page,
            formSettings,
            {
                region: hsSettings.region,
                portalID: hsSettings.portalID, 
                formID: hsSettings.feedbackFormID
            },
            onFormReady, 
            onBeforeFormSubmit,
            onFormSubmitted,
            onBeforeFormInit
        );
        resolve(formContainerSelector);
    });
}

const fedbackFormContainer__ASYNC = (formContainerSelector) => {
    return new Promise((resolve) => {
        const formContainer = () => {
            return (
                `
                    <div id = "pageFeedbackFormColumn" class="mt-4 px-5 col-5">
                        <div 
                            id="${formContainerSelector}" 
                            class="d-none">
                        </div>
                        <div class="hsFormLink mt-2 text-primary">
                            <a href="${settings.hsIntegration.privacyLink}" target=_blank>
                                Privacy Policy
                            </a>
                        </div>
                    </div>
                `
            );
        }

        $(`#pageFeedbackFormColumn`).remove();
        $('footer[class!="site-footer"]').append(formContainer('pageFeedbackForm'));
        resolve(formContainerSelector);
    });
}
