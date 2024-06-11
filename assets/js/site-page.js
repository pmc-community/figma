// FUNCTIONS FOR EACH PAGE
const showPageCustomTags = (crtPage) => {

    const tagElement = (tag, numPages) => {
        return (
            `
                <div class="d-inline-flex align-items-center">
                    <a 
                        href="/tag-info?tag=${tag}" 
                        sitefunction="pageTagButton" 
                        type="button" 
                        class="focus-ring focus-ring-warning px-3 my-2 mr-5 btn btn-sm btn-success position-relative">
                        ${tag}
                    </a> 
                    <span 
                        sitefunction="tagBadgeOnPage" 
                        class="position-relative translate-middle badge rounded-pill text-bg-warning"> 
                        ${numPages} 
                        <span class="visually-hidden" >number of pages</span>
                    </span>
                </div>
            `
        );
    }

    const customTags = getPageTags({siteInfo:crtPage})
    customTags.forEach( tag => {
        const numPages = getTagPages(tag);
        $('#pageTags').append($(tagElement(tag, numPages)));
    });
};