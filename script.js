(() => {
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", (e) => {
      const onIndex = /(^|\/)index\.html$/.test(location.pathname) || location.pathname.endsWith("/");
      if (onIndex) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });

  mainNav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Открыть меню");
    }
  });

  const revealEls = document.querySelectorAll("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && revealEls.length && !reduceMotion) {
    const pending = new Set();

    const reveal = (el) => {
      el.classList.remove("pending");
      pending.delete(el);
      io.unobserve(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach((el, i) => {
      const belowFold = el.getBoundingClientRect().top >= window.innerHeight;
      if (belowFold) {
        el.classList.add("pending");
        el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
        pending.add(el);
        io.observe(el);
      }
    });

    // Fallback for discrete/instant scroll jumps (scrollbar-track clicks, flicks,
    // programmatic scrollTo) that can skip an element past the observer's
    // intersection threshold without ever firing it — sweep on scroll too.
    if (pending.size) {
      let ticking = false;
      const sweep = () => {
        pending.forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
        });
        if (!pending.size) window.removeEventListener("scroll", onScroll);
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          sweep();
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }
})();
