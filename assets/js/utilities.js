
const getExternalMDContent = async (file, position, startMarker , endMarker, header) => {
    $(window).on('load', () => {
        $.ajax({
            url: file,
            method: "GET",
            dataType: "text",
            success: async (data) => {
                const converter = new showdown.Converter();
                const content = await data;
                goodHeader = typeof header === 'undefined' ? '' : header;
                let contentSliced = goodHeader + '\n';
                if (typeof startMarker === 'undefined' ||  typeof endMarker === 'undefined' ) {
                    contentSliced += content;
                }
                else {
                    if (startMarker === '' || endMarker === '') {
                        contentSliced += content;
                    }
                    else {
                        const startIndex = content.indexOf(startMarker) + startMarker.length;
                        const contentA = content.slice(startIndex);
                        const endIndex = contentA.indexOf(endMarker);
                        const contentB = contentA.slice(0,endIndex);
                        contentSliced += contentB;
                    }
                }
                if (position === 'before') $('.main-content-wrap').prepend(converter.makeHtml(contentSliced));
                else $('.main-content-wrap').append(converter.makeHtml(contentSliced));
                initPageToc();
            },
            error: async (xhr, status, error) => {
                console.error("Error fetching file:", error);
            }
        });
    })   
}

// NOT USED
const  updateAlgoliaIndex = (newData) => {
    // Initialize Algolia client
    const client = algoliasearch('xxxx', 'xxxxx');
    
    // Initialize index
    const index = client.initIndex('xxxx');

    // Add or update records in the index
    index.saveObjects([{"1":1},{"2":2}],{ autoGenerateObjectIDIfNotExist: true }).then(({ objectIDs }) => {
        console.log('ix1', objectIDs);
        // Optionally, refresh Instant Search UI
        InstantSearch.refresh();
    }).catch(error => {
        console.error('Error updating index:', error);
    });
}