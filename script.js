/**
 * Combines all functionality from main.js and inline scripts
 */

// Lazy load images using Intersection Observer for better cross-browser support
function initLazyLoading() {
  // Skip if IntersectionObserver is not supported
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const lazyImages = [].slice.call(document.querySelectorAll('img[loading="lazy"]'));
  
  // Skip if no lazy images found
  if (lazyImages.length === 0) return;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        // If the image is already loaded, skip
        if (img.getAttribute('data-loaded') === 'true') {
          observer.unobserve(img);
          return;
        }
        
        // Load the image
        img.src = img.getAttribute('data-src') || img.src;
        
        // Handle image load/error
        img.onload = function() {
          img.setAttribute('data-loaded', 'true');
          img.removeAttribute('data-src');
        };
        
        img.onerror = function() {
          console.error('Error loading image:', img.src);
          img.setAttribute('data-loaded', 'error');
        };
        
        // Stop observing this image
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px', // Start loading images 200px before they enter the viewport
    threshold: 0.01
  });

  // Observe all lazy images
  lazyImages.forEach(img => {
    // Store the original src in data-src if not already done
    if (!img.hasAttribute('data-src')) {
      img.setAttribute('data-src', img.src);
      // Set a placeholder or blank src
      img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg=';
    }
    imageObserver.observe(img);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }

  // Hero Image Slider Functionality
  const initHeroImageSlider = () => {
    const sliderContainer = document.getElementById("heroImageSlider");
    if (!sliderContainer) return;

    const images = sliderContainer.querySelectorAll(".heroBannerImage");
    if (images.length < 2) return;

    let currentIndex = 0;
    const slideInterval = 7000; // 7 seconds between slides

    const showImage = (index) => {
      images.forEach((img, i) => {
        img.classList.remove("active", "fadeIn");
        if (i === index) {
          img.classList.add("active", "fadeIn");
        }
      });
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    };

    // Start the slideshow
    let slideTimer = setInterval(nextSlide, slideInterval);

    // Pause slideshow on hover
    sliderContainer.addEventListener("mouseenter", () => {
      clearInterval(slideTimer);
    });

    // Resume slideshow when mouse leaves
    sliderContainer.addEventListener("mouseleave", () => {
      slideTimer = setInterval(nextSlide, slideInterval);
    });

    // Pause slideshow when page is not visible (tab switching)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(slideTimer);
      } else {
        slideTimer = setInterval(nextSlide, slideInterval);
      }
    });

    // Initialize first slide
    showImage(0);
  };

  // Initialize lazy loading
  initLazyLoading();

  // Initialize hero image slider
  initHeroImageSlider();

  // Set current year in footer
  const currentYearElement = document.getElementById("current-year");
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Enhanced scroll functionality for recommendation buttons
  document.querySelectorAll(".recommendation-button").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    });
  });

  // Smooth scroll for other anchor links
  document
    .querySelectorAll('a[href^="#"]:not(.recommendation-button)')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        e.preventDefault();
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for fixed header
            behavior: "smooth",
          });
        }
      });
    });

  // Header and Navigation
  const header = document.getElementById("header");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const backToTopBtn = document.getElementById("backToTop");
  const ctaButton = document.getElementById("ctaButton");

  // Mobile Menu Toggle
  if (mobileMenuBtn && navMenu) {
    const toggleMobileMenu = (show) => {
      navMenu.classList.toggle("active", show);
      mobileMenuBtn.setAttribute("aria-expanded", show);
      mobileMenuBtn.classList.toggle("active", show);

      // Prevent body scroll when menu is open
      document.body.style.overflow = show ? "hidden" : "";
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        toggleMobileMenu(false);
      }
    };

    mobileMenuBtn.addEventListener("click", () => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      toggleMobileMenu(!isExpanded);
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      const isClickInside =
        navMenu.contains(e.target) || mobileMenuBtn.contains(e.target);
      if (!isClickInside && navMenu.classList.contains("active")) {
        toggleMobileMenu(false);
      }
    });

    // Close mobile menu when clicking on a nav link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 992) {
          toggleMobileMenu(false);
        }
      });
    });
  }

  // Header scroll effect
  if (header) {
    let lastScroll = 0;
    const headerHeight = header.offsetHeight;
    let ticking = false;

    const updateHeader = () => {
      const currentScroll = window.pageYOffset;

      // Add/remove scrolled class based on scroll position
      header.classList.toggle("scrolled", currentScroll > 50);

      // Only run the hide/show logic if not in mobile menu
      if (!navMenu || !navMenu.classList.contains("active")) {
        // Hide/show header on scroll
        if (currentScroll > lastScroll && currentScroll > headerHeight) {
          // Scrolling down
          header.classList.add("hide");
        } else {
          // Scrolling up
          header.classList.remove("hide");
        }
      }

      // Show/hide back to top button
      if (backToTopBtn) {
        backToTopBtn.classList.toggle("show", currentScroll > 300);
      }

      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateHeader(); // Initialize header state
  }

  // Back to top button
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // Focus on header for keyboard users
      const header = document.querySelector("header");
      if (header) {
        header.setAttribute("tabindex", "-1");
        header.focus();
      }
    });
  }

  // Set active navigation link based on scroll position
  const setActiveLink = () => {
    const scrollPosition = window.scrollY + 100;

    document.querySelectorAll("section[id]").forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${sectionId}`
          );
        });
      }
    });
  };

  // Run on load and scroll
  window.addEventListener("load", setActiveLink);
  window.addEventListener("scroll", setActiveLink, { passive: true });

  // CTA Button hover effect
  if (ctaButton) {
    const updateCtaHover = (isHovered) => {
      const icon = ctaButton.querySelector("i");
      if (icon) {
        icon.style.transform = isHovered ? "translateX(-5px)" : "translateX(0)";
      }
    };

    ctaButton.addEventListener("mouseenter", () => updateCtaHover(true));
    ctaButton.addEventListener("mouseleave", () => updateCtaHover(false));
    ctaButton.addEventListener("focus", () => updateCtaHover(true));
    ctaButton.addEventListener("blur", () => updateCtaHover(false));
  }

  // Add animation to nav items on page load
  if (navLinks.length > 0) {
    navLinks.forEach((link, index) => {
      link.style.opacity = "0";
      link.style.transform = "translateY(10px)";
      link.style.transition = `opacity 0.3s ease ${
        index * 0.1
      }s, transform 0.3s ease ${index * 0.1}s`;

      // Trigger reflow
      void link.offsetWidth;

      link.style.opacity = "1";
      link.style.transform = "translateY(0)";
    });
  }

  // Handle reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = "auto";
  }

  // Initialize accordion functionality (delegated, accessible, single-open)
  const accordion = document.querySelector(".accordion");
  if (accordion) {
    const closePanel = (item) => {
      const header = item.querySelector(".accordion-header");
      const panel = item.querySelector(".accordion-panel");
      if (!header || !panel) return;
      header.setAttribute("aria-expanded", "false");
      panel.style.maxHeight = null;
      item.classList.remove("active");
      const icon = header.querySelector(".fa-plus, .fa-minus");
      if (icon) {
        icon.classList.remove("fa-minus");
        icon.classList.add("fa-plus");
      }
    };

    const openPanel = (item) => {
      const header = item.querySelector(".accordion-header");
      const panel = item.querySelector(".accordion-panel");
      if (!header || !panel) return;
      // close others
      accordion.querySelectorAll(".accordion-item").forEach((other) => {
        if (other !== item) closePanel(other);
      });
      header.setAttribute("aria-expanded", "true");
      panel.style.maxHeight = panel.scrollHeight + "px";
      item.classList.add("active");
      const icon = header.querySelector(".fa-plus, .fa-minus");
      if (icon) {
        icon.classList.remove("fa-plus");
        icon.classList.add("fa-minus");
      }
    };

    const toggleItem = (item) => {
      const header = item.querySelector(".accordion-header");
      if (!header) return;
      const isExpanded = header.getAttribute("aria-expanded") === "true";
      if (isExpanded) closePanel(item);
      else openPanel(item);
    };

    // Click delegation: handle clicks on header or any child inside it (icons, spans)
    accordion.addEventListener("click", (e) => {
      const header = e.target.closest(".accordion-header");
      if (!header || !accordion.contains(header)) return;
      e.preventDefault();
      const item = header.parentElement;
      if (!item || !item.classList.contains("accordion-item")) return;
      toggleItem(item);
    });

    // Keyboard support: Enter and Space toggle when header is focused
    accordion.addEventListener("keydown", (e) => {
      const header = e.target.closest(".accordion-header");
      if (!header || !accordion.contains(header)) return;
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        const item = header.parentElement;
        if (!item) return;
        toggleItem(item);
      }
    });

    // Initialize according to existing aria-expanded attributes and ensure headers are focusable
    accordion.querySelectorAll(".accordion-item").forEach((item) => {
      const header = item.querySelector(".accordion-header");
      const panel = item.querySelector(".accordion-panel");
      if (!header || !panel) return;
      // ensure keyboard focus & role
      if (!header.hasAttribute("tabindex"))
        header.setAttribute("tabindex", "0");
      if (!header.hasAttribute("role")) header.setAttribute("role", "button");

      if (header.getAttribute("aria-expanded") === "true") {
        panel.style.maxHeight = panel.scrollHeight + "px";
        item.classList.add("active");
        const icon = header.querySelector(".fa-plus, .fa-minus");
        if (icon) {
          icon.classList.remove("fa-plus");
          icon.classList.add("fa-minus");
        }
      } else {
        panel.style.maxHeight = null;
        item.classList.remove("active");
        const icon = header.querySelector(".fa-plus, .fa-minus");
        if (icon) {
          icon.classList.remove("fa-minus");
          icon.classList.add("fa-plus");
        }
      }
    });
  }
  // Close all when clicking outside the accordion
  document.addEventListener("click", (e) => {
    // If the click target is not inside the accordion, close all panels
    if (!accordion.contains(e.target)) {
      accordion
        .querySelectorAll(".accordion-item")
        .forEach((it) => closePanel(it));
    }
  });

  // تحديد جميع العناصر التي تحتوي على سمة data-aos
  const animatedElements = document.querySelectorAll("[data-aos]");

  animatedElements.forEach((element) => {
    // إضافة الصنف الأساسي للتحريك
    element.classList.add("aos-init");

    // تعيين تأخير مخصص (إذا كان موجوداً)
    if (element.dataset.aosDelay) {
      element.style.transitionDelay = `${element.dataset.aosDelay}ms`;
    }

    // تعيين مدة مخصصة (إذا كانت موجودة)
    if (element.dataset.aosDuration) {
      element.style.transitionDuration = `${element.dataset.aosDuration}ms`;
    }

    // بدء مراقبة العنصر
    animateOnScrollObserver.observe(element);
  });
});

function updateCountdown() {
  const countdownContainer = document.querySelector(".cta-timer");
  if (!countdownContainer) return;

  const targetDateStr = countdownContainer.getAttribute("data-countdown-date");
  if (!targetDateStr) return;

  let countDownDate = new Date(targetDateStr).getTime();
  const now = Date.now();
  let distance = countDownDate - now;

  // عدد الميلي ثانية في 4 أيام
  const fourDaysMs = 4 * 24 * 60 * 60 * 1000;

  // ✅ لما التايمر يخلص، نرجع نعد من جديد لمدة 4 أيام
  if (distance < 0) {
    const newDate = new Date(now + fourDaysMs);
    countdownContainer.setAttribute(
      "data-countdown-date",
      newDate.toISOString()
    );
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").innerHTML = days.toString().padStart(2, "0");
  document.getElementById("hours").innerHTML = hours
    .toString()
    .padStart(2, "0");
  document.getElementById("minutes").innerHTML = minutes
    .toString()
    .padStart(2, "0");
  // عداد الثواني
  document.getElementById("seconds").innerHTML = seconds
    .toString()
    .padStart(2, "0");

  if (days < 1) {
    document.querySelector(".countdown").classList.add("animate-pulse");
  }
}

// Back to Top Button Functionality
const backToTopButton = document.getElementById("backToTop");

function toggleBackToTopButton() {
  if (window.pageYOffset > 300) {
    backToTopButton.classList.add("show");
  } else {
    backToTopButton.classList.remove("show");
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

window.addEventListener("scroll", toggleBackToTopButton);
backToTopButton.addEventListener("click", scrollToTop);

window.addEventListener("load", () => {
  // Initialize countdown timer with a 4-day countdown
  const countdownContainer = document.querySelector(".cta-timer");
  if (
    countdownContainer &&
    !countdownContainer.getAttribute("data-countdown-date")
  ) {
    const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
    const targetDate = new Date(Date.now() + fourDaysMs);
    countdownContainer.setAttribute(
      "data-countdown-date",
      targetDate.toISOString()
    );
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});

// Add hover effect to pricing cards
const pricingCards = document.querySelectorAll(".pricing-card");
pricingCards.forEach((card) => {
  const orderButton = card.querySelector(".order-now-btn");

  card.addEventListener("mouseenter", function (e) {
    // Do not trigger card hover effect if hovering over the button
    if (orderButton && e.target === orderButton) return;

    if (!this.classList.contains("featured")) {
      pricingCards.forEach((otherCard) => {
        if (!otherCard.classList.contains("featured")) {
          otherCard.style.transform = "scale(0.98)";
          otherCard.style.opacity = "0.9";
        }
      });
      this.style.transform = "translateY(-10px)";
      this.style.opacity = "1";
    }
  });

  card.addEventListener("mouseleave", function () {
    if (!this.classList.contains("featured")) {
      pricingCards.forEach((otherCard) => {
        if (!otherCard.classList.contains("featured")) {
          otherCard.style.transform = "scale(1)";
          otherCard.style.opacity = "1";
        }
      });
    }
  });
});



// Back to top button
(function () {
  function updateBackToTopHeight() {
    try {
      const backBtn = document.getElementById("backToTop");
      let backHeight = 0;
      if (backBtn) {
        const styles = window.getComputedStyle(backBtn);
        backHeight =
          backBtn.getBoundingClientRect().height ||
          parseFloat(styles.height) ||
          60;
      } else {
        backHeight = 60;
      }

      // If there's a cookie banner or bottom toolbar, add cushion
      const bannerSelectors = [
        ".cookie-banner",
        ".cookie-consent",
        "#cookieConsent",
        ".c-cookie-banner",
        ".cookie-notice",
      ];
      let bannerExtra = 0;
      for (const sel of bannerSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.height && rect.bottom >= window.innerHeight - 10) {
            bannerExtra = Math.max(bannerExtra, rect.height + 10);
          }
        }
      }

      const total = Math.ceil(backHeight + 12 + bannerExtra);
      document.documentElement.style.setProperty(
        "--back-to-top-height",
        total + "px"
      );
    } catch (e) {
      document.documentElement.style.setProperty(
        "--back-to-top-height",
        "72px"
      );
    }
  }

  window.addEventListener("load", updateBackToTopHeight, {
    passive: true,
  });
  window.addEventListener("resize", updateBackToTopHeight, {
    passive: true,
  });

  const backBtn = document.getElementById("backToTop");
  if (backBtn && "ResizeObserver" in window) {
    const ro = new ResizeObserver(updateBackToTopHeight);
    ro.observe(backBtn);
  }

  if ("MutationObserver" in window) {
    const mo = new MutationObserver(() => updateBackToTopHeight());
    mo.observe(document.body, { childList: true, subtree: true });
  }

  updateBackToTopHeight();
})();



// Outbound Link Tracking
(function () {
  // Function to get URL parameters
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const trackingParams = {
      gclid: params.get("gclid"),
      gbraid: params.get("gbraid"),
      wbraid: params.get("wbraid"),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_term: params.get("utm_term"),
      utm_content: params.get("utm_content"),
    };

    // Remove null values
    Object.keys(trackingParams).forEach((key) => {
      if (trackingParams[key] === null) {
        delete trackingParams[key];
      }
    });

    return trackingParams;
  }

  // Function to append parameters to URL
  function appendTrackingParams(url, params) {
    const urlObj = new URL(url);

    // If no tracking params found, add default UTM values
    if (Object.keys(params).length === 0) {
      params = {
        utm_source: "landing",
        utm_medium: "cta",
        utm_campaign: "iptv_sa",
      };
    }

    Object.keys(params).forEach((key) => {
      urlObj.searchParams.set(key, params[key]);
    });

    return urlObj.toString();
  }

  // Initialize tracking on DOM load
  document.addEventListener("DOMContentLoaded", function () {
    const trackingParams = getUrlParams();

    // Find all outbound links with data-out attribute
    const outboundLinks = document.querySelectorAll("a[data-out]");

    outboundLinks.forEach(function (link) {
      const originalHref = link.getAttribute("href");

      // Only process if it's a valid URL and points to rqgstore.com
      if (originalHref && originalHref.includes("rqgstore.com")) {
        try {
          const updatedUrl = appendTrackingParams(originalHref, trackingParams);
          link.setAttribute("href", updatedUrl);

          // Ensure rel="noopener" is set
          const currentRel = link.getAttribute("rel") || "";
          if (!currentRel.includes("noopener")) {
            link.setAttribute("rel", currentRel + " noopener");
          }
        } catch (e) {
          console.warn("Failed to update tracking for link:", originalHref, e);
        }
      }
    });
  });
})();
