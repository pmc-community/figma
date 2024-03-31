const customiseTheme = () => {
    customiseFooter();
    addLogo();

    $(window).on('load', function() {
        if(window.location.hash) {
            // remove the hash and keep everything else
            history.replaceState({}, document.title, location.pathname + location.search);
        }
    });

    //jtd.setTheme("dark")
}


const customiseFooter = () => {
    $('.site-footer').prepend(`<div class="footer_first_row">Copyright ${new Date().getFullYear()}, <a href="https://pmc-expert.com" target=_blank>PMC</a></div>`);
}

const addLogo = () => {
    $('.site-header').prepend('<a href="/"><img class = "site_logo" src="/assets/img/logo.png" /></a>');
}