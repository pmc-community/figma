const showPageFullInfoCanvas = (pageInfo) => {
    if (pageInfo) {
        initPageFullInfoCanvasBeforeShow(pageInfo);
        $('#offcanvasPageFullInformation').offcanvas('show');
        initPageFullInfoCanvasAfterShow(pageInfo);
        initPageFullInfoCanvasAfterDocReady(pageInfo);
    }
}

const initPageFullInfoCanvasAfterDocReady = (pageInfo) => {
    fillTagList(pageInfo);    
}

const initPageFullInfoCanvasAfterShow = (pageInfo) => {
    // for tags
    setTagEditor('#offcanvasPageFullInfoPageTagsEditor', pageInfo);
}

const initPageFullInfoCanvasBeforeShow = (pageInfo) => {
    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val('');
    // for custom notes
    setPageStatusButtons(pageInfo);
    setCanvasSectionsOpeners();
    resetCustomNotesInputAreas();
    setCanvasButtonsFunctions(pageInfo);
    setInitialCanvasSectionsVisibility();
    fillPageTitle(pageInfo);
    fillPageLastUpdate(pageInfo);
    fillPageExcerpt(pageInfo);
    setCustomNoteTextAreaLimits();
    initCustomNotesTable(pageInfo);
    setCanvasGeneralCustomNotesVisibility(pageInfo);

    // for tags
    setCanvasPageCustomTagsVisibility(pageInfo);
    
}

const fillTagList = (pageInfo) => {
    
    const $tagItemsContainer = $('div[siteFunction="offcanvasPageFullInfoPageTagsList"]');
    const $tagItemElement = $('a[siteFunction="offcanvasPageFullInfoPageTagButton"]')[0];
    const html = $tagItemElement.outerHTML;
    $tagItemsContainer.empty();

    pageInfo.siteInfo.tags.sort().forEach( tag => {
        const $el = $(html);
        $el.text(tag);
        $el.attr('href',`/tag-info?tag=${tag}`);
        $el.removeClass('btn-primarry').removeClass('btn-success').addClass('btn-primary');
        $el.appendTo( $tagItemsContainer);
    });

    pageInfo.savedInfo.customTags.sort().forEach( tag => {
        const $el = $(html);
        $el.text(tag);
        $el.attr('href',`/tag-info?tag=${tag}`);
        $el.removeClass('btn-primarry').removeClass('btn-success').addClass('btn-success');
        $el.appendTo( $tagItemsContainer);
    });
}

const setCanvasGeneralCustomNotesVisibility = (pageInfo) => {
    if ( getPageStatusInSavedItems(pageInfo)) {
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesLimitsAlert"]').show();
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesSavePageAlert"]').hide();
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesContainer"]').show();
    }
    else {
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesLimitsAlert"]').hide();
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesSavePageAlert"]').show();
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesContainer"]').hide();
    }
}

const setCanvasPageCustomTagsVisibility = (pageInfo) => {
    if ( getPageStatusInSavedItems(pageInfo)) {
        $('div[siteFunction="offcanvasPageFullInfoPageCustomTags"]').show();
    }
    else {
        $('div[siteFunction="offcanvasPageFullInfoPageCustomTags"]').hide();
    }
}

const setPageStatusButtons = (pageInfo) => {
    if ( getPageStatusInSavedItems(pageInfo)) {
        $('button[siteFunction="offcanvasPageFullInfoPageSaveToSavedItems"]').addClass('disabled');
        $('button[siteFunction="offcanvasPageFullInfoPageRemoveFromSavedItems"]').removeClass('disabled');
    }
    else {
        $('button[siteFunction="offcanvasPageFullInfoPageSaveToSavedItems"]').removeClass('disabled');
        $('button[siteFunction="offcanvasPageFullInfoPageRemoveFromSavedItems"]').addClass('disabled');
    }
}

const resetCustomNotesInputAreas = () => {
    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val('');
    $('span[siteFunction="offcanvasPageFullInfoPageGeneralCustomNoteWords"]').text('W: 0');
    $('span[siteFunction="offcanvasPageFullInfoPageGeneralCustomNoteChars"]').text('C: 0');
}

const setCustomNoteTextAreaLimits = () => {
    keepTextInputLimits(
        '#offcanvasPageFullInfoPageGeneralCustomNotesEdit', 
        50, 
        250, 
        'span[siteFunction="offcanvasPageFullInfoPageGeneralCustomNoteWords"]', 
        'span[siteFunction="offcanvasPageFullInfoPageGeneralCustomNoteChars"]'
    );
}

const setCanvasButtonsFunctions = (pageInfo) => {

    // .off('click') is mandatory, otherwise the listener will be binded multiple times to the page
    // and the function will be executed for all history of pageInfo until the whole page is reloaded
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditAdd"]').off('click').on('click', function() {
        addCustomNote(pageInfo);
    });

    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').off('click').on('click', function() {
        const noteId = $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').attr('selectedNote');
        updateCustomNote(noteId, pageInfo);
    });

    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').off('click').on('click', function() {
        const noteId = $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').attr('selectedNote');
        deleteCustomNote(noteId, pageInfo);
    });

    $('button[siteFunction="offcanvasPageFullInfoPageSaveToSavedItems"]').off('click').on('click', function() {
        savePageToSavedItems(pageInfo);
        setPageStatusButtons(pageInfo);
        setCanvasGeneralCustomNotesVisibility(pageInfo);
        setCanvasPageCustomTagsVisibility(pageInfo);
        refreshNotesTable(pageInfo);
    });
    
    $('button[siteFunction="offcanvasPageFullInfoPageRemoveFromSavedItems"]').off('click').on('click', function() {
        removePageFromSavedItems(pageInfo);
        setPageStatusButtons(pageInfo);
        setCanvasGeneralCustomNotesVisibility(pageInfo);
        setCanvasPageCustomTagsVisibility(pageInfo);
        refreshNotesTable(pageInfo);
    });
    
}

const refreshNotesTable = (pageInfo) => {
    const notesData = getPageNotes(pageInfo);
    const table = $('#offcanvasPageFullInfoPageGeneralCustomNotesTable').DataTable();
    table.rows().remove().draw();
    table.rows.add(notesData).draw();
}

const addCustomNote = (pageInfo) => {
    note = $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val();
    if (addNote(note, pageInfo)) refreshNotesTable(pageInfo);
    resetCustomNotesInputAreas();
    toggleUpdateNoteButton();
    toggleDeleteNoteButton();
    unsetSelectedNote();
}

const updateCustomNote = (noteId, pageInfo) => {
    console.log ('update');
    note = $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val();
    if (updateNote(noteId, note, pageInfo)) refreshNotesTable(pageInfo);
    resetCustomNotesInputAreas();
    toggleUpdateNoteButton();
    toggleDeleteNoteButton();
    unsetSelectedNote();
}

const deleteCustomNote = (noteId, pageInfo) => {
    if (deleteNote(noteId, pageInfo)) refreshNotesTable(pageInfo);
    resetCustomNotesInputAreas();
    toggleUpdateNoteButton();
    toggleDeleteNoteButton();
    unsetSelectedNote();
}

const setInitialCanvasSectionsVisibility = () => {
    $('div[siteFunction="offcanvasPageFullInfoPageGeneral"]').hide();
    $('div[siteFunction="offcanvasPageFullInfoPageTags"]').hide();
}

const setCanvasSectionsOpeners = () => {
    $('span[siteFunction="offcanvasPageFullInfoPageOpenGeneral"]').on('click', function() {
        $('div[siteFunction="offcanvasPageFullInfoPageGeneral"]').fadeIn();
    })

    $('span[siteFunction="offcanvasPageFullInfoPageTagsOpen"]').on('click', function() {
        $('div[siteFunction="offcanvasPageFullInfoPageTags"]').fadeIn();
    })
}

const fillPageTitle = (pageInfo) => {
    $('a[siteFunction="offcanvasPageFullInfoPageGeneralDocLink"]').text(pageInfo.siteInfo.title);
    $('a[siteFunction="offcanvasPageFullInfoPageGeneralDocLink"]').attr('href',pageInfo.siteInfo.permalink);
}

const fillPageLastUpdate = (pageInfo) => {
    $('span[siteFunction="offcanvasPageFullInfoPageGeneralLastUpdateDate"]').text(formatDate(pageInfo.siteInfo.lastUpdate));
}

const fillPageExcerpt = (pageInfo) => {
    pageExcerpt = pageInfo.siteInfo.excerpt || '---';
    $('span[siteFunction="offcanvasPageFullInfoPageGeneralExcerptText"]').text(pageExcerpt);
}

const initCustomNotesTable = (pageInfo) => {
    const permalink = pageInfo.siteInfo.permalink.replace(/^\/|\/$/g, '').replace(/\//g, '_').trim();
    const $table = $('#offcanvasPageFullInfoPageGeneralCustomNotesTable').DataTable();
    if ($.fn.DataTable.isDataTable($table)) $table.destroy();
        
    setDataTable(
        '#offcanvasPageFullInfoPageGeneralCustomNotesTable',
        `PageCustomNotes_${permalink}`,
        
        // columns settings
        [
            // date
            {
                data: 'date',
                type: 'date',
                className: 'dt-left alwaysCursorPointer alwaysTextToLeft'
            }, 

            // note
            {
                data: "note",
                className: 'alwaysCursorPointer'
            },

            // note id
            { 
                data: "id",
                searchable: false, 
                orderable: false, 
                visible: false
            }

        ],

        (table) => { postProcessCustomNotesTable(table, pageInfo) },
        (rowData) => {processCustomNotesTabelsClickOnRow(rowData, pageInfo)},
        {
            order: [
                [0, "desc"]
            ],
            data: getPageNotes(pageInfo)
        }
    );
}

const processCustomNotesTabelsClickOnRow = (rowData, pageInfo) => {
    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val(rowData.data.note).on('input', function() { 
        disableDeleteNoteButton(); // disable delete if click on table and start typing in note text area
    });

    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').trigger('keyup'); // to update word and char counts
    toggleDeleteNoteButton(true);
    toggleUpdateNoteButton(true);
    setSelectedNote(rowData);
}

const postProcessCustomNotesTable = (table, pageInfo) => {
    if(table) {
        deleteAllNotes = {
            attr: {
                siteFunction: 'tablePageCustomNotesRemoveAllNotes',
                title: `Remove all custom notes for page ${pageInfo.siteInfo.title}`
            },
            className: 'btn-danger btn-sm text-light focus-ring focus-ring-warning mb-2',
            text: 'Delete All Notes',
            action: () => {
                removeAllCustomNotes(pageInfo);
                const notesData = getPageNotes(pageInfo);
                table.clear().rows.add(notesData).draw();
                resetCustomNotesInputAreas();
                toggleUpdateNoteButton();
                toggleDeleteNoteButton();
                unsetSelectedNote();
        
            }
        };
        const btnArray = [];
        btnArray.push(deleteAllNotes);
        addAdditionalButtonsToTable(table, '#offcanvasPageFullInfoPageGeneralCustomNotesTable', 'bottom2', btnArray);      
    }   
}

const toggleDeleteNoteButton = (mode) => {
    if (mode) $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').removeClass('disabled');
    else $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').addClass('disabled');
}

const toggleUpdateNoteButton = (mode) => {
    if (mode) $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').removeClass('disabled');
    else $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').addClass('disabled');
}

const setSelectedNote = (rowData) => {
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').attr('selectedNote', rowData.data.id);
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').attr('selectedNote', rowData.data.id)
}

const unsetSelectedNote = () => {
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').attr('selectedNote', '');
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').attr('selectedNote', '')
}

const disableDeleteNoteButton = () => {
    toggleDeleteNoteButton();
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').attr('selectedNote', '');
}

const setTagEditor = (editorSelector, pageInfo) => {
    if ( getPageStatusInSavedItems(pageInfo)) {
        const options = {
            toolbar: {
                show: true,
                selector: '#offcanvasPageFullInfoPageTagsEditorToolbar'
            },
            menuBar: {
                show: true,
                selector: '#offcanvasPageFullInfoPageTagsEditorMenubar'
            },
            builtInOptions: {}
        };

        setEditor(
            editorSelector, 
            options,
            (editor) => {
                postProcessTagEditor(editor, pageInfo);
            }, 
            (editorText, callbackResponse) => {
                //editor = $(editorSelector).parent().find('.ck-editor__editable')[0].ckeditorInstance;
                //editor.model.document.off();
                postProcessingEditorText(editorText, editorSelector, pageInfo, callbackResponse);
            }
        );
    }
}

const postProcessTagEditor = (editor, pageInfo) => {
    // add post processing of editor after creation
    // such as changing fonts through API, etc
}

const postProcessingEditorText = (editorText, editorSelector, pageInfo, callbackResponse) => {
    // process the editor text while typing

    let tagString = DOMPurify.sanitize(editorText.replace(/<[^>]*>/g, '').replace(/(\n|&nbsp;)/g, ','));
    tagString = tagString === ',' ? '' : tagString;
    console.log(tagString);

    editor = $(editorSelector).parent().find('.ck-editor__editable')[0].ckeditorInstance;
    editor.setData(tagString);
        
    // moving cursor at the end of text after setData()
    // setTimeout is necessary to avoid endless loop
    setTimeout(() => {
        const editingView = editor.editing.view;    
        editor.model.change((writer) => {
          writer.setSelection(writer.createPositionAt(editor.model.document.getRoot(), 'end'));
        });    
        editingView.focus();
        callbackResponse(); //job done here, is time to set back the change:data listener 
      }, 100);

}
