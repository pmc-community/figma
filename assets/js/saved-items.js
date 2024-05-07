const setRemoveFromSavedItemsStatus = () => {
    $('button[siteFunction="tagPageItemRemoveFromSavedItems"]').each( function() {
        const pageToSave = {
            permalink: $(this).attr('pageRefPermalink'),
            title: $(this).attr('pageRefTitle')
        }
        const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];        
        if (!findObjectInArray(pageToSave, savedItems)) $(this).addClass('disabled');
        else $(this).removeClass('disabled')
    });
}

const setRemoveFromSavedItems = () => {
    $('button[siteFunction="tagPageItemRemoveFromSavedItems"]').click(function() {
        const pageToSave = {
            permalink: $(this).attr('pageRefPermalink'),
            title: $(this).attr('pageRefTitle')
        }
        const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

        foundIndex = objectIndexInArray(pageToSave, savedItems);
        if ( foundIndex !== -1) {
            const newData = _.without(savedItems, savedItems[foundIndex]);
            localStorage.setItem('savedItems', JSON.stringify(newData));
            setSaveForLaterReadStatus();
            setRemoveFromSavedItemsStatus();
        }
    });
}

const setSaveForLaterReadStatus = () => {
    $('button[siteFunction="tagPageItemSaveForLaterRead"]').each( function() {
        const pageToSave = {
            permalink: $(this).attr('pageRefPermalink'),
            title: $(this).attr('pageRefTitle')
        }
        const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

        if (findObjectInArray(pageToSave, savedItems)) $(this).addClass('disabled');
        else $(this).removeClass('disabled')
    });
}

const setSaveForLaterRead = () => {
    
    $('button[siteFunction="tagPageItemSaveForLaterRead"]').click(function() {
        const pageToSave = {
            permalink: sanitizeURL($(this).attr('pageRefPermalink')),
            title: DOMPurify.sanitize($(this).attr('pageRefTitle')),
            customTags: [],
            customCategories: [],
            customNotes:[]
        }
        const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

        if (!findObjectInArray(pageToSave, savedItems)) {
            savedItems.push(pageToSave);
            localStorage.setItem('savedItems', JSON.stringify(savedItems));
            setSaveForLaterReadStatus();
            setRemoveFromSavedItemsStatus();
        }
    });
}

const getPageSavedInfo = (permalink, title) => {
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    const page = {
        permalink: permalink,
        title: title
    }
    return getObjectFromArray(page, savedItems);
}

const getCustomTags = () => {
    let customTags = [];
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (savedItems.length === 0 ) return customTags;
    else {
        savedItems.forEach( (page) => {
            let pageCustomTags = page.customTags || [];
            pageCustomTags = ['ct1', 'ct2'];
            //customTags = [...customTags, ...pageCustomTags];
            customTags = Array.from(new Set([...customTags, ...pageCustomTags].slice().sort()));
        });
    return customTags;
    }
}

const getCustomCats = () => {
    let customCats = [];
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (savedItems.length === 0 ) return customCats;
    else {
        savedItems.forEach( (page) => {
            let pageCustomCats = page.customCategories || [];
            customCats = Array.from(new Set([...customCats, ...pageCustomCats].slice().sort()));
        });
    return customCats;
    }
}