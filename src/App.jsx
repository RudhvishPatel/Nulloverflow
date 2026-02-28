import { useState, useEffect, useRef } from 'react'
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Services from './pages/Services.jsx'
import Personal from './pages/Personal.jsx'
import Contact from './pages/Contact.jsx'
import Preloader from './component/Preloader/Preloader.jsx'

/**
 * Re-initializes jQuery/GSAP animations after React Router page transitions.
 * This replaces what Swup's contentReplaced event used to do — cloning hidden
 * elements (arrows, dodecahedrons, lines) and setting up ScrollTrigger animations.
 */
function reinitAnimations() {
  if (typeof gsap === 'undefined' || typeof jQuery === 'undefined') return;

  const $ = jQuery;

  // Kill existing ScrollTriggers to avoid duplicates and memory leaks
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  // Re-clone arrows into .mil-arrow-place elements
  $(".mil-arrow-place .mil-arrow").remove();
  $(".mil-arrow-place").each(function () {
    if ($(".mil-hidden-elements .mil-arrow").length) {
      $(".mil-hidden-elements .mil-arrow").clone().appendTo($(this));
    }
  });

  // Re-clone dodecahedrons into .mil-animation elements
  $(".mil-animation").each(function () {
    if (!$(this).find(".mil-dodecahedron").length && $(".mil-hidden-elements .mil-dodecahedron").length) {
      $(".mil-hidden-elements .mil-dodecahedron").clone().appendTo($(this));
    }
  });

  // Re-clone SVG lines into .mil-lines-place elements
  $(".mil-lines-place").each(function () {
    if (!$(this).find(".mil-lines").length && $(".mil-hidden-elements .mil-lines").length) {
      $(".mil-hidden-elements .mil-lines").clone().appendTo($(this));
    }
  });

  // Re-init progress bar
  gsap.to('.mil-progress', {
    height: '100%',
    ease: 'sine',
    scrollTrigger: { scrub: 0.3 }
  });

  // Re-init scroll appearance animations (.mil-up)
  document.querySelectorAll(".mil-up").forEach((section) => {
    gsap.fromTo(section, {
      opacity: 0,
      y: 40,
      scale: 0.98,
      ease: 'sine',
    }, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.4,
      scrollTrigger: {
        trigger: section,
        toggleActions: 'play none none reverse',
      }
    });
  });

  // Re-init scale animations (.mil-scale)
  document.querySelectorAll(".mil-scale").forEach((section) => {
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

  // Re-init parallax animations (.mil-parallax) - desktop only
  if ($(window).width() > 960) {
    document.querySelectorAll(".mil-parallax").forEach((section) => {
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

  // Re-init rotate animations (.mil-rotate)
  document.querySelectorAll(".mil-rotate").forEach((section) => {
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

  // Re-init Swiper sliders if elements exist
  if ($('.mil-reviews-slider').length && typeof Swiper !== 'undefined') {
    new Swiper('.mil-reviews-slider', {
      pagination: {
        el: '.mil-revi-pagination',
        clickable: true,
      },
      speed: 800,
      effect: 'fade',
      parallax: true,
      navigation: {
        nextEl: '.mil-revi-next',
        prevEl: '.mil-revi-prev',
      },
    });
  }

  if ($('.mil-infinite-show').length && typeof Swiper !== 'undefined') {
    new Swiper('.mil-infinite-show', {
      slidesPerView: 2,
      spaceBetween: 30,
      speed: 5000,
      autoplay: { delay: 0 },
      loop: true,
      freeMode: true,
      breakpoints: { 992: { slidesPerView: 4 } },
    });
  }
}

/**
 * Handles route changes: scrolls to top and re-initializes animations.
 * Skips the first render (main.js handles initial setup).
 */
function RouteChangeHandler() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Scroll to top on navigation
    window.scrollTo(0, 0);

    // Wait for React to render the new page DOM before re-initializing
    const timer = setTimeout(() => {
      reinitAnimations();
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <BrowserRouter>
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      <RouteChangeHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/services" element={<Services />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
