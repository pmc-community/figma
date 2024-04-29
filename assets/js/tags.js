// Let's do some work
const setTagsSupport = () => {
    setSearchTag('#tagSearchInput', '#tagSearchResults');
    setTagDetailsDataTable();
    setTagButtons();
    showTagDetails(readQueryString());

    // from saved-items.js
    setSaveForLaterReadStatus();
    setRemoveFromSavedItemsStatus();
    setSaveForLaterRead();
    setRemoveFromSavedItems();
}
// work ends here

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
    if ( !tag ) return
    $(`div[siteFunction="tagDetails"][tagReference="${tag}"]`).removeClass('d-none');
    $(`div[siteFunction="tagDetails"][tagReference!="${tag}"]`).addClass('d-none');
    history.replaceState({}, document.title, window.location.pathname);
}

const setSearchTag = (searchInputSelector, searchResultsSelector) => {
    // from utilities
    setSearchList(searchInputSelector, searchResultsSelector);
}

const setTagDetailsDataTable = () => {
    setDataTable('TagInfo', 'table[siteFunction="tagDetailsPageTable"]')
}

