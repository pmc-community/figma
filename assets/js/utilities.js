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

// read external contents between markers
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

const filterArrayStartingWith = (arr, prefix) => {
    return arr.filter(function(item) {
      return item.startsWith(prefix);
    });
  }

const setSearchList = (
    searchInputSelector, 
    searchResultsSelector, 
    searchResultsItemSelector, 
    searchResultsItemTag, 
    searchResultsItemClosingTag,
    callback
) => {
        $(document).ready( () => {
            const $searchInput = $(searchInputSelector);
            const $searchResults = $(searchResultsSelector);

            $searchResults.css('left', $(searchInputSelector).position().left + 'px');
            $searchResults.css('top', $(searchInputSelector).position().top + $(searchInputSelector).outerHeight(true) + 'px');    

            let list = [];
            $(searchResultsItemSelector).each(function() { list.push($(this).text().trim()); });
    
            function showSearchResults() {
                const searchTerm = $searchInput.val().trim().toLowerCase();
                let html = '';
                if (searchTerm === '') {
                    $searchResults.hide();
                    return;
                }
                const filteredList =  filterArrayStartingWith (list, searchTerm);            
                filteredList.forEach(function(result) { html += searchResultsItemTag + result + searchResultsItemClosingTag; });            
                $searchResults.html(html).show();
            }
            
            $searchInput.on('input', function() { if ($searchInput.val().trim().toLowerCase() !== '') showSearchResults(); });
        
            // Handle click outside search input or search results to hide the list
            $(document).on('click', function(event) {
                const $target = $(event.target);
                if (!$target.closest(`${searchInputSelector}, ${searchResultsSelector}`).length) { $searchResults.hide();} 
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
            
                        //showTagDetails(selectedValue);
                        //executeFunction(customFunction, customFunctionArgs);
                        callback(selectedValue);
                    }
                }
            });
            // Handle click on search results item
            $searchResults.on('click', searchResultsItemSelector, function() {
                const clickedValue = $(this).text();
                $searchInput.val(clickedValue); // Set input value to clicked item
                $searchResults.hide(); // Hide search results
        
                // Call custom function here
                //showTagDetails(clickedValue);
                //executeFunction(customFunction, customFunctionArgs);
                callback(selectedValue);
            });
        });
}

// columnsConfig is set in the caller, to be fit to the specific table
// callback and callbackClickRow are set in the caller to do specific processing after the table is initialized
const setDataTable = (tableSelector, tableUniqueID, columnsConfig, callback, callbackClickRow, additionalSettings = {}) => {
    const defaultSettings = {
        paging: true, 
        ordering: true,
        searching: true,
        colReorder: true,
        processing: true,
        fixedHeader: true,
        colReorder: false,
        layout: {
            topStart: {
                pageLength: {
                    menu: [1, 5, 10, 25, 50]
                }
            },
            bottom2: {
                buttons: [
                    {
                        extend: ['colvis'],
                        columns: ':gt(0)', // except first column which will be always visible
                        text: 'Columns',
                        attr: {
                            title: 'Show/Hide Columns',
                            siteFunction: 'tableColumnsVisibility'
                        },
                        className: 'btn-primary btn-sm text-light focus-ring focus-ring-warning mb-2'
                    }
                ]
            }
        },
        stateSave: true,
        stateSaveCallback: function (settings, data) {
            localStorage.setItem(`${window.location.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_')}_DataTables_` + tableUniqueID, JSON.stringify(data));
        },
        stateLoadCallback: function (settings) {
            return JSON.parse(localStorage.getItem(`${window.location.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_')}_DataTables_` + tableUniqueID));
        },
        columns: columnsConfig
    };
    const allSettings = {...defaultSettings, ...additionalSettings};

    $(document).ready(function() {
        $(`${tableSelector} tr`).removeClass('table-active'); // just to be sure that nothing is marked as selected
        table = $(tableSelector).DataTable(allSettings);

        // callback to be personalised for each table
        // for post processing the table (i.e. adding buttons based on context)
        callback(table);

        const composeRowClickColumnsSelector = (colDef) => {
            let notActiveWhenClick = [];
            colDef.forEach( column => {
                if (column && table.column(colDef.indexOf(column)).visible() && table.colReorder.order().indexOf(colDef.indexOf(column)) !== -1) {
                    if (column.exceptWhenRowSelect) {
                        notActiveWhenClick.push(colDef.indexOf(column));
                    }
                }
            });
            let rowClickSelector = 'tbody tr'

            if (notActiveWhenClick.length > 0) {
                rowClickSelector = 'tbody td'
                notActiveWhenClick.forEach( columnIndex => {
                    rowClickSelector += `:not(:nth-child(${columnIndex+1}))`
                });
            }
            return rowClickSelector
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

        table.off('click').on('click', composeRowClickColumnsSelector(columnsConfig), handleRowClick);

        // since tables are created dynamically, some color corrections may be lost 
        // because the theme is already applied, so we need to do the corrections again
        // also needed when switching theme
        // if switch theme and increase no of rows/page, new rows will have the previous scheme background
        applyColorSchemaCorrections();
        // also on draw event to cover all potential cases
        table.on('draw', function () { applyColorSchemaCorrections(); });
    });
}

const addAdditionalButtonsToTable = (table, tableSelector, zone, btnArray) => {
    tableConfiguration = table.settings().init();
    tableConfigurationLayout = tableConfiguration.layout || {};
    tableConfigurationLayoutZone = tableConfigurationLayout[zone] || {};
    tableButtonsInZone = tableConfigurationLayoutZone.buttons || [];
    tableButtonsInZone = [...tableButtonsInZone, ...btnArray];
    tableConfiguration.layout[zone].buttons = tableButtonsInZone;
    table.destroy();
    $(tableSelector).DataTable(tableConfiguration);
    applyColorSchemaCorrections();
}

const handleBtnClose = () => {
    $(document).ready(function ()  {
        $('.btn-close').click(function() {
            toCloseSelector = $(this).attr('whatToClose');
            if (toCloseSelector !== 'undefined') {
                $(`${toCloseSelector}`).fadeOut();
            }
        });
    });
}

const applyColorSchemaCorrections = (theme) => {
    
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
        $('.btn-close').removeClass('btn-close-white');
    }
    else {
        $(settings.colSchemaCorrections.elementsWithBackgroundAffected).css('background',settings.colSchemaCorrections.backgroundColorOnElementsAffected.dark);
        $(settings.colSchemaCorrections.elementsWithTextAffected).css('color', settings.colSchemaCorrections.textColorOnElementsAffected.dark);
        $(settings.colSchemaCorrections.elementsWithBorderTopAffected).css('border-top', settings.colSchemaCorrections.borderTopOnElementsAffected.dark)
        $('.btn-close').addClass('btn-close-white');
    }
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
    } else {
        console.error('Target node not found when trying to set datatables cell background');
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

const setCanvasCloseObserver = (callback) => {
    const targetElement = document.querySelector('.offcanvas');
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                const classList = Array.from(mutation.target.classList);
                if (!classList.includes('show')) {
                    callback();
                }
            }
        });
    });
    const config = { attributes: true, attributeFilter: ['class'] };
    observer.observe(targetElement, config);
}

const setSimpleEditor = (placeholder, options, callbackEditor, callbackEditorData) => {
    const createEditor = () => {
        const $parent = $(placeholder).parent();
        
        if ($parent.find('.ck').length === 0) {
            DecoupledEditor.create(document.querySelector(placeholder), options)
            .then(editor => {
                callbackEditor(editor);
                $(placeholder).addClass('rounded border'); // to fit in the theme design
                editor.model.document.on('change', handleEditorDataChange.bind(null, editor, callbackEditorData));
            })
            .catch(error => {
                console.error(error);
            });
        }
        else {
            // stop the listener so editor to not fire on change for setData()
            editor = $parent.find('.ck-editor__editable')[0].ckeditorInstance;
            editor.model.document.off();
            editor.setData('');
            editor.model.document.on('change', handleEditorDataChange.bind(null, editor, callbackEditorData));
        }
    }

    $(document).ready(createEditor);
}

const handleEditorDataChange = (editor, callbackEditorData) => { 
    callbackEditorData(editor.getData());
}
