
const showPageFullInfoCanvas = (pageInfo) => {
    $(document).ready ( function() {  
        if (pageInfo) {
            initPageFullInfoCanvas(pageInfo);
            $('#offcanvasPageFullInformation').offcanvas('show');
        }
    });  
}

const initPageFullInfoCanvas = (pageInfo) => {
    setOpeners();
    resetCustomNotesInputAreas();
    setFunctions(pageInfo);
    setInitialVisibility();
    fillPageTitle(pageInfo);
    fillPageExcerpt(pageInfo);
    setCustomNoteTextAreaLimits();
    initCustomNotesTable(pageInfo);
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

const setFunctions = (pageInfo) => {
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditAdd"]').on('click', () => {
        addCustomNote(pageInfo);
    });

    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').on('click', () => {
        updateCustomNote(pageInfo);
    });

    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').on('click', () => {
        deleteCustomNote(pageInfo);
    });
}

const addCustomNote = (pageInfo) => {
    note = $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val();
    if (addNote(note, pageInfo)) {
        const notesData = getPageNotes(pageInfo);
        const table = $('#offcanvasPageFullInfoPageGeneralCustomNotesTable').DataTable();
        table.rows().remove().draw();
        table.rows.add(notesData).draw();
        resetCustomNotesInputAreas();
    }
}

const updateCustomNote = (pageInfo) => {
    console.log ('update');
    resetCustomNotesInputAreas(); 
}

const deleteCustomNote = (pageInfo) => {
    console.log ('delete');
    resetCustomNotesInputAreas(); 
}

const setInitialVisibility = () => {
    $('div[siteFunction="offcanvasPageFullInfoPageTags"]').hide();
}

const setOpeners = () => {
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
                [0, "dec"]
            ],
            data: getPageNotes(pageInfo)
        }
    );
}

const processCustomNotesTabelsClickOnRow = (rowData, pageInfo) => {
    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val(rowData.data.note);
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
        
            }
        };
        const btnArray = [];
        btnArray.push(deleteAllNotes);
        addAdditionalButtonsToTable(table, '#offcanvasPageFullInfoPageGeneralCustomNotesTable', 'bottom2', btnArray);       
    }   
}