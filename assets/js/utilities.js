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
    }, 200);
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

// CONVERSION FUNCTIONS FOR DATATABLES SORTING PURPOSES
// type dd-mmm-yyyy to Unix Timestamp
$.fn.dataTable.ext.type.order['date-dd-mmm-yyyy-pre'] = function(d) {
    const months = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3,
        "May": 4, "Jun": 5, "Jul": 6, "Aug": 7,
        "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };
    const dateParts = stripHtml(d).split('-');
    const day = parseInt(dateParts[0], 10);
    const month = months[dateParts[1]];
    const year = parseInt(dateParts[2], 10);

    return new Date(year, month, day).getTime();
};

// type html-string to html stripped text
$.fn.dataTable.ext.type.order['html-string-pre'] = function(s) {
    return stripHtml(s);
};

$.fn.dataTable.ext.type.search['raw-data'] = function(data) {
    console.log('here')
    try {
        var parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
            if (typeof parsedData[0] === 'object' && parsedData[0] !== null) {
                // Extract titles from array of objects
                return parsedData.map(function(item) { return item.title; }).join(' ');
            } else {
                // Union of arrays
                return [...new Set(parsedData.flat())].join(' ');
            }
        }
    } catch (e) {
        return data;
    }
    return data;
};
// Extend DataTables with custom search function

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

// read external contents between markers to dynamically add it to documents on client side
const getExternalContent = async (file, position, startMarker , endMarker, header, whereID, whoCalled) => {
    $(window).on('load', () => {
        // prevent returning unwanted quantity of content
        if (typeof startMarker === 'undefined' ||  typeof endMarker === 'undefined' ) return;
        if (startMarker.trim() === '' && endMarker.trim() === '') return;
        
        // getting the content from external md
        // comments in the form of '<!- comment ... ->' are ignored when converting from md to html
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

                // move the top content separator where it should be
                if (position === 'before') {
                    $('hr[siteFunction="pageContentTopSeparator"]').remove();
                    $(settings.externalContent.containerToIncludeExternalContent).prepend('<hr siteFunction="pageContentTopSeparator" class="my-4">');
                   
                }
            },
            error: async (xhr, status, error) => {
                toast = new bootstrap.Toast($('.toast'));
                $('.toast').addClass('bg-danger');
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

const getObjectFromArray = (searchCriteria, objectArray) => {
    if (objectArray.length === 0) return 'none';
    const found = _.find(objectArray, searchCriteria);
    return !found || found === 'undefined' ? 'none' : found;
}

const objectIndexInArray = (searchCriteria, objectArray) => {
    return _.findIndex(objectArray, (obj) => {
        return Object.entries(searchCriteria).every(([key, value]) => obj[key] === value);
      });
}

const readQueryString = (queryParameter) => {

    const replaceSpecialCharacters = (inputString) => {
        const encodedString = encodeURIComponent(inputString);
        const replacedString = decodeURIComponent(encodedString);
        return replacedString;        
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(queryParameter);
    return value;
}

const readQueryString_ASYNC = (queryParameter) => {

    return new Promise ( (resolve, reject) => {
        const replaceSpecialCharacters = (inputString) => {
            const encodedString = encodeURIComponent(inputString);
            const replacedString = decodeURIComponent(encodedString);
            return replacedString;        
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const value = urlParams.get(queryParameter);
        resolve(value);
    })
}

const filterArrayStartingWith = (arr, prefix, caseSensitive) => {
    return arr.filter(function(item) {
        return (
            typeof item !== 'string' ? 
                item : 
                !caseSensitive ? 
                    item.toLowerCase().startsWith(prefix.toLowerCase()) : 
                    item.startsWith(prefix) 
        );
    });
}

const setSearchList = (
    searchInputSelector, 
    searchResultsSelector, 
    searchResultsItemSelector, 
    searchResultsItemTag, 
    searchResultsItemClosingTag,
    caseSensitive = false,
    callback,
    callbackFilteredList = null
) => {  

    const handleSetSearcResults = (
        searchInputSelector, // css selector for the search text input field
        searchResultsSelector, // css selector for the search results list
        searchResultsItemSelector, // usually li[some_attribute = "some_value"]
        searchResultsItemTag, // usually <li with_some_attributes>
        searchResultsItemClosingTag, // usually </li>
        caseSensitive, // true if the search must be case sensitive
        callback, // do something with selected item
        callbackFilteredList // do something with the filtered list before showing it and before making any selection
    ) => {
            const $searchInput = $(searchInputSelector);
            const $searchResults = $(searchResultsSelector);

            // small delay to be sure that the search input/list is set and we can calculate the position properly
            // otherwise the search results position may not be related the final position of the search input and
            // the search results may be shown somewhere on the page, not stick to the search imput
            setTimeout(() => {
                $searchResults.css('left', $(searchInputSelector).position().left + 'px');
                $searchResults.css('top', $(searchInputSelector).position().top + $(searchInputSelector).outerHeight(true) + 'px');    
            }, 100);

            let list = [];
            $(searchResultsItemSelector).each(function() { list.push($(this).text().trim()); });

            function showSearchResults() {
                //const searchTerm = $searchInput.val().trim().toLowerCase();
                const searchTerm = $searchInput.val().trim();
                let html = '';
                if (searchTerm === '') {
                    $searchResults.hide();
                    return;
                }
                const filteredList =  filterArrayStartingWith (list, searchTerm, caseSensitive);
                filteredList.forEach(function(item) { html += searchResultsItemTag + item + searchResultsItemClosingTag; });            
                $searchResults.html(html);
                if (callbackFilteredList) callbackFilteredList(filteredList); // do some addtional processing to the filtered list before showing it
                $searchResults.show();
            }
            
            $searchInput.off('input').on('input', function() { if ($searchInput.val().trim() !== '') showSearchResults(); });
        
            // Handle click outside search input or search results to hide the list
            $(document).on('click', function(event) {
                const $target = $(event.target);
                if (!$target.closest(`${searchInputSelector}, ${searchResultsSelector}`).length) {
                    $searchResults.hide();
                    $searchInput.val('');
                } 
            });
        
            // Hide search results when pressing escape key
            // delegate event to parent since cannot delegate all to document because
            // we may have more than one search box on page and then esc key will behave in a wrong way
            $searchInput.parent().off('keydown').on('keydown', function(event) {
                if (event.which === 27) { // Escape key
                    $searchResults.hide();
                    $searchInput.val('');
                }
            });
        
            // Handle keydown events on search input
            // HEADS UP!!! .off('keydown') is mandatory, otherwise multiple handlers will be set and errors can be raised
            // e.g., when having datatables on page and one of these must be updated on the event handler callback, the instances of dt may be mixed
            // and datatables.js may raise error of not being able to initialize a table since is already initialized
            $searchInput.off('keydown').on('keydown', function(event) {

                // Adjust scroll position to keep the selected element in sight
                const getElementInSight = (container, element) => {
                    const containerHeight = container.innerHeight();
                    const scrollTop = container.scrollTop();
                    const elementTop = element.position().top;

                    if (elementTop < 0) {
                    container.scrollTop(scrollTop + elementTop); // Scroll up
                    } else if (elementTop + element.outerHeight() > containerHeight) {
                        container.scrollTop(scrollTop + elementTop + element.outerHeight() - containerHeight); // Scroll down
                    }
                }

                const $selected = $searchResults.find('.selected');
                const $items = $searchResults.find(searchResultsItemSelector);
        
                // Handle up arrow key
                if (event.which === 38) { // Up arrow
                    if ($selected.length) {
                        let $prev = $selected.prev();
                        if ($prev.length) {
                            $selected.removeClass('selected');
                            $prev.addClass('selected');
                            if ($items.filter('.selected').length === 1) {
                                $searchInput.val($prev.text()); // Copy selected value to search input
                            }
                            // Adjust scroll position to keep the selected element in sight
                            getElementInSight($searchResults, $prev)
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
                        let $next = $selected.next();
                        if ($next.length) {
                            $selected.removeClass('selected');
                            $next.addClass('selected');
                            if ($items.filter('.selected').length === 1) {
                                $searchInput.val($next.text()); // Copy selected value to search input
                            }
                            // Adjust scroll position to keep the selected element in sight
                            getElementInSight($searchResults, $next);                        }
                    } else {
                        $items.first().addClass('selected');
                        $searchInput.val($items.first().text()); // Copy first value to search input
                    }
                    event.preventDefault(); // Prevent scrolling the page
                }

                // Handle enter key
                if (event.which === 13) { // Enter key
                    if ($selected.length === 1) { // Only if there is a single selected item
                        const selectedValue = $selected.text();
                        $searchInput.val(selectedValue); // Set input value to selected item
                        $searchResults.hide(); // Hide search results
                        event.preventDefault(); // Prevent default behavior (form submission)
                        $searchInput.val('');
                        callback(selectedValue);
                    }
                }
            });

            // Handle click on search results item
            $searchResults.off('click', searchResultsItemSelector).on('click', searchResultsItemSelector, function() {
                const clickedValue = $(this).text();
                $searchInput.val(clickedValue); // Set input value to clicked item
                $searchResults.hide(); // Hide search results
                $searchInput.val('');
                callback(clickedValue);
            });
    }

    $(document).off('ready', handleSetSearcResults).ready(handleSetSearcResults.bind(
        null, 
        searchInputSelector, 
        searchResultsSelector, 
        searchResultsItemSelector, 
        searchResultsItemTag, 
        searchResultsItemClosingTag,
        caseSensitive,
        callback,
        callbackFilteredList
    ));
        
}

// columnsConfig is set in the caller, to be fit to the specific table
// callback and callbackClickRow are set in the caller to do specific processing after the table is initialized
const setDataTable = (
    tableSelector, // css selector of the raw table to be converted to datatable
    tableUniqueID, // will be added to <page permalink>_DataTables_tableUniqueID when saving status in local storage
    columnsConfig, // columns object
    callback,  // will be executed after table is created, post processing the table
    callbackClickRow, // will be executed when click on row
    additionalSettings = {}, // any other settings besides the default ones (i.e. columnDefs to define individual search panes)
    searchPanes = null // search panes configuration and callbacks
        /*
        {
            enable: true,
            // page load may become very slow. better to use viewCount=false when cascade=false because viewCount doesn't update dynamicaly
            cascade: false,
            searchPanesOpenCallback: () => {} || null,
            searchPanesCloseCallback: (tableSearchPanesSelection) => {} || null,
            searchPanesSelectionChangeCallback: (tableSearchPanesSelection) => {} || null,
            searchPanesCurrentSelection: <current selection in the form of [{column:..., rows:[...]}]> || []
        } || null
        */
) => {

    const $loading = $(
        `
            <div id="dataTableLoading" class="d-flex justify-content-center align-items-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `
    );
    $(tableSelector).parent().prepend($loading);
    $(tableSelector).hide(); // hide table here to minimise weird display while creating the table

    // ONLY searchPanes TRIGGERED BY BUTTON IS AVALILABLE
    // OTHERWISE THE searchPanes LOGIC WILL FAIL AND WILL RAISE ERRORS
    const bottom2Buttons = searchPanes ?
        [
            {
                extend: ['colvis'],
                columns: ':gt(0)', // except first column which will be always visible
                text: 'Columns',
                attr: {
                    title: 'Show/Hide Columns',
                    siteFunction: 'tableColumnsVisibility'
                },
                className: 'btn-primary btn-sm text-light mb-2'
            },
            {
                extend: ['searchPanes'],
                text: 'Filter', // this is actually set in defaultSettings object .language.searchPanes
                attr: {
                    title: 'Advanced filter',
                    siteFunction: `tableSearchPanes`,
                    id: `tableSearchPanes_${tableUniqueID}`
                },
                className: 'btn-danger btn-sm text-light mb-2 btnSearchPanesFilter',
                config: {
                    cascadePanes: searchPanes.cascade
                },
            }
        ]:

        [
            {
                extend: ['colvis'],
                columns: ':gt(0)', // except first column which will be always visible
                text: 'Columns',
                attr: {
                    title: 'Show/Hide Columns',
                    siteFunction: 'tableColumnsVisibility'
                },
                className: 'btn-primary btn-sm text-light mb-2'
            }
        ];
    
    const searchPanesBtnText = () => {
        return (
            `
                <div class="tableSearchPanes_loader">
                    <span
                        siteFunction="tableSearchPanes_loader" 
                        class="spinner-border spinner-border-sm mr-1 d-none"
                        aria-hidden="true">
                    </span>
                    <span role="status">
                        Filter
                    </span>
                </div>
            `
        );
    }; // should be defined here because is used in defaultSettings object (defaultSettings.language.searchPanes)

    const defaultSettings = {
        paging: true,
        pageLength: 5,
        ordering: true,
        searching: true,
        processing: true,
        fixedHeader: true,
        deferRender: true, // Defer rendering for speed up
        layout: {
            topStart: {
                pageLength: {
                    menu: [5, 10, 25, 50]
                }
            },
            bottom2: {
                buttons: bottom2Buttons
            },
        },
        stateSave: true,
        stateSaveCallback: function (settings, data) {
            localStorage.setItem(`${window.location.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_')}_DataTables_` + tableUniqueID, JSON.stringify(data));
        },
        stateLoadCallback: function (settings) {
            return JSON.parse(localStorage.getItem(`${window.location.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_')}_DataTables_` + tableUniqueID));
        },
        columns: columnsConfig,
        language: {
            searchPanes: {
                clearMessage: 'Clear All',
                collapse: { 0: searchPanesBtnText(), _: searchPanesBtnText()},
            }
        },
        
    };
    const allSettings = {...defaultSettings, ...additionalSettings};
    
    const createTable_ASYNC = (
        tableSelector,
        tableUniqueID,
        columnsConfig, 
        callback, 
        callbackClickRow, 
        allSettings, 
        searchPanes
    ) => {
        return new Promise ( (resolve, reject) => {

            $(`${tableSelector} tr`).removeClass('table-active'); // just to be sure that nothing is marked as selected
            table = $(tableSelector).DataTable(allSettings);
            
            // SETTING SOME TABLE OBSERVERS
            if (searchPanes && searchPanes.enable) {
                // PROCESSING WHEN FILTER BUTTON IS CREATED
                removeObservers('body (selector=#tableSearchPanes_SitePages)');
                setElementCreateBySelectorObserver(`#tableSearchPanes_${tableUniqueID}`, async (node)=> {
                    // .. here to add some post processing after search panes button (Filter) is created
                    // HEADS UP!!!
                    // MODIFICATIONS OF THE DEFAULT HANDLER ARE POSSIBLE BUT MAY GENERATE UNEXPECTED BEHAVIOR
                    // DUE TO MULTIPLE ASYNC THINGS THAT HAPPENS
                    //console.log(node)
                });
            }

            // define some helpers
            const helpers = {
                autoApplyActiveFilter: async () => {
                    await $(`#tableSearchPanes_${tableUniqueID}`).click(); // execute Filter button click to open search panes and apply selection
                    await $('.dropdown-menu').hide(); // hide search panes
                    await $('.dtb-popover-close').click(); // force search panes to close
                    setTimeout(()=>$('body').click(), 500); // force sitePagesDetailsLastFilter to lose focus
                },

                clearActiveFilter: async (tableUniqueID) => {
                    await $(`#tableSearchPanes_${tableUniqueID}`).click();
                    await $('.dropdown-menu[id!="category-menu-more-list"]').hide();
                    await $('.dtsp-clearAll').click();
                    await $('.dtb-popover-close').click();
                    
                    setTimeout(()=>$('body').click(), 500);   
                },

                triggerApplyActiveFilter: (tableUniqueID) => {
                    $(`button[id="tableSearchPanes_${tableUniqueID}"]`).click();
                }
            }

            table.helpers = helpers;

            // callback to be personalised for each table
            // for post processing the table (i.e. adding buttons based on context)
            callback(table);

            // set the columns which are active when click on row
            // HEADS UP!!! THIS WORKS ONLY WHEN THE callbackClickRow IS USED
            const composeRowClickColumnsSelector = () => {
                // safer to read the columns defs from the table settings
                // because it may not be always diectly available in all contexts
                // i.e. when returning from page info offcanvas, columnsConfig is not available anymore for direct access
                colDef = tableConfiguration = table.settings().init().columns;
                colDefIndex = 0;
                colVisIndex = 0;
                disabledForClick = [];
                colDef.forEach((column) => {
                    if (table.column(colDefIndex).visible() === true) {
                        if (column.exceptWhenRowSelect) {
                            colVisIndex += 1;
                            disabledForClick.push(colVisIndex+1);
                        }
                    }
                    colDefIndex += 1;
                });

                let rowClickSelector = 'tbody tr'

                if (disabledForClick.length > 0) {
                    rowClickSelector = 'tbody td'
                    disabledForClick.forEach( columnIndex => {
                        rowClickSelector += `:not(:nth-child(${columnIndex}))`
                    });
                }
                return rowClickSelector;
            }
            
            // HEADS UP!!!
            // ARROW FUNCTIONS NOT ALLOWED HERE, WILL RAISE ERROR WHEN EXECUTING CALLBACK
            const handleRowClick = function(event) {
                table = $(event.target).closest('table').DataTable(); // mandatory when many tables on page, otherwise will mix the tables and raise errors
                
                if (table.rows().count() > 0) {
                    // using try-catch to avoid datatables behaviour when removing rows and clicking in table. 
                    // table.rows().count() has still the value before the rows removal
                    try { 
                        $(`${tableSelector} tr`).removeClass('table-active');
                        if (event.target.tagName.toLowerCase() === 'span') rowElement = $(event.target).parent().parent();
                        else rowElement = $(event.target).parent();
                        rowElement.addClass('table-active');

                        // callbackClickRow to be personalised for each table
                        // to process the selected row
                        callbackClickRow({
                                rowNumber: table.row(this).index(),
                                data: table.row(this).data()
                            }
                        );
                    } catch {} 
                }
            }

            // set clickabl columns as per the col definition in columnsConfig object (which is the columns option of DataTable) 
            table.off('click').on('click', composeRowClickColumnsSelector(), handleRowClick);


            // since tables are created dynamically, some color corrections may be lost 
            // because the theme is already applied, so we need to do the corrections again
            // also needed when switching theme
            // if switch theme and increase no of rows/page, new rows will have the previous scheme background
            //applyColorSchemaCorrections();
            // also on draw event to cover all potential cases
            table.on('draw', function () { applyColorSchemaCorrections(); });

            // when display hidden table columns in dark mode, the column backgroud may be light, so corrections should be applied
            $(document).off('click','.buttons-columnVisibility').on('click', '.buttons-columnVisibility', function() {
                applyColorSchemaCorrections();            
            });


            // searchPanes logic
            // WE CAN USE HARD CODED CLASS NAMES BECAUSE 
            // THERE WILL BE ONLY ONE searchPanes CONTAINER ACTIVE AT ONE MOMENT
            // SINCE WE ONLY USE BUTTON ACTIVATED searchPanes
            // AND THE CLASSES ARE ALWAYS THE SAME

            let tableSearchPanesSelection = !searchPanes ?
                [] :
                !searchPanes.searchPanesCurrentSelection ?
                [] :
                searchPanes.searchPanesCurrentSelection;

            if (searchPanes && searchPanes.enable) {
        
                const getSearchPanesSelection = () => {
                    const table = $(tableSelector).DataTable();
                    const $panes = table.searchPanes.container().children().last().find('.dtsp-searchPane').not('.dtsp-hidden');
                    const panesContainerSelector = `.${(table.searchPanes.container().children().last()).attr('class').split(/\s+/).join('.')}`;
                    $panes.each( function() {
                        const mainTableColIndex = $(this).index();         
                        const childSelector = `${panesContainerSelector} > .${($(this).attr('class').split(/\s+/)).join('.')}:nth-child(${mainTableColIndex+1})`;
                        const searchPaneTableWrapper = $(childSelector).children().last().attr('id');
                        const searchPaneTableId = searchPaneTableWrapper.replace(/_wrapper$/, '').trim();
                        const searchPaneDataTable = $(`#${searchPaneTableId}`).DataTable();
                        const selectedRows = searchPaneDataTable.rows({ selected: true });
                        const selectedData = selectedRows.data().toArray();
                        tableSearchPanesSelection.forEach(col => {
                            if (col.column === mainTableColIndex) {
                                col.rows =  selectedData ? selectedData.map(item => item.display) : [];
                                col.name = $(table.column(mainTableColIndex).header()).text().trim();
                            }
                        });
            
                    });
                }

                const setSearchPanesSelection = (selection) => {
                    const table = $(tableSelector).DataTable();
                    const $panes = table.searchPanes.container().children().last().find('.dtsp-searchPane').not('.dtsp-hidden');
                    const panesContainerSelector = `.${(table.searchPanes.container().children().last()).attr('class').split(/\s+/).join('.')}`;
                    $panes.each( function() {
                        const mainTableColIndex = $(this).index();         
                        const childSelector = `${panesContainerSelector} > .${($(this).attr('class').split(/\s+/)).join('.')}:nth-child(${mainTableColIndex+1})`;
                        const searchPaneTableWrapper = $(childSelector).children().last().attr('id');
                        const searchPaneTableId = searchPaneTableWrapper.replace(/_wrapper$/, '').trim();
                        const searchPaneDataTable = $(`#${searchPaneTableId}`).DataTable();
                        let paneSelection = []
                        selection.forEach( pane => {
                            if (pane.column === mainTableColIndex) {
                                paneSelection = pane.rows;
                                searchPaneDataTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
                                    const data = this.data();
                                    if (paneSelection.includes(data.display)) {
                                        this.select();
                                    }
                                });
                            }
                        });
            
                    });
                }

                // SETTING SEARCH PANES OBSERVERS
                // PROCESSING WHEN SEARCH PANES CONTAINER IS OPEN
                removeObservers('body (class=dropdown-menu dt-button-collection dtb-collection-closeable)');
                setElementCreatedByClassObserver('dropdown-menu dt-button-collection dtb-collection-closeable', () => {
                    // ... here to add search panes post-processing (after searchPanes container is created)
                    // using css visibility instead of .hide() because is faster and prevents display of the search panes
                    // when clicking clear filter btn on the active filter warning box
                    $('.dropdown-menu[id!="category-menu-more-list"]').css('visibility','hidden');
                    $('.dropdown-menu[id!="category-menu-more-list"]').css('position','fixed');
                    $('.dropdown-menu[id!="category-menu-more-list"]').css('top',`${$(settings.headerAboveContent.headerID).height() + settings.headerAboveContent.offsetWhenScroll}px`);
                    $('.dropdown-menu[id!="category-menu-more-list"]').css('left','20px');
                    $('.dropdown-menu[id!="category-menu-more-list"]').draggable({
                        containment: "window"
                    });
                    $('.dropdown-menu[id!="category-menu-more-list"]').css('visibility','visible');

                    setTimeout(() => {
                        tableSearchPanesSelection = searchPanes.searchPanesCurrentSelection || [];
                        
                        if (tableSearchPanesSelection.length === 0) {
                            // init searchPanes selections
                            const table = $(tableSelector).DataTable();
                            const $panes = table.searchPanes.container().children().last().find('.dtsp-searchPane').not('.dtsp-hidden');
                            $panes.each( function() {
                                const mainTableColIndex = $(this).index();
                                const colObject = {column: mainTableColIndex, rows: ''};
                                tableSearchPanesSelection.push(colObject);
                            });
                            getSearchPanesSelection();
                        }
                        else {
                            setSearchPanesSelection(tableSearchPanesSelection);
                        }
                        
                        if (searchPanes.searchPanesOpenCallback) searchPanes.searchPanesOpenCallback();
            
                    }, 100);
                });

                // PROCESSING WHEN SEARCH PANES CONTAINER IS CLOSED
                removeObservers('body removal (class=dropdown-menu dt-button-collection dtb-collection-closeable)');
                setElementRemovalByClassObserver('dropdown-menu dt-button-collection dtb-collection-closeable', () => {
                    setTimeout(() => {
                        if (searchPanes.searchPanesCloseCallback) searchPanes.searchPanesCloseCallback(tableSearchPanesSelection);
                    }, 100);
                    
                });

                // PROCESSING WHEN SELECTION IS CHANGED IN ANY OF SEARCH PANES
                // select option
                removeObservers('div.dtsp-searchPane table tr class=selected getClass=true');
                setElementChangeClassObserver('div.dtsp-searchPane table tr', 'selected', true, () => {
                    getSearchPanesSelection();
                    if (searchPanes.searchPanesSelectionChangeCallback) searchPanes.searchPanesSelectionChangeCallback(tableSearchPanesSelection);
                });

                // unselect option
                removeObservers('div.dtsp-searchPane table tr class=selected getClass=false');
                setElementChangeClassObserver('div.dtsp-searchPane table tr', 'selected', false, () => {
                    getSearchPanesSelection();
                    if (searchPanes.searchPanesSelectionChangeCallback) searchPanes.searchPanesSelectionChangeCallback(tableSearchPanesSelection);
                });
    
            }
            
            // everything set, now we need to resolve the promise 
            // we pass the table and its current search panes selection to the next steps
            resolve(
                {
                    table: table,
                    selection: tableSearchPanesSelection,
                    tableUniqueID: tableUniqueID
                }
            );
            
        });
    }

    // first: create the table, second: apply active searchPanes selection if available
    $(document).ready(function() {   
        createTable_ASYNC(
            tableSelector,
            tableUniqueID, 
            columnsConfig, 
            callback, 
            callbackClickRow, 
            allSettings, 
            searchPanes
        )
            .then((result) => {
                
                if ( result.selection.length === 0 ||  _.sumBy(result.selection, obj => _.get(obj, 'rows.length', 0)) === 0) {
                    return result.table;
                }
                else {
                    result.table.helpers.autoApplyActiveFilter(result.tableUniqueID);
                    return result.table;
                }       
            })
            .then((table) => {
                setTimeout(()=>table.fixedHeader.adjust(),100);

            })
            .then(() => {
                $('#dataTableLoading').remove(); // remove the table loader placeholder)
                setTimeout(()=>$(tableSelector).show(), 100);
            }); 
        ;
    });
}

const addAdditionalButtonsToTable = (table, tableSelector=null, zone=null, btnArray) => {
    btnArray.forEach(btnConfig => {
        table.button().add(null, btnConfig);
    });
    applyColorSchemaCorrections();
}

const handleBtnClose = () => {
    $(document).ready(function ()  {
        // delegate listener at higher level since some close buttons may be created dynamically
        $(document).on('click','.btn-close', function() {
            toCloseSelector = $(this).attr('whatToClose');
            if (toCloseSelector !== 'undefined' && $(`${toCloseSelector}`).length > 0 ) {
                $(`${toCloseSelector}`).fadeOut();
            }
        });
    });
}

const applyColorSchemaCorrections = (theme=null) => {
    
    // jtd forgets to change some colors when switching from light to dark and back
    if (!theme) {
        let themeCookie = Cookies.get(settings.themeSwitch.cookie);
        if (typeof themeCookie === 'undefined') Cookies.set(settings.themeSwitch.cookie,0, { expires:365 , secure: true, sameSite: 'strict' });
        themeCookie = Cookies.get(settings.themeSwitch.cookie);
        if (Cookies.get(settings.themeSwitch.cookie) === '0' ) theme = 'light';
        else  theme = 'dark';
    }

    if (theme === 'light' ) {
        $(settings.colSchemaCorrections.elementsWithBackgroundAffected).css('background',settings.colSchemaCorrections.backgroundColorOnElementsAffected.light);
        $(settings.colSchemaCorrections.elementsWithTextAffected).css('color', settings.colSchemaCorrections.textColorOnElementsAffected.light);
        $(settings.colSchemaCorrections.elementsWithBorderTopAffected).css('border-top', settings.colSchemaCorrections.borderTopOnElementsAffected.light);
        $(settings.colSchemaCorrections.elementsWithBorderLeftAffected).css('border-left', settings.colSchemaCorrections.borderLeftOnElementsAffected.light);
        $('.btn-close').removeClass('btn-close-white');
        
        // style the active page pagination button if table(s) on page
        $('li.dt-paging-button.page-item.active a')
            .addClass('paginationActivePageThemeLight')
            .removeClass('paginationActivePageThemeDark');
    }
    else {
        $(settings.colSchemaCorrections.elementsWithBackgroundAffected).css('background',settings.colSchemaCorrections.backgroundColorOnElementsAffected.dark);
        $(settings.colSchemaCorrections.elementsWithTextAffected).css('color', settings.colSchemaCorrections.textColorOnElementsAffected.dark);
        $(settings.colSchemaCorrections.elementsWithBorderTopAffected).css('border-top', settings.colSchemaCorrections.borderTopOnElementsAffected.dark);
        $(settings.colSchemaCorrections.elementsWithBorderLeftAffected).css('border-left', settings.colSchemaCorrections.borderLeftOnElementsAffected.dark);
        $('.btn-close').addClass('btn-close-white');
        
        // style the active page pagination button if table(s) on page
        $('li.dt-paging-button.page-item.active a')
            .removeClass('paginationActivePageThemeLight')
            .addClass('paginationActivePageThemeDark');
    }

    // apply css corrections on HS forms if necessary
    hsForms.forEach($form => {
        hsIntegrate.applyCSSCorrection($form, null);
    })
}

const sanitizeURL = (url) => {
    url = url.trim();

    if (!/^(?:\w+:)?\/\//.test(url) && url[0] !== '/') {
        url = url.split(/[?#]/)[0];
        return url;
    }
    url = decodeURI(url);
    url = url.split(/[?#]/)[0];
    url = encodeURI(url);

    return url;
}

const getElementInHotZone = (elements, zone, callback) => {
    $(document).ready(function() {
        $(window).scroll(function() {
            const viewportTop = $(window).scrollTop();
            const viewportBottom = viewportTop + $(window).height();
            let minTopPosition = Number.POSITIVE_INFINITY;
            let minTopElement = null;
            
            elements.forEach(function(element) {
        
                $(element).each(function() {
                    const crtElement = $(this);
                    let crtElementTop = crtElement.offset().top;
            
                    if (crtElementTop >= viewportTop + zone.top && crtElementTop <= viewportTop + zone.bottom) {
                        if (crtElementTop < minTopPosition) {
                            minTopPosition = crtElementTop;
                            minTopElement = crtElement;
                        }
                    }
                });
            });
        
            if (minTopElement) {
                callback(minTopElement);
            }
        });
    });
}

// necessary on mobile for datatables cells, when responsive mode is true for tables
// not used since we do not use responsive mode for tables, we use srollX with overflowX
const applyColorSchemaCorrectionsOnTD = () => {
    const targetNode = document.querySelector(settings.layouts.contentArea.contentContainer);
    if (targetNode) {
        const config = { childList: true, subtree: true };
        const callback = function(mutationsList, observer) {
            mutationsList.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && $(node).is('tr.child')) {
                        applyColorSchemaCorrections();
                    }
                });
            });
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }
}

const showToast = (message, type, textType) => {
    toast = new bootstrap.Toast($('.toast'));
    $('.toast').removeClass('bg-warning').removeClass('bg-danger').removeClass('bg-success').removeClass('bg-info');
    $('.toast').addClass(type);
    $('.toast .toast-body').removeClass('text-light').removeClass('text-dark');
    $('.toast .toast-body').addClass(textType);
    $('.toast-body').html(message);
    toast.show();
}

const getCurrentDateTime = () => {
    return formatDate(new Date());
}

const formatDate = (dateString) => {
    const today = new Date(dateString);
    const dd = String(today.getDate()).padStart(2, '0');
    const mmm = today.toLocaleString('default', { month: 'short' });
    const yyyy = today.getFullYear();
    
    //const hh = String(today.getHours()).padStart(2, '0');
    //const mm = String(today.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${dd}-${mmm}-${yyyy}`;
    return formattedDate;
}

const keepTextInputLimits = (textInputSelector, maxWords, maxChars, wordCountSelector, charCountSelector) => {
    const MAX_WORDS = maxWords;
    const MAX_CHARS = maxChars;
    const $textarea = $(textInputSelector);
    const $wordCount= $(wordCountSelector) || null;
    const $charCount= $(charCountSelector) || null;

    $textarea.on('keyup keypress paste', function() {
        const text = $(this).val();
        const wordCount = _.words(text).length;
        const charCount = text.length;
        if ($wordCount) $wordCount.text(`W: ${wordCount}/${MAX_WORDS}`);
        if ($charCount) $charCount.text(`C: ${charCount}/${MAX_CHARS}`);
        if (wordCount > MAX_WORDS || charCount > MAX_CHARS) {
            $(this).val(_.truncate(text, { 'length': MAX_CHARS }));
        }
    });
}

// OBSERVERS
// observes when elementSelector receive class cls (getClass=true) or lose class cls (getClass=false)
// and executes callback function
const setElementChangeClassObserver = (elementSelector, cls, getClass, callback = () => {}) => {
    // Start observing the body for mutations
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const targetElement = mutation.target;
                if (targetElement.matches(elementSelector)) {
                    const classList = Array.from(targetElement.classList);
                    if (!getClass) {
                        if (!classList.includes(cls)) {
                            callback();
                        }
                    } else {
                        if (classList.includes(cls)) {
                            callback();
                        }
                    }
                }
            }
        });
    });

    const config = { attributes: true, attributeFilter: ['class'], subtree: true };
    siteObservers.set(observer, `${elementSelector} class=${cls} getClass=${getClass}`);
    observer.observe(document.body, config);
    return observer;
};

// same as before but inside any iframe from the page
// one jQuery element inside the iframe must be known 
const iframe__setElementChangeClassObserver = ($elementInsideIFrame, elementSelector, cls, getClass, callback = () => {}) => {
    // Start observing the body for mutations

    const mutationCallback = function(mutationsList) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const targetElement = mutation.target;
                if (targetElement.matches(elementSelector)) {
                    const classList = Array.from(targetElement.classList);
                    if (!getClass) {
                        if (!classList.includes(cls)) {
                            callback();
                        }
                    } else {
                        if (classList.includes(cls)) {
                            callback();
                        }
                    }
                }
            }
        }
    };

    const observerOptions = { attributes: true, attributeFilter: ['class'], subtree: true };
    
    $('iframe').each(function($iframe) {
        const $iframeDocument = $elementInsideIFrame[0].ownerDocument;
        
        const observer = new MutationObserver(mutationCallback); 
        //console.log($iframeDocument)
        observer.observe($iframeDocument.body, observerOptions);
    });
};

// observes when an element with class=element Class is created and executes callback function
const setElementCreatedByClassObserver = (elementClass, callback = () => {}) => {
    const mutationCallback = function(mutationsList) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    //console.log(node)
                    if (
                        node instanceof Element && node.classList.contains(elementClass) || 
                        node instanceof Element &&  _.includes(node.classList.value, elementClass)
                        ) {
                        callback();
                    }
                });
            }
        }
    };
    
    const observerOptions = {
        childList: true,  
        subtree: true  
    };
    
    const targetNode = document.body;
    const observer = new MutationObserver(mutationCallback); 
    siteObservers.set(observer, `body (class=${elementClass})`); 
    observer.observe(targetNode, observerOptions);

    // Return the observer so it can be disconnected if needed
    return observer;
}

// same as before but inside any iframe from the page
// one jQuery element inside the iframe must be known 
const iframe__setElementCreatedByClassObserver = ($elementInsideIFrame, elementClass, callback = () => {}) => {
    const mutationCallback = function(mutationsList) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (
                        node instanceof Element && node.classList.contains(elementClass) || 
                        node instanceof Element &&  _.includes(node.classList.value, elementClass)
                        ) {
                        callback();
                    }
                });
            }
        }
    };
    
    const observerOptions = {
        childList: true,  
        subtree: true  
    };
    
    $('iframe').each(function($iframe) {
        const $iframeDocument = $elementInsideIFrame[0].ownerDocument;
        
        const observer = new MutationObserver(mutationCallback); 
        //console.log($iframeDocument)
        observer.observe($iframeDocument.body, observerOptions);
    });
}

// observes when the element with selector=selector is created and executes callback function
const setElementCreateBySelectorObserver = (selector, callback = (node=null) => {}) => {
    function handleNewElements(mutationsList) {
        mutationsList.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                //console.log(mutation.addedNodes)
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.matches(selector)) {
                        callback(node);
                    }
                });
            }
        });
    }
    
    var targetNode = document.body;
    var config = { childList: true, subtree: true };    
    var observer = new MutationObserver(function(mutationsList, observer) {
        handleNewElements(mutationsList, observer);
        
    });
    siteObservers.set(observer, `body (selector=${selector})`); 
    observer.observe(targetNode, config);

    // Return the observer so it can be disconnected if needed
    return observer;
}

// same as before but inside any iframe from the page
// one jQuery element inside the iframe must be known 
const iframe__setElementCreateBySelectorObserver = ($elementInsideIFrame, selector, callback = () => {}) => {
    function handleNewElements(mutationsList) {
        mutationsList.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                //console.log(mutation.addedNodes)
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.matches(selector)) {
                        callback();
                    }
                });
            }
        });
    }

    const observerOptions = {
        childList: true,  
        subtree: true  
    };
    
    $('iframe').each(function($iframe) {
        const $iframeDocument = $elementInsideIFrame[0].ownerDocument;
        const observer = new MutationObserver(function(mutationsList, observer) {
            handleNewElements(mutationsList, observer);   
        });
        observer.observe($iframeDocument.body, observerOptions);
    });

}

const setElementRemovalByClassObserver = (classString, removalCallback = null) => {
    const classes = classString.split(' ');
    const classSelector = classes.map(cls => '.' + cls).join('');
    const targetNode = document.body; // You can specify a more specific parent if you know it
    const config = { childList: true, subtree: true };

    const callback = function(mutationsList, observer) {
        mutationsList.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach(function(removedNode) {
                    if (removedNode.nodeType === Node.ELEMENT_NODE && removedNode.matches(classSelector)) {
                        removalCallback()
                    }
                });
            }
        });
    };

    const observer = new MutationObserver(callback);
    siteObservers.set(observer, `body removal (class=${classString})`); 
    observer.observe(targetNode, config);

    // Return the observer so it can be disconnected if needed
    return observer;
}

// disconnect an observer having the id=observerID
// see each observer definition to understand what are the used observerIDs
const removeObservers = (observerID) => {
    for (const [observer, element] of siteObservers) {
        if (element === observerID) {
            observer.disconnect();
            siteObservers.delete(observer);
        }
    }
}

// build a CKEditor Decoupled Editor having a set of default options + context specific options, on a div with the id=placeholder
// sets the needed general observers to modify the styles of the dynamic created elements
// sets the listeners for context specific processing and the references to the context specific callbacks:
// - post-processing the editor object after creation (callbackEditor)
// - process editor data while typing (callbackEditorData)
// - process editor data when hit the enter key (callbackEnterKey)
const setEditor = (placeholder, options={}, callbackEditor = ()=>{}, callbackEditorData = ()=>{}, callbackEnterKey = ()=>{}) => {
    const createEditor = () => {
        const $parent = $(placeholder).parent();
        const defaultBuiltInOptions = {
            toolbar: [
                'undo', 'redo', '|', 'heading', '|', 'alignment', 'outdent', 'indent', '|',
                {
                    label: 'Fonts',
                    withText: true,
                    items: [ 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor' ]
                },
                '|',
                {
                    label: 'Style',
                    withText: true,
                    items: [ 'bold', 'italic', 'strikethrough', 'superscript', 'subscript' ]
                },
                '|',
                {
                    label: 'Code Blocks',
                    withText: true,
                    items: [ 'blockQuote', 'codeBlock' ]
                },
                '|', 'link', 'blockQuote', '|',
                {
                    label: 'Lists',
                    withText: true,
                    items: [ 'bulletedList', 'numberedList', 'todoList']
                },   
            ]
        }

        const allBuiltInOptions = { ...defaultBuiltInOptions, ...options.builtInOptions }

        // EDITOR EVENT HANDLERS

        // on change:data
        const handleEditorDataChange = (editor, callbackEditorData) => {
            // we assume that there may be a setData() when processing the text, so we stop the listner to avoid endless loop
            editor.model.document.off('change:data');
            callbackEditorData(editor, ()=>{
                
                // more post setData() processing can be added here, before setting back the listener
                // this processing will be executed for all active CKEditors, so it should be something like logging
                // this is callbackResponse function, see setting the CKEditor in page-full-info.js 
                /* ... */
                editor.model.document.on('change:data', handleEditorDataChange.bind(null, editor, callbackEditorData));
            });
        } 

        // on hit enter
        const handleEnterKey = (editor, callbackEnterKey) => {
            callbackEnterKey(editor); 
        }

        const setListeners = (editor) => {

            // set a listener to process data while typing
            // using on change:data to filter events that don't change data but fire the event (i.e. mouse click)
            editor = $parent.find('.ck-editor__editable')[0].ckeditorInstance;
            editor.model.document.on('change:data', handleEditorDataChange.bind(null, editor, callbackEditorData));

            // set a listener to process data when hit enter key
            // but first remove any potential existing listeners on enter key
            editor.editing.view.document.off('enter');
            editor.editing.view.document.on('enter', handleEnterKey.bind(null, editor, callbackEnterKey));

        }

        // CREATE THE EDITOR OR RESET ITS DATA IF ALREADY EXISTS
        if ($parent.find('.ck').length === 0) {
            DecoupledEditor.create(document.querySelector(placeholder), allBuiltInOptions)
            .then(editor => {

                if (options.toolbar.show) {
                    const toolbarContainer = document.querySelector( options.toolbar.selector);
                    toolbarContainer.appendChild( editor.ui.view.toolbar.element );

                    if (options.menuBar.show) {
                        document.querySelector( options.menuBar.selector).appendChild( editor.ui.view.menuBarView.element );
                        $(options.toolbar.selector).css('margin-top','-1px');
                    }
                    
                    removeObservers(`${placeholder} class=documentEditor getClass=false`);
                    $(placeholder).addClass('documentEditor').addClass('border').removeClass('rounded');
                    setElementChangeClassObserver(placeholder,'documentEditor', false, ()=>{
                        $(placeholder).addClass('documentEditor').addClass('border').removeClass('rounded');
                    });
                }
                else {
                    removeObservers(`${placeholder} class=border getClass=false`);
                    $(placeholder).addClass('border');
                    setElementChangeClassObserver(placeholder,'border', false, ()=>{
                        $(placeholder).addClass('border');
                    });            
                }
                callbackEditor(editor);
                setListeners(editor);
        
            })
            .catch(error => {
                console.error(error);
            });
        }
        else {
            // stop the listener so editor to not fire on change for setData() and avoid endless loop on change
            editor = $parent.find('.ck-editor__editable')[0].ckeditorInstance;
            editor.model.document.off('change:data');
            editor.setData('');
            setListeners(editor);
        }
    }

    $(document).ready(createEditor);
}

const transformEditorTextToArray = (htmlString) => {
    const textWithoutTags = htmlString.replace(/<[^>]*>|&nbsp;/g, ' ');
    const trimmedText = textWithoutTags.trim().replace(/\s{2}/g, ', ');
    const rawArray = trimmedText.split(",");
    const notEmptyArray = _.compact(rawArray);
    var nonEmptyArray = _.filter(nonEmptyArray, function(value) { return value !== ''; });
    const cleanArray = notEmptyArray.map(function(value) { return value.trim(); });
    const uniqueArray = _.uniqBy(cleanArray, function(value) { return value.toLowerCase(); });
    
    return uniqueArray;
}

const createGlobalLists = () => {
    globCustomCats = _.uniq(getCustomCats());
    globCustomTags = _.uniq(getCustomTags());
    globAllCats = _.uniq(Array.from(new Set([...catList, ...globCustomCats].slice().sort())));
    globAllTags = _.uniq(Array.from(new Set([...tagList, ...globCustomTags].slice().sort()))); // here to check if a site tag is the same as a custom tag and to rename the custom tag with CT_

    // do some cleaning since datatables are, usually, created with saveState configuration
    // and modifications of tags/cats may lead to orphan tables in local storage
    getOrphanDataTables('tag').forEach( table => { localStorage.removeItem(table); });
    getOrphanDataTables('cat').forEach( table => { localStorage.removeItem(table); });
    
    // better to clean all notes tables to avoid cases when the user save the table configuration wih all columns visible
    // and the note uuid remains visible although is not useful for anything
    getOrphanDataTables('notes').forEach( table => { localStorage.removeItem(table); });

}

const getOrphanDataTables = (what) => {
    
    let substring = '';

    switch (what) {
        case 'tag':
            substring = '_DataTables_TagPages_';
            break;
        case 'cat':
            substring = '_DataTables_CatPages_';
            break;
        case 'notes':
            substring = '_DataTables_PageCustomNotes_';
            break;
        default:
            substring = '_DataTables_Table_'; 
            break;
    }
    
    if (!substring) return [];
    if (substring === 'undefined' || substring === '') return [];

    let matchingKeys = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes(substring)) {
            matchingKeys.push(key);
        }
    }

    const modifiedArray = _.map(matchingKeys, item => {
        return _.split(item, substring)[1];
      });

    const orphanTags = _.difference(_.uniq(modifiedArray.sort()), globAllTags);
    const regex = new RegExp(`${substring}(${orphanTags.join('|')})$`);
    matchingKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (regex.test(key)) {
          matchingKeys.push(key);
        }
    }

    return matchingKeys;
}

// elementTriggerCloseWhenScroll is the element which triggers the closure of the context menu when scrolled vertically. 
// usually is the window element but can be the parent of the element on which the context menu is applied 
// (to be used when the context menu is applied on an element which is on a modal or offcanvas that blocks the window scroll when active)
const setContextMenu = (
    elementSelector, //css selector for the element on which the context menu is applied
    elementTriggerCloseWhenScroll = null, //element which triggers the closure of the context menu when scrolled vertically
    menuContent, // the html content of the context menu = header(custom) + body(menu item list) + footer(custom)
    callbackItem, // executed when click on a menu item from the menuContent items list
    callbackAfterShow = null, //executed after the context menu is shown to do some post processing if needed
    additionalClass = [] // additional classes to be applied to the whole context menu container
) => {
    $(document).ready(function() {

        $(document).off('contextmenu', elementSelector).on('contextmenu', elementSelector, function(event) {
            event.preventDefault(); // Prevent default context menu  
            
            // we can use a hard-coded class for the context menu since there will never be more than one open
            // since any click outside a context menu will close it and remove the context menu from the DOM
            $('.context-menu').remove(); // remove the potential existing context menu
            const $clickedElement = $(this);

            const calculatePosition = ($element, dropdownMenu) => {
                // calculate the position of the context menu
                const elementHeight = $element.outerHeight();
                const elementScrollTop = $element.offset().top - $(window).scrollTop();
                const elementLeft = $element.offset().left;
                let topPosition;

                topPosition = elementScrollTop + elementHeight + 2
                
                let leftPosition = elementLeft; 
                
                position = {
                    x:leftPosition,
                    y:topPosition
                }

                return position;
            }

            $(window).sizeChanged(() => { 
                position = calculatePosition($clickedElement, dropdownMenu);
            });

            
            const dropdownMenu = $('<div class="context-menu rounded border bg-light-subtle show">');

            // context menu header
            if (menuContent.header.trim() !=='') {
                const dropdownMenuHeader = $('<div class="context-menu-header px-4 py-2">');
                dropdownMenuHeader.append($(menuContent.header));
                const dropdownMenuSeparator = $('<hr class="my-0 mx-2" siteFunction="contextMenuSeparator">');
                dropdownMenu.append(dropdownMenuHeader).append(dropdownMenuSeparator);
            }
        
            // context menu items
            const dropdownMenuList = $('<ul class="context-menu-list">'); 
            const dropdownMenuListContainer = $('<div class="context-menu-list-container px-4">');
            dropdownMenu.append(dropdownMenuListContainer);
            dropdownMenuListContainer.append(dropdownMenuList);

            menuContent.menu.forEach( item => {
                let $itemElement = $(item.html);
                $itemElement.addClass('context-menu-item py-2');
                dropdownMenuList.append($itemElement);
            });

            // context menu footer
            if (menuContent.footer.trim() !=='') {
                const dropdownMenuFooter = $('<div class="context-menu-footer px-4 py-2">');
                dropdownMenuFooter.append($(menuContent.footer));
                const dropdownMenuSeparator = $('<hr class="my-0, mx-2" siteFunction="contextMenuSeparator">');
                dropdownMenu.append(dropdownMenuSeparator).append(dropdownMenuFooter);
                
            }
            
            position = calculatePosition($(this), dropdownMenu);
            dropdownMenu.css({
                top: position.y + 'px',
                left: position.x + 'px',
            });

            $('body').append(dropdownMenu);
            additionalClass.forEach(cls => {
                dropdownMenu.addClass(cls);
            });
            
            if (callbackAfterShow) callbackAfterShow(event);
            
            // set auto closing events
            if (elementTriggerCloseWhenScroll) 
                $(elementTriggerCloseWhenScroll).on('scroll', function() {
                    $('.context-menu').remove();
                });
            
            $(window).on('scroll', function() {
                $('.context-menu').remove();
            });

            $(document).on('click', function(e) {
                if (!$(e.target).closest('.context-menu').length) {
                dropdownMenu.remove();
                }
            });
            
            // set callback action
            dropdownMenu.find('.context-menu-item').on('click', function(e) {
                e.preventDefault();
                callbackItem($(this), $clickedElement);
                dropdownMenu.remove();
            });
        });
    });
}

const getContextMenuItemHandler = (action, menuContent) => {
    let handler = null;
    menuContent.menu.forEach (menuItem => {
        if ( $(menuItem.html).text().trim() === action ) handler = menuItem.handler
    });
    return handler;
}

const cleanText = (text) => {
    return DOMPurify.sanitize(text.replace(/<[^>]*>/g, '').replace(/(\n|&nbsp;)/g, ''));
}

const replaceAllOccurrencesCaseInsensitive = (array, target, replacement) => {
    // Create a case-insensitive, global regular expression
    const regex = new RegExp(_.escapeRegExp(target), 'gi');
    
    // Use _.map to iterate through the array and replace the target string
    return _.map(array, item => {
      if (typeof item === 'string') {
        return item.replace(regex, replacement);
      }
      return item;
    });
}

const transformStringFromPageSearchList = (input) => {
    // Use a regular expression to capture the title and permalink parts
    const regex = /(.*) \((.*)\)/;
    const match = input.match(regex);

    if (match) {
        const [_, title, permalink] = match;
        return { title, permalink };
    }

    return null;
}

const stripHtml = (data) => {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = data;
    return tmp.textContent || tmp.innerText || "";
}

const getSearchPaneOptionsFromArray = (tableSelector, columnIndex, initCallback=null, callback = null) => {
    
    let values = new Set();
    
    // init the searchPane from data-raw attribute of each cell in coumnIndex column
    // data-raw must contain an array json string
    // or from a set returned by initCallback, if initCallBack is provided
    // USING initCallback IS ALWAYS RECOMMENDED SINCE CAN BE MUCH FASTER THAN
    // ITERATING THROUGH THE WHOLE TABLE EACH TIME WHEN FILTERING
    if (!initCallback) {
        // THIS IS BEFORE DATATABLE INIT, 
        // WE CAN ACCESS THE CELLS USING JQERY
        // WE CANNOT ACCES CELLS USING datatable OBJECT SINCE DATATABLE DOES NOT EXIST YET
        let table = $(tableSelector);
        const rows = table.find('tbody tr');
        
        // Iterate over all rows to collect unique values from the specified column
        rows.each(function() {
            // Get the array of <td> elements in this row
            const cells = $(this).find('td').get(); // `.get()` to return an array of DOM elements
            if (cells.length > columnIndex) {
                const cell = $(cells[columnIndex]);
                // data-raw should be set always on the first child of the content of the cell
                // see details below
                const rawData = cell.children().first().attr('data-raw');

                let cellData;
                try {
                    cellData = JSON.parse(rawData);
                } catch (e) {
                    cellData = rawData;
                }

                if (cellData !== undefined) {
                    // If cellData is an array, add its items to the Set
                    if (Array.isArray(cellData)) {
                        cellData.forEach(item => values.add(item));
                    } else {
                        values.add(cellData);
                    }
                }
            }
        });
    }
    else values = initCallback();

    // Convert set to array of options
    // THIS IS AFTER DATATABLE INIT, 
    // WE CANNOT ACCESS THE CELLS USING JQERY SINCE SOME COLUMNS MAY BE NOT VISIBLE = NOT IN THE DOM
    // WE CAN ACCESS CELLS USING datatable OBJECT IF WE NEED TO DO SO

    return Array.from(values).map(value => ({
        label: `${value}`,
        value: function(row) {
            const cell = $(row[columnIndex]);
            // data-raw should be set always on the first child of the content of the cell 
            // (see _includes/siteIncludes/partials/site-pages/pages-details.html as example)
            // the reason is to optimise filtering when changing selections in search panes
            // because cell = $(row[columnIndex]) above returns only the content of the cell (as html)
            // and putting data-raw as td level means extra iterations in table (many iterations)
            // for getting the full td element and extracting data-raw
            const rawData = cell.children().first().attr('data-raw');
            let cellData;
            // trying to parse the data we will use for checking the value, should be a valid json array
            try { cellData = JSON.parse(rawData); } 
            catch (e) { cellData = rawData; }

            // if callback is provided, we send back some info, maybe is needed for extra custom processing
            if (callback) callback(row, value);
            
            // Check if cellData is an array or a single value
            if (Array.isArray(cellData)) return cellData.includes(value);
            else return cellData === value;
        },
        viewCount: 0
    }));
}

const allPagesTitles = (data, key) => {
    return _.chain(data)
        .flatMap(item => _.get(item, key, []))
        .map(page => _.get(page, 'title', ''))
        .filter(title => title.trim() !== '')
        .uniq()
        .sortBy()
        .value();
}

// iFrames and HS integration
const pushHSFormToHSFormsList = ($form) => {
    const formExists = _.some(hsForms, (form) => {
        return form.attr('id') === $form.attr('id');
    });

    if ( !formExists ) hsForms.push($form);
}

const addBootstrapToIFrames = () => {
    const addBootstrapScripts = (iframe, bootstrapCSS, bootstrapJS) => {
        const iframeDoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
        try {
            $(iframeDoc.head).append(bootstrapCSS);
            $(iframeDoc.body).append(bootstrapJS);
        } catch (e) {
            console.error('Unable to access iframe content:', e);
        }

    } 
    const bootstrapCSS = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">';
    const bootstrapJS = '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>';
    
    $('iframe').each(function() { 
        addBootstrapScripts($(this), bootstrapCSS, bootstrapJS);
    });
}

const iframe__addBootstrapToIFrames = ($elementInsideIFrame) => {
    const $iframeDocument = $elementInsideIFrame[0].ownerDocument;
    const $iframeHead = $($iframeDocument).find('head');
    const bootstrapCSS = `<link rel="stylesheet" href="${settings.hsIntegration.bootstrapCSS}">`;
    const bootstrapIconCSS = `<link rel="stylesheet" href="${settings.hsIntegration.bootstrapIconsCSS}">`;
    $($iframeHead).append(bootstrapCSS).append(bootstrapIconCSS);

    // HEADS UP!
    // WE DON'T LOAD bootstrapJS TO IFRAMES 
    //BECAUSE WILL BREAK SOME FUNCTIONALITIES OF BOOTSTRAP IN MAIN DOCUMENT
    
    //const $iframeBody = $($iframeDocument).find('body');
    //const bootstrapJS = `<script src="${settings.hsIntegration.bootstrapJS}"></script>`;
    //$($iframeBody).append(bootstrapJS);
    
}

const addCustomScriptsToIFrames = (cssScripts = [], jsScripts = []) => {
    const addCustomScripts = (iframe, cssScripts, jsScripts) => {
        const iframeDoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
        try {
            cssScripts.forEach( script => {
                $(iframeDoc.head).append(`<link rel="stylesheet" href="/assets/css/${script}">`);
            })
            jsScripts.forEach( script => {
                $(iframeDoc.head).append(`<script src="/assets/js/${script}"></script>`);
            })
        } catch (e) {
            console.error('Unable to access iframe content:', e);
        }

    } 
    
    $('iframe').each(function() { 
        addCustomScripts($(this), cssScripts, jsScripts);
    });
}

const iframe__addCustomScriptsToIFrames = ($elementInsideIFrame, cssScripts = [], jsScripts = []) => {    
    const $iframeDocument = $elementInsideIFrame[0].ownerDocument;
    const $iframeHead = $($iframeDocument).find('head');
    const $iframeBody = $($iframeDocument).find('body');
    cssScripts.forEach( script => {
        $($iframeHead).append(`<link rel="stylesheet" href="/assets/css/${script}">`);
    })
    jsScripts.forEach( script => {
        $($iframeBody).append(`<script src="/assets/js/${script}"></script>`);
    })
}

const iframe__utilities = () => {
    return {
        settings: settings,
        pageSettings: pageSettings,
        hsSettings: hsSettings,
        func: {
            showToast: showToast
        }
    }
}

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return _.isString(email) && emailRegex.test(email);
}


const isValidText = (text, minWords, maxWords) => {
    // Check if the text contains new lines, tabs, or any HTML tags
    if (/\n|\t|<[^>]+>/.test(text)) {
        return false;
    }

    // Split the text by any sequence of whitespace characters to count words
    const wordCount = text.trim().split(/\s+/).length;

    // Return false if the text contains fewer than 3 words or more than 10 words
    if (wordCount < minWords || wordCount > maxWords) {
        return false;
    }

    // Return true if none of the above conditions are met
    return true;
};

// selected text context menu
const setSelectedTextContextMenu = (
    hotZoneSelector, // the area inside the context menu is active; cannot be document or window
    contextMenuContent, // the content object to be rendered inside the context menu
    selectedTextCallback = null // to be executed with selected text as a parameter
) => {
    const checkContextMenuContent = (contextMenuContent) => {
        return contextMenuContent.menu.length > 0 || (contextMenuContent.ops && contextMenuContent.ops !== '') ? true : false;
    }

    const contextMenuOptionsHtml = (contextMenuContent) => {
        const getMenuItemHtml = (itemText) => {
            return `<li class="selected-text-context-menu-item">${itemText}</li>`;
        }

        let itemsHtml = '';
        contextMenuContent.menu.forEach(item => {
            itemsHtml += getMenuItemHtml(item.label);
        });

        return itemsHtml === '' ? itemsHtml : `<ul>${itemsHtml}</ul>`;
    }

    // Clear previous menu content
    $('#selected-text-context-menu').empty();

    if (!checkContextMenuContent(contextMenuContent)) return;

    let rect =  null;

    if (contextMenuContent.menu.length > 0) $('#selected-text-context-menu').append($(contextMenuOptionsHtml(contextMenuContent)));
    if (contextMenuContent.ops && contextMenuContent.ops !== '') $('#selected-text-context-menu').append($(contextMenuContent.ops));

    $(hotZoneSelector).on('mouseup', function (e) {
        const selectedText = window.getSelection();

        if (selectedText.toString().trim().length > 0 && isValidText(selectedText.toString().trim(), 3, 10)) {
            const range = selectedText.getRangeAt(0);
            rect = range.getBoundingClientRect();

            $('#selected-text-context-menu').css({
                top: rect.y + rect.height + 5 + 'px',
                left: rect.x + 'px',
                zIndex: 1000
            });

            setTimeout(() => $('#selected-text-context-menu').show(), 200);

            // Store selected text for use later
            $('#selected-text-context-menu').data('selectedText', selectedText.toString().trim());
        } else {
            $('#selected-text-context-menu').hide();
        }
    });

    // Hide context menu when clicking outside it
    $(document).on('mousedown', function (e) {
        if (!$(e.target).closest('#selected-text-context-menu, ' + hotZoneSelector).length) {
            $('#selected-text-context-menu').hide();
        }
    });

    // Hide the context menu when scrolling
    $(window).on('scroll', function() {
        $('#selected-text-context-menu').hide();
    });

    // Hide the context menu when the Escape key is pressed
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            $('#selected-text-context-menu').hide();
        }
    });

    // Prevent the context menu from hiding when clicking inside it
    $('#selected-text-context-menu').on('mousedown', function (e) {
        e.stopPropagation(); // Prevent clicks inside the menu from hiding it
    });

    // Handle the custom option click and preservinf the highlight of selected text until context menu is closed
    $('#selected-text-context-menu').on('click', '.selected-text-context-menu-item', function (event) {
        // Capture the selected text from the data attribute
        const selectedText = $('#selected-text-context-menu').data('selectedText');
        
        
        if (!selectedText) {
            console.warn('No selected text found.');
            return;
        }

        // Helper function to check if the rectangle intersects with the bounding rect
        const isRectInRectangle = (boundingRect, rect) => {
            return !(boundingRect.right < rect.left ||
                    boundingRect.left > rect.right ||
                    boundingRect.bottom < rect.top ||
                    boundingRect.top > rect.bottom);
        }

        // Function to find and select the exact occurrence of the text within the rectangle
        const reapplySelection = (text) => {
            const selection = window.getSelection();
            const range = document.createRange();
            
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let node;
            while ((node = walker.nextNode())) {
                const nodeText = node.nodeValue;
                let index = nodeText.indexOf(text);

                if (index !== -1) {
                    // Found the text; create a range and check its bounding rectangle
                    range.setStart(node, index);
                    range.setEnd(node, index + text.length);

                    const boundingRect = range.getBoundingClientRect();
                    if (isRectInRectangle(boundingRect, rect)) {
                        selection.removeAllRanges();
                        selection.addRange(range);
                        return; // Exit after selecting the correct occurrence
                    }
                }
            }

            console.warn('Selected text could not be re-applied within the rectangle.');
        }

        // Reapply the exact text selection for the specified occurrence
        reapplySelection(selectedText);

        // Execute the callback function if it exists
        if (typeof selectedTextCallback === 'function') {
            selectedTextCallback(event, selectedText, rect);
        }
    });
}








