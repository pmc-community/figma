const home__headerSection = () => {
    $(document).ready(function() {{
        homePage.setHeaderButtonsFunctions();
    }});
}

const home__collectionsSection = () => {
    $(document).ready(function() {{
        homePage.hoverListItems('li[siteFunction="homeCollection_doc"]');
    }});
}

const home__recentAndPopularSection = () => {
    $(document).ready(function() {{
        homePage.hoverListItems('li[siteFunction="homeCollection_page"]');
        homePage.getPopularCategories();
        homePage.getPopularTags();
        homePage.hoverListItems_DELEGATE('li[siteFunction="homeRecentAndPopular_popular_categories_cat"]');
        homePage.hoverListItems_DELEGATE('li[siteFunction="homeRecentAndPopular_popular_tags_tag"]');
    }});
}

const home__statsSection = () => {
    $(document).ready(function() {{
        console.log('here')
    }});
}

homePage = {

    setHeaderButtonsFunctions: () => {
        $('button[siteFunction="homePageHeaderNavBtns_collections"]').on('click', function() {
            $('html, body').animate({
                scrollTop: $('div[siteFunction="homeCollectionsContainer"]').offset().top - $(settings.headerAboveContent.headerID).height() - settings.headerAboveContent.offsetWhenScroll
            }, 100);
        });

        $('button[siteFunction="homePageHeaderNavBtns_recentAndPopular"]').on('click', function() {
            $('html, body').animate({
                scrollTop: $('div[siteFunction="homeRecentAndPopularContainer"]').offset().top - $(settings.headerAboveContent.headerID).height() - settings.headerAboveContent.offsetWhenScroll
            }, 100);
        });

        $('button[siteFunction="homePageHeaderNavBtns_stats"]').on('click', function() {
            $('html, body').animate({
                scrollTop: $('div[siteFunction="homeStatsContainer"]').offset().top - $(settings.headerAboveContent.headerID).height() - settings.headerAboveContent.offsetWhenScroll
            }, 100);
        });

        $('button[siteFunction="homePageHeaderNavBtns_support"]').on('click', function() {
            $('html, body').animate({
                scrollTop: $('div[siteFunction="pageFeedbackAndSupport"]').offset().top - $(settings.headerAboveContent.headerID).height() - settings.headerAboveContent.offsetWhenScroll
            }, 100);
        });
    },

    hoverListItems: (itemSelector) => {
        $(itemSelector).each(function() {
            $(this)
                .on('mouseenter', function() {
                    $($(this))
                        .removeClass('bg-transparent')
                        .addClass('bg-secondary bg-opacity-10');
                })
                .on('mouseleave', function() {
                    $($(this))
                        .addClass('bg-transparent')
                        .removeClass('bg-secondary bg-opacity-10');
                });
            });
    },

    hoverListItems_DELEGATE: (itemSelector) => {
        $(itemSelector).each(function() {
            $(document)
                .on('mouseenter', itemSelector, function() {
                    $($(this))
                        .removeClass('bg-transparent')
                        .addClass('bg-secondary bg-opacity-10');
                })
                .on('mouseleave', itemSelector, function() {
                    $($(this))
                        .addClass('bg-transparent')
                        .removeClass('bg-secondary bg-opacity-10');
                });
            });
    },

    getPopularCategories: () => {
        const catItem = (cat) => {
            catItemClass = cat.type === 'siteCat' ? 'text-danger' : 'text-success';
            return (
                `   
                    <a href="/cat-info?cat=${cat.name}">
                        <li 
                            siteFunction="homeRecentAndPopular_popular_categories_cat"
                            class="list-group-item d-flex align-items-center justify-content-between align-items-start py-2 my-0 bg-transparent border-top border-secondary border-opacity-25">
                            <div class="ms-2 me-auto">
                                <div class="${catItemClass}">${cat.name}</div>
                            </div>
                            <span class="badge bg-warning-subtle text-dark rounded-pill">${cat.numPages}</span>
                        </li>
                    </a>
                `
            );
        }

        topCats = homePage.createTopCatsList();
        let catHtml = '';
        topCats.forEach(cat => {
            catHtml += catItem(cat);
        });

        if (topCats.length === 0) {
            $('div[siteFunction="homeRecentAndPopular_popular_categories"]').remove();
            return;
        }
        catHtml = `<ul siteFunction="homeRecentAndPopular_popular_categories_list" class="pl-0">${catHtml}</ul>`
        $('div[siteFunction="homeRecentAndPopular_popular_categories_container"]').prepend($(catHtml));
    },

    getPopularTags: () => {
        const tagItem = (tag) => {
            tagItemClass = tag.type === 'siteTag' ? 'text-primary' : 'text-success';
            return (
                `   
                    <a href="/tag-info?tag=${tag.name}">
                        <li 
                            siteFunction="homeRecentAndPopular_popular_tags_tag"
                            class="list-group-item d-flex align-items-center justify-content-between align-items-start py-2 my-0 bg-transparent border-top border-secondary border-opacity-25">
                            <div class="ms-2 me-auto">
                                <div class="${tagItemClass}">${tag.name}</div>
                            </div>
                            <span class="badge bg-warning text-dark rounded-pill">${tag.numPages}</span>
                        </li>
                    </a>
                `
            );
        }

        topTags = homePage.createTopTagsList();
        let tagHtml = '';
        topTags.forEach(tag => {
            tagHtml += tagItem(tag);
        });

        if (topTags.length === 0) {
            $('div[siteFunction="homeRecentAndPopular_popular_tags"]').remove();
            return;
        }
        tagHtml = `<ul siteFunction="homeRecentAndPopular_popular_tags_list" class="pl-0">${tagHtml}</ul>`
        $('div[siteFunction="homeRecentAndPopular_popular_tags_container"]').prepend($(tagHtml));
    },

    createTopCatsList: () => {
        let topSiteCats = [];
        let topCustomCats = [];
        catList.forEach( cat => {
            const catObj = {
                name: cat,
                type: 'siteCat',
                numPages: catDetails[cat].numPages
            };
            topSiteCats.push(catObj);
        });

        let topCustomCatsRaw = getTopCustomCats();
        topCustomCatsRaw.forEach( cat => {
            const catObj = {
                name: cat.name,
                type: 'customCat',
                numPages: cat.numPages
            };
            topCustomCats.push(catObj);
        });

        allCats = _.unionWith(topSiteCats, topCustomCats, _.isEqual);
        sortedTopCats = _.orderBy(allCats, ['numPages'], ['desc']);
        return _.take(sortedTopCats, pageSettings.sections.mostRecentAndPopular_section.popularCatsToShow);
    },

    createTopTagsList: () => {
        let topSiteTags = [];
        let topCustomTags = [];
        tagList.forEach( tag => {
            const tagObj = {
                name: tag,
                type: 'siteTag',
                numPages: tagDetails[tag].numPages
            };
            topSiteTags.push(tagObj);
        });

        let topCustomTagsRaw = getTopCustomTags();
        topCustomTagsRaw.forEach( tag => {
            const tagObj = {
                name: tag.name,
                type: 'customTag',
                numPages: tag.numPages
            };
            topCustomTags.push(tagObj);
        });

        allTags = _.unionWith(topSiteTags, topCustomTags, _.isEqual);
        sortedTopTags = _.orderBy(allTags, ['numPages'], ['desc']);
        return _.take(sortedTopTags, pageSettings.sections.mostRecentAndPopular_section.popularTagsToShow);
    }

}