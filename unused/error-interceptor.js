(function() {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = function(...args) {
        originalConsoleError.apply(console, args);
        processError({ type: "console.error", args });
    };

    console.warn = function(...args) {
        originalConsoleWarn.apply(console, args);
        processError({ type: "console.warn", args });
    };

    window.onerror = function(message, source, lineno, colno, error) {
        const errorDetails = {
            type: "uncaught error",
            message,
            source: source || "Unknown source",
            lineno,
            colno,
            error: error ? error.stack || error.toString() : "Unknown error"
        };
        processError(errorDetails);
        return false; 
    };

    window.addEventListener("unhandledrejection", function(event) {
        const errorDetails = {
            type: "unhandled rejection",
            reason: event.reason ? event.reason.stack || event.reason.toString() : "Unknown reason"
        };
        processError(errorDetails);
    });

    window.addEventListener("error", function(event) {
        if (event.target instanceof HTMLElement) {
            const errorDetails = {
                type: "resource load error",
                message: "Failed to load resource",
                resource: event.target.src || event.target.href || "Unknown",
                tag: event.target.tagName
            };
            processError(errorDetails);
        }
    }, true); 

    function wrapFunction(fn) {
        if (typeof fn !== "function" || fn.__wrapped__) {
            return fn;
        }

        function wrappedFunction(...args) {
            try {
                return fn.apply(this, args);
            } catch (error) {
                const errorDetails = {
                    type: "function execution error",
                    message: error.message,
                    stack: error.stack
                };
                processError(errorDetails);
                throw error; 
            }
        }

        wrappedFunction.__wrapped__ = true;
        return wrappedFunction;
    }

    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(fn, delay, ...args) {
        return originalSetTimeout(wrapFunction(fn), delay, ...args);
    };

    const originalSetInterval = window.setInterval;
    window.setInterval = function(fn, delay, ...args) {
        return originalSetInterval(wrapFunction(fn), delay, ...args);
    };

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        return originalAddEventListener.call(this, type, wrapFunction(listener), options);
    };

    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch(...args);
            if (response.status >= 400 && response.status < 500) {
                const errorDetails = {
                    type: "fetch error",
                    url: args[0],
                    status: response.status,
                    statusText: response.statusText
                };
                processError(errorDetails);
            }
            return response;
        } catch (error) {
            const errorDetails = {
                type: "fetch failure",
                url: args[0],
                error: error.message
            };
            processError(errorDetails);
            throw error;
        }
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this.addEventListener("readystatechange", function() {
            if (this.readyState === 4 && this.status >= 400 && this.status < 500) {
                const errorDetails = {
                    type: "xhr error",
                    method,
                    url,
                    status: this.status,
                    statusText: this.statusText
                };
                processError(errorDetails);
            }
        });
        return originalOpen.apply(this, [method, url, ...args]);
    };

    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        if (tagName === "script") {
            const originalOnError = element.onerror;
            element.onerror = function(event) {
                const errorDetails = {
                    type: "dynamic script error",
                    message: "Error loading script",
                    resource: event.target.src
                };
                processError(errorDetails);
                if (originalOnError) {
                    originalOnError.apply(this, arguments);
                }
            };
        }
        return element;
    };

    function processError(errorDetails) {
        console.log("Error intercepted:", errorDetails);
        nrLog(
            'error', 
            'intercept errors', 
            'error', 
            {
                functionName: 'error interceptor',
                result: errorDetails,
                args: '', 
                argsExtra: '', 
            }
        );
    }

    console.log("Error interceptor is now active");

})();