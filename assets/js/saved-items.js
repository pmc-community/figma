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

const savePageToSavedItems = (pageInfo) => {
    const pageToSave = {
        permalink: sanitizeURL(pageInfo.siteInfo.permalink),
        title: DOMPurify.sanitize(pageInfo.siteInfo.title),
        customTags: [],
        customCategories: [],
        customNotes:[]
    }
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

    if (!findObjectInArray(pageToSave, savedItems)) {
        savedItems.push(pageToSave);
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
    }
}

const removePageFromSavedItems = (pageInfo) => {
    const pageToRemove = {
        permalink: sanitizeURL(pageInfo.siteInfo.permalink),
        title:DOMPurify.sanitize(pageInfo.siteInfo.title)
    }
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

    foundIndex = objectIndexInArray(pageToRemove, savedItems);
    if ( foundIndex !== -1) {
        const newData = _.without(savedItems, savedItems[foundIndex]);
        localStorage.setItem('savedItems', JSON.stringify(newData));
    }
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

const removeAllCustomNotes = (pageInfo) => {
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (savedItems.length === 0 ) return;
    const page = {
        permalink: pageInfo.siteInfo.permalink,
        title: pageInfo.siteInfo.title
    };

    const pageIndex = objectIndexInArray(page, savedItems);
    if ( pageIndex === -1 ) return;

    savedPage = getPageSavedInfo(pageInfo.siteInfo.permalink, pageInfo.siteInfo.title);
    savedPage.customNotes = [];
    savedItems[pageIndex] = savedPage;
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
}

const addNote = (note, pageInfo) => {
    const page = {
        permalink: pageInfo.siteInfo.permalink,
        title: pageInfo.siteInfo.title
    };
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (savedItems.length === 0 ) {
        showToast(`Can\'t add note! Page ${page.title} is not in saved items...`, 'bg-danger', 'text-light');
        return false;
    }

    const pageIndex = objectIndexInArray(page, savedItems);
    if ( pageIndex === -1 ) {
        showToast(`Can\'t add note! Page ${page.title} not found in saved items...`, 'bg-danger', 'text-light');
        return false;
    }

    if (note.trim() === '') {
        //showToast('Nothing to add, write something ...', 'bg-warning', 'text-dark');
        return false;
    }
    
    const savedPage = savedItems[pageIndex];
    const savedPageCustomNotes = savedPage.customNotes || [];
    const rawSavedPageCustomNotes = _.map(savedPageCustomNotes, obj => ({
        ...obj,
        note: _.trim(obj.note).toLowerCase()
    }));
    
    const noteIndex = objectIndexInArray({note: note.trim().toLowerCase()}, rawSavedPageCustomNotes);
    if (noteIndex !== -1) {
        showToast('Note already saved, no need to save it again!', 'bg-warning', 'text-dark');
        return false;
    }

    const noteObj = {
        date: getCurrentDateTime(),
        note: DOMPurify.sanitize(note.trim()).replace(/<[^>]*>/g, ''),
        id: uuid()
    }
    savedPageCustomNotes.push(noteObj);
    savedPage.customNotes = savedPageCustomNotes;
    savedItems[pageIndex] = savedPage;
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    return true;

}

const deleteNote = (noteId, pageInfo) => {
    const page = {
        permalink: pageInfo.siteInfo.permalink,
        title: pageInfo.siteInfo.title
    };

    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (savedItems.length === 0 ) {
        showToast('Can\'t delete note! Page is not in saved items...', 'bg-danger', 'text-light');
        return false;
    }

    const pageIndex = objectIndexInArray(page, savedItems);
    if ( pageIndex === -1 ) {
        showToast('Can\'t delete note! Page not found in saved items...', 'bg-danger', 'text-light');
        return false;
    }

    const savedPage = savedItems[pageIndex];
    const savedPageCustomNotes = savedPage.customNotes || [];

    const noteIndex = objectIndexInArray({id: noteId}, savedPageCustomNotes);
    if (noteIndex !== -1)  _.pullAt(savedPageCustomNotes, noteIndex);

    savedPage.customNotes = savedPageCustomNotes;
    savedItems[pageIndex] = savedPage;
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    return true;
}

const updateNote = (noteId, note, pageInfo) => {
    const page = {
        permalink: pageInfo.siteInfo.permalink,
        title: pageInfo.siteInfo.title
    };

    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (savedItems.length === 0 ) {
        showToast('Can\'t update note! Page is not in saved items...', 'bg-danger', 'text-light');
        return false;
    }

    const pageIndex = objectIndexInArray(page, savedItems);
    if ( pageIndex === -1 ) {
        showToast('Can\'t update note! Page not found in saved items...', 'bg-danger', 'text-light');
        return false;
    }

    const savedPage = savedItems[pageIndex];
    const savedPageCustomNotes = savedPage.customNotes || [];
    
    const noteIndex = objectIndexInArray({id: noteId}, savedPageCustomNotes);
    if (noteIndex === -1) {
        showToast('Can\'t update! Note not found', 'bg-danger', 'text-light');
        return false;
    }

    savedPageCustomNotes[noteIndex].note = note;
    savedPage.customNotes = savedPageCustomNotes;
    savedItems[pageIndex] = savedPage;
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    return true;
}

const getPageNotes = (pageInfo) => {
    const page = {
        permalink: pageInfo.siteInfo.permalink,
        title: pageInfo.siteInfo.title
    };

    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    if (savedItems.length === 0 ) return [];

    const pageIndex = objectIndexInArray(page, savedItems);
    if ( pageIndex === -1 ) return [];

    const savedPage = savedItems[pageIndex];
    return savedPage.customNotes || [];
}

const getPageStatusInSavedItems = (pageInfo) => {
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    return findObjectInArray({permalink: pageInfo.siteInfo.permalink, title:pageInfo.siteInfo.title}, savedItems);
}
