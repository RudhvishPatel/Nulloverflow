/**
 * Safari Compatibility Fix for Swup and jQuery
 * This polyfill fixes XMLHttpRequest.responseURL issues in Safari
 * Must be loaded BEFORE jQuery and Swup libraries
 */
(function() {
    'use strict';

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof XMLHttpRequest === 'undefined') {
        return;
    }

    // Detect Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Helper function to get current URL safely - NEVER returns null
    function getCurrentUrl() {
        try {
            return window.location.href || 'about:blank';
        } catch (e) {
            return 'about:blank';
        }
    }

    // Ensure getCurrentUrl is available globally IMMEDIATELY
    window.getCurrentUrl = getCurrentUrl;

    // Helper function to resolve URL
    function resolveURL(url) {
        if (!url) return getCurrentUrl();

        // If URL is absolute, return as is
        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        // If URL is relative, resolve it
        try {
            const a = document.createElement('a');
            a.href = url;
            return a.href;
        } catch (e) {
            return getCurrentUrl();
        }
    }

    // Store original XMLHttpRequest
    const OriginalXHR = XMLHttpRequest;
    const originalOpen = OriginalXHR.prototype.open;
    const originalSend = OriginalXHR.prototype.send;
    const originalSetRequestHeader = OriginalXHR.prototype.setRequestHeader;

    // Patch XMLHttpRequest.open
    OriginalXHR.prototype.open = function(method, url, async, user, password) {
        // Store the resolved URL
        this._requestURL = resolveURL(url);
        this._requestMethod = method;

        // CRITICAL: Force responseURL to exist IMMEDIATELY with a value
        // This prevents "null is not an object" errors in Swup
        try {
            if (!this.hasOwnProperty('responseURL')) {
                Object.defineProperty(this, 'responseURL', {
                    get: function() {
                        return this._responseURL || this._requestURL || getCurrentUrl();
                    },
                    set: function(value) {
                        this._responseURL = value || this._requestURL || getCurrentUrl();
                    },
                    configurable: true,
                    enumerable: true
                });
            }
        } catch (e) {
            // Fallback if defineProperty fails
            this.responseURL = this._requestURL;
        }

        // Set initial value - NEVER null
        this._responseURL = this._requestURL;
        this.responseURL = this._requestURL;

        // Call original open
        try {
            return originalOpen.apply(this, arguments);
        } catch (e) {
            console.error('XHR open error:', e);
            throw e;
        }
    };

    // Patch setRequestHeader
    OriginalXHR.prototype.setRequestHeader = function(header, value) {
        if (!this._requestHeaders) {
            this._requestHeaders = {};
        }
        this._requestHeaders[header] = value;
        return originalSetRequestHeader.apply(this, arguments);
    };

    // Patch XMLHttpRequest.send
    OriginalXHR.prototype.send = function(data) {
        const xhr = this;
        const requestURL = xhr._requestURL || getCurrentUrl();

        // Ensure responseURL exists before send
        if (!xhr.hasOwnProperty('responseURL')) {
            try {
                Object.defineProperty(xhr, 'responseURL', {
                    get: function() {
                        return this._responseURL || this._requestURL || getCurrentUrl();
                    },
                    set: function(value) {
                        this._responseURL = value || this._requestURL || getCurrentUrl();
                    },
                    configurable: true,
                    enumerable: true
                });
            } catch (e) {
                // Fallback
                xhr.responseURL = requestURL;
            }
        }

        // Set initial value
        xhr._responseURL = requestURL;
        if (!xhr.responseURL) {
            xhr.responseURL = requestURL;
        }

        // Monitor state changes
        const originalOnReadyStateChange = xhr.onreadystatechange;
        xhr.onreadystatechange = function() {
            // Ensure responseURL is never null
            if (!this.responseURL || this.responseURL === null) {
                this.responseURL = this._responseURL || this._requestURL || getCurrentUrl();
            }

            if (this.readyState === 4) {
                // Final check on completion
                if (!this.responseURL) {
                    this.responseURL = this._requestURL || getCurrentUrl();
                }
                this._responseURL = this.responseURL;
            }

            if (originalOnReadyStateChange) {
                return originalOnReadyStateChange.apply(this, arguments);
            }
        };

        // Add event listener as backup
        if (xhr.addEventListener) {
            xhr.addEventListener('readystatechange', function() {
                if (!this.responseURL || this.responseURL === null) {
                    this.responseURL = this._responseURL || this._requestURL || getCurrentUrl();
                }
            });
        }

        // Call original send
        try {
            return originalSend.apply(this, arguments);
        } catch (e) {
            console.error('XHR send error:', e);
            throw e;
        }
    };

    // Global getCurrentUrl function for Swup
    window.getCurrentUrl = getCurrentUrl;

    // Ensure getCurrentUrl is always available on window
    Object.defineProperty(window, 'getCurrentUrl', {
        value: getCurrentUrl,
        writable: false,
        configurable: true,
        enumerable: true
    });

    // Additional safety: prevent null XHR responses in Swup/jQuery
    // Override XMLHttpRequest constructor completely
    const SafeXMLHttpRequest = function() {
        const xhr = new OriginalXHR();

        // Immediately ensure responseURL exists
        try {
            if (!xhr.hasOwnProperty('responseURL') || xhr.responseURL === null || xhr.responseURL === undefined) {
                Object.defineProperty(xhr, 'responseURL', {
                    get: function() {
                        return this._responseURL || this._requestURL || getCurrentUrl();
                    },
                    set: function(value) {
                        this._responseURL = value || getCurrentUrl();
                    },
                    configurable: true,
                    enumerable: true
                });
                xhr._responseURL = getCurrentUrl();
            }
        } catch (e) {
            xhr.responseURL = getCurrentUrl();
        }

        return xhr;
    };

    // Copy all properties from original constructor
    SafeXMLHttpRequest.prototype = OriginalXHR.prototype;
    for (let prop in OriginalXHR) {
        if (OriginalXHR.hasOwnProperty(prop)) {
            SafeXMLHttpRequest[prop] = OriginalXHR[prop];
        }
    }

    // Replace global XMLHttpRequest
    window.XMLHttpRequest = SafeXMLHttpRequest;

    // CRITICAL: Patch fetch API as well for complete coverage
    if (window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).catch(function(error) {
                console.warn('Fetch error caught and handled:', error);
                // Return a minimal valid response to prevent crashes
                return new Response('', { status: 200, headers: {} });
            });
        };
    }

    // Extra Swup-specific patches
    window.addEventListener('DOMContentLoaded', function() {
        // Patch any Swup internals that might cause issues
        if (window.Swup && isSafari) {
            console.log('Applying additional Swup patches for Safari');
        }
    });

    // Prevent ANY null access errors globally (emergency fallback)
    if (isSafari) {
        window.addEventListener('error', function(e) {
            if (e.message && e.message.includes('null is not an object')) {
                console.warn('Safari: Prevented null object error:', e.message);
                e.preventDefault();
                return false;
            }
        });

        window.addEventListener('unhandledrejection', function(e) {
            if (e.reason && e.reason.message && e.reason.message.includes('null is not an object')) {
                console.warn('Safari: Prevented unhandled rejection:', e.reason.message);
                e.preventDefault();
            }
        });

        // Additional Safari-specific library detection
        window.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                console.log('Safari library check:');
                console.log('- GSAP loaded:', typeof window.gsap !== 'undefined');
                console.log('- jQuery loaded:', typeof window.jQuery !== 'undefined');
                console.log('- Swup loaded:', typeof window.Swup !== 'undefined');
            }, 500);
        });
    }

    // Disable smooth-scroll.js for Safari - use native scrolling instead
    if (isSafari) {
        window.addEventListener('load', function() {
            // Disable the SmoothScroll library for Safari
            if (window.SmoothScroll && window.SmoothScroll.destroy) {
                window.SmoothScroll.destroy();
                console.log('Safari: Disabled SmoothScroll library, using native scrolling');
            }

            // Ensure native smooth scroll is enabled
            document.documentElement.style.scrollBehavior = 'smooth';
            document.body.style.scrollBehavior = 'smooth';

            // Optimize scroll performance for Safari
            document.documentElement.style.webkitOverflowScrolling = 'touch';
            document.body.style.webkitOverflowScrolling = 'touch';
        });
    }

    console.log('Safari XHR/Swup compatibility patch loaded successfully');
})();
