algolia = {
    appId: algoliaSettings.algoliaAppID,
    apiKey: algoliaSettings.algoliaPublicApiKey,
    indexName: algoliaSettings.algoliaIndex,
    container: algoliaSettings.algoliaSearchBoxContainer,
    debug: algoliaSettings.algoliaDebug,
    maxResultsPerGroup: algoliaSettings.algoliaMaxResultsPerGroup,
    insights: algoliaSettings.algoliaSendInsights,
    raiseIssueLink: algoliaSettings.algoliaRaiseIssueLink,

    searchInSite: (query, searchResultsCallback) => {
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

    setDocSearchBox: () => {
        // hide JTD search box for the moment
        $('.search').addClass('d-none');
        
        // set algolia DocSearch box
        docsearch({
            appId: algolia.appId,
            apiKey: algolia.apiKey,
            indexName: algolia.indexName,
            container: algolia.container,
            debug: algolia.debug,
            maxResultsPerGroup: algolia.maxResultsPerGroup,
            insights: algolia.insights,
            raiseIssueLink: algolia.algoliaRaiseIssueLink,

            resultsFooterComponent({ state }) {
                const maxHitsPerPage = algolia.maxResultsPerGroup;
                const totalPages = Math.ceil(state.context.nbHits / maxHitsPerPage);
                let children = [];
                if (state.context.nbHits > maxHitsPerPage)
                    children = [
                        `${state.context.nbHits} hits found in ${totalPages} results pages!
                        Refine your query to get all your query hits (we show maximum ${algolia.maxResultsPerGroup} per results page).
                        `
                        ];
                else
                    children = [
                        `${state.context.nbHits} hit(s) found!
                        All of them are shown.
                        `
                    ];
                
                return {
                    type: 'div',
                    ref: undefined,
                    constructor: undefined,
                    key: state.query,
                    props: {
                        class: 'w-100 d-flex justify-content-center text-dark bg-warning-subtle rounded p-3 fw-medium',
                        children: children
                    },
                    __v: null,
                    };
            },

            getMissingResultsUrl({ query }) {
                return `${algolia.raiseIssueLink}${query}`;
            },
        });
        
        // finally remove the JTD search box
        setTimeout(()=>$('.search').remove(), 5000);
    }
   
}