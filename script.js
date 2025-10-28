/**
 * site-optimized.js
 * نسخة مُنقّحة من main.js + inline scripts
 * - واحد IIFE لحماية النطاق العام
 * - تعريف animateOnScrollObserver قبل الاستخدام
 * - lazy loading مُحسّن + placeholder صالح
 * - تحسينات على scroll (rAF) و passive listeners
 * - تجنّب تكرار متغيرات و listeners
 */

(function () {
  "use strict";

  /* ---------------------------
   *  Helpers
   * --------------------------- */
  const safeQuery = (selector, ctx = document) => ctx.querySelector(selector);
  const safeQueryAll = (selector, ctx = document) =>
    Array.prototype.slice.call(ctx.querySelectorAll(selector || "") || []);

  const noop = () => {};

  /* Valid tiny SVG placeholder (base64) to avoid ERR_INVALID_URL */
  const VALID_SVG_PLACEHOLDER =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWUiLz48L3N2Zz4=";

  /* Utility to safe-set innerText/HTML if element exists */
  const safeSetText = (selectorOrEl, text) => {
    const el =
      typeof selectorOrEl === "string" ? safeQuery(selectorOrEl) : selectorOrEl;
    if (el) el.textContent = text;
  };

  /* ---------------------------
   *  animateOnScrollObserver (defined once)
   *  - adds class 'aos-animate' when visible
   *  - unobserves after animate (one-time)
   * --------------------------- */
  const animateOnScrollObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const t = entry.target;
                t.classList.add("aos-animate");
                try {
                  obs.unobserve(t);
                } catch (e) {
                  /* ignore */
                }
              }
            });
          },
          { threshold: 0.1 }
        )
      : null;

  /* ---------------------------
   *  Lazy loading images using IntersectionObserver
   *  - uses data-src pattern and valid placeholder
   * --------------------------- */
  function initLazyLoading() {
    if (!("IntersectionObserver" in window)) return;

    const lazyImages = safeQueryAll('img[loading="lazy"]');
    if (!lazyImages.length) return;

    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          if (img.getAttribute("data-loaded") === "true") {
            observer.unobserve(img);
            return;
          }

          // set actual src from data-src or keep current src
          const dataSrc = img.getAttribute("data-src");
          if (dataSrc) img.src = dataSrc;

          img.onload = function () {
            try {
              img.setAttribute("data-loaded", "true");
              img.removeAttribute("data-src");
            } catch (e) {}
          };

          img.onerror = function () {
            console.error("Error loading image:", img.src);
            img.setAttribute("data-loaded", "error");
          };

          observer.unobserve(img);
        });
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    lazyImages.forEach((img) => {
      // preserve existing data-src if present, otherwise set it
      if (!img.hasAttribute("data-src")) {
        img.setAttribute("data-src", img.src || "");
      }
      // set a valid tiny placeholder to avoid ERR_INVALID_URL
      if (!img.src || img.src.trim() === "") {
        img.src = VALID_SVG_PLACEHOLDER;
      }
      io.observe(img);
    });
  }

  /* ---------------------------
   *  Hero image slider (safe init)
   * --------------------------- */
  function initHeroImageSlider() {
    const slider = safeQuery("#heroImageSlider");
    if (!slider) return;

    const images = slider.querySelectorAll(".heroBannerImage");
    if (!images || images.length < 2) return;

    let currentIndex = 0;
    const slideIntervalMs = 7000;
    let slideTimer = null;

    const showImage = (index) => {
      images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
        img.classList.toggle("fadeIn", i === index);
      });
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    };

    const start = () => {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, slideIntervalMs);
    };
    const stop = () => {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
    };

    slider.addEventListener("mouseenter", stop, { passive: true });
    slider.addEventListener("mouseleave", start, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    showImage(0);
    start();
  }

  /* ---------------------------
   *  Header behavior + Back-to-Top (single unified logic)
   *  - uses rAF to avoid layout thrash
   * --------------------------- */
  function initHeaderAndBackToTop() {
    const header = safeQuery("#header");
    const navMenu = safeQuery("#mainNav");
    const navLinks = safeQueryAll("[data-nav-link]");
    const backToTopBtn = safeQuery("#backToTop");

    if (!header) return;

    let lastScroll = 0;
    let ticking = false;
    const headerHeight = header.offsetHeight || 80;

    const updateHeader = () => {
      const currentScroll = window.pageYOffset || window.scrollY || 0;

      // scrolled class
      header.classList.toggle("scrolled", currentScroll > 50);

      // hide/show header only if mobile menu not open
      if (!navMenu || !navMenu.classList.contains("active")) {
        if (currentScroll > lastScroll && currentScroll > headerHeight) {
          header.classList.add("hide");
        } else {
          header.classList.remove("hide");
        }
      }

      // back-to-top visibility
      if (backToTopBtn) {
        backToTopBtn.classList.toggle("show", currentScroll > 300);
      }

      lastScroll = Math.max(0, currentScroll);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateHeader();

    // Back to top click (if exists)
    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });

        const hdr = document.querySelector("header");
        if (hdr) {
          hdr.setAttribute("tabindex", "-1");
          hdr.focus({ preventScroll: true });
        }
      });
    }

    // Mobile menu toggle (keeps body scroll locked)
    const mobileMenuBtn = safeQuery("#mobileMenuBtn");
    if (mobileMenuBtn && navMenu) {
      const toggleMobileMenu = (show) => {
        navMenu.classList.toggle("active", show);
        mobileMenuBtn.setAttribute("aria-expanded", show ? "true" : "false");
        mobileMenuBtn.classList.toggle("active", show);
        document.body.style.overflow = show ? "hidden" : "";
      };

      mobileMenuBtn.addEventListener("click", () => {
        const isExpanded =
          mobileMenuBtn.getAttribute("aria-expanded") === "true";
        toggleMobileMenu(!isExpanded);
      });

      // close on outside click
      document.addEventListener(
        "click",
        (e) => {
          const isInside =
            navMenu.contains(e.target) || mobileMenuBtn.contains(e.target);
          if (!isInside && navMenu.classList.contains("active"))
            toggleMobileMenu(false);
        },
        { passive: true }
      );

      navLinks.forEach((link) => {
        link.addEventListener(
          "click",
          () => {
            if (window.innerWidth <= 992) toggleMobileMenu(false);
          },
          { passive: true }
        );
      });
    }
  }

  /* ---------------------------
   *  Smooth scrolling for anchors & recommendation buttons
   * --------------------------- */
  function initSmoothScrolls() {
    // recommendation buttons (href="#id")
    safeQueryAll(".recommendation-button").forEach((btn) => {
      btn.addEventListener(
        "click",
        function (e) {
          e.preventDefault();
          const href = this.getAttribute("href") || "";
          const targetId = href.startsWith("#") ? href.substring(1) : href;
          const target = document.getElementById(targetId);
          if (target)
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
        },
        { passive: true }
      );
    });

    // other anchor links
    safeQueryAll('a[href^="#"]:not(.recommendation-button)').forEach(
      (anchor) => {
        anchor.addEventListener(
          "click",
          function (e) {
            const targetId = this.getAttribute("href");
            if (!targetId || targetId === "#") return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              // compute top with header offset safely (avoids forced reflow in loops)
              const top = Math.max(
                0,
                targetEl.getBoundingClientRect().top + window.scrollY - 80
              );
              window.scrollTo({ top, behavior: "smooth" });
            }
          },
          { passive: true }
        );
      }
    );
  }

  /* ---------------------------
   *  Active nav link on scroll (optimized)
   * --------------------------- */
  function initActiveNavOnScroll() {
    const sections = safeQueryAll("section[id]");
    const navLinks = safeQueryAll("[data-nav-link]");

    if (!sections.length || !navLinks.length) return;

    let ticking = false;

    const setActive = () => {
      const scrollPos = window.scrollY + 100;
      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute("id");
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`
            );
          });
        }
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(setActive);
        ticking = true;
      }
    };

    window.addEventListener("load", setActive);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------
   *  CTA countdown timer (robust)
   * --------------------------- */
  function updateCountdown() {
    const countdownContainer = safeQuery(".cta-timer");
    if (!countdownContainer) return;

    const targetDateStr = countdownContainer.getAttribute(
      "data-countdown-date"
    );
    if (!targetDateStr) return;

    const now = Date.now();
    let countDownDate = new Date(targetDateStr).getTime();

    const fourDaysMs = 4 * 24 * 60 * 60 * 1000;

    if (isNaN(countDownDate) || countDownDate < now) {
      const newDate = new Date(now + fourDaysMs);
      countdownContainer.setAttribute(
        "data-countdown-date",
        newDate.toISOString()
      );
      return;
    }

    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const elDays = safeQuery("#days");
    const elHours = safeQuery("#hours");
    const elMinutes = safeQuery("#minutes");
    const elSeconds = safeQuery("#seconds");
    if (elDays) elDays.innerHTML = days.toString().padStart(2, "0");
    if (elHours) elHours.innerHTML = hours.toString().padStart(2, "0");
    if (elMinutes) elMinutes.innerHTML = minutes.toString().padStart(2, "0");
    if (elSeconds) elSeconds.innerHTML = seconds.toString().padStart(2, "0");

    if (days < 1) {
      const countdown = safeQuery(".countdown");
      if (countdown) countdown.classList.add("animate-pulse");
    }
  }

  /* ---------------------------
   *  Pricing cards hover (non-blocking)
   * --------------------------- */
  function initPricingCardHover() {
    const pricingCards = safeQueryAll(".pricing-card");
    if (!pricingCards.length) return;

    pricingCards.forEach((card) => {
      const orderButton = card.querySelector(".order-now-btn");

      card.addEventListener(
        "mouseenter",
        function (e) {
          if (orderButton && e.target === orderButton) return;

          if (!card.classList.contains("featured")) {
            pricingCards.forEach((otherCard) => {
              if (!otherCard.classList.contains("featured")) {
                otherCard.style.transform = "scale(0.98)";
                otherCard.style.opacity = "0.9";
              }
            });
            card.style.transform = "translateY(-10px)";
            card.style.opacity = "1";
          }
        },
        { passive: true }
      );

      card.addEventListener(
        "mouseleave",
        function () {
          if (!card.classList.contains("featured")) {
            pricingCards.forEach((otherCard) => {
              if (!otherCard.classList.contains("featured")) {
                otherCard.style.transform = "scale(1)";
                otherCard.style.opacity = "1";
              }
            });
            card.style.transform = "";
            card.style.opacity = "";
          }
        },
        { passive: true }
      );
    });
  }

  /* ---------------------------
   *  Accordion (accessible, delegated)
   * --------------------------- */
  function initAccordion() {
    const accordion = safeQuery(".accordion");
    if (!accordion) return;

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

    accordion.addEventListener("click", (e) => {
      const header = e.target.closest(".accordion-header");
      if (!header || !accordion.contains(header)) return;
      e.preventDefault();
      const item = header.parentElement;
      if (!item || !item.classList.contains("accordion-item")) return;
      toggleItem(item);
    });

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

    accordion.querySelectorAll(".accordion-item").forEach((item) => {
      const header = item.querySelector(".accordion-header");
      const panel = item.querySelector(".accordion-panel");
      if (!header || !panel) return;
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

    // Close all when clicking outside
    document.addEventListener(
      "click",
      (e) => {
        if (!accordion.contains(e.target)) {
          accordion
            .querySelectorAll(".accordion-item")
            .forEach((it) => closePanel(it));
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------
   *  AOS fallback (if library not present uses our observer)
   * --------------------------- */
  function initAosFallback() {
    const animatedElements = safeQueryAll("[data-aos]");
    if (!animatedElements.length) return;

    // If AOS library is present, it already handles it
    if (typeof AOS !== "undefined") {
      try {
        AOS.init({
          duration: 800,
          easing: "ease-in-out",
          once: true,
          offset: 100,
        });
      } catch (e) {}
      return;
    }

    // Use our animateOnScrollObserver if available
    if (animateOnScrollObserver) {
      animatedElements.forEach((el) => {
        el.classList.add("aos-init");
        if (el.dataset.aosDelay)
          el.style.transitionDelay = `${el.dataset.aosDelay}ms`;
        if (el.dataset.aosDuration)
          el.style.transitionDuration = `${el.dataset.aosDuration}ms`;
        animateOnScrollObserver.observe(el);
      });
    } else {
      // If no observer support, just reveal elements
      animatedElements.forEach((el) => el.classList.add("aos-animate"));
    }
  }

  /* ---------------------------
   *  Outbound link tracking (safe)
   * --------------------------- */
  (function initOutboundTracking() {
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
      Object.keys(trackingParams).forEach((k) => {
        if (trackingParams[k] === null) delete trackingParams[k];
      });
      return trackingParams;
    }

    function appendTrackingParams(url, params) {
      try {
        const urlObj = new URL(url);
        if (Object.keys(params).length === 0) {
          params = {
            utm_source: "landing",
            utm_medium: "cta",
            utm_campaign: "iptv_sa",
          };
        }
        Object.keys(params).forEach((key) =>
          urlObj.searchParams.set(key, params[key])
        );
        return urlObj.toString();
      } catch (e) {
        return url;
      }
    }

    document.addEventListener("DOMContentLoaded", function () {
      const params = getUrlParams();
      const outboundLinks = safeQueryAll("a[data-out]");
      outboundLinks.forEach((link) => {
        const originalHref = link.getAttribute("href");
        if (!originalHref || !originalHref.includes("rqgstore.com")) return;
        try {
          const updated = appendTrackingParams(originalHref, params);
          link.setAttribute("href", updated);
          const currentRel = link.getAttribute("rel") || "";
          if (!currentRel.includes("noopener"))
            link.setAttribute("rel", (currentRel + " noopener").trim());
        } catch (e) {
          console.warn("Failed to update tracking for link:", originalHref, e);
        }
      });
    });
  })();

  /* ---------------------------
   *  Back-to-top height manager (keeps CSS var correct)
   * --------------------------- */
  (function initBackToTopHeight() {
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

    window.addEventListener("load", updateBackToTopHeight, { passive: true });
    window.addEventListener("resize", updateBackToTopHeight, { passive: true });

    const backBtn = document.getElementById("backToTop");
    if (backBtn && "ResizeObserver" in window) {
      try {
        const ro = new ResizeObserver(updateBackToTopHeight);
        ro.observe(backBtn);
      } catch (e) {}
    }

    if ("MutationObserver" in window) {
      try {
        const mo = new MutationObserver(() => updateBackToTopHeight());
        mo.observe(document.body, { childList: true, subtree: true });
      } catch (e) {}
    }

    updateBackToTopHeight();
  })();

  /* ---------------------------
   *  Init on DOMContentLoaded
   * --------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    // AOS library init or fallback
    initAosFallback();

    // Lazy loading & hero slider
    initLazyLoading();
    initHeroImageSlider();

    // Header, nav, back-to-top
    initHeaderAndBackToTop();

    // Smooth scrolls
    initSmoothScrolls();

    // Active link
    initActiveNavOnScroll();

    // Pricing cards hover
    initPricingCardHover();

    // Accordion
    initAccordion();

    // Countdown initial setup (if needed)
    const countdownContainer = safeQuery(".cta-timer");
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
  });

  /* ---------------------------
   *  Init things that need window.load
   * --------------------------- */
  window.addEventListener(
    "load",
    () => {
      // kickoff countdown updates
      updateCountdown();
      try {
        setInterval(updateCountdown, 1000);
      } catch (e) {}

      // small nav item entrance animation - safe & one-time
      const navLinks = safeQueryAll("[data-nav-link]");
      navLinks.forEach((link, index) => {
        try {
          link.style.opacity = "0";
          link.style.transform = "translateY(10px)";
          link.style.transition = `opacity 0.3s ease ${
            index * 0.1
          }s, transform 0.3s ease ${index * 0.1}s`;
          // trigger reflow in a safe way
          void link.offsetWidth;
          link.style.opacity = "1";
          link.style.transform = "translateY(0)";
        } catch (e) {}
      });
    },
    { passive: true }
  );

  /* ---------------------------
   *  End of file
   * --------------------------- */
})();
