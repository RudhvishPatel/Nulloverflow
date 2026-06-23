/* -------------------------------------------

Name: 		Ruizarch
Version:    1.0
Developer:	Nazar Miller (millerDigitalDesign)
Portfolio:  https://themeforest.net/user/millerdigitaldesign/portfolio?ref=MillerDigitalDesign

p.s. I am available for Freelance hire (UI design, web development). email: miller.themes@gmail.com

------------------------------------------- */

// Note: Safari compatibility fix is now loaded from safari-fix.js (loaded before this script)

$(function () {

    "use strict";

    // Check if GSAP is loaded - critical for animations
    if (typeof gsap === 'undefined') {
        console.error('GSAP is not loaded! Animations will not work.');
        return;
    }

    // Check if jQuery is loaded
    if (typeof jQuery === 'undefined') {
        console.error('jQuery is not loaded!');
        return;
    }

    console.log('All libraries loaded successfully (GSAP, jQuery)');

    // Wait for React to render DOM elements before initializing animations
    // Check if elements exist before proceeding
    function waitForReactDOM(callback, maxAttempts = 100) {
        let attempts = 0;
        const checkInterval = setInterval(function () {
            attempts++;
            // Check if key React-rendered elements exist
            // Check for either .mil-banner (Home) or .mil-inner-banner (Projects)
            const preloader = document.querySelector('.mil-preloader');
            const banner = document.querySelector('.mil-banner') || document.querySelector('.mil-inner-banner') || document.querySelector('.mil-contact-page');
            const swupMain = document.querySelector('#swupMain');

            console.log(`Attempt ${attempts}: Preloader=${!!preloader}, Banner=${!!banner}, SwupMain=${!!swupMain}`);

            if ((preloader || banner) && swupMain) {
                clearInterval(checkInterval);
                console.log('React DOM ready, initializing animations');
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.warn('Timeout waiting for React DOM, proceeding anyway');
                callback();
            }
        }, 50); // Check every 50ms for faster detection
    }

    // Wrap all animations and initializations to wait for React DOM
    waitForReactDOM(function () {

        /***************************
    
        swup
    
        ***************************/
        // Detect Safari browser
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        // Safe Swup initialization with error handling
        let swup = null;

        // Initialize Swup for all browsers (Safari fix is loaded before this)
        // For Safari, wait a bit to ensure all patches are fully applied
        const initSwup = function () {
            try {
                const options = {
                    containers: ['#swupMain', '#swupMenu'],
                    animateHistoryBrowsing: true,
                    linkSelector: 'a:not([data-no-swup])',
                    animationSelector: '[class="mil-main-transition"]'
                };

                // Ensure Swup is available
                if (typeof Swup !== 'undefined') {
                    swup = new Swup(options);
                    if (isSafari) {
                        console.log('Swup initialized successfully for Safari (with XHR compatibility patch)');
                    } else {
                        console.log('Swup initialized successfully');
                    }
                } else {
                    console.warn('Swup is not available, page transitions disabled');
                }
            } catch (e) {
                console.error('Swup initialization failed:', e);
                console.log('Continuing without Swup page transitions');
                // Even if Swup fails, continue with the page
            }
        };

        // Safari needs a small delay to ensure patches are ready
        if (isSafari) {
            setTimeout(initSwup, 100);
        } else {
            initSwup();
        }

        /***************************
    
        register gsap plugins
    
        ***************************/
        gsap.registerPlugin(ScrollTrigger);
        /***************************
    
        color variables
    
        ***************************/

        var accent = 'rgba(255, 152, 0, 1)';
        var dark = '#000';
        var light = '#fff';

        /***************************
     
         preloader
     
         ***************************/
        // Preloader is now handled by the Preloader React component (src/component/Preloader/Preloader.jsx)
        // using its own useEffect logic to ensure it triggers on every mount.
        // The logic below is disabled to avoid conflicts.
        /*
        // Detect mobile devices
        const isMobileDevice = window.innerWidth <= 768;
    
        // Set timing based on device
        const companyNameDuration = isMobileDevice ? 1.2 : 0.6;
        const companyNameDelay = isMobileDevice ? 0.8 : 0.5;
    
        var timeline = gsap.timeline();
    
        timeline.to(".mil-preloader-animation", {
            opacity: 1,
        });
    
        timeline.fromTo(
            ".mil-animation-1 .mil-h3", {
                y: "30px",
                opacity: 0
            }, {
                y: "0px",
                opacity: 1,
                stagger: 0.4
            },
        );
    
        timeline.to(".mil-animation-1 .mil-h3", {
            opacity: 0,
            y: '-30',
        }, "+=.3");
    
        // Set reveal box timing based on device
        const revealBoxDuration = isMobileDevice ? 0.15 : 0.3;
        const revealBoxDelay = isMobileDevice ? 0.05 : 0.2;
        const revealBoxFinalDelay = isMobileDevice ? 0 : 0.1;
    
        timeline.fromTo(".mil-reveal-box", 0.1, {
            opacity: 0,
        }, {
            opacity: 1,
            x: '-30',
        });
    
        timeline.to(".mil-reveal-box", revealBoxDuration, {
            width: "100%",
            x: 0,
        }, "+=" + revealBoxDelay);
        timeline.to(".mil-reveal-box", {
            right: "0"
        });
        timeline.to(".mil-reveal-box", revealBoxDuration, {
            width: "0%"
        }, "+=" + revealBoxFinalDelay);
    
        // Ensure box is completely hidden before company name appears
        timeline.set(".mil-reveal-box", {
            opacity: 0,
            display: "none"
        });
    
        timeline.fromTo(".mil-animation-2 .mil-h3", {
            opacity: 0,
        }, {
            opacity: 1,
        }, "-=.5");
        timeline.to(".mil-animation-2 .mil-h3", companyNameDuration, {
            opacity: 0,
            y: '-30'
        }, "+=" + companyNameDelay);
        timeline.to(".mil-preloader", 0.8, {
            opacity: 0,
            ease: 'sine',
        }, "+=.2");
        timeline.fromTo(".mil-up", 0.8, {
            opacity: 0,
            y: 40,
            scale: .98,
            ease: 'sine',
    
        }, {
            y: 0,
            opacity: 1,
            scale: 1,
            onComplete: function () {
                $('.mil-preloader').addClass("mil-hidden");
            },
        }, "-=1");
    
        // Safari fallback: ensure preloader is hidden after max 8 seconds
        // Increased timeout to allow GSAP animations to complete properly
        setTimeout(function() {
            const preloader = $('.mil-preloader');
            if (preloader.length && !preloader.hasClass('mil-hidden')) {
                console.log('Forcing preloader hide (Safari fallback)');
                preloader.css({
                    'opacity': '0',
                    'visibility': 'hidden',
                    'pointer-events': 'none',
                    'display': 'none'
                });
                preloader.addClass('mil-hidden');
            }
        }, 8000);
        */
        /***************************
    
        anchor scroll
    
        ***************************/
        $(document).on('click', 'a[href^="#"]', function (event) {
            event.preventDefault();

            var target = $($.attr(this, 'href'));
            var offset = 0;

            if ($(window).width() < 1200) {
                offset = 90;
            }

            $('html, body').animate({
                scrollTop: target.offset().top - offset
            }, 400);
        });
        /***************************
    
        append
    
        ***************************/
        $(document).ready(function () {
            $(".mil-arrow-place").each(function () {
                if (!$(this).find(".mil-arrow").length) {
                    $(".mil-hidden-elements .mil-arrow").clone().appendTo($(this));
                }
            });
            $(".mil-animation").each(function () {
                if (!$(this).find(".mil-dodecahedron").length) {
                    $(".mil-hidden-elements .mil-dodecahedron").clone().appendTo($(this));
                }
            });
            $(".mil-lines-place").each(function () {
                if (!$(this).find(".mil-lines").length) {
                    $(".mil-hidden-elements .mil-lines").clone().appendTo($(this));
                }
            });
            if (!$(".mil-current-page a").length) {
                $(".mil-main-menu ul li.mil-active > a").clone().appendTo(".mil-current-page");
            }
        });
        /***************************
    
        accordion
    
        ***************************/

        let groups = gsap.utils.toArray(".mil-accordion-group");
        let menus = gsap.utils.toArray(".mil-accordion-menu");
        let menuToggles = groups.map(createAnimation);

        menus.forEach((menu) => {
            menu.addEventListener("click", () => toggleMenu(menu));
        });

        function toggleMenu(clickedMenu) {
            menuToggles.forEach((toggleFn) => toggleFn(clickedMenu));
        }

        function createAnimation(element) {
            let menu = element.querySelector(".mil-accordion-menu");
            let box = element.querySelector(".mil-accordion-content");
            let symbol = element.querySelector(".mil-symbol");
            let minusElement = element.querySelector(".mil-minus");
            let plusElement = element.querySelector(".mil-plus");

            gsap.set(box, {
                height: "auto",
            });

            let animation = gsap
                .timeline()
                .from(box, {
                    height: 0,
                    duration: 0.4,
                    ease: "sine"
                })
                .from(minusElement, {
                    duration: 0.4,
                    autoAlpha: 0,
                    ease: "none",
                }, 0)
                .to(plusElement, {
                    duration: 0.4,
                    autoAlpha: 0,
                    ease: "none",
                }, 0)
                .to(symbol, {
                    background: accent,
                    ease: "none",
                }, 0)
                .reverse();

            return function (clickedMenu) {
                if (clickedMenu === menu) {
                    animation.reversed(!animation.reversed());
                } else {
                    animation.reverse();
                }
            };
        }
        /***************************
    
        back to top
    
        ***************************/
        // Disable back-to-top on mobile devices and Safari to prevent auto-scroll issues
        const isMobile = window.innerWidth <= 768;
        const btt = document.querySelector(".mil-back-to-top .mil-link");

        if (btt && !isMobile && !isSafari) {
            // Only enable back-to-top on desktop non-Safari browsers
            gsap.set(btt, {
                x: -30,
                opacity: 0,
            });

            gsap.to(btt, {
                x: 0,
                opacity: 1,
                ease: 'sine',
                scrollTrigger: {
                    trigger: "body",
                    start: "top -40%",
                    end: "top -40%",
                    toggleActions: "play none reverse none"
                }
            });
        } else if (btt) {
            // Hide back-to-top button on mobile and Safari
            btt.style.display = 'none';
            if (btt.parentElement) {
                btt.parentElement.style.display = 'none';
            }
        }
        /***************************
    
        cursor
    
        ***************************/
        let cursor = document.querySelector('.mil-ball');

        gsap.set(cursor, {
            xPercent: -50,
            yPercent: -50,
        });

        document.addEventListener('pointermove', movecursor);

        function movecursor(e) {
            if (!cursor) {
                cursor = document.querySelector('.mil-ball');
                if (!cursor) return;
            }
            gsap.to(cursor, {
                duration: 0.6,
                ease: 'sine',
                x: e.clientX,
                y: e.clientY,
            });
        }

        $('.mil-drag, .mil-more, .mil-choose').mouseover(function () {
            gsap.to($(cursor), .2, {
                width: 90,
                height: 90,
                opacity: 1,
                ease: 'sine',
            });
        });

        $('.mil-drag, .mil-more, .mil-choose').mouseleave(function () {
            gsap.to($(cursor), .2, {
                width: 20,
                height: 20,
                opacity: .1,
                ease: 'sine',
            });
        });

        $('.mil-accent-cursor').mouseover(function () {
            gsap.to($(cursor), .2, {
                background: accent,
                ease: 'sine',
            });
            $(cursor).addClass('mil-accent');
        });

        $('.mil-accent-cursor').mouseleave(function () {
            gsap.to($(cursor), .2, {
                background: dark,
                ease: 'sine',
            });
            $(cursor).removeClass('mil-accent');
        });

        $('.mil-drag').mouseover(function () {
            gsap.to($('.mil-ball .mil-icon-1'), .2, {
                scale: '1',
                ease: 'sine',
            });
        });

        $('.mil-drag').mouseleave(function () {
            gsap.to($('.mil-ball .mil-icon-1'), .2, {
                scale: '0',
                ease: 'sine',
            });
        });

        $('.mil-more').mouseover(function () {
            gsap.to($('.mil-ball .mil-more-text'), .2, {
                scale: '1',
                ease: 'sine',
            });
        });

        $('.mil-more').mouseleave(function () {
            gsap.to($('.mil-ball .mil-more-text'), .2, {
                scale: '0',
                ease: 'sine',
            });
        });

        $('.mil-choose').mouseover(function () {
            gsap.to($('.mil-ball .mil-choose-text'), .2, {
                scale: '1',
                ease: 'sine',
            });
        });

        $('.mil-choose').mouseleave(function () {
            gsap.to($('.mil-ball .mil-choose-text'), .2, {
                scale: '0',
                ease: 'sine',
            });
        });

        $('a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input , textarea, .mil-accordion-menu').mouseover(function () {
            gsap.to($(cursor), .2, {
                scale: 0,
                ease: 'sine',
            });
            gsap.to($('.mil-ball svg'), .2, {
                scale: 0,
            });
        });

        $('a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input, textarea, .mil-accordion-menu').mouseleave(function () {
            gsap.to($(cursor), .2, {
                scale: 1,
                ease: 'sine',
            });

            gsap.to($('.mil-ball svg'), .2, {
                scale: 1,
            });
        });

        $('body').mousedown(function () {
            gsap.to($(cursor), .2, {
                scale: .1,
                ease: 'sine',
            });
        });
        $('body').mouseup(function () {
            gsap.to($(cursor), .2, {
                scale: 1,
                ease: 'sine',
            });
        });
        /***************************
    
         menu
    
        ***************************/
        $('.mil-menu-btn').on("click", function () {
            $('.mil-menu-btn').toggleClass('mil-active');
            $('.mil-menu').toggleClass('mil-active');
            $('.mil-menu-frame').toggleClass('mil-active');
        });
        /***************************
    
        main menu
    
        ***************************/
        $('.mil-has-children a').on('click', function () {
            $('.mil-has-children ul').removeClass('mil-active');
            $('.mil-has-children a').removeClass('mil-active');
            $(this).toggleClass('mil-active');
            $(this).next().toggleClass('mil-active');
        });
        /***************************
    
        progressbar
    
        ***************************/
        gsap.to('.mil-progress', {
            height: '100%',
            ease: 'sine',
            scrollTrigger: {
                scrub: 0.3
            }
        });
        /***************************
    
        scroll animations
    
        ***************************/

        const appearance = document.querySelectorAll(".mil-up");

        appearance.forEach((section) => {
            gsap.fromTo(section, {
                opacity: 0,
                y: 40,
                scale: .98,
                ease: 'sine',

            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: .4,
                scrollTrigger: {
                    trigger: section,
                    toggleActions: 'play none none reverse',
                }
            });
        });

        const scaleImage = document.querySelectorAll(".mil-scale");

        scaleImage.forEach((section) => {
            var value1 = $(section).data("value-1");
            var value2 = $(section).data("value-2");
            gsap.fromTo(section, {
                ease: 'sine',
                scale: value1,

            }, {
                scale: value2,
                scrollTrigger: {
                    trigger: section,
                    scrub: true,
                    toggleActions: 'play none none reverse',
                }
            });
        });

        const parallaxImage = document.querySelectorAll(".mil-parallax");


        if ($(window).width() > 960) {
            parallaxImage.forEach((section) => {
                var value1 = $(section).data("value-1");
                var value2 = $(section).data("value-2");
                gsap.fromTo(section, {
                    ease: 'sine',
                    y: value1,

                }, {
                    y: value2,
                    scrollTrigger: {
                        trigger: section,
                        scrub: true,
                        toggleActions: 'play none none reverse',
                    }
                });
            });
        }

        const rotate = document.querySelectorAll(".mil-rotate");

        rotate.forEach((section) => {
            var value = $(section).data("value");
            gsap.fromTo(section, {
                ease: 'sine',
                rotate: 0,

            }, {
                rotate: value,
                scrollTrigger: {
                    trigger: section,
                    scrub: true,
                    toggleActions: 'play none none reverse',
                }
            });
        });
        /***************************

        reviews slider

        ***************************/

        var menu = ['<div class="mil-custom-dot mil-slide-1"></div>', '<div class="mil-custom-dot mil-slide-2"></div>', '<div class="mil-custom-dot mil-slide-3"></div>', '<div class="mil-custom-dot mil-slide-4"></div>', '<div class="mil-custom-dot mil-slide-5"></div>', '<div class="mil-custom-dot mil-slide-6"></div>', '<div class="mil-custom-dot mil-slide-7"></div>']
        var mySwiper = new Swiper('.mil-reviews-slider', {
            // If we need pagination
            pagination: {
                el: '.mil-revi-pagination',
                clickable: true,
                renderBullet: function (index, className) {
                    return '<span class="' + className + '">' + (menu[index]) + '</span>';
                },
            },
            speed: 800,
            effect: 'fade',
            parallax: true,
            navigation: {
                nextEl: '.mil-revi-next',
                prevEl: '.mil-revi-prev',
            },
        })

        /***************************
    
        infinite slider
    
        ***************************/
        var swiper = new Swiper('.mil-infinite-show', {
            slidesPerView: 2,
            spaceBetween: 30,
            speed: 5000,
            autoplay: true,
            autoplay: {
                delay: 0,
            },
            loop: true,
            freeMode: true,
            breakpoints: {
                992: {
                    slidesPerView: 4,
                },
            },
        });

        /***************************
    
        portfolio slider
    
        ***************************/
        var swiper = new Swiper('.mil-portfolio-slider', {
            slidesPerView: 1,
            spaceBetween: 0,
            speed: 800,
            parallax: true,
            mousewheel: {
                enable: true
            },
            navigation: {
                nextEl: '.mil-portfolio-next',
                prevEl: '.mil-portfolio-prev',
            },
            pagination: {
                el: '.swiper-portfolio-pagination',
                type: 'fraction',
            },
        });
        /***************************
    
        1 item slider
    
        ***************************/
        var swiper = new Swiper('.mil-1-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            speed: 800,
            parallax: true,
            navigation: {
                nextEl: '.mil-portfolio-next',
                prevEl: '.mil-portfolio-prev',
            },
            pagination: {
                el: '.swiper-portfolio-pagination',
                type: 'fraction',
            },
        });
        /***************************
    
        2 item slider
    
        ***************************/
        var swiper = new Swiper('.mil-2-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            speed: 800,
            parallax: true,
            navigation: {
                nextEl: '.mil-portfolio-next',
                prevEl: '.mil-portfolio-prev',
            },
            pagination: {
                el: '.swiper-portfolio-pagination',
                type: 'fraction',
            },
            breakpoints: {
                992: {
                    slidesPerView: 2,
                },
            },
        });

        /*----------------------------------------------------------
        ------------------------------------------------------------
    
        REINIT
    
        ------------------------------------------------------------
        ----------------------------------------------------------*/
        document.addEventListener("swup:contentReplaced", function () {

            $('html, body').animate({
                scrollTop: 0,
            }, 0);

            gsap.to('.mil-progress', {
                height: 0,
                ease: 'sine',
                onComplete: () => {
                    ScrollTrigger.refresh()
                },
            });
            /***************************
    
             menu
    
            ***************************/
            $('.mil-menu-btn').removeClass('mil-active');
            $('.mil-menu').removeClass('mil-active');
            $('.mil-menu-frame').removeClass('mil-active');
            /***************************
    
            append
    
            ***************************/
            $(document).ready(function () {
                $(".mil-arrow-place .mil-arrow, .mil-animation .mil-dodecahedron, .mil-current-page a").remove();
                $(".mil-arrow-place").each(function () {
                    $(".mil-hidden-elements .mil-arrow").clone().appendTo($(this));
                });
                $(".mil-animation").each(function () {
                    $(".mil-hidden-elements .mil-dodecahedron").clone().appendTo($(this));
                });
                $(".mil-lines-place").each(function () {
                    if (!$(this).find(".mil-lines").length) {
                        $(".mil-hidden-elements .mil-lines").clone().appendTo($(this));
                    }
                });
                $(".mil-main-menu ul li.mil-active > a").clone().appendTo(".mil-current-page");
            });
            /***************************
    
            accordion
    
            ***************************/

            let groups = gsap.utils.toArray(".mil-accordion-group");
            let menus = gsap.utils.toArray(".mil-accordion-menu");
            let menuToggles = groups.map(createAnimation);

            menus.forEach((menu) => {
                menu.addEventListener("click", () => toggleMenu(menu));
            });

            function toggleMenu(clickedMenu) {
                menuToggles.forEach((toggleFn) => toggleFn(clickedMenu));
            }

            function createAnimation(element) {
                let menu = element.querySelector(".mil-accordion-menu");
                let box = element.querySelector(".mil-accordion-content");
                let symbol = element.querySelector(".mil-symbol");
                let minusElement = element.querySelector(".mil-minus");
                let plusElement = element.querySelector(".mil-plus");

                gsap.set(box, {
                    height: "auto",
                });

                let animation = gsap
                    .timeline()
                    .from(box, {
                        height: 0,
                        duration: 0.4,
                        ease: "sine"
                    })
                    .from(minusElement, {
                        duration: 0.4,
                        autoAlpha: 0,
                        ease: "none",
                    }, 0)
                    .to(plusElement, {
                        duration: 0.4,
                        autoAlpha: 0,
                        ease: "none",
                    }, 0)
                    .to(symbol, {
                        background: accent,
                        ease: "none",
                    }, 0)
                    .reverse();

                return function (clickedMenu) {
                    if (clickedMenu === menu) {
                        animation.reversed(!animation.reversed());
                    } else {
                        animation.reverse();
                    }
                };
            }

            /***************************
    
            cursor
    
            ***************************/

            $('.mil-drag, .mil-more, .mil-choose').mouseover(function () {
                gsap.to($(cursor), .2, {
                    width: 90,
                    height: 90,
                    opacity: 1,
                    ease: 'sine',
                });
            });

            $('.mil-drag, .mil-more, .mil-choose').mouseleave(function () {
                gsap.to($(cursor), .2, {
                    width: 20,
                    height: 20,
                    opacity: .1,
                    ease: 'sine',
                });
            });

            $('.mil-accent-cursor').mouseover(function () {
                gsap.to($(cursor), .2, {
                    background: accent,
                    ease: 'sine',
                });
                $(cursor).addClass('mil-accent');
            });

            $('.mil-accent-cursor').mouseleave(function () {
                gsap.to($(cursor), .2, {
                    background: dark,
                    ease: 'sine',
                });
                $(cursor).removeClass('mil-accent');
            });

            $('.mil-drag').mouseover(function () {
                gsap.to($('.mil-ball .mil-icon-1'), .2, {
                    scale: '1',
                    ease: 'sine',
                });
            });

            $('.mil-drag').mouseleave(function () {
                gsap.to($('.mil-ball .mil-icon-1'), .2, {
                    scale: '0',
                    ease: 'sine',
                });
            });

            $('.mil-more').mouseover(function () {
                gsap.to($('.mil-ball .mil-more-text'), .2, {
                    scale: '1',
                    ease: 'sine',
                });
            });

            $('.mil-more').mouseleave(function () {
                gsap.to($('.mil-ball .mil-more-text'), .2, {
                    scale: '0',
                    ease: 'sine',
                });
            });

            $('.mil-choose').mouseover(function () {
                gsap.to($('.mil-ball .mil-choose-text'), .2, {
                    scale: '1',
                    ease: 'sine',
                });
            });

            $('.mil-choose').mouseleave(function () {
                gsap.to($('.mil-ball .mil-choose-text'), .2, {
                    scale: '0',
                    ease: 'sine',
                });
            });

            $('a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input , textarea, .mil-accordion-menu').mouseover(function () {
                gsap.to($(cursor), .2, {
                    scale: 0,
                    ease: 'sine',
                });
                gsap.to($('.mil-ball svg'), .2, {
                    scale: 0,
                });
            });

            $('a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input, textarea, .mil-accordion-menu').mouseleave(function () {
                gsap.to($(cursor), .2, {
                    scale: 1,
                    ease: 'sine',
                });

                gsap.to($('.mil-ball svg'), .2, {
                    scale: 1,
                });
            });

            $('body').mousedown(function () {
                gsap.to($(cursor), .2, {
                    scale: .1,
                    ease: 'sine',
                });
            });
            $('body').mouseup(function () {
                gsap.to($(cursor), .2, {
                    scale: 1,
                    ease: 'sine',
                });
            });
            /***************************
    
            main menu
    
            ***************************/
            $('.mil-has-children a').on('click', function () {
                $('.mil-has-children ul').removeClass('mil-active');
                $('.mil-has-children a').removeClass('mil-active');
                $(this).toggleClass('mil-active');
                $(this).next().toggleClass('mil-active');
            });
            /***************************
    
            scroll animations
    
            ***************************/

            const appearance = document.querySelectorAll(".mil-up");

            appearance.forEach((section) => {
                gsap.fromTo(section, {
                    opacity: 0,
                    y: 40,
                    scale: .98,
                    ease: 'sine',

                }, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: .4,
                    scrollTrigger: {
                        trigger: section,
                        toggleActions: 'play none none reverse',
                    }
                });
            });

            const scaleImage = document.querySelectorAll(".mil-scale");

            scaleImage.forEach((section) => {
                var value1 = $(section).data("value-1");
                var value2 = $(section).data("value-2");
                gsap.fromTo(section, {
                    ease: 'sine',
                    scale: value1,

                }, {
                    scale: value2,
                    scrollTrigger: {
                        trigger: section,
                        scrub: true,
                        toggleActions: 'play none none reverse',
                    }
                });
            });

            const parallaxImage = document.querySelectorAll(".mil-parallax");


            if ($(window).width() > 960) {
                parallaxImage.forEach((section) => {
                    var value1 = $(section).data("value-1");
                    var value2 = $(section).data("value-2");
                    gsap.fromTo(section, {
                        ease: 'sine',
                        y: value1,

                    }, {
                        y: value2,
                        scrollTrigger: {
                            trigger: section,
                            scrub: true,
                            toggleActions: 'play none none reverse',
                        }
                    });
                });
            }

            const rotate = document.querySelectorAll(".mil-rotate");

            rotate.forEach((section) => {
                var value = $(section).data("value");
                gsap.fromTo(section, {
                    ease: 'sine',
                    rotate: 0,

                }, {
                    rotate: value,
                    scrollTrigger: {
                        trigger: section,
                        scrub: true,
                        toggleActions: 'play none none reverse',
                    }
                });
            });
            /***************************

            reviews slider

            ***************************/

            var menu = ['<div class="mil-custom-dot mil-slide-1"></div>', '<div class="mil-custom-dot mil-slide-2"></div>', '<div class="mil-custom-dot mil-slide-3"></div>', '<div class="mil-custom-dot mil-slide-4"></div>', '<div class="mil-custom-dot mil-slide-5"></div>', '<div class="mil-custom-dot mil-slide-6"></div>', '<div class="mil-custom-dot mil-slide-7"></div>']
            var mySwiper = new Swiper('.mil-reviews-slider', {
                // If we need pagination
                pagination: {
                    el: '.mil-revi-pagination',
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<span class="' + className + '">' + (menu[index]) + '</span>';
                    },
                },
                speed: 800,
                effect: 'fade',
                parallax: true,
                navigation: {
                    nextEl: '.mil-revi-next',
                    prevEl: '.mil-revi-prev',
                },
            })

            /***************************
    
            infinite slider
    
            ***************************/
            var swiper = new Swiper('.mil-infinite-show', {
                slidesPerView: 2,
                spaceBetween: 30,
                speed: 5000,
                autoplay: true,
                autoplay: {
                    delay: 0,
                },
                loop: true,
                freeMode: true,
                breakpoints: {
                    992: {
                        slidesPerView: 4,
                    },
                },
            });

            /***************************
    
            portfolio slider
    
            ***************************/
            var swiper = new Swiper('.mil-portfolio-slider', {
                slidesPerView: 1,
                spaceBetween: 0,
                speed: 800,
                parallax: true,
                mousewheel: {
                    enable: true
                },
                navigation: {
                    nextEl: '.mil-portfolio-next',
                    prevEl: '.mil-portfolio-prev',
                },
                pagination: {
                    el: '.swiper-portfolio-pagination',
                    type: 'fraction',
                },
            });
            /***************************
    
            1 item slider
    
            ***************************/
            var swiper = new Swiper('.mil-1-slider', {
                slidesPerView: 1,
                spaceBetween: 30,
                speed: 800,
                parallax: true,
                navigation: {
                    nextEl: '.mil-portfolio-next',
                    prevEl: '.mil-portfolio-prev',
                },
                pagination: {
                    el: '.swiper-portfolio-pagination',
                    type: 'fraction',
                },
            });
            /***************************
    
            2 item slider
    
            ***************************/
            var swiper = new Swiper('.mil-2-slider', {
                slidesPerView: 1,
                spaceBetween: 30,
                speed: 800,
                parallax: true,
                navigation: {
                    nextEl: '.mil-portfolio-next',
                    prevEl: '.mil-portfolio-prev',
                },
                pagination: {
                    el: '.swiper-portfolio-pagination',
                    type: 'fraction',
                },
                breakpoints: {
                    992: {
                        slidesPerView: 2,
                    },
                },
            });

        });

    }); // End of waitForReactDOM callback

}); // End of jQuery ready
