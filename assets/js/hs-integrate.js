
$(document).ready(function() {
    window.addEventListener('error', function(event) {
        console.log('Error caught:', event.message);
        return true;
    });

    window.addEventListener('unhandledrejection', function(event) {
        console.log('Unhandled rejection caught:', event.reason);
        return true;
    });
});



hsIntegrate = {
    hsForm: (formContainerSelector, formID, callbackOnFormReady) => {
        try {
            hbspt.forms.create({
                region: 'na1',
                portalId: '7598952',
                formId: `${formID}`,
                target: `${formContainerSelector}`,
                submitText: 'Let us know!',
                submitButtonClass: 'btn btn-small btn-primary',
                onFormReady: function($form) {
                    try {
                        pushHSFormToHSFormsList($form);
                        hsIntegrate.applyCSSCorrection($form);
                        callbackOnFormReady($form);
                    } catch (e) {
                        console.log(`An error occurred in onFormReady for ${formID}`);
                        console.log(e);
                    }
                }
            });
        } catch (e) {
            console.log(`An error occurred while creating the form ${formID}`);
            console.log(e);
        }
    },

    applyCSSCorrection: ($form) => {
        const $iframeDocument = $form[0].ownerDocument;
        const $iframeBody = $($iframeDocument).find('body');
        const $iframeHtml = $($iframeDocument).find('html');
        $iframeBody.css('background', $('body').css('background'));
        $iframeBody.css('font-family', $('body').css('font-family'));
        $iframeHtml.css('background', $('body').css('background'));
        $form.css('background', $('body').css('background'));

        $iframeBody.find('iframe').on('load', function() {
            $(this).parent().css('height', '0')
        })

        $form.find('label').find('span')
            .css('color', $('body').css('color'))
            .addClass('fw-medium')
            .css('font-family', $('body').css('font-family'))
            .css('font-size', $('body').css('font-size'));

        $form.find('p')
            .css('color', $('body').css('color'))
            .css('font-family', $('body').css('font-family'))
            .css('font-size', $('body').css('font-size'));
        
        $iframeBody.find('p')
            .css('color', $('body').css('color'))
            .css('font-family', $('body').css('font-family'))
            .css('font-size', $('body').css('font-size'))
            .addClass('fw-medium fs-6');

    }

}