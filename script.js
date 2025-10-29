!(function () {
  "use strict";
  const t = (t, e = document) => e.querySelector(t),
    e = (t, e = document) =>
      Array.prototype.slice.call(e.querySelectorAll(t || "") || []),
    n =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (t, e) => {
              t.forEach((t) => {
                if (t.isIntersecting) {
                  const n = t.target;
                  n.classList.add("aos-animate");
                  try {
                    e.unobserve(n);
                  } catch (t) {}
                }
              });
            },
            { threshold: 0.1 }
          )
        : null;
  function o() {
    const e = t(".cta-timer");
    if (!e) return;
    const n = e.getAttribute("data-countdown-date");
    if (!n) return;
    const o = Date.now();
    let a = new Date(n).getTime();
    if (isNaN(a) || a < o) {
      const t = new Date(o + 3456e5);
      return void e.setAttribute("data-countdown-date", t.toISOString());
    }
    const s = a - o,
      r = Math.floor(s / 864e5),
      i = Math.floor((s % 864e5) / 36e5),
      c = Math.floor((s % 36e5) / 6e4),
      d = Math.floor((s % 6e4) / 1e3),
      l = t("#days"),
      u = t("#hours"),
      f = t("#minutes"),
      m = t("#seconds");
    if (
      (l && (l.innerHTML = r.toString().padStart(2, "0")),
      u && (u.innerHTML = i.toString().padStart(2, "0")),
      f && (f.innerHTML = c.toString().padStart(2, "0")),
      m && (m.innerHTML = d.toString().padStart(2, "0")),
      r < 1)
    ) {
      const e = t(".countdown");
      e && e.classList.add("animate-pulse");
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    const t = (function () {
      const t = new URLSearchParams(window.location.search),
        e = {
          gclid: t.get("gclid"),
          gbraid: t.get("gbraid"),
          wbraid: t.get("wbraid"),
          utm_source: t.get("utm_source"),
          utm_medium: t.get("utm_medium"),
          utm_campaign: t.get("utm_campaign"),
          utm_term: t.get("utm_term"),
          utm_content: t.get("utm_content"),
        };
      return (
        Object.keys(e).forEach((t) => {
          null === e[t] && delete e[t];
        }),
        e
      );
    })();
    e("a[data-out]").forEach((e) => {
      const n = e.getAttribute("href");
      if (n && n.includes("rqgstore.com"))
        try {
          const o = (function (t, e) {
            try {
              const n = new URL(t);
              return (
                0 === Object.keys(e).length &&
                  (e = {
                    utm_source: "landing",
                    utm_medium: "cta",
                    utm_campaign: "iptv_sa",
                  }),
                Object.keys(e).forEach((t) => n.searchParams.set(t, e[t])),
                n.toString()
              );
            } catch (e) {
              return t;
            }
          })(n, t);
          e.setAttribute("href", o);
          const a = e.getAttribute("rel") || "";
          a.includes("noopener") ||
            e.setAttribute("rel", (a + " noopener").trim());
        } catch (t) {
          console.warn("Failed to update tracking for link:", n, t);
        }
    });
  }),
    (function () {
      function t() {
        try {
          const t = document.getElementById("backToTop");
          let e = 0;
          if (t) {
            const n = window.getComputedStyle(t);
            e = t.getBoundingClientRect().height || parseFloat(n.height) || 60;
          } else e = 60;
          const n = [
            ".cookie-banner",
            ".cookie-consent",
            "#cookieConsent",
            ".c-cookie-banner",
            ".cookie-notice",
          ];
          let o = 0;
          for (const t of n) {
            const e = document.querySelector(t);
            if (e) {
              const t = e.getBoundingClientRect();
              t.height &&
                t.bottom >= window.innerHeight - 10 &&
                (o = Math.max(o, t.height + 10));
            }
          }
          const a = Math.ceil(e + 12 + o);
          document.documentElement.style.setProperty(
            "--back-to-top-height",
            a + "px"
          );
        } catch (t) {
          document.documentElement.style.setProperty(
            "--back-to-top-height",
            "72px"
          );
        }
      }
      window.addEventListener("load", t, { passive: !0 }),
        window.addEventListener("resize", t, { passive: !0 });
      const e = document.getElementById("backToTop");
      if (e && "ResizeObserver" in window)
        try {
          new ResizeObserver(t).observe(e);
        } catch (t) {}
      if ("MutationObserver" in window)
        try {
          new MutationObserver(() => t()).observe(document.body, {
            childList: !0,
            subtree: !0,
          });
        } catch (t) {}
      t();
    })(),
    document.addEventListener("DOMContentLoaded", () => {
      !(function () {
        const t = e("[data-aos]");
        if (t.length)
          if ("undefined" == typeof AOS)
            n
              ? t.forEach((t) => {
                  t.classList.add("aos-init"),
                    t.dataset.aosDelay &&
                      (t.style.transitionDelay = `${t.dataset.aosDelay}ms`),
                    t.dataset.aosDuration &&
                      (t.style.transitionDuration = `${t.dataset.aosDuration}ms`),
                    n.observe(t);
                })
              : t.forEach((t) => t.classList.add("aos-animate"));
          else
            try {
              AOS.init({
                duration: 800,
                easing: "ease-in-out",
                once: !0,
                offset: 100,
              });
            } catch (t) {}
      })(),
        (function () {
          if (!("IntersectionObserver" in window)) return;
          const t = e('img[loading="lazy"]');
          if (!t.length) return;
          const n = new IntersectionObserver(
            (t, e) => {
              t.forEach((t) => {
                if (!t.isIntersecting) return;
                const n = t.target;
                if ("true" === n.getAttribute("data-loaded"))
                  return void e.unobserve(n);
                const o = n.getAttribute("data-src");
                o && (n.src = o),
                  (n.onload = function () {
                    try {
                      n.setAttribute("data-loaded", "true"),
                        n.removeAttribute("data-src");
                    } catch (t) {}
                  }),
                  (n.onerror = function () {
                    console.error("Error loading image:", n.src),
                      n.setAttribute("data-loaded", "error");
                  }),
                  e.unobserve(n);
              });
            },
            { rootMargin: "200px", threshold: 0.01 }
          );
          t.forEach((t) => {
            t.hasAttribute("data-src") ||
              t.setAttribute("data-src", t.src || ""),
              (t.src && "" !== t.src.trim()) ||
                (t.src =
                  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWUiLz48L3N2Zz4="),
              n.observe(t);
          });
        })(),
        (function () {
          const e = t("#heroImageSlider");
          if (!e) return;
          const n = e.querySelectorAll(".heroBannerImage");
          if (!n || n.length < 2) return;
          let o = 0,
            a = null;
          const s = (t) => {
              n.forEach((e, n) => {
                e.classList.toggle("active", n === t),
                  e.classList.toggle("fadeIn", n === t);
              });
            },
            r = () => {
              (o = (o + 1) % n.length), s(o);
            },
            i = () => {
              a && clearInterval(a), (a = setInterval(r, 7e3));
            },
            c = () => {
              a && (clearInterval(a), (a = null));
            };
          e.addEventListener("mouseenter", c, { passive: !0 }),
            e.addEventListener("mouseleave", i, { passive: !0 }),
            document.addEventListener("visibilitychange", () => {
              document.hidden ? c() : i();
            }),
            s(0),
            i();
        })(),
        (function () {
          const n = t("#header"),
            o = t("#mainNav"),
            a = e("[data-nav-link]"),
            s = t("#backToTop");
          if (!n) return;
          let r = 0,
            i = !1;
          const c = n.offsetHeight || 80,
            d = () => {
              const t = window.pageYOffset || window.scrollY || 0;
              n.classList.toggle("scrolled", t > 50),
                (o && o.classList.contains("active")) ||
                  (t > r && t > c
                    ? n.classList.add("hide")
                    : n.classList.remove("hide")),
                s && s.classList.toggle("show", t > 300),
                (r = Math.max(0, t)),
                (i = !1);
            };
          window.addEventListener(
            "scroll",
            () => {
              i || (window.requestAnimationFrame(d), (i = !0));
            },
            { passive: !0 }
          ),
            d(),
            s &&
              s.addEventListener("click", (t) => {
                t.preventDefault(),
                  window.scrollTo({ top: 0, behavior: "smooth" });
                const e = document.querySelector("header");
                e &&
                  (e.setAttribute("tabindex", "-1"),
                  e.focus({ preventScroll: !0 }));
              });
          const l = t("#mobileMenuBtn");
          if (l && o) {
            const t = (t) => {
              o.classList.toggle("active", t),
                l.setAttribute("aria-expanded", t ? "true" : "false"),
                l.classList.toggle("active", t),
                (document.body.style.overflow = t ? "hidden" : "");
            };
            l.addEventListener("click", () => {
              const e = "true" === l.getAttribute("aria-expanded");
              t(!e);
            }),
              document.addEventListener(
                "click",
                (e) => {
                  !o.contains(e.target) &&
                    !l.contains(e.target) &&
                    o.classList.contains("active") &&
                    t(!1);
                },
                { passive: !0 }
              ),
              a.forEach((e) => {
                e.addEventListener(
                  "click",
                  () => {
                    window.innerWidth <= 992 && t(!1);
                  },
                  { passive: !0 }
                );
              });
          }
        })(),
        e(".recommendation-button").forEach((t) => {
          t.addEventListener(
            "click",
            function (t) {
              t.preventDefault();
              const e = this.getAttribute("href") || "",
                n = e.startsWith("#") ? e.substring(1) : e,
                o = document.getElementById(n);
              o &&
                o.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                  inline: "nearest",
                });
            },
            { passive: !0 }
          );
        }),
        e('a[href^="#"]:not(.recommendation-button)').forEach((t) => {
          t.addEventListener(
            "click",
            function (t) {
              const e = this.getAttribute("href");
              if (!e || "#" === e) return;
              const n = document.querySelector(e);
              if (n) {
                t.preventDefault();
                const e = Math.max(
                  0,
                  n.getBoundingClientRect().top + window.scrollY - 80
                );
                window.scrollTo({ top: e, behavior: "smooth" });
              }
            },
            { passive: !0 }
          );
        }),
        (function () {
          const t = e("section[id]"),
            n = e("[data-nav-link]");
          if (!t.length || !n.length) return;
          let o = !1;
          const a = () => {
            const e = window.scrollY + 100;
            t.forEach((t) => {
              const o = t.offsetTop,
                a = t.offsetHeight,
                s = t.getAttribute("id");
              e >= o &&
                e < o + a &&
                n.forEach((t) => {
                  t.classList.toggle(
                    "active",
                    t.getAttribute("href") === `#${s}`
                  );
                });
            }),
              (o = !1);
          };
          window.addEventListener("load", a),
            window.addEventListener(
              "scroll",
              () => {
                o || (window.requestAnimationFrame(a), (o = !0));
              },
              { passive: !0 }
            );
        })(),
        (function () {
          const t = e(".pricing-card");
          t.length &&
            t.forEach((e) => {
              const n = e.querySelector(".order-now-btn");
              e.addEventListener(
                "mouseenter",
                function (o) {
                  (n && o.target === n) ||
                    e.classList.contains("featured") ||
                    (t.forEach((t) => {
                      t.classList.contains("featured") ||
                        ((t.style.transform = "scale(0.98)"),
                        (t.style.opacity = "0.9"));
                    }),
                    (e.style.transform = "translateY(-10px)"),
                    (e.style.opacity = "1"));
                },
                { passive: !0 }
              ),
                e.addEventListener(
                  "mouseleave",
                  function () {
                    e.classList.contains("featured") ||
                      (t.forEach((t) => {
                        t.classList.contains("featured") ||
                          ((t.style.transform = "scale(1)"),
                          (t.style.opacity = "1"));
                      }),
                      (e.style.transform = ""),
                      (e.style.opacity = ""));
                  },
                  { passive: !0 }
                );
            });
        })(),
        (function () {
          const e = t(".accordion");
          if (!e) return;
          const n = (t) => {
              const e = t.querySelector(".accordion-header"),
                n = t.querySelector(".accordion-panel");
              if (!e || !n) return;
              e.setAttribute("aria-expanded", "false"),
                (n.style.maxHeight = null),
                t.classList.remove("active");
              const o = e.querySelector(".fa-plus, .fa-minus");
              o && (o.classList.remove("fa-minus"), o.classList.add("fa-plus"));
            },
            o = (t) => {
              const o = t.querySelector(".accordion-header");
              o &&
                ("true" === o.getAttribute("aria-expanded")
                  ? n(t)
                  : ((t) => {
                      const o = t.querySelector(".accordion-header"),
                        a = t.querySelector(".accordion-panel");
                      if (!o || !a) return;
                      e.querySelectorAll(".accordion-item").forEach((e) => {
                        e !== t && n(e);
                      }),
                        o.setAttribute("aria-expanded", "true"),
                        (a.style.maxHeight = a.scrollHeight + "px"),
                        t.classList.add("active");
                      const s = o.querySelector(".fa-plus, .fa-minus");
                      s &&
                        (s.classList.remove("fa-plus"),
                        s.classList.add("fa-minus"));
                    })(t));
            };
          e.addEventListener("click", (t) => {
            const n = t.target.closest(".accordion-header");
            if (!n || !e.contains(n)) return;
            t.preventDefault();
            const a = n.parentElement;
            a && a.classList.contains("accordion-item") && o(a);
          }),
            e.addEventListener("keydown", (t) => {
              const n = t.target.closest(".accordion-header");
              if (
                n &&
                e.contains(n) &&
                ("Enter" === t.key || " " === t.key || "Spacebar" === t.key)
              ) {
                t.preventDefault();
                const e = n.parentElement;
                if (!e) return;
                o(e);
              }
            }),
            e.querySelectorAll(".accordion-item").forEach((t) => {
              const e = t.querySelector(".accordion-header"),
                n = t.querySelector(".accordion-panel");
              if (e && n)
                if (
                  (e.hasAttribute("tabindex") ||
                    e.setAttribute("tabindex", "0"),
                  e.hasAttribute("role") || e.setAttribute("role", "button"),
                  "true" === e.getAttribute("aria-expanded"))
                ) {
                  (n.style.maxHeight = n.scrollHeight + "px"),
                    t.classList.add("active");
                  const o = e.querySelector(".fa-plus, .fa-minus");
                  o &&
                    (o.classList.remove("fa-plus"),
                    o.classList.add("fa-minus"));
                } else {
                  (n.style.maxHeight = null), t.classList.remove("active");
                  const o = e.querySelector(".fa-plus, .fa-minus");
                  o &&
                    (o.classList.remove("fa-minus"),
                    o.classList.add("fa-plus"));
                }
            }),
            document.addEventListener(
              "click",
              (t) => {
                e.contains(t.target) ||
                  e.querySelectorAll(".accordion-item").forEach((t) => n(t));
              },
              { passive: !0 }
            );
        })();
      const o = t(".cta-timer");
      if (o && !o.getAttribute("data-countdown-date")) {
        const t = 3456e5,
          e = new Date(Date.now() + t);
        o.setAttribute("data-countdown-date", e.toISOString());
      }
    }),
    window.addEventListener(
      "load",
      () => {
        o();
        try {
          setInterval(o, 1e3);
        } catch (t) {}
        e("[data-nav-link]").forEach((t, e) => {
          try {
            (t.style.opacity = "0"),
              (t.style.transform = "translateY(10px)"),
              (t.style.transition = `opacity 0.3s ease ${
                0.1 * e
              }s, transform 0.3s ease ${0.1 * e}s`),
              t.offsetWidth,
              (t.style.opacity = "1"),
              (t.style.transform = "translateY(0)");
          } catch (t) {}
        });
      },
      { passive: !0 }
    );
})();
