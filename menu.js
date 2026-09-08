(() => {
  const jumpLinks = Array.from(document.querySelectorAll(".menu-jump-row a"));
  const sections = jumpLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!jumpLinks.length || !sections.length) return;

  const jumpNav = document.querySelector(".menu-jump");
  const jumpRow = document.querySelector(".menu-jump-row");
  let currentId = null;

  const setActive = (id) => {
    if (id === currentId) return;
    currentId = id;
    let activeLink = null;
    jumpLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
      if (isActive) activeLink = link;
    });

    if (activeLink && jumpRow) {
      const linkBox = activeLink.getBoundingClientRect();
      const rowBox = jumpRow.getBoundingClientRect();
      const isVisible = linkBox.left >= rowBox.left && linkBox.right <= rowBox.right;
      if (!isVisible) {
        const target = activeLink.offsetLeft - (jumpRow.clientWidth - activeLink.clientWidth) / 2;
        jumpRow.scrollTo({ left: target, behavior: "smooth" });
      }
    }
  };

  const updateActive = () => {
    const scrollMarginTop = parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0;
    const offset = jumpNav ? Math.max(jumpNav.getBoundingClientRect().bottom, scrollMarginTop) : scrollMarginTop;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) {
        active = section;
      } else {
        break;
      }
    }
    setActive(active.id);
  };

  // Clicking a pill should jump straight to it, not flip through every pill
  // the smooth-scroll passes on the way there. Set it active immediately and
  // ignore scroll-driven updates until the browser's scroll finishes settling.
  let manualNavUntilSettled = false;
  let settleTimer = null;
  let settleTimeoutCap = null;

  const watchForSettle = () => {
    clearTimeout(settleTimer);
    clearTimeout(settleTimeoutCap);
    let lastY = window.scrollY;
    let stableTicks = 0;
    const check = () => {
      if (window.scrollY === lastY) {
        stableTicks++;
        if (stableTicks >= 3) {
          manualNavUntilSettled = false;
          return;
        }
      } else {
        stableTicks = 0;
        lastY = window.scrollY;
      }
      settleTimer = setTimeout(check, 100);
    };
    settleTimer = setTimeout(check, 100);
    // Safety cap: never let a manual click permanently block scroll-spy.
    settleTimeoutCap = setTimeout(() => { manualNavUntilSettled = false; }, 4000);
  };

  jumpLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href").slice(1);
      manualNavUntilSettled = true;
      setActive(id);
      watchForSettle();
    });
  });

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (!manualNavUntilSettled) updateActive();
      ticking = false;
    });
  }, { passive: true });

  updateActive();
})();
