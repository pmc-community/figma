const iframeWindow = window;
const iframeDocument = iframeWindow.document;
const mainJQuery = window.parent.mainJQuery;
iframeWindow.$ = mainJQuery;
iframeWindow.jQuery = mainJQuery;

const {settings, pageSettings, hsSettings} = window.parent.utilities;
const { showToast } = window.parent.utilities.func;

hsFeedbackForm = {
    doTheWork: () => {
        if (mainJQuery) {
            $(hsFeedbackForm.iframeDocument).ready(function() {
                hsFeedbackForm.fixMessageTextareaHeight(); // should be fixed to a certain height, otherwise has the tendency to grow
                hsFeedbackForm.setWasThisUsefullFunction();
                hsFeedbackForm.setChangeRatingFunction();
                hsFeedbackForm.hideFormExtraControls();
            });
        } else {
            showToast(`Something went wrong, cannot execute functions!`, 'bg-danger', 'text-light');
        }
    },

    hideFormExtraControls: () => {
        $(iframeDocument).find('.hs_submit').addClass('d-none');
        $(iframeDocument).find('.hs-message').addClass('d-none')
        $(iframeDocument).find('.hs-email').parent().addClass('d-none');
    },

    setWasThisUsefullFunction: () => {
        const yourRating = (rating) => {
            const ratingTextClass = rating === 'Yes' ? 'text-success' : 'text-danger';

            return (
                `
                    <div siteFunction="hsFormChangeRatingContainer" class="d-flex justify-content-between align-items-center mb-2">
                        <div class="hsFormRegularText text-secondary">
                            <span>Was this useful: </span>
                            <span class="${ratingTextClass}">${rating}</span>
                        </div>
                        <button siteFunction="hsFormChangeRating" class="btn btn-warning text-dark btn-sm hsFormRegularText me-2">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                `
            );
        }
        $(iframeDocument).find('.hs-form-radio').click(function() {
            if ($(iframeDocument).find('div[siteFunction="hsFormChangeRatingContainer"]').length === 0)
                $(iframeDocument).find('.hbspt-form').prepend(yourRating($(this).find('label > span').first().text()));
            $(iframeDocument).find('.hs_was_this_useful_').addClass('d-none');
            $(iframeDocument).find('.hs-message').removeClass('d-none');
            $(iframeDocument).find('.hs-email').parent().removeClass('d-none');
            $(iframeDocument).find('.hs_submit').removeClass('d-none');
        })
    },

    setChangeRatingFunction: () => {
        $(iframeDocument).on('click', 'button[siteFunction="hsFormChangeRating"]', () => {
            hsFeedbackForm.hideFormExtraControls();
            $(iframeDocument).find('.hs_was_this_useful_').removeClass('d-none');
            $(iframeDocument).find('div[siteFunction="hsFormChangeRatingContainer"]').remove();

        });
    },

    fixMessageTextareaHeight: () => {
        $(iframeDocument).find('.hs-message').css('height', '100px');
    }
    
};

hsFeedbackForm.doTheWork();


