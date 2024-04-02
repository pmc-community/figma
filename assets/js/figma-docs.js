/* SOME UTILITIES */
// check if an element is on screen
$.fn.is_on_screen = function () {
    var win = $(window);
    var viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds;
    bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
};

// usage: $().sizeChanged(function(){})
$.fn.sizeChanged = function (handleFunction) {
    var element = this;
    var lastWidth = element.width();
    var lastHeight = element.height();

    setInterval(function () {
        if (lastWidth === element.width()&&lastHeight === element.height())
            return;
        if (typeof (handleFunction) == 'function') {
            handleFunction({ width: lastWidth, height: lastHeight },
                            { width: element.width(), height: element.height() });
            lastWidth = element.width();
            lastHeight = element.height();
        }
    }, 100);
    return element;
};


const customiseTheme = () => {
    addTopOfPage ();
    clearTheUrl();
    customiseFooter();
    addLogo();
    setGoToTopBtn();
    formatAuxLinksBtns();
    fullContentAreaOnHome();
    hidePageTOConHome();

}

const hidePageTOConHome = () => {
    $(window).on('load', () => {
        const rootUrl = window.location.origin + '/';
    const crtPage = window.location.href;
    if (rootUrl === crtPage) $('#page_toc').hide();
    });
}

const fullContentAreaOnHome = () => {
    const rootUrl = window.location.origin + '/';
    const crtPage = window.location.href;
    console.log(`o=${rootUrl} c=${crtPage}`)
    if (rootUrl === crtPage) $('.main-content-wrap').css('width','100%');
}

const formatAuxLinksBtns =() => {
    $('.aux-nav-list-item').addClass('btn btn-danger btn-sm m-2');
    $('.aux-nav-list-item:first-child a').addClass('text-light');
    $('.aux-nav-list-item:last-child').removeClass('btn-danger').addClass('btn-warning');
    $('.aux-nav-list-item:last-child a').addClass('text-dark');
}

const setGoToTopBtn = () => {
    $('.main').append('<div id="ihs_go_to_top_btn"><img src="/assets/img/goToTop.png" loading="lazy" alt="tick-circle"></div>');

    // if the header is not fixed, - $('#main-header').height() - 20 can be removed
    $('#ihs_go_to_top_btn').click(() => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#ihs_top_of_page").offset().top - $('#main-header').height() - 20
        }, 300);
    });
   
}        

const addTopOfPage = () => {
    $('.main-content-wrap').prepend('<div id ="ihs_top_of_page"></div>');
}
const customiseFooter = () => {
    $('.site-footer').prepend('<div class="footer_first_row"><a href="https://innohub.space/eng/terms-of-service/" target=_blank>Terms</a> | <a href="https://innohub.space/eng/privacy/" target=_blank>Privacy</a> | <a href="https://innohub.space/eng/cookie-policy/" target=_blank>Cookies</a></div>');
    $('.site-footer').prepend(`<div class="footer_first_row">Copyright ${new Date().getFullYear()}, <a href="https://pmc-expert.com" target=_blank>PMC</a></div>`);
}

const addLogo = () => {
    $('.site-header').prepend('<a href="/"><img class = "site_logo" src="/assets/img/logo.png" /></a>');
}

const clearTheUrl = () => {
    $(window).on('scroll', function() {
        if(window.location.hash) {
            // remove the hash and keep everything else
            history.replaceState({}, document.title, location.pathname + location.search);
        }
    });

    $(window).on('load', function() {
        if(window.location.hash) {
            // remove the hash and keep everything else
            history.replaceState({}, document.title, location.pathname + location.search);
        }
    });

}
  
  $(window).on('scroll', () => {
    var hash = window.location.hash;
    if (hash) {
        // if the header is not fixed, - $('#main-header').height() - 20 can be removed
        $([document.documentElement, document.body]).animate({
            scrollTop: $(hash).offset().top - $('#main-header').height() - 20
        }, 100);
    }
  })
  