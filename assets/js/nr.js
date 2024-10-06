// logLevel must be one of: debug | error | info | trace | warn
const nrLog = (logMessage, logAction, logLevel = null, funcData) => {
    if (nrSettings.newRelicEnabled === 'true') {
        if (!logLevel) logLevel = 'info';
        logCustomAttributes = {
            source: 'Figmares',
            permalink: $('page-data-permalink').text() ? $('page-data-permalink').text() : '/',
            datetime: getFullCurrentDateTime(),
            action:logAction,
            function: funcData.functionName,
            args: funcData.args,
            result: funcData.result ? funcData.result : 'func doesn\'t expect to return anything',
            user: Cookies.get(settings.user.userTokenCookie)
        }
        newrelic.log(logMessage, {level: logLevel, customAttributes: logCustomAttributes});
    }
}