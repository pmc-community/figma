// Let's do some work
const setTagsSupport = () => {

    requestedTag = readQueryString('tag');
    if (requestedTag) showTagDetails(requestedTag);

    setPageSavedButtonsStatus();        
    
    $(document).ready(()=> {
        setCustomTagCloud();
        setTagInfoPageButtonsFunctions();
        updateTagSearchList();
        setTagSearchList();
        setTagCloudButtonsContextMenu();
        setPageTagButtonsContextMenu();
    });
    
    // from utilities.js
    removeObservers('.offcanvas class=hiding getClass=true');
    setElementChangeClassObserver('.offcanvas', 'hiding', true, () => {
        setPageSavedButtonsStatus();
        
        // tag was passed to pageInfo global before opening the offcanvas 
        // in order to preserve the reference to the active tag details datatable
        // see processTagDetailsTableRowClick
        updateAllTagInfoOnPage(pageInfo.tag);
    });

}
// work ends here

// FUNCTIONS
const updateAllTagInfoOnPage = (tagForActiveTagDetailsTable = null) => {
    setCustomTagCloud(); //only custom tags are dynamic, site tags don't need update since cannot be modified
    updateTagSearchList(); //update the tag search list items to have all custom tags modifications
    setTagSearchList(); //tag search list must be recreated after the update of the list items
    if (tagForActiveTagDetailsTable) 
        addCustomTagsToPages(null, tagForActiveTagDetailsTable); //update custom tags for the pages in the active tag details datatable
}

const setTagInfoPageButtonsFunctions = () => {

    // click "Tag Cloud" button and show the tag cloud container
    $('#openTagCloud').off('click').click(function() {
        $('#cloud_tag_container').fadeIn();
    });

    // click on tag button in the tag cloud and show the tag details table
    // delegate listener at document level since buttons are dynamically added/removed/modified
    $(document)
        .off('click', 'button[siteFunction="tagButton"]')
        .on('click', 'button[siteFunction="tagButton"]', function() {
            const selectedTag = $(this).attr('id');
            showTagDetails(selectedTag);
            setPageSavedButtonsStatus(); 
        });

    // click on the tag button in tag details table and show the details table for the clicked tag
    // delegate listener at document level since buttons are dynamically added/removed/modified
    $(document)
        .off('click', 'button[siteFunction="pageTagButton"]')
        .on('click', 'button[siteFunction="pageTagButton"]', function(event) {
            const handlePageTagButtonClick = (event) => {
                const selectedTag = $(event.target).attr('id');
                showTagDetails(selectedTag.match(/pageTag_(.*)/)[1]);
                setPageSavedButtonsStatus(); 
            }   
            handlePageTagButtonClick(event);
        });

    // remove page from saved items
    $('button[siteFunction="tagPageItemRemoveFromSavedItems"]').off('click').click(function() {
        const pageToRemove = {
            siteInfo: {
                permalink: $(this).attr('pageRefPermalink'),
                title: $(this).attr('pageRefTitle')
            }
        }
        removePageFromSavedItems(pageToRemove);
        setPageSavedButtonsStatus();
        updateAllTagInfoOnPage($(this).attr('tagForTagTableDetailsReference'));
    });

    // save page to saved items
    $('button[siteFunction="tagPageItemSaveForLaterRead"]').off('click').click(function() {
        const pageToSave = {
            siteInfo: {
                permalink: sanitizeURL($(this).attr('pageRefPermalink')),
                title: DOMPurify.sanitize($(this).attr('pageRefTitle')),
                customTags: [],
                customCategories: [],
                customNotes:[]
            }
        }
        savePageToSavedItems(pageToSave);
        setPageSavedButtonsStatus();
        updateAllTagInfoOnPage($(this).attr('tagForTagTableDetailsReference'));
    });

    // update tag for all pages when click "Update" in the context menu for custom tags in tag cloud
    // delegate event handler to document since the buttons are not available when setting the listener
    $(document)
        .off('click', 'button[siteFunction="tagCloudEditCustomTag"]')
        .on('click', 'button[siteFunction="tagCloudEditCustomTag"]', handleTagUpdate);

    // update tag for a page when click "Update" in the context menu for custom tags in page tag column from a datatable
    // delegate event handler to document since the buttons are not available when setting the listener
    $(document)
        .off('click', 'button[siteFunction="pageTagEditCustomTag"]')
        .on('click', 'button[siteFunction="pageTagEditCustomTag"]', handlePageTagUpdate);
    
    // add tag for a page when click "Add" in the context menu for custom tags in page tag column from a datatable
    // delegate event handler to document since the buttons are not available when setting the listener
    $(document)
        .off('click', 'button[siteFunction="pageTagAddCustomTag"]')
        .on('click', 'button[siteFunction="pageTagAddCustomTag"]', handlePageTagAdd);

}

const setPageTagButtonsContextMenu = () => {

    const getMenuItemHtml = (title, text, icon) => {
        return `
            <li title="${title}">
                <a class="icon-link">
                    <i class="bi ${icon}"></i>
                    ${text}
                </a>
            </li>`
    }

    const menuContent = 
    {   
        header: '',
        menu:[
            {
                html: getMenuItemHtml(`Remove the tag from page`,'Remove tag', 'bi-x-circle'),
                handler: handleTagRemovalFromPage
            }
        ],
        footer: 
            `
                <input type="text" autocomplete="off" class="form-control my-2" id="pageTagEditCustomTagInput">

                <div class="mb-2">
                    <button 
                        siteFunction="pageTagEditCustomTag"
                        tagForTagTableDetailsReference="" 
                        tagReference=""
                        id="pageTagEditCustomTag" 
                        type="button" 
                        class="focus-ring focus-ring-warning btn btn-sm btn-warning mt-2 position-relative pageTagContextMenuFooterBtn">
                        Update      
                    </button>

                    <button 
                        siteFunction="pageTagAddCustomTag"
                        tagForTagTableDetailsReference="" 
                        tagReference=""
                        id="pageTagEditCustomTag" 
                        type="button" 
                        class="focus-ring focus-ring-warning btn btn-sm btn-success mt-2 position-relative pageTagContextMenuFooterBtn">
                        Add      
                    </button>
                </div>
            `
    };
    
    setContextMenu (
        'button[sitefunction="pageTagButton"]', 
        'body', 
        menuContent, 
        (menuItem, itemClicked) => {
            // get the menu item click handler and execute it            
            getContextMenuItemHandler(
                menuItem.text().replace(/[\n\r\t]/g, '').trim(), 
                menuContent
            ).bind(
                null,
                // page
                {
                    title: itemClicked.closest('td').attr('pageTitleReference'),
                    permalink: itemClicked.closest('td').attr('pagePermalinkReference')
                },

                // tag to be processed
                $(itemClicked.prop('outerHTML')).children().remove().end().text().replace(/[\n\r\t]/g, '').trim(),

                // tag for the active tag details datatable
                $('div[siteFunction="tagDetails"]:not(.d-none) button[sitefunction="tagForActiveTagDetailsDatatable"]').text().trim() 
            )();
        },
        (event) => {
            // tag to be processed
            const $tagBtn = $(event.target).closest('button[sitefunction="pageTagButton"][tagtype="customTag"]').clone();
            const tag = $($tagBtn.prop('outerHTML')).children().remove().end().text().replace(/[\n\r\t]/g, '').trim();
            $('#pageTagEditCustomTagInput').val(tag);
            $('#pageTagEditCustomTagInput').focus();

            // tag for active tag details datatable
            const tagForActiveTagDetailsDatatable = $('div[siteFunction="tagDetails"]:not(.d-none) button[sitefunction="tagForActiveTagDetailsDatatable"]').text().trim();
            
            // set needed attributes to the context menu footer buttons
            $('button[siteFunction="pageTagEditCustomTag"]').attr('tagForTagTableDetailsReference',tagForActiveTagDetailsDatatable);
            $('button[siteFunction="pageTagEditCustomTag"]').attr('tagReference', tag);

            $('button[siteFunction="pageTagAddCustomTag"]').attr('tagForTagTableDetailsReference',tagForActiveTagDetailsDatatable);
            $('button[siteFunction="pageTagAddCustomTag"]').attr('tagReference', tag);

            const page = {
                title: $(event.target).closest('td').attr('pageTitleReference'),
                permalink: $(event.target).closest('td').attr('pagePermalinkReference'),
            };

            $('button[siteFunction="pageTagEditCustomTag"]').attr('pageTitleReference', page.title);
            $('button[siteFunction="pageTagEditCustomTag"]').attr('pagePermalinkReference', page.permalink);

            $('button[siteFunction="pageTagAddCustomTag"]').attr('pageTitleReference', page.title);
            $('button[siteFunction="pageTagAddCustomTag"]').attr('pagePermalinkReference', page.permalink);

            // removing things that are not applicable to site tags
            if (_.findIndex(globCustomTags, item => item.toLowerCase() === tag.trim().toLowerCase()) === -1 ) {
                $('.context-menu-list').remove();
                $('button[sitefunction="pageTagEditCustomTag"]').remove();
                $('hr[sitefunction="contextMenuSeparator"]').remove();
            }

        },
        ['pageTagContextMenu']
    );
}

const handleTagRemovalFromPage = (page = {}, tag, tagForActiveTagDetailsDatatable) => {
    console.log(`removing ${tag} from ${page.title} = ${page.permalink}, table is ${tagForActiveTagDetailsDatatable}`);
    updateAllTagInfoOnPage(tagForActiveTagDetailsDatatable);
}

const handlePageTagUpdate = () => {
    const tag = cleanText($('#pageTagEditCustomTagInput').val());
    const oldTag = $('button[siteFunction="pageTagEditCustomTag"]').attr('tagReference');
    const title = $('button[siteFunction="pageTagEditCustomTag"]').attr('pageTitleReference');
    const permalink = $('button[siteFunction="pageTagEditCustomTag"]').attr('pagePermalinkReference');
    const page = {
        title: title,
        permalink: permalink
    };
    
    const tagForActiveTagDetailsDatatable = $('div[siteFunction="tagDetails"]:not(.d-none) button[sitefunction="tagForActiveTagDetailsDatatable"]').text().trim();

    $('.context-menu').remove();

    console.log(`update ${oldTag} to ${tag} for page ${page.title} = ${page.permalink}, table is ${tagForActiveTagDetailsDatatable}`);
    updateAllTagInfoOnPage(tagForActiveTagDetailsDatatable);
}

const handlePageTagAdd = () => {
    const tag = cleanText($('#pageTagEditCustomTagInput').val());
    const title = $('button[siteFunction="pageTagAddCustomTag"]').attr('pageTitleReference');
    const permalink = $('button[siteFunction="pageTagAddCustomTag"]').attr('pagePermalinkReference');
    const page = {
        title: title,
        permalink: permalink
    };
    
    const tagForActiveTagDetailsDatatable = $('div[siteFunction="tagDetails"]:not(.d-none) button[sitefunction="tagForActiveTagDetailsDatatable"]').text().trim();

    $('.context-menu').remove();

    console.log(`adding ${tag} for page ${page.title} = ${page.permalink}, table is ${tagForActiveTagDetailsDatatable}`);
    updateAllTagInfoOnPage(tagForActiveTagDetailsDatatable);
}

const setTagCloudButtonsContextMenu = () => {

    const getMenuItemHtml = (title, text, icon) => {
        return `
            <li title="${title}">
                <a class="icon-link">
                    <i class="bi ${icon}"></i>
                    ${text}
                </a>
            </li>`
    }

    const menuContent = 
    {   
        header: '',
        menu:[
            {
                html: getMenuItemHtml(`Remove the tag from all pages`,'Remove tag', 'bi-trash'),
                handler: handleTagRemoval
            }
        ],
        footer: 
            `
                <input type="text" autocomplete="off" class="form-control my-2" id="tagCloudEditCustomTagInput">
                <button 
                    siteFunction="tagCloudEditCustomTag"
                    tagForTagTableDetailsReference="" 
                    tagReference=""
                    id="tagCloudEditCustomTag" 
                    type="button" 
                    class="focus-ring focus-ring-warning btn btn-sm btn-warning my-2 position-relative">
                    Update      
                </button>
            `
    };
    
    setContextMenu (
        'button[sitefunction="tagButton"][tagType="customTag"]', 
        'body', 
        menuContent, 
        (menuItem, itemClicked) => {
            // get the menu item click handler and execute it            
            getContextMenuItemHandler(
                menuItem.text().replace(/[\n\r\t]/g, '').trim(), 
                menuContent
            ).bind(
                null,
                // tag to be processed
                $(itemClicked.prop('outerHTML')).children().remove().end().text().replace(/[\n\r\t]/g, '').trim(),
                // tag for the active tag details datatable
                $('div[siteFunction="tagDetails"]:not(.d-none) button[sitefunction="tagForActiveTagDetailsDatatable"]').text().trim() 
            )();
        },
        (event) => {
            // tag to be processed
            const $tagBtn = $(event.target).closest('button[sitefunction="tagButton"][tagtype="customTag"]').clone();
            const tag = $($tagBtn.prop('outerHTML')).children().remove().end().text().replace(/[\n\r\t]/g, '').trim();
            $('#tagCloudEditCustomTagInput').val(tag);
            $('#tagCloudEditCustomTagInput').focus();

            // tag for active tag details datatable
            const tagForActiveTagDetailsDatatable = $('div[siteFunction="tagDetails"]:not(.d-none) button[sitefunction="tagForActiveTagDetailsDatatable"]').text().trim();
            
            $('button[siteFunction="tagCloudEditCustomTag"]').attr('tagForTagTableDetailsReference',tagForActiveTagDetailsDatatable);
            $('button[siteFunction="tagCloudEditCustomTag"]').attr('tagReference', tag);
        },
        ['tagCloudContextMenu']
    );
}

const handleTagUpdate = () => {
    const tag = cleanText($('#tagCloudEditCustomTagInput').val());

    const oldTag = $('button[siteFunction="tagCloudEditCustomTag"]').attr('tagReference');
    $('.context-menu').remove();

    if (!tag) return;
    if (tag === 'undefined') return;
    if (tag === '') return;

    
    if (!oldTag) return;
    if (oldTag === 'undefined') return;
    if (oldTag === '' ) return;

    if (!updateTagForAllPages(oldTag,tag)) return;
    createGlobalLists();
    
    const tagForActiveTagDetailsDatatable = $('div[siteFunction="tagDetails"]:not(.d-none) button[sitefunction="tagForActiveTagDetailsDatatable"]').text().trim();

    updateAllTagInfoOnPage(tagForActiveTagDetailsDatatable);
}

const handleTagRemoval = (tag, tagForActiveTagDetailsDatatable = null) => {
    if (!tag) return;
    if (tag === 'undefined') return;
    if (tag === '') return;

    if (!deleteTagFromAllPages(tag)) return;
    createGlobalLists();
    updateAllTagInfoOnPage(tagForActiveTagDetailsDatatable);

}

const setPageOtherCustomTags = (pageInformation) => {

    const getCustomTagButtonElement = (tag) => {
        return (
            `
                <button 
                    siteFunction="pageTagButton"
                    tagType="customTag" 
                    tagReference="${tag}"
                    id="pageTag_${tag}" 
                    type="button" 
                    class="focus-ring focus-ring-warning px-3 mr-2 my-1 btn btn-sm btn-success position-relative"
                    title = "Details for tag ${tag}">
                    ${tag}
                </button>
            `
        )
    }

    const customTags = getPageTags(pageInformation);

    const $pageOtherTagsElement = $(`td[colFunction="tagInfoTagTablePageOtherTags"][pageTitleReference="${pageInformation.siteInfo.title}"][pagePermalinkReference="${pageInformation.siteInfo.permalink}"]`);

    const $pageOtherCustomTagElement = $(`td[colFunction="tagInfoTagTablePageOtherTags"][pageTitleReference="${pageInformation.siteInfo.title}"][pagePermalinkReference="${pageInformation.siteInfo.permalink}"] button[siteFunction="pageTagButton"][tagType="customTag"]`);
    
    $pageOtherCustomTagElement.remove();
    
    customTags.forEach(tag => {        
        $pageOtherTagsElement.each(function() {
            $(this).children().first().append($(getCustomTagButtonElement(tag)))
        })
    });

}

const setTagSearchList = () => {
    setSearchList(
        '#tagSearchInput', 
        '#tagSearchResults', 
        'li[siteFunction="searchTagListItem"]', // this will be updated in callbackFilteredList to add specific tag attributes, based on tag type
        '<li siteFunction="searchTagListItem">',
        '</li>',
        false, // case insensitive
        function(result) { 
            showTagDetails(result);
        },
        (filteredList) => {
            updateTagSearchListItems(filteredList);
        }
    );
}

const updateTagSearchListItems = (list) => {
    $('li[sitefunction="searchTagListItem"]').each(function() {
        $(this).attr('tagReference', $(this).text().trim());
        $(this).attr(
            'tagType', 
            _.findIndex(globCustomTags, item => item.toLowerCase() === $(this).text().trim().toLowerCase()) === -1 ? 
                'siteTag' : 
                'customTag'
        );
    });
}

const updateTagSearchList = () => {
    getTagType = (tag) => {
        return _.findIndex(globCustomTags, item => item.toLowerCase() === tag.toLowerCase()) === -1 ? 'siteTag' : 'customTag'
    }

    getCustomTagListElement = (tag) => {
        return (
            `
                <li 
                    siteFunction="searchTagListItem"
                    tagType="${getTagType(tag)}"
                    tagReference="${tag}">
                    ${tag}
                </li>
            `
        );
    }

    $('li[tagType="customTag"]').remove();
    globCustomTags.forEach(tag => {
        $('ul[siteFunction="searchTagList"]').append($(getCustomTagListElement(tag)));
    });
}

const setCustomTagCloud = () => {

    const getTagCloudElement = (tag, numPages) => {
         
        return  (
            `
                <button 
                    siteFunction="tagButton" 
                    tagType="customTag"
                    id="${tag}" type="button" 
                    class="focus-ring focus-ring-warning px-3 mr-5 my-2 btn btn-sm btn-success position-relative"
                    title = "Details for tag ${tag}">
                    ${tag}
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-warning">
                        ${numPages}
                    </span>
                </button>
            `
        );
    } 

    $('button[tagType="customTag"]').remove();
    globCustomTags.forEach(tag => {
        $('div[siteFunction="tagCloudContainerBody"]').append($(getTagCloudElement(tag, getTagPages(tag))));
    });
}

// here we set the datatable with tag details
const showTagDetails = (tag) => {
    if ( !tag ) return;
    if ( tag === 'undefined' ) return;
    if ( tag === '' ) return;

    const siteTagPageNo = tagList.includes(tag) ? tagDetails[tag].numPages : 0;
    const customTagPageNo = tagList.includes(tag) ? 0 : getTagPages(tag);
    if (siteTagPageNo + customTagPageNo === 0 ) return;

    if (siteTagPageNo === 0 && customTagPageNo > 0 ) {
        console.log(tag);
        return; // TO BE REMOVED WHEN CUSTOM TAGS FUNCTIONALITY WILL BE ADDED
    }

    $(`div[siteFunction="tagDetails"][tagReference="${tag}"]`).removeClass('d-none');
    $(`div[siteFunction="tagDetails"][tagReference!="${tag}"]`).addClass('d-none');
    $('div[siteFunction="tagDetails"]').removeAttr('style'); // to clear some style values added by a potential previous close button click
    $(`div[siteFunction="tagDetails"][tagReference="${tag}"]`).fadeIn();

    if( $.fn.DataTable.isDataTable(`table[tagReference="${tag}"]`) ) {
        $(`table[tagReference="${tag}"]`).DataTable().destroy();
        $(`table[tagReference="${tag}"]`).removeAttr('id').removeAttr('aria-describedby')
    }
    
    // exceptWhenRowSelect: true to make the column inactive when click in a table row
    // this is a custom column configuration, not a standard DataTables column configuration
    // is good to be used for columns having already a functional role in the table (such as buttons)
    setDataTable(
        `table[tagReference="${tag}"]`,
        tag.trim().replace(/\s+/g, "_"),
        
        // columns settings
        [
            // page name
            {
                className: 'alwaysCursorPointer' 
            }, 

            // last update
            {
                type: 'date', 
                className: 'dt-left', 
                exceptWhenRowSelect: true
            }, 

            // action buttons
            { 
                searchable: false, 
                orderable: false, 
                exceptWhenRowSelect: true
            }, 
            
            // excerpt
            {
                exceptWhenRowSelect: true,
                width: '30%',
                visible: false
            }, 

            // other tags
            {
                exceptWhenRowSelect: true
            }
        ],

        (table) => { postProcessTagDetailsTable(table, tag) },
        (rowData) => { processTagDetailsTableRowClick(rowData, `table[tagReference="${tag}"]`, tag) },
        {
            scrollX:true,
            fixedColumns: {
                "left": 1
            }
        }
    );

    history.replaceState({}, document.title, window.location.pathname);
}

const processTagDetailsTableRowClick = (rowData, tableSelector, tag) => {
    // tags may contain spaces 
    // so we need to extract them from the html to prevent .split(' ') to provide wrong tags
    const extractTags = (tags) => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = `${tags}`;
        const buttons = tempElement.querySelectorAll('button');
        const buttonTexts = Array.from(buttons).map(button => button.textContent.trim());
        return buttonTexts;
    }

    const extractPermalink = (actionsHtml) => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = `${actionsHtml}`;
        const linkToDoc = tempElement.querySelector('a[siteFunction="tagPageItemLinkToDoc"]');
        return linkToDoc.getAttribute('href');
    }

    // process rowData when click on row
    const cleanRowData = rowData.data.map(element => element.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' '));
    cleanRowData[4] = extractTags(rowData.data[4]);
    const permalink = extractPermalink(rowData.data[2]);
    const title = cleanRowData[0];

    pageInfo = {
        siteInfo: getObjectFromArray ({permalink: permalink, title: title}, pageList),
        savedInfo: getPageSavedInfo (permalink, title),
        tag:tag //need to pass tag too because we need a reference to the tag details datatable when returning from page info offcanvas
    };
    
    showPageFullInfoCanvas(pageInfo);
}

const postProcessTagDetailsTable = (table, tag) => {
    if(table) {
        addAdditionalButtons(table, tag);
        addCustomTagsToPages(table, null);
    }   
}

const addCustomTagsToPages = (table = null, tag = null) => {
    
    if (!table && !tag) return;
    if (table && tag ) return; // not allowed both arguments to be not null

    let nodes;
    if (table) nodes = table.rows().nodes();
    if (tag) nodes = $(`table[tagReference="${tag}"]`).DataTable().rows().nodes();

    $.each(nodes, function(index, node) {
        const title = $(node.outerHTML).attr('pageTitleReference');
        const permalink = $(node.outerHTML).attr('pagePermalinkReference');
        const pageInformation = {
            siteInfo: {
                title: title,
                permalink: permalink
            }
        };
        
        setPageOtherCustomTags(pageInformation)

    });
}

const addAdditionalButtons = (table, tag) => {
     // post processing table: adding 2 buttons in the bottom2 zone
     gotToCatBtn = {
        attr: {
            siteFunction: 'tableNavigateToCategories',
            title: 'Go to categories'
        },
        className: 'btn-warning btn-sm text-light focus-ring focus-ring-warning mb-2',
        text: 'Categories',
        action: () => {
            window.location.href = '/cat-info'
        }
    }

    gotToSavedItemsBtn = {
        attr: {
            siteFunction: 'tableNavigateToSavedItems',
            title: 'Go to saved items'
        },
        className: 'btn-success btn-sm text-light focus-ring focus-ring-warning mb-2',
        text: 'Saved items',
        action: () => {
            window.location.href = '/cat-info'
        }
    }
    const btnArray = [];
    btnArray.push(gotToCatBtn);
    btnArray.push(gotToSavedItemsBtn);
    addAdditionalButtonsToTable(table, `table[tagReference="${tag}"]`, 'bottom2', btnArray);
}

const setPageSavedButtonsStatus = () => {

    const setRemoveFromSavedItemsStatus = () => {
        $('button[siteFunction="tagPageItemRemoveFromSavedItems"]').each( function() {
            const pageToSave = {
                permalink: $(this).attr('pageRefPermalink'),
                title: $(this).attr('pageRefTitle')
            }
            const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];        
            if (!findObjectInArray(pageToSave, savedItems)) $(this).addClass('disabled');
            else $(this).removeClass('disabled')
        });
    }
    
    const setSaveForLaterReadStatus = () => {
        $('button[siteFunction="tagPageItemSaveForLaterRead"]').each( function() {
            const pageToSave = {
                permalink: $(this).attr('pageRefPermalink'),
                title: $(this).attr('pageRefTitle')
            }
            const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    
            if (findObjectInArray(pageToSave, savedItems)) $(this).addClass('disabled');
            else $(this).removeClass('disabled')
        });
    }
    
    setRemoveFromSavedItemsStatus();
    setSaveForLaterReadStatus();
}