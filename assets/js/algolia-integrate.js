algolia = {
    appId: algoliaSettings.algoliaAppID,
    apiKey: algoliaSettings.algoliaPublicApiKey,
    indexName: algoliaSettings.algoliaIndex,

    searchInSite: (query, searchResultsCallback) => {
        const client = algoliasearch(algolia.appId, algolia.apiKey);
        const index = client.initIndex(algolia.indexName);
        index.search(query)
            .then(function(searchResults) {
                searchResultsCallback(searchResults.hits);
            })
            .catch(function(error) {
                showToast('Something went wrong with this search!<br><br>You may try again later. If the problem persist, contact support.', 'bg-danger', 'text-light');
                console.error('Search error:', error);
            });
    }
}
