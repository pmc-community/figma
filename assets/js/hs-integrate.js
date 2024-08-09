

hsIntegrate = {
    hsForm: (formContainerSelector, page, formSettings, formIdentification, callbackOnFormReady = null, callbackOnBeforeFormSubmit = null) => {
        try {
            hbspt.forms.create({
                region: `${formIdentification.region}`,
                portalId: `${formIdentification.portalID}`,
                formId: `${formIdentification.formID}`,
                formInstanceId: uuid(),
                target: `${formContainerSelector}`,
                submitText: `${formSettings.submitText}`,
                submitButtonClass: `${formSettings.submitButtonClass}`,
                onFormReady: function($form) {
                    try {
                        pushHSFormToHSFormsList($form);
                        hsIntegrate.applyCSSCorrection($form, page);
                        if(callbackOnFormReady) callbackOnFormReady($form);
                    } catch (e) {
                        console.error(`An error occurred in onFormReady for ${formID}:`, e);
                    }
                },
                onBeforeFormSubmit: function($form, data) {
                    try {
                        const emailObject = _.find(data, { name: "email" });
                        if (emailObject && _.isEmpty(emailObject.value)) $form.find('input[name=email]').val('visitor@noreply.com');
                        if(callbackOnBeforeFormSubmit) callbackOnBeforeFormSubmit($form, data);
                    }
                    catch (e) {
                        console.error(`An error occurred in onBeforeFormSubmit for ${formID}:`, e);
                    }
                }
            });
        } catch (e) {
            console.error(`An error occurred while creating the form ${formID}:`, e);
        }
    },

    applyCSSCorrection: ($form, page = null) => {
        // general css settings
        // form particular css settings can be made directly in callbackOnFormReady
        const $iframeDocument = $form[0].ownerDocument;
        const $iframeBody = $($iframeDocument).find('body');
        const $iframeHtml = $($iframeDocument).find('html');

        if (page) $iframeBody.attr('pagePermalinkRef', page.permalink).attr('pageTitleRef', page.title);

        $iframeBody.css('background', $('body').css('background'));
        $iframeBody.css('font-family', $('body').css('font-family'));
        $iframeHtml.css('background', $('body').css('background'));
        $form.css('background', $('body').css('background'));

        $iframeBody.find('iframe').on('load', function() {
            $(this).css('height', '0px')
            $(this).parent().css('height', '0px')
        })

        $form.find('label').find('span')
            .css('color', $('body').css('color'))
            .addClass('text-secondary')
            .css('font-family', $('body').css('font-family'))
            //.css('font-size', $('body').css('font-size'));
            .css('font-size', '14px');

        $form.find('p')
            .css('color', $('body').css('color'))
            .css('font-family', $('body').css('font-family'))
            .css('font-size', $('body').css('font-size'));
        
        $iframeBody.find('p')
            .css('color', $('body').css('color'))
            .css('font-family', $('body').css('font-family'))
            .css('font-size', $('body').css('font-size'))
            .addClass('fw-medium fs-6');

        $iframeBody.find('.actions').addClass('p-0 m-0');

    }

}