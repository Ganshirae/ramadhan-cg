/* ================================================
   UTILITY: loadComponent
   ================================================ */
async function loadComponent(placeholderId, filePath) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Gagal load: ${filePath} (${res.status})`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.warn(`[loadComponent] ${err.message}`);
  }
}

/* ================================================
   NAVBAR: scroll effect + active link + hamburger
   ================================================ */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  // Scroll: tambah class .scrolled
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  };
  window.addEventListener("scroll", onScroll, {passive: true});
  onScroll();

  // Active link berdasarkan CURRENT_PAGE
  const currentPage = window.CURRENT_PAGE || "home";
  document.querySelectorAll(".nav-link[data-page]").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("nav-active");
      link.setAttribute("aria-current", "page");
    }
  });

  // Hamburger mobile
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const iconOpen = document.getElementById("icon-open");
  const iconClose = document.getElementById("icon-close");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = !menu.classList.contains("hidden");
      menu.classList.toggle("hidden", isOpen);
      menu.setAttribute("aria-hidden", String(isOpen));
      toggle.setAttribute("aria-expanded", String(!isOpen));
      iconOpen.classList.toggle("hidden", !isOpen);
      iconClose.classList.toggle("hidden", isOpen);
    });

    // Tutup menu saat link diklik
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.classList.add("hidden");
        menu.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        iconOpen.classList.remove("hidden");
        iconClose.classList.add("hidden");
      });
    });
  }
}

/* ================================================
   STARFIELD
   ================================================ */
function initStarfield() {
  const container = document.getElementById("stars");
  if (!container) return;
  for (let i = 0; i < 80; i++) {
    const star = document.createElement("div");
    const size = Math.random() * 2.5 + 0.5;
    star.classList.add("star");
    Object.assign(star.style, {
      width: size + "px",
      height: size + "px",
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      animationDelay: Math.random() * 5 + "s",
      animationDuration: Math.random() * 3 + 2 + "s",
      opacity: Math.random() * 0.7 + 0.2,
    });
    container.appendChild(star);
  }
}

/* ================================================
   SCROLL REVEAL
   ================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    {threshold: 0.1, rootMargin: "0px 0px -40px 0px"},
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ================================================
   SMOOTH SCROLL
   ================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href === "#") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({behavior: "smooth", block: "start"});
    });
  });
}

/* ================================================
   ACTIVE SECTION NAV HIGHLIGHT (doa.html)
   ================================================ */
function initSectionHighlight() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("nav-active");
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.classList.add("nav-active");
            }
          });
        }
      });
    },
    {threshold: 0.5},
  );

  sections.forEach((s) => obs.observe(s));
}

/* ================================================
   ZIKIR COUNTER
   ================================================ */
function initZikir() {
  if (window.CURRENT_PAGE !== "zikir") return;

  // State
  let count = 0;
  let totalSession = 0;
  let rounds = 0;
  let target = 33;
  let currentZikir = {
    arabic: "سُبْحَانَ اللّٰهِ",
    latin: "Subhanallah",
    target: 33,
  };

  // DOM refs
  const countDisplay = document.getElementById("count-display");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const targetDisplay = document.getElementById("target-display");
  const notification = document.getElementById("notification");
  const btnAdd = document.getElementById("btn-add");
  const btnReset = document.getElementById("btn-reset");
  const zikirArabic = document.getElementById("zikir-arabic");
  const zikirLatin = document.getElementById("zikir-latin");
  const statTotal = document.getElementById("stat-total");
  const statRounds = document.getElementById("stat-rounds");
  const statTargetDisp = document.getElementById("stat-target-display");
  const countRing = document.getElementById("count-ring");
  const tabs = document.querySelectorAll(".zikir-tab");

  function updateUI() {
    // Number
    countDisplay.textContent = count;

    // Progress bar
    const pct = Math.min((count / target) * 100, 100);
    const deg = Math.round((count / target) * 360);
    progressBar.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", count);
    progressBar.setAttribute("aria-valuemax", target);
    progressText.textContent = `${count} dari ${target}`;

    // Ring
    countRing.style.setProperty("--progress", deg + "deg");

    // Stats
    statTotal.textContent = totalSession;
    statRounds.textContent = rounds;
    statTargetDisp.textContent = target;

    // Notification
    if (count === target) {
      showNotification(
        `🎉 Target ${target}x tercapai! Allahu Akbar!`,
        "notif-target",
      );
    } else if (count > 0 && count % target === 0) {
      showNotification(`✅ Putaran ke-${rounds} selesai!`, "notif-round");
    }
  }

  function showNotification(msg, cls) {
    notification.textContent = msg;
    notification.className = `mb-6 px-5 py-3 rounded-2xl border text-sm font-semibold text-center ${cls}`;
    notification.classList.remove("hidden");
    // auto hide after 4s unless at target
    clearTimeout(notification._timer);
    if (!msg.includes("🎉")) {
      notification._timer = setTimeout(
        () => notification.classList.add("hidden"),
        4000,
      );
    }
  }

  function pulseCount() {
    countDisplay.classList.remove("count-pulse");
    // reflow
    void countDisplay.offsetWidth;
    countDisplay.classList.add("count-pulse");
  }

  // Add button
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      count++;
      totalSession++;

      if (count > target) {
        // exceeded — start new round
        rounds++;
        count = 1;
        notification.classList.add("hidden");
      } else if (count === target) {
        rounds++;
      }

      pulseCount();
      updateUI();
    });
  }

  // Reset button
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      count = 0;
      notification.classList.add("hidden");
      countDisplay.classList.remove("count-pulse");
      progressBar.style.width = "0%";
      progressText.textContent = `0 dari ${target}`;
      countRing.style.setProperty("--progress", "0deg");
      updateUI();
    });
  }

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Reset counter on tab switch
      count = 0;
      rounds = 0;
      notification.classList.add("hidden");

      tabs.forEach((t) => {
        t.classList.remove("active-tab");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active-tab");
      tab.setAttribute("aria-selected", "true");

      target = parseInt(tab.dataset.target, 10);
      currentZikir = {
        arabic: tab.dataset.arabic,
        latin: tab.dataset.latin,
        target,
      };

      if (zikirArabic) zikirArabic.textContent = currentZikir.arabic;
      if (zikirLatin) zikirLatin.textContent = currentZikir.latin;
      if (targetDisplay) targetDisplay.textContent = target;
      progressBar.setAttribute("aria-valuemax", target);

      updateUI();
    });
  });

  // Initial render
  updateUI();
}

/* ================================================
   BOOT
   ================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadComponent("navbar-placeholder", "components/navbar.html"),
    loadComponent("header-placeholder", "components/header.html"),
    loadComponent("footer-placeholder", "components/footer.html"),
  ]);

  initStarfield();
  initNavbar();
  initScrollReveal();
  initSmoothScroll();
  initSectionHighlight();
  initZikir();
});
