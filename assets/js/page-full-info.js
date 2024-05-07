
const showPageFullInfoCanvas = (pageInfo) => {
    $(document).ready ( function() {  
        if (pageInfo) {
            initPageFullInfoCanvas(pageInfo);
            $('#offcanvasPageFullInformation').offcanvas('show');
        }
    });  
}

const initPageFullInfoCanvas = (pageInfo) => {
    fillPageTitle(pageInfo);
    fillPageExcerpt(pageInfo);
    initCustomNotesTable(pageInfo);
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
                type: 'date', 
                className: 'dt-left'
            }, 

            // note
            null, 

            // action buttons
            { 
                searchable: false, 
                orderable: false, 
                exceptWhenRowSelect: true
            }
        ],

        (table) => {},
        (rowData) => {console.log(rowData)}
    );

}