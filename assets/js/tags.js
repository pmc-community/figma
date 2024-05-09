// Let's do some work
const setTagsSupport = () => {
    setSearchList(
        '#tagSearchInput', 
        '#tagSearchResults', 
        'li[siteFunction="searchTagListItem"]', 
        '<li siteFunction="searchTagListItem">',
        '</li>',
        function(result) { showTagDetails(result);}
    );
    setOpenTagCloudBtn();
    setTagButtons();
    setPageTagButtons();

    requestedTag = readQueryString('tag');
    if (requestedTag) showTagDetails(requestedTag);

    // from saved-items.js
    setSaveForLaterReadStatus();
    setRemoveFromSavedItemsStatus();
    setSaveForLaterRead();
    setRemoveFromSavedItems();

    setCanvasCloseObserver( () => {
        setSaveForLaterReadStatus();
        setRemoveFromSavedItemsStatus();
    });
}
// work ends here
const setPageTagButtons = () => {
    $(window).on('load', () => {
        $('button[siteFunction="pageTagButton"]').click( function() {
            const selectedTag = $(this).attr('id');
            showTagDetails(selectedTag.match(/pageTag_(.*)/)[1]);
            setSaveForLaterReadStatus();
            setRemoveFromSavedItemsStatus();
        } );
    });
}

const setTagButtons = () => {
    $(window).on('load', () => {
        $('button[siteFunction="tagButton"]').click( function() {
            const selectedTag = $(this).attr('id');
            showTagDetails(selectedTag);
            setSaveForLaterReadStatus();
            setRemoveFromSavedItemsStatus();
        } );
    });
}

const showTagDetails = (tag) => {
    if ( !tag ) return;
    if ( tag === 'undefined' ) return;
    $(`div[siteFunction="tagDetails"][tagReference="${tag}"]`).removeClass('d-none');
    $(`div[siteFunction="tagDetails"][tagReference!="${tag}"]`).addClass('d-none');
    $(`div[siteFunction="tagDetails"][tagReference="${tag}"]`).fadeIn();

    const $table = $(`table[tagReference="${tag}"]`).DataTable();
    if ($.fn.DataTable.isDataTable($table)) $table.destroy();

    // exceptWhenRowSelect: true to make the column inactive when click in a table row
    // this is a custom column configuration, not a standard DataTables column configuration
    // is good to be used for columns having already a functional role in the table (such as buttons)
    setDataTable(
        `table[tagReference="${tag}"]`,
        tag.trim().replace(/\s+/g, "_"),
        
        // columns settings
        [
            // page name
            null, 

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
                exceptWhenRowSelect: true
            }, 

            // other tags
            {
                exceptWhenRowSelect: true
            }
        ],

        (table) => { postProcessTagDetailsTable(table, tag) },
        (rowData) => { processTagDetailsTableRowClick(rowData, `table[tagReference="${tag}"]`, tag) }
    );

    history.replaceState({}, document.title, window.location.pathname);
}

const processTagDetailsTableRowClick = (rowData, tableSelector, tag) => {
    // tags may contain spaces 
    // so we need to extract them from the html to prevent .split(' ' ) to provide wrong tags
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
    let pageInfo = {
        siteInfo: getObjectFromArray ({permalink: permalink, title: title}, pageList),
        savedInfo: getPageSavedInfo (permalink, title)
    };
    
    showPageFullInfoCanvas(pageInfo);
    pageInfo = {}
}

const postProcessTagDetailsTable = (table, tag) => {
    if(table) {
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
}

const setOpenTagCloudBtn = () => {
    $(document).ready(function ()  {
        $('#openTagCloud').click(function() {
            $('#cloud_tag_container').fadeIn();
        });
    });
}
