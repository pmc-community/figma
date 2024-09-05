algolia = {
    appId: algoliaSettings.algoliaAppID,
    apiKey: algoliaSettings.algoliaPublicApiKey,
    indexName: algoliaSettings.algoliaIndex,
    container: algoliaSettings.algoliaSearchBoxContainer,
    debug: algoliaSettings.algoliaDebug,
    maxResultsPerGroup: algoliaSettings.algoliaMaxResultsPerGroup,
    insights: algoliaSettings.algoliaSendInsights,
    raiseIssueLink: algoliaSettings.algoliaRaiseIssueLink,

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

    getResultItem: (result, index) => {
        let permalink = getPageTitleFromUrl(result.url_without_anchor);
        permalink = `<span class="text-dark">${permalink}</span>`;
        
        return (
            `
                    <a 
                        href="${result.url}">
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
                                            ${result._snippetResult.content ?
                                                result._snippetResult.content.value ?
                                                    result._snippetResult.content.value :
                                                    result._highlightResult.hierarchy.lvl1.value :
                                                    result._highlightResult.hierarchy.lvl1.value  
                                            }
                                        </span>
                                        <span class="DocSearch-Hit-path">
                                            ${result._snippetResult.content ?
                                                permalink + ' | ' + result._highlightResult.hierarchy.lvl1.value:
                                                permalink 
                                            }
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
                            </div>
                        </div>
                    </a>
            `
        );
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
    
            // Create pagination and handle results
            resultsFooterComponent({ state }) {
                const maxHitsPerPage = algolia.maxResultsPerGroup;
                const totalPages = Math.ceil(state.context.nbHits / maxHitsPerPage);
                let footerMessage = '';
                
                
                if (state.context.nbHits > maxHitsPerPage) {
                    footerMessage = `Hits found across multiple pages. You may refine your query to get more specific results.`;
                    createPagination(totalPages, state.query);
                } else {
                    footerMessage = `${state.context.nbHits} hit(s) found. All results are displayed.`;
                    removePagination();
                }
                
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
            },
    
            // Handle missing results
            getMissingResultsUrl({ query }) {
                return `${algolia.raiseIssueLink}${query}`;
            },
        });
    
        // Remove JTD search box after 5 seconds (this time interval is not important, can have any value)
        setTimeout(() => $('.search').remove(), 5000);
    
        // Create pagination buttons
        // HERE WE SEAT ALSO THE FUNCTIONS OF THE PAGINATION BUTTONS
        const createPagination = (totalPages, query) => {
            removePagination(); // Clear existing pagination
    
            if (totalPages > 1) {
                const paginationContainer = $('<div>').addClass('pagination-buttons d-flex justify-content-center mt-4');
    
                for (let i = 0; i < totalPages; i++) {
                    const button = $('<button>')
                        .addClass('btn btn-sm btn-primary mx-1')
                        .css('width', '2rem')
                        .text(i + 1)
                        .data('page', i)
                        .click(function() {
                            // when using custom pagination, default DocSearch key and mouse events must be re-created
                            algolia.setEvents(); 
                            const page = $(this).data('page');
                            refreshResults(query, page); // Use current query and selected page
                        });
    
                    paginationContainer.append(button);
                }
    
                $('#docsearch-list').after(paginationContainer); // Insert pagination after results
            }
        };
    
        // Remove pagination buttons
        const removePagination = () => {
            $('.pagination-buttons').remove();
        };
        
        // HERE WE ACTUALLY DI THE SEARCH
        // Function to refresh the DocSearch results on pagination click
        const refreshResults = (query, page) => {
            
            const client = algoliasearch(algolia.appId, algolia.apiKey);
            const index = client.initIndex(algolia.indexName);
    
            index.search(query, { page }) // Search by page
                .then(function(searchResults) {    
                    // Clear existing results and append new ones
                    $('#docsearch-list').empty();
                    
                    let resIndex = 0;

                    // HEADS UP!!!
                    // the li attribute used for active list item is aria-selected 
                    // (stands for Accessible Rich Internet Applications), not area-selected
                    searchResults.hits.forEach(result => {
                        console.log(result)
                        const resultItem = $('<li>')
                            .addClass('DocSearch-Hit')
                            .attr('id', `docsearch-item-${resIndex}`)
                            .attr('aria-selected', "false")
                            .attr('role', 'option')
                            .html(algolia.getResultItem(result, resIndex));
                        $('#docsearch-list').append(resultItem);
                        resIndex += 1;
                    });

                    $newActiveItem = $('.DocSearch-Hit').first();
                    $newActiveItem.attr('aria-selected', 'true');
                    const $container = $('.DocSearch-Dropdown');
                    algolia.scrollToView($newActiveItem, $container);
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

    handleKey: (event) => {
    
        const $activeItem = $('.DocSearch-Hit[aria-selected="true"]');
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
                } else if ($activeItem.is(':last-child')) {
                    // If the current item is the last one, wrap around to the first item
                    $newActiveItem = $('.DocSearch-Hit').first();
                    $activeItem.attr('aria-selected', 'false');
                    $newActiveItem.attr('aria-selected', 'true');
                    algolia.scrollToView($newActiveItem, $container);
                }
            } else {
                // No active item, activate the first one
                $newActiveItem = $('.DocSearch-Hit').first();
                $newActiveItem.attr('aria-selected', 'true');
                algolia.scrollToView($newActiveItem, $container);
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
                } else if ($activeItem.is(':first-child')) {
                    // If the current item is the first one, wrap around to the last item
                    $newActiveItem = $('.DocSearch-Hit').last();
                    $activeItem.attr('aria-selected', 'false');
                    $newActiveItem.attr('aria-selected', 'true');
                    algolia.scrollToView($newActiveItem, $container);
                }
            } else {
                // No active item, activate the last one in the list
                $newActiveItem = $('.DocSearch-Hit').last();
                $newActiveItem.attr('aria-selected', 'true');
                algolia.scrollToView($newActiveItem, $container);
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
    },

    // Helper function to scroll the item into view
    scrollToView: ($item, $container) => {
        const containerTop = $container.scrollTop();
        const containerHeight = $container.height();
        const itemTop = $item.position().top + containerTop;
        const itemHeight = $item.outerHeight();

        // Define margins for top and bottom
        const marginTop = 5;
        const marginBottom = 5;

        // Calculate the amount to scroll the container to keep the item fully in view
        if (itemTop < containerTop + marginTop) {
            // Scroll up so the item is fully visible with margin from the top
            $container.scrollTop(itemTop - marginTop - $('.DocSearch-Hit-source').outerHeight());
        } else if (itemTop + itemHeight > containerTop + containerHeight - marginBottom) {
            // Scroll down so the item is fully visible with margin from the bottom
            $container.scrollTop(itemTop - containerHeight + itemHeight + marginBottom);
        }
    },
    
    keyboardEventsHandler: (event) => {
        algolia.handleKey(event);
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
        },

        mouseLeave: (event) => {
            $closestElement = $(event.target).closest('.DocSearch-Hit');
            $closestElement.attr('aria-selected', 'false');
        }
    }

}

