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
    setDataTable(
        `table[tagReference="${tag}"]`,
        tag.trim().replace(/\s+/g, "_"),
        [null, { searchable: false, orderable: false}, null, null],
        (table) => {
            if(table) {
                // post processing table: adding 2 buttons in the bottom 2 zone
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
    );

    history.replaceState({}, document.title, window.location.pathname);
}

const setOpenTagCloudBtn = () => {
    $(document).ready(function ()  {
        $('#openTagCloud').click(function() {
            $('#cloud_tag_container').fadeIn();
        });
    });
}
