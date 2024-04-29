/* SOME UTILITIES ADDED TO JQUERY*/
// check if an element is on screen
$.fn.is_on_screen = function () {
    var win = $(window);
    var viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds;
    bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
};

// usage: $().sizeChanged(function(){})
$.fn.sizeChanged = function (handleFunction) {
    var element = this;
    var lastWidth = element.width();
    var lastHeight = element.height();

    setInterval(function () {
        if (lastWidth === element.width()&&lastHeight === element.height())
            return;
        if (typeof (handleFunction) == 'function') {
            handleFunction({ width: lastWidth, height: lastHeight },
                            { width: element.width(), height: element.height() });
            lastWidth = element.width();
            lastHeight = element.height();
        }
    }, 100);
    return element;
};

// init page toc
$(function () {
    var navSelector = settings.pageToc.toc;
    var $myNav = $(navSelector);
    if ($(`#${settings.marker404}`).length === 0) Toc.init($myNav);
    // check if there is something in the ToC, if empty, the scrollspy raise errors in console
    // page toc will be further removed from page when the page loads
    if ($(`${settings.pageToc.toc} ul`).children('li').length > 0 ) $(settings.pageToc.scrollSpyBase).scrollspy({target: navSelector,});
});

const removeChildrenExceptFirst = (nodeSelector) => {
    var $node = $(nodeSelector);
    var $children = $node.children();
    var $childrenToRemove = $children.not(':first-child');
    $childrenToRemove.remove();
}

// generate uuid
const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // eslint-disable-next-line
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const hashFromString = (string) => {
    const regex = /#(.*)/;
    const match = string.match(regex);
    const hash = match ? match[1] : null;
    return hash;
}

const arrayDuplicates = (arr) => {
    const counts = _.countBy(arr);
    const duplicates = _.pickBy(counts, count => count > 1);
    const duplicateValues = _.keys(duplicates);
    return duplicateValues;
}

// read external contens between markers
const getExternalContent = async (file, position, startMarker , endMarker, header, whereID, whoCalled) => {
    $(window).on('load', () => {
        // prevent returning unwanted quantity of content
        if (typeof startMarker === 'undefined' ||  typeof endMarker === 'undefined' ) return;
        if (startMarker.trim() === '' && endMarker.trim() === '') return;
        
        // getting the content from external md
        // comments in the form of '<!- comment ... ->' are ignored when converting from md to hmml
        $.ajax({
            url: file,
            method: "GET",
            dataType: "text",
            success: async (data) => {
                const converter = new showdown.Converter();
                const content = await data;
                goodHeader = typeof header === 'undefined' ? '' : header;
                let contentSliced = goodHeader + '\n';
                const startIndex = startMarker === 'fullFile' ? 0 : content.indexOf(startMarker) + startMarker.length;
                const contentA = content.slice(startIndex);
                const endIndex = endMarker === 'fullFile' ? contentA.length+1 : contentA.indexOf(endMarker) ;
                const contentB = contentA.slice(0,endIndex);
                contentSliced += contentB + '\n';

                contentSliced = converter.makeHtml(contentSliced);

                let contentPlaceholder = '';

                const contentPlaceholderID = whereID ? whereID : uuid();
                if(!whereID) contentPlaceholder = `<div id=${contentPlaceholderID}><div>`;

                constContentPosition = typeof position === 'undefined' || position === '' ? 'after' : position;
                if (constContentPosition === 'before') $(settings.externalContent.containerToIncludeExternalContent).prepend(contentPlaceholder);
                if (constContentPosition === 'after') $(settings.externalContent.containerToIncludeExternalContent).append(contentPlaceholder);
                
                $(`#${contentPlaceholderID}`).html(contentSliced);

                // refresh the ToC
                initPageToc();
                
                // move the top of page where it should be
                if (position === 'before') {
                    $(settings.goToTopBtn.topOfPageId).remove();
                    addTopOfPage();
                }
            },
            error: async (xhr, status, error) => {
                toast = new bootstrap.Toast($('.toast'));
                $('.toast-body').html('Error loading external content. Details in console ...');
                toast.show();
                const placeholder = position === 'before' || position === 'after' ? 'N/A for this position' : whereID;
                console.error(`Error fetching file: ${file}\nStatus: ${status} / ${xhr.responseText}\nPosition: ${position}\nPlaceholder: ${placeholder}\nOrigin: ${whoCalled}`,error
                );
            }
        });
    })   
}

const findObjectInArray = (searchCriteria, objectArray) => {
    return _.some(objectArray, (obj) => {
        const matches = Object.entries(searchCriteria).every(([key, value]) => obj[key] === value);
        return matches;
      });
}

const objectIndexInArray = (searchCriteria, objectArray) => {
    return _.findIndex(objectArray, (obj) => {
        return Object.entries(searchCriteria).every(([key, value]) => obj[key] === value);
      });
}

const readQueryString = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');
    return tag;
}

const setSearchList = (searchInputSelector, searchResultsSelector) => {
    $(document).ready( () => {
        var $searchInput = $(searchInputSelector);
        var $searchResults = $(searchResultsSelector);

        $searchResults.css('left', $(searchInputSelector).position().left);
    
        $searchInput.on('input', function() {
        var query = $(this).val().toLowerCase();
    
        // Filter the list items based on the search query
        $searchResults.find('li').each(function() {
            var $item = $(this);
            var text = $item.text().toLowerCase();
            var match = text.includes(query);
            //$item.toggleClass('selected', match);
        });
    
        // Show or hide the list based on whether there are matching results
        $searchResults.toggle(query.length > 0);
        });
    
        // Handle click outside search input or search results to hide the list
        $(document).on('click', function(event) {
        var $target = $(event.target);
        if (!$target.closest(`${searchInputSelector}, ${searchResultsSelector}`).length) {
            $searchResults.hide();
        }
        });
    
        // Hide search results when pressing escape key
        $(document).on('keydown', function(event) {
        if (event.which === 27) { // Escape key
            $searchResults.hide();
            $searchInput.val('');
        }
        });
    
        // Handle keydown events on search input
        $searchInput.on('keydown', function(event) {
        var $selected = $searchResults.find('.selected');
        var $items = $searchResults.find('li');
    
        // Handle up arrow key
        if (event.which === 38) { // Up arrow
            if ($selected.length) {
            var $prev = $selected.prev();
            if ($prev.length) {
                $selected.removeClass('selected');
                $prev.addClass('selected');
                if ($items.filter('.selected').length === 1) {
                $searchInput.val($prev.text()); // Copy selected value to search input
                }
            }
            } else {
            $items.last().addClass('selected');
            $searchInput.val($items.last().text()); // Copy last value to search input
            }
            event.preventDefault(); // Prevent scrolling the page
        }
    
        // Handle down arrow key
        if (event.which === 40) { // Down arrow
            if ($selected.length) {
            var $next = $selected.next();
            if ($next.length) {
                $selected.removeClass('selected');
                $next.addClass('selected');
                if ($items.filter('.selected').length === 1) {
                $searchInput.val($next.text()); // Copy selected value to search input
                }
            }
            } else {
            $items.first().addClass('selected');
            $searchInput.val($items.first().text()); // Copy first value to search input
            }
            event.preventDefault(); // Prevent scrolling the page
        }
    
        // Handle enter key
        if (event.which === 13) { // Enter key
            if ($selected.length === 1) { // Only if there is a single selected item
            var selectedValue = $selected.text();
            $searchInput.val(selectedValue); // Set input value to selected item
            $searchResults.hide(); // Hide search results
            event.preventDefault(); // Prevent default behavior (form submission)
    
            // Call custom function here
            showTagDetails(selectedValue);
            }
        }
        });
    
        // Handle click on search results item
        $searchResults.on('click', 'li', function() {
        var clickedValue = $(this).text();
        $searchInput.val(clickedValue); // Set input value to clicked item
        $searchResults.hide(); // Hide search results
    
        // Call custom function here
        showTagDetails(clickedValue);
        });
    
    });
}

const setDataTable = (page, tableSelector) => {
    $(document).ready(function() {
        // Initialize DataTable
        $(tableSelector).DataTable({
            paging: true, 
            ordering: true,
            searching: true,
            colReorder: true,
            processing: true,
            fixedHeader: true,
            layout: {
                topStart: {
                    pageLength: {
                        menu: [1,2,5, 10, 25, 50]
                    }
                }
            },
            stateSave: true,
            stateSaveCallback: function (settings, data) {
                localStorage.setItem(
                    `${page}_DataTables_` + settings.sInstance,
                    JSON.stringify(data)
                );
            },
            stateLoadCallback: function (settings) {
                return JSON.parse(localStorage.getItem(`${page}_DataTables_` + settings.sInstance));
            },
            columns: [null, { searchable: false }, null]
        });
    });
}