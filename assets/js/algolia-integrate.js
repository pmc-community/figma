// removing addtional docSearch features when click on clear query button
// since is not wise to try to overwrite the clear query button handler, we use a DOM event to handle this
removeObservers('.DocSearch-Reset receive attribute=hidden');
setElementReceiveAttributeObserver('.DocSearch-Reset', 'hidden', () => {
   algolia.resetSearch();
   algolia.hideSearchHitDetailsContainer();
});

// setup the search hit details box
// we force esults to be shown in the custom fomat defined in setDocSearchBox/refreshResults by force navigating to first page
// we create the search hit details container
removeObservers('body class=DocSearch--active getClass=true');
setElementChangeClassObserver ('body', 'DocSearch--active', true, () => {
    algolia.createSearchHitDetailsContainer();
    algolia.forceNavigationToPage(0);
});

// setting some events to modify the default behaviour of DocSearch
// search results must be shown in the custom fomat defined in setDocSearchBox/refreshResults
// and search box dropdown list should navigate to first page of results
// so we overwrite the default behaviour of showing results which based on the built-in instant search
$(document).off('input', '.DocSearch-Input').on('input', '.DocSearch-Input', function() {
    algolia.forceNavigationToPage(0);
});

$(document).off('focus', '.DocSearch-Input').on('focus', '.DocSearch-Input', function() {
    algolia.forceNavigationToPage(algolia.currentPage);
});


algolia = {
    appId: algoliaSettings.algoliaAppID,
    apiKey: algoliaSettings.algoliaPublicApiKey,
    indexName: algoliaSettings.algoliaIndex,
    container: algoliaSettings.algoliaSearchBoxContainer,
    debug: algoliaSettings.algoliaDebug,
    maxResultsPerGroup: algoliaSettings.algoliaMaxResultsPerGroup,
    insights: algoliaSettings.algoliaSendInsights,
    raiseIssueLink: algoliaSettings.algoliaRaiseIssueLink,
    hitsPerPage: algoliaSettings.algoliaHitsPerPage,
    currentPage: 0,
    highlightTextPrefixTag: algoliaSettings.algoliaTextHighlightPrefixTag,
    highlightTextPostfixTag: algoliaSettings.algoliaTextHighlightPostfixTag,
    hitItemDetailsBoxGutter: 5,

    resetSearch: () => {
        $('div[siteFunction="showMoreShowLessButtons"]').remove();
        $('.pagination-buttons').remove();
        $('div[siteFunction="docSearchListItemDetails"]').addClass('d-none');
    },

    createSearchHitDetailsContainer: () => {
        const styleListItemDetails = () => {
            const width = $('.DocSearch-Modal').outerWidth();
            const offset = $('.DocSearch-Modal').offset(); 
            const rightDocSearchPosition = offset.left + width - $(window).scrollLeft();
            const left = rightDocSearchPosition + algolia.hitItemDetailsBoxGutter;
            const height = $('.main-header').offset().top + $('.main-header').height();

            $('div[siteFunction="docSearchListItemDetails"]')
                .css(
                    'top', 
                    height + 'px'
                )
                .css(
                    'left', 
                    left + 'px'
                )
                .css(
                    'width', 
                    width + 'px'
                );

            $('div[siteFunction="docSearchListItemDetails"]').draggable({
                containment: "window"
            });
        }

        if($('div[siteFunction="docSearchListItemListAndDetails"]').length === 0 ) {
            const $details = $('<div siteFunction="docSearchListItemDetails" class="d-none p-4 text-dark">Search Hit Details</div>');
            $('.DocSearch-Modal').prepend($details);
            styleListItemDetails();
           
        }
    },

    showSearchHitDetailsContainer: () => {
        const width = $('.DocSearch-Modal').outerWidth();
        const fullwidth = 2 * width + algolia.hitItemDetailsBoxGutter;

        const marginLeft = ($(window).width() - fullwidth)/2;
        $('.DocSearch-Modal').css('margin-left', marginLeft + 'px');

        const offset = $('.DocSearch-Modal').offset(); 
        const rightDocSearchPosition = offset.left + width - $(window).scrollLeft();
        const left = rightDocSearchPosition + algolia.hitItemDetailsBoxGutter;

        const top = $('.main-header').height();

        $('div[siteFunction="docSearchListItemDetails"]')
            .css(
                'top', 
                top + 'px'
            )
            .css(
                'left', 
                left + 'px'
            );

        $('div[siteFunction="docSearchListItemDetails"]').removeClass('d-none');
        $('div[siteFunction="docSearchListItemDetails"]').fadeIn();

    },

    hideSearchHitDetailsContainer: () => {
        $('div[siteFunction="docSearchListItemDetails"]').fadeOut();
        $('div[siteFunction="docSearchListItemDetails"]').addClass('d-none');
        $('.DocSearch-Modal').css('margin-left', '');
    },

    forceNavigationToPage: (page) => {
        $('.DocSearch-Dropdown').css('visibility', 'hidden');
        setTimeout(()=>{       
            $(`button[siteFunction="docSearchPaginationPage_${page}"]`).click();
            $(document).off('keydown').off('keypress');
            $('.DocSearch-Dropdown').css('visibility', 'visible');        
        }, 200);
        
    },

    silentSearchInSite: (query, searchResultsCallback) => {
        const client = algoliasearch(algolia.appId, algolia.apiKey);
        const index = client.initIndex(algolia.indexName);
        index.search(query)
            .then(function(initialSearchResults) {
                const resultsPages = initialSearchResults.nbPages;
                let results = [];

                const logResults = () => {
                    //console.log(results);
                    searchResultsCallback(results);
                };

                const fetchPage = (i) => {
                    return index.search(query, { page: i })
                        .then(function(searchResults) {
                            // Correctly concatenate results, ensuring no overwriting
                            results = results.concat(searchResults.hits);
                        })
                        .catch(function(error) {
                            showToast('Something went wrong with this search!<br><br>You may try again later. If the problem persists, contact support.', 'bg-danger', 'text-light');
                            console.error('Search error:', error);
                        });
                };

                // Create an array of promises for each page
                const fetchPromises = [];
                for (let i = 0; i < resultsPages; i++) {
                    fetchPromises.push(fetchPage(i));
                }

                // Wait for all page fetching promises to complete
                Promise.all(fetchPromises)
                    .then(() => {
                        logResults();  // Ensure logging only after all promises resolve
                    })
                    .catch(function(error) {
                        showToast('Something went wrong with retrieving all search result pages!<br><br>You may try again later. If the problem persists, contact support.', 'bg-danger', 'text-light');
                        console.error('Error in fetching all pages:', error);
                    });
            })
            .catch(function(error) {
                showToast('Something went wrong with the initial search (number of pages)!<br><br>You may try again later. If the problem persists, contact support.', 'bg-danger', 'text-light');
                console.error('Initial search error:', error);
            });


    },

    findMarkedStrings: (obj, parentKey = '', openingTag = '', closingTag = '') => {
        const result = [];
  
        const markPattern = new RegExp(`${openingTag}(.*?)${closingTag}`, 'g'); // 'g' for global match

        const processKey = (key, value) => {
            const currentPath = parentKey ? `${parentKey}.${key}` : key;

            if (typeof value === 'string' && markPattern.test(value)) {
                result.push({ key: currentPath, value: value });
            } else if (typeof value === 'object' && value !== null) {
                result.push(...algolia.findMarkedStrings(value, currentPath, openingTag, closingTag));
            }
        }
        
        if (obj) {
            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    processKey(index, item);
                });
            } else {
                Object.keys(obj).forEach((key) => {
                    processKey(key, obj[key]);
                });
            }
        }

        return result;
    },

    getResultItem: (result) => {
        let title;
        if (result.url_without_anchor) title = getPageTitleFromUrl(result.url_without_anchor);
        else if (result.url) title = getPageTitleFromUrl(result.url);

        const secondRow = () => {
            let row = [title];
            if (result.hierarchy.lvl1) row.push(result.hierarchy.lvl1);
            if (result.hierarchy.lvl2) row.push(result.hierarchy.lvl2);
            if (result.hierarchy.lvl3) row.push(result.hierarchy.lvl3);
            if (result.hierarchy.lvl4) row.push(result.hierarchy.lvl4);
            if (result.hierarchy.lvl5) row.push(result.hierarchy.lvl5);
            if (result.hierarchy.lvl6) row.push(result.hierarchy.lvl6);
            return row.join(' > ');
        }

        let marked;
        if (result.url_without_anchor)
            marked = algolia.findMarkedStrings(result._snippetResult, '', algolia.highlightTextPrefixTag, algolia.highlightTextPostfixTag);
        else
            marked = algolia.findMarkedStrings(result._highlightResult, '', algolia.highlightTextPrefixTag, algolia.highlightTextPostfixTag);

        const firstRow = () => {
            return marked.length > 0 ? marked[0].value : null;
        }
        
        return firstRow 
        ? (
            `
                <a href="${result.url}">
                    <div class="DocSearch-Hit-Container">
                        
                        <div class="DocSearch-Hit-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <path 
                                    d="M17 5H3h14zm0 5H3h14zm0 5H3h14z" 
                                    stroke="currentColor" 
                                    fill="none" 
                                    fill-rule="evenodd" 
                                    stroke-linejoin="round">
                                </path>
                            </svg>
                        </div>
                        
                        <div class="DocSearch-Hit-content-wrapper">
                            <span class="DocSearch-Hit-title">
                                ${firstRow()}
                            </span>
                            <span class="DocSearch-Hit-path">
                                ${secondRow()}
                            </span>
                        </div>

                        <div class="DocSearch-Hit-action">
                            <svg 
                                class="DocSearch-Hit-Select-Icon" 
                                width="20" height="20" 
                                viewBox="0 0 20 20">
                                <g 
                                    stroke="currentColor" 
                                    fill="none" 
                                    fill-rule="evenodd" 
                                    stroke-linecap="round" 
                                    stroke-linejoin="round">
                                    <path d="M18 3v4c0 2-2 4-4 4H2"></path>
                                    <path d="M8 17l-6-6 6-6"></path>
                                </g>
                            </svg>
                        </div>

                    </div>
                </a>
            `
        )
        : null;
    },

    // setting DocSearch with pagination
    setDocSearchBox: () => {
        // Hide JTD search box
        $('.search').addClass('d-none');
        
        // Set Algolia DocSearch box
        docsearch({
            appId: algolia.appId,
            apiKey: algolia.apiKey,
            indexName: algolia.indexName,
            container: algolia.container,
            debug: algolia.debug,
            maxResultsPerGroup: algolia.maxResultsPerGroup,
            insights: algolia.insights,
            raiseIssueLink: algolia.algoliaRaiseIssueLink,

            // we use this DocSearch built-in callback to overwrite the default behaviour of the instant search
            // in order to display the search hits in the same format as defined in algolia/getResultItem function
            // otherwise the format will be different and the feature of search hit details box will not work if already open
            // cannot use the normal behaviour of hitComponent since cannot return a proper JSX.Element in a regular (nonReact) app
            hitComponent: ({ hit, children }) => {
                algolia.setEvents();
                resultItemContent = algolia.getResultItem(hit);
            
                // Create a new list item with the hit data
                const resultItem = $('<li>')
                    .addClass('DocSearch-Hit')
                    .attr('id', `docsearch-item`)
                    .attr('aria-selected', "false")
                    .attr('role', 'option')
                    .html(resultItemContent)
                    .data('result', hit);
            
                const targetItem = $('#docsearch-list li').filter(function() {
                    return _.isEqual($(this).data('result'), resultItem.data('result'));
                });
            
                if (targetItem.length) {
                    const originalHeight = targetItem.outerHeight();                
                    resultItem.css('height', originalHeight);
                    targetItem.css('height', originalHeight);
                    targetItem.replaceWith(resultItem);
                    resultItem.css('height', '');
                }

                $('#docsearch-list li').filter(function() {
                    return $.trim($(this).html()) === '';
                }).remove();
                
                // HEADS UP!!!
                // HERE WE SHOULD RETURN A VALID JSX.Element OBJECT WHICH WE CANNOT PROPERLY CREATE HERE
                // SO WE NOT RETURNING ANYTHING HERE
                // THE SEARCH HITS WERE ADDED BFORE THROUGH DOM MANIPULATION
            },

            
            // Create pagination and handle results
            // we use this docSearch built-in callback to create other elements: pagination btns, show more/less btns
            resultsFooterComponent({ state }) {
                if (state.query && state.query.length > 1 ) {
                    const maxHitsPerPage = algolia.hitsPerPage;
                    const totalPages = Math.ceil(state.context.nbHits / maxHitsPerPage);
                    let footerMessage = '';
                    
                    if (totalPages > 1 ) {
                        footerMessage = `${state.context.nbHits} hits found across ${totalPages} pages of results. You may refine your query to get more specific results.`;
                    } else {
                        footerMessage = `${state.context.nbHits} hit(s) found. All results are displayed.`;
                    }

                    createShowMoreShowLess(state);
                    createPagination(totalPages, state.query);
                    
                    return {
                        type: 'div',
                        ref: undefined,
                        constructor: undefined,
                        key: state.query,
                        props: {
                            class: 'w-100 text-dark fw-medium',
                            children: footerMessage
                        },
                        __v: null,
                    };
                } else {
                    removePagination();
                    removeShowMoreShowLess();
                    $('div[siteFunction="docSearchListItemDetails"]').addClass('d-none');
                }


            },
    
            // Handle missing results
            // we use this docSearch build-in callback to remove some extra features
            // in case of no results
            getMissingResultsUrl({ query }) {
                removeShowMoreShowLess();
                removePagination();
                $('div[siteFunction="docSearchListItemDetails"]').addClass('d-none');
                return `${algolia.raiseIssueLink}${query}`;
            },

            searchParameters: {
                // HEADS UP!!! NEEDS TO BE INCLUDED IN index.search(....) TOO, SEE BELOW, FUNCTION refreshResults
                hitsPerPage: algolia.hitsPerPage, 
            },

        });
    
        // Remove JTD search box after 5 seconds (this time interval is not important, can have any value)
        setTimeout(() => $('.search').remove(), 5000);

        // create Show More and Show Less btns
        const createShowMoreShowLess = (state=null) => {
            
            $('div[siteFunction="showMoreShowLessButtons"]').remove();
            
            const showMoreShowLessContainer = $('<div siteFunction="showMoreShowLessButtons">').addClass('showMoreShowLessButtons d-flex justify-content-center align-items-center');

            const buttonShowMore = $('<button>')
                .attr('siteFunction',`docSearchPaginationShowMore`)
                .addClass('btn btn-sm btn-success text-light mx-1 rounded-circle')
                .css('height', 'fit-content')
                .html('<i class="bi bi-chevron-bar-expand"></i>')
                .click(function() {
                    $(`button[siteFunction="docSearchPaginationPage_${algolia.currentPage}"]`).click();
                    algolia.showSearchHitDetailsContainer();
                });

            const buttonShowLess = $('<button>')
                .attr('siteFunction',`docSearchPaginationShowMore`)
                .addClass('btn btn-sm btn-danger text-light mx-1 rounded-circle')
                .css('height', 'fit-content')
                .html('<i class="bi bi-chevron-bar-contract"></i>')
                .click(function() {
                   algolia.hideSearchHitDetailsContainer();
                });

            showMoreShowLessContainer
                .append(buttonShowMore)
                .append(buttonShowLess);
            $('.DocSearch-SearchBar').addClass('d-flex').append(showMoreShowLessContainer);
                
        };

        // remove Show More and Show Less btns
        const removeShowMoreShowLess = () => {
            $('div[siteFunction="showMoreShowLessButtons"]').remove();
        };

        // Create pagination buttons
        // HERE WE SEAT ALSO THE FUNCTIONS OF THE PAGINATION BUTTONS
        const createPagination = (totalPages, query) => {
            removePagination(); // Clear existing pagination
            const paginationContainer = $('<div>').addClass('pagination-buttons d-flex justify-content-start mt-2 p-2');
            
            for (let i = 0; i < totalPages; i++) {
                const button = $('<button>')
                    .attr('siteFunction',`docSearchPaginationPage_${i}`)
                    .addClass('docSearchPaginationPage btn btn-sm btn-outline-secondary border border-secondary border-opacity-25 mx-1 text-dark')
                    .css('width', '2rem')
                    .text(i + 1)
                    .data('page', i)
                    .click(function() {
                        // when using custom pagination, default DocSearch key and mouse events must be re-created
                        algolia.setEvents();                             
                        const page = $(this).data('page');
                        refreshResults(query, page); // Use current query and selected page
                        algolia.currentPage = page;
                        $('.docSearchPaginationPage').addClass('bg-transparent').removeClass('bg-warning');
                        $(`button[siteFunction="docSearchPaginationPage_${i}"]`).removeClass('bg-transparent').addClass('bg-warning');

                    });

                paginationContainer.append(button);
            }

            //$('#docsearch-list').after(paginationContainer); // Insert pagination after results  
            $('.DocSearch-SearchBar').after(paginationContainer);
        };
    
        // Remove pagination buttons
        const removePagination = () => {
            $('.pagination-buttons').remove();
        };
        
        // HERE WE ACTUALLY DO THE SEARCH
        // Function to refresh the DocSearch results on pagination click
        const refreshResults = (query, page) => {
            
            const client = algoliasearch(algolia.appId, algolia.apiKey);
            const index = client.initIndex(algolia.indexName);
    
            index.search(query, { page: page,  hitsPerPage: algolia.hitsPerPage }) // Search by page
                .then(function(searchResults) {    
                    // Clear existing results and append new ones
                    $('#docsearch-list').empty();
                    
                    let resIndex = 0;

                    // HEADS UP!!!
                    // the li attribute used for active list item is aria-selected 
                    // (stands for Accessible Rich Internet Applications), not area-selected
                    searchResults.hits.forEach(result => {
                        resultItemContent = algolia.getResultItem(result, resIndex);

                        if (resultItemContent) {
                            const resultItem = $('<li>')
                                .addClass('DocSearch-Hit')
                                .attr('id', `docsearch-item-${resIndex}`)
                                .attr('aria-selected', "false")
                                .attr('role', 'option')
                                .html(resultItemContent)
                                .data('result', result);
                            $('#docsearch-list').append(resultItem);
                        }
                        resIndex += 1;
                    });

                    $newActiveItem = $('.DocSearch-Hit').first();
                    $newActiveItem.attr('aria-selected', 'true');
                    const $container = $('.DocSearch-Dropdown');
                    algolia.scrollToView($newActiveItem, $container);
                    algolia.updateHitMoreInfo($newActiveItem);

                    // now is the moment to set the height of the search hit details box
                    const h = $('.DocSearch-Modal').height();
                    $('div[siteFunction="docSearchListItemDetails"]').css('height', h + 'px');      
                })
                .catch(function(error) {
                    console.error('Error while fetching paginated results:', error);
                    showToast('Error while fetching paginated results! Please try again.', 'bg-danger', 'text-light');
                });
        };
    },

    setEvents: () => {
        algolia.setMouseHitEvents();
        algolia.setKeyboardHitEvents();
    },

    setKeyboardHitEvents: () => {
        $(document).off('keydown').on('keydown', algolia.keyboardEventsHandler);
    },

    unsetKeyboardHitEvents: () => {
        $(document).off('keydown');
    },

    updateHitMoreInfo: ($newActiveItem) => {

        const getSearchHit = (hit) => {
            let searchHit;
            searchHit = algolia.findMarkedStrings(
                hit._snippetResult, 
                '', 
                algolia.highlightTextPrefixTag, 
                algolia.highlightTextPostfixTag
            );
            
            if (searchHit.length === 0)
                searchHit = algolia.findMarkedStrings(
                    hit._highlightResult, 
                    '', 
                    algolia.highlightTextPrefixTag, 
                    algolia.highlightTextPostfixTag
                );
            //console.log(searchHit)

            $searchHit = 
                `
                    <div>
                        ${searchHit[0].value}
                    </div>
                `
            return $($searchHit);
        }

        const hit = $newActiveItem.data('result');
        if (hit) {
            //console.log(hit)
            $('div[siteFunction="docSearchListItemDetails"]').empty();
            $('div[siteFunction="docSearchListItemDetails"]').append(getSearchHit(hit));
        }
        else $('div[siteFunction="docSearchListItemDetails"]').empty();
    },

    handleKey: (event) => {
        let $activeItem = $('.DocSearch-Hit[aria-selected="true"]');
        let $newActiveItem;
        const $container = $('.DocSearch-Dropdown');
    
        // Deselect all items before processing the key event
        $('.DocSearch-Hit').attr('aria-selected', 'false');
    
        if (event.key === 'ArrowDown') {
            // Move to the next item
            if ($activeItem.length) {
                $newActiveItem = $activeItem.next('.DocSearch-Hit');
                if ($newActiveItem.length) {
                    // Normal case: Move to the next item
                    $activeItem.attr('aria-selected', 'false');
                    $newActiveItem.attr('aria-selected', 'true');
                    algolia.scrollToView($newActiveItem, $container);

                    algolia.updateHitMoreInfo($newActiveItem);
    
                } else if ($activeItem.is(':last-child')) {
                    // If the current item is the last one, wrap around to the first item
                    $newActiveItem = $('.DocSearch-Hit').first();
                    $activeItem.attr('aria-selected', 'false');
                    $newActiveItem.attr('aria-selected', 'true');
                    algolia.scrollToView($newActiveItem, $container);

                    algolia.updateHitMoreInfo($newActiveItem);
    
                }
            } else {
                // No active item, activate the first one
                $newActiveItem = $('.DocSearch-Hit').first();
                $newActiveItem.attr('aria-selected', 'true');
                algolia.scrollToView($newActiveItem, $container);

                algolia.updateHitMoreInfo($newActiveItem);

            }
        } else if (event.key === 'ArrowUp') {
            // Move to the previous item
            if ($activeItem.length) {
                $newActiveItem = $activeItem.prev('.DocSearch-Hit');
                if ($newActiveItem.length) {
                    // Normal case: Move to the previous item
                    $activeItem.attr('aria-selected', 'false');
                    $newActiveItem.attr('aria-selected', 'true');
                    algolia.scrollToView($newActiveItem, $container);

                    algolia.updateHitMoreInfo($newActiveItem);
    
                } else if ($activeItem.is(':first-child')) {
                    // If the current item is the first one, wrap around to the last item
                    $newActiveItem = $('.DocSearch-Hit').last();
                    $activeItem.attr('aria-selected', 'false');
                    $newActiveItem.attr('aria-selected', 'true');
                    algolia.scrollToView($newActiveItem, $container);

                    algolia.updateHitMoreInfo($newActiveItem);
    
                }
            } else {
                // No active item, activate the last one in the list
                $newActiveItem = $('.DocSearch-Hit').last();
                $newActiveItem.attr('aria-selected', 'true');
                algolia.scrollToView($newActiveItem, $container);

                algolia.updateHitMoreInfo($newActiveItem);

            }
        } else if (event.key === 'Enter') {
            // Handle selection of the currently active item
            if ($activeItem.length) {
                console.log('Selected item:', $activeItem.find('a').attr('href'));
                url = sanitizeUrl($activeItem.find('a').attr('href'));
                if (isValidUrl(url)) {
                    window.location.href = url;
                } else {
                    console.error('Invalid URL:', url);
                    showToast(`Something is wrong with the hit target (${url})! Cannot go there ... `, 'bg-danger', 'text-light');
                    console.error('Search error:', error);
                }
            }
        } 
    
        // Move the mouse outside the container
        const isMouseInside = $container.is(':hover');
        if (isMouseInside) {
            // Create a temporary element to move the mouse cursor out
            const $temp = $('<div>').css({
                position: 'absolute',
                top: '-100px',
                left: '-100px',
                width: '1px',
                height: '1px'
            }).appendTo('body');
    
            // Focus the new item to give a visual indication
            if ($newActiveItem) {
                $newActiveItem[0].focus();
            }
    
            // Remove the temporary element
            setTimeout(() => {
                $temp.remove();
            }, 0);
        }

        // just to be on the safe, side we remove the empty search hits items
        // when navigating in the initial search hits list generated by instant search,
        // sometimes an empty element is created because of the way we use hitComponent callback
        // which manipulates the DOM and do not return a JSX.Element (same as returning an empty one)
        $('#docsearch-list li').filter(function() {
            return $.trim($(this).html()) === '';
        }).remove();

        /*
        $activeItem = $('.DocSearch-Hit[aria-selected="true"]');
        if ($activeItem.length === 0 ) {
            $newActiveItem = $('.DocSearch-Hit').first();
            $newActiveItem.attr('aria-selected', 'true');
            algolia.scrollToView($newActiveItem, $container);
            algolia.updateHitMoreInfo($newActiveItem);
        }
        */
    },

    scrollToView: ($item, $container) => {
        const containerTop = $container.offset().top;
        const containerScrollTop = $container.scrollTop();
        const containerHeight = $container.height();
        const itemTop = $item.offset().top;
        const itemHeight = $item.outerHeight();
        const margin = $('.DocSearch-Hit-source').outerHeight() + 20 ; // Minimum margin from the top
    
        // Check if the item is above the visible container view
        if (itemTop - containerTop < margin) {
            $container.scrollTop(containerScrollTop + (itemTop - containerTop) - margin);
        }
        // Check if the item is below the visible container view
        else if (itemTop + itemHeight - containerTop > containerHeight) {
            $container.scrollTop(containerScrollTop + (itemTop + itemHeight - containerTop) - containerHeight);
        }
    },
    
    keyboardEventsHandler: (event) => {
        algolia.unsetMouseHitEvents();
        algolia.handleKey(event);
        setTimeout(()=>algolia.setMouseHitEvents(), 200); // a bit of delay to prevent mouse event to trigger
    },

    setMouseHitEvents: () => {
        $(document).off('mouseenter').on('mouseenter', '.DocSearch-Hit', algolia.mouseEventsHandlers.mouseEnter);
        $(document).off('mouseleave').on('mouseleave', '.DocSearch-Hit', algolia.mouseEventsHandlers.mouseLeave);
    },

    unsetMouseHitEvents: () => {
        $(document).off('mouseenter');
        $(document).off('mouseleave');
    },

    mouseEventsHandlers: {
        mouseEnter: (event) => {
            $('.DocSearch-Hit').attr('aria-selected', 'false');
            $closestElement = $(event.target).closest('.DocSearch-Hit');
            $closestElement.attr('aria-selected', 'true');
            algolia.updateHitMoreInfo($closestElement);
        },

        mouseLeave: (event) => {
            $closestElement = $(event.target).closest('.DocSearch-Hit');
            $closestElement.attr('aria-selected', 'false');
        }
    }

}