

// called from siteIncludes/partials/site-pages/pageSearch.html
const sitePages__pageSearch = () => {
    $(document).ready(function() {
        sitePagesFn.setPageSearchList();
    });

    // small delay to be sure that offcanvas is ready in the DOM, otherwise the observer will fail to set
    setTimeout(()=>{sitePagesFn.handleOffCanvasClose()}, 200); 

    sitePagesFn.setPageSearchButtonsFunctions();
}

// called from siteIncludes/partials/site-pages/pages.html
const sitePages__pages = () => {
    $(document).ready( function() { 
        sitePagesFn.setPagesTableButtonsFunctions();
        sitePagesFn.setPagesTablePageBadges();
        sitePagesFn.setPagesTags();
        sitePagesFn.setPagesCats();
        sitePagesFn.setPagesDataTable();
    });
}

// using a 'namespace' to avoid fn name duplicates
sitePagesFn = {
    setPageSearchList: () => {
        setSearchList(
            `#pageSearchInput`, 
            `#pageSearchResults`, 
            `li[siteFunction="searchPageListItem"]`, 
            `<li siteFunction="searchPageListItem">`,
            '</li>',
            false,
            (result) => { sitePagesFn.showPageInfo(transformStringFromPageSearchList(result)); },
            (filteredList) => {}
        );
    },
    
    showPageInfo: (page) => {
        pageInfo = {
            siteInfo: getObjectFromArray ({permalink: page.permalink, title: page.title}, pageList),
            savedInfo: getPageSavedInfo (page.permalink, page.title),
            page: page
        };
        showPageFullInfoCanvas(pageInfo);
    },

    updateInfoAfterOffCanvasClose: (page) => {
        sitePagesFn.setPagesTablePageBadges();
        sitePagesFn.setPagesTags();
        sitePagesFn.setPagesCats();
    },

    handleOffCanvasClose: () =>{
        // from utilities.js
        removeObservers('.offcanvas class=hiding getClass=true');
        setElementChangeClassObserver('.offcanvas', 'hiding', true, () => {
            sitePagesFn.updateInfoAfterOffCanvasClose(pageInfo.page);
            $(`table[siteFunction="sitePagesDetailsPageTable"] td`).removeClass('table-active'); // remove any previous selection
        });
    },

    setPageSearchButtonsFunctions: () => {
        $('#openSitePagesDetails').off('click').click( function() {
            $('#site_pages_details').removeClass('d-none');
            // redraw the pages table to avoid worng table head sizing
            sitePagesFn.redrawPagesTable();
            $('div[sitefunction="sitePagesDetails"]').fadeIn();
        });            
    },

    setPagesTableButtonsFunctions: () => {
        $('span[siteFunction="sitePagesPageLinkToOffCanvas"]').off('click').click( function() {
            sitePagesFn.showPageInfo({permalink: $(this).attr('pagePermalinkReference'), title:$(this).attr('pageTitleReference')});
        });

        $('span[siteFunction="pageRelatedPageLinkToOffCanvas"]').off('click').click( function() {
            sitePagesFn.showPageInfo({permalink: $(this).attr('pageRelatedPermalinkReference'), title:$(this).attr('pageRelatedTitleReference')});
        });

        $('span[siteFunction="pageSimilarPageLinkToOffCanvas"]').off('click').click( function() {
            sitePagesFn.showPageInfo({permalink: $(this).attr('pageSimilarPermalinkReference'), title:$(this).attr('pageSimilarTitleReference')});
        });
    },

    setPagesTablePageBadges: () => {
        const pageSiteInfoBadges = (page) => {
            if (page.siteInfo === 'none') return ['',[]];
            let siteInfoBadges = '';
            let flags = [];
            
            if (page.siteInfo.tags.length > 0 ) {
                siteInfoBadges += 
                    `
                        <span
                            siteFunction="pageHasSiteTagsBadge"
                            title = "Page ${page.siteInfo.title} has site tags" 
                            class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-primary">
                            Tags
                        </span>
                    `;
                flags.push('Has Site Tags');
            }

            if (page.siteInfo.categories.length > 0 ) {
                siteInfoBadges += 
                    `
                        <span
                            siteFunction="pageHasSiteCategoryBadge"
                            title = "Page ${page.siteInfo.title} has site categories" 
                            class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-danger">
                            Categories
                        </span>
                    `;
                flags.push('Has Site Categories');
            }

            if (page.siteInfo.autoSummary !== '' ) {
                siteInfoBadges += 
                    `
                        <span
                            siteFunction="pageHasAutoSummaryBadge"
                            title = "Page ${page.siteInfo.title} has auto generated summary" 
                            class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-dark">
                            Summary
                        </span>
                    `;
                flags.push('Has Auto Summary');
            }

            if (page.siteInfo.excerpt !== '' ) {
                siteInfoBadges += 
                    `
                        <span
                            siteFunction="pageHasExcerptBadge"
                            title = "Page ${page.siteInfo.title} has excerpt" 
                            class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-secondary">
                            Excerpt
                        </span>
                    `;
                flags.push('Has Excerpt');
            }
            
            return [siteInfoBadges, flags];
        }

        const pageSavedInfoBadges = (page) => {
            if (page.savedInfo === 'none') return ['',[]];
            let savedInfoBadges = '';
            let flags = [];
    
            if (page.savedInfo.customTags.length > 0 ) {
                savedInfoBadges += 
                    `
                        <span
                            siteFunction="pageHasCustomTagsBadge"
                            title = "Page ${page.siteInfo.title} has custom tags" 
                            class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-success">
                            Tags
                        </span>
                    `;
                flags.push('Has Custom Tags');
            }
            
            if (page.savedInfo.customCategories.length > 0 ) {
                savedInfoBadges += 
                    `
                        <span
                            siteFunction="pageHasCustomCategoriesBadge"
                            title = "Page ${page.siteInfo.title} has custom categories" 
                            class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-success">
                            Categories
                        </span>
                    `;
                flags.push('Has Custom Categories');
            }
            
            if (page.savedInfo.customNotes.length > 0 ) {
                savedInfoBadges += 
                    `
                        <span
                            siteFunction="pageHasCustomNotesBadge"
                            title = "Page ${page.siteInfo.title} has custom notes" 
                            class="m-1 px-3 py-2 fw-medium badge rounded-pill text-bg-warning">
                            Notes
                        </span>
                    `;
                flags.push('Has Custom Notes');
            }
    
            return [savedInfoBadges, flags];
    
        }
    
        $('td[colFunction="pageInfoBadges"]').each( function() {
            const pageSiteInfo = getObjectFromArray(
                {
                    permalink: $(this).attr('pagePermalinkReference'), 
                    title: $(this).attr('pageTitleReference')
                }, pageList);
            
            const pageSavedInfo = getPageSavedInfo($(this).attr('pagePermalinkReference'), $(this).attr('pageTitleReference'));
            
            siteInfo = pageSiteInfoBadges({ siteInfo: pageSiteInfo });
            savedInfo = pageSavedInfoBadges({ siteInfo: pageSiteInfo, savedInfo: pageSavedInfo });
            const badgesHtml = 
                '<span>' +
                siteInfo[0] +
                savedInfo[0] +
                '</span>';
            $(this).html(badgesHtml);  
            $(this).attr('data-raw',JSON.stringify(_.union(siteInfo[1], savedInfo[1])));
        })
    },

    setPagesDataTable: () => {

        if( $.fn.DataTable.isDataTable(`table[siteFunction="sitePagesDetailsPageTable"]`) ) {
            $(`table[siteFunction="sitePagesDetailsPageTable"]`).DataTable().destroy();
            $(`table[siteFunction="sitePagesDetailsPageTable"]`).removeAttr('id').removeAttr('aria-describedby');
        }
        const colDefinition = [
            // page name
            {
                className: 'alwaysCursorPointer',
                title:'Title',
                width:'15%',
                type: 'html-string'
            }, 
    
            // last update
            {
                title:'Last Update',
                type: 'date-dd-mmm-yyyy', 
                className: 'dt-left', 
                exceptWhenRowSelect: true,
                searchable: true,
            }, 
    
            // details
            { 
                title:'Details',
                type: 'string',
                searchable: true, 
                orderable: false, 
                exceptWhenRowSelect: true,
                visible: false
            }, 

            // related
            { 
                title:'Related Pages',
                type: 'string',
                searchable: true, 
                orderable: false, 
                exceptWhenRowSelect: true
            },

            // similar
            { 
                title:'Similar Pages',
                type: 'string',
                searchable: true, 
                orderable: false, 
                exceptWhenRowSelect: true
            },
            
            // excerpt
            {
                type: 'string',
                title:'Excerpt',
                exceptWhenRowSelect: true,
                orderable: false,
                visible: false
            },

            // auto summary
            {
                type: 'string',
                title:'Summary',
                exceptWhenRowSelect: true,
                searchable: true,
                orderable: false,
                visible: false
            },

            // tags
            {
                type: 'string',
                title:'Tags',
                exceptWhenRowSelect: true,
                searchable: true,
                orderable: false,
                visible: false
            },

             // cats
             {
                type: 'string',
                title:'Categories',
                exceptWhenRowSelect: true,
                searchable: true,
                orderable: false,
                visible: false
            }
        ];

        const commonAdditionalTableSettings = {
            scrollX:true,
            fixedColumns: {
                "left": 1
            },
            //autoWidth: true,
            deferRender: true, // Defer rendering for speed up
            
            initComplete: function(settings, json) {
                    // Adjust columns after initialization to ensure proper alignment
                    const table = $(`table[siteFunction="sitePagesDetailsPageTable"]`).DataTable();
                    setTimeout(()=>{
                        table.order([0, 'asc']).draw();
                        table.columns.adjust().draw();
                    },100);
                    
            },

        };

        const additionalTableSettings = commonAdditionalTableSettings;

        setDataTable(
            `table[siteFunction="sitePagesDetailsPageTable"]`,
            `SitePages`,     
            colDefinition,
            (table) => {sitePagesFn.postProcessPagesTable(table)}, // will execute after the table is created
            (rowData) => {}, // will execute when click on row
            additionalTableSettings // additional datatable settings for this table instance
            
        );
    },

    postProcessPagesTable: (table) => {
        if(table) {
            sitePagesFn.addAdditionalPagesTableButtons(table);
        }   
    },

    addAdditionalPagesTableButtons: (table) => {
        // post processing table: adding 2 buttons in the bottom2 zone
        gotToTagBtn = {
           attr: {
               siteFunction: 'tableNavigateToTags',
               title: 'Go to tags'
           },
           className: 'btn-warning btn-sm text-light focus-ring focus-ring-warning mb-2',
           text: 'Tags info',
           action: () => {
               window.location.href = '/tag-info'
           }
       }
    
       gotToCatsBtn = {
           attr: {
               siteFunction: 'tableNavigateToCategoriesSP',
               title: 'Go to categories'
           },
           className: 'btn-success btn-sm text-light focus-ring focus-ring-warning mb-2',
           text: 'Categories',
           action: () => {
               window.location.href = '/cat-info'
           }
       }
       const btnArray = [];
       btnArray.push(gotToTagBtn);
       btnArray.push(gotToCatsBtn);
       addAdditionalButtonsToTable(table, 'table[siteFunction="sitePagesDetailsPageTable"]', 'bottom2', btnArray);
    },

    redrawPagesTable: () => {
        const table = $(`table[siteFunction="sitePagesDetailsPageTable"]`).DataTable();
        setTimeout(()=>{ table.draw(); },100);
    },

    setPagesTags: () => {

        const tagElement = (tag, isSiteTag) => {
            const tagBtnColor = isSiteTag ? 'btn-primary' : 'btn-success';
            return  (
                `
                    <a 
                        siteFunction="tagButton" 
                        tagType="${isSiteTag ? 'siteTag' : 'customTag'}"
                        id="${tag}" type="button" 
                        class="focus-ring focus-ring-warning px-3 mr-5 my-2 btn btn-sm ${tagBtnColor} position-relative"
                        title = "Details for tag ${tag}"
                        href="tag-info?tag=${tag}">
                        ${tag}
                    </a>
                `
            );
        }

        $('td[colFunction="pageInfoTags"]').each(function() {
            const permalink = $(this).attr('pagePermalinkReference');
            const title = $(this).attr('pageTitleReference');
            pageSiteInfo = getObjectFromArray({permalink: permalink, title: title}, pageList);
            const siteTags = pageSiteInfo === 'none' ? [] : pageSiteInfo['tags'] || [];
            const customTags = getPageTags({siteInfo:{permalink: permalink, title: title}}) || [];
            const allTags = _.union(siteTags, customTags);
            $(this).attr('data-raw', JSON.stringify(allTags));

            let tagsHtml = '';
            siteTags.forEach( tag => {
                tagsHtml += tagElement(tag, true);
            });

            customTags.forEach( tag => {
                tagsHtml += tagElement(tag, false);
            });

            tagsHtml = `<span>${tagsHtml}</span>`;
            $(this).html(tagsHtml);
        });

    },

    setPagesCats: () => {

        const catElement = (cat, isSiteCat) => {
            const catBtnColor = isSiteCat ? 'text-danger' : 'text-success';
            return  (
                `
                    <a 
                        siteFunction="catButton" 
                        catType= "${isSiteCat ? 'siteCat' : 'customCat'}"
                        id="${cat}" type="button" 
                        class="focus-ring focus-ring-warning px-2 mr-2 my-2 btn btn-sm btn btn-sm ${catBtnColor} fw-medium border-0 shadow-none position-relative"
                        title = "Details for category ${cat}"
                        href="cat-info?cat=${cat}">
                        ${cat}
                    </a>
                `
            );
        }

        $('td[colFunction="pageInfoCats"]').each(function() {
            const permalink = $(this).attr('pagePermalinkReference');
            const title = $(this).attr('pageTitleReference');
            pageSiteInfo = getObjectFromArray({permalink: permalink, title: title}, pageList);
            const siteCats = pageSiteInfo === 'none' ? [] : pageSiteInfo['categories'] || [];
            const customCats = getPageCats({siteInfo:{permalink: permalink, title: title}}) || [];
            const allCats = _.union(siteCats, customCats);
            $(this).attr('data-raw', JSON.stringify(allCats));

            let catsHtml = '';
            siteCats.forEach( cat => {
                catsHtml += catElement(cat, true);
            });

            customCats.forEach( cat => {
                catsHtml += catElement(cat, false);
            });

            catsHtml = `<span>${catsHtml}</span>`;
            $(this).html(catsHtml);
        });

    }
}
