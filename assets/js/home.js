

const home__collectionsSection = () => {
    $(document).ready(function() {{
        console.log('here');
        homePage.hoverCollectionsItems();
    }});
}

homePage = {

    hoverCollectionsItems: () => {
        
        $('li[siteFunction="homeCollection_doc"]').each(function() {
            $(this)
                .on('mouseenter', function() {
                    $($(this))
                        .removeClass('bg-transparent')
                        .addClass('bg-secondary bg-opacity-10');
                })
                .on('mouseleave', function() {
                    $($(this))
                        .addClass('bg-transparent')
                        .removeClass('bg-secondary bg-opacity-10');
                });
            });
    }

}