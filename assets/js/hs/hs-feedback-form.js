const iframeWindow = window;
const iframeDocument = iframeWindow.document;
const mainJQuery = window.parent.mainJQuery;
iframeWindow.$ = mainJQuery;
iframeWindow.jQuery = mainJQuery;

hsFeedbackForm = {
    doTheWork: () => {
        if (mainJQuery) {
            $(hsFeedbackForm.iframeDocument).ready(function() {
                hsFeedbackForm.setWasThisUsefullFunction();
                hsFeedbackForm.hideMessageAndEmail();
            });
        } else {
            console.error('Main document jQuery is not available.');
        }
    },

    hideMessageAndEmail: () => {
        $(iframeDocument).find('.hs-message').addClass('d-none');
        $(iframeDocument).find('.hs-email').parent().addClass('d-none');
    },

    setWasThisUsefullFunction: () => {
        $(iframeDocument).find('.hs-form-radio').click(function() {
            $(iframeDocument).find('.hs-message').removeClass('d-none');
            $(iframeDocument).find('.hs-email').parent().removeClass('d-none');
        })
    }
};


hsFeedbackForm.doTheWork();


