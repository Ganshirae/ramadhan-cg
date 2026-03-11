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
        `Target ${target}x tercapai! Alhamdulillah`,
        "notif-target",
      );
    } else if (count > 0 && count % target === 0) {
      showNotification(`Putaran ke-${rounds} selesai!`, "notif-round");
    }
  }

  function showNotification(msg, cls) {
    notification.textContent = msg;
    notification.className = `mb-6 px-5 py-3 rounded-2xl border text-sm font-semibold text-center ${cls}`;
    notification.classList.remove("hidden");
    // auto hide after 4s unless at target
    clearTimeout(notification._timer);
    if (!msg.includes("Target")) {
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
   ZAKAT KALKULATOR
   ================================================ */
function initZakat() {
  if (window.CURRENT_PAGE !== "zakat") return;

  const jenisSelect     = document.getElementById("jenis-zakat");
  const formPenghasilan = document.getElementById("form-penghasilan");
  const formEmas        = document.getElementById("form-emas");
  const formHargaEmas   = document.getElementById("form-harga-emas");
  const btnHitung       = document.getElementById("btn-hitung");
  const btnResetHitung  = document.getElementById("btn-reset-hitung");
  const hasilSection    = document.getElementById("hasil-section");
  const errorMsg        = document.getElementById("error-msg");

  const inputGaji       = document.getElementById("gaji");
  const inputPengLain   = document.getElementById("penghasilan-lain");
  const inputTotalEmas  = document.getElementById("total-emas");
  const inputHargaEmas  = document.getElementById("harga-emas");

  const hasilJenis  = document.getElementById("hasil-jenis");
  const hasilTotal  = document.getElementById("hasil-total");
  const hasilNisab  = document.getElementById("hasil-nisab");
  const hasilZakat  = document.getElementById("hasil-zakat");
  const hasilInfo   = document.getElementById("hasil-info");
  const statusBadge = document.getElementById("status-badge");

  const formatRp = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
  }
  function clearError() {
    errorMsg.textContent = "";
    errorMsg.classList.add("hidden");
  }
  function showEl(el) {
    el.classList.remove("hidden");
    el.classList.add("slide-down");
  }
  function hideEl(el) {
    el.classList.add("hidden");
    el.classList.remove("slide-down");
  }

  jenisSelect.addEventListener("change", () => {
    const val = jenisSelect.value;
    clearError();
    hideEl(hasilSection);
    hideEl(formPenghasilan);
    hideEl(formEmas);
    hideEl(formHargaEmas);
    hideEl(btnHitung);

    if (val === "penghasilan") {
      showEl(formPenghasilan);
      showEl(formHargaEmas);
      showEl(btnHitung);
    } else if (val === "emas") {
      showEl(formEmas);
      showEl(formHargaEmas);
      showEl(btnHitung);
    }
  });

  btnHitung.addEventListener("click", () => {
    clearError();
    const jenis     = jenisSelect.value;
    const hargaEmas = parseFloat(inputHargaEmas.value);

    if (!hargaEmas || hargaEmas <= 0) {
      showError("Harga emas per gram harus diisi dengan nilai yang benar.");
      inputHargaEmas.focus();
      return;
    }

    const nisab = hargaEmas * 85;
    let total = 0;
    let labelJenis = "";

    if (jenis === "penghasilan") {
      const gaji     = parseFloat(inputGaji.value) || 0;
      const pengLain = parseFloat(inputPengLain.value) || 0;
      if (gaji <= 0) {
        showError("Gaji / Penghasilan pokok harus diisi.");
        inputGaji.focus();
        return;
      }
      total      = gaji + pengLain;
      labelJenis = "Zakat Penghasilan";
    } else if (jenis === "emas") {
      const gram = parseFloat(inputTotalEmas.value);
      if (!gram || gram <= 0) {
        showError("Total emas yang dimiliki harus diisi.");
        inputTotalEmas.focus();
        return;
      }
      total      = gram * hargaEmas;
      labelJenis = "Zakat Emas";
    }

    const wajib       = total >= nisab;
    const jumlahZakat = wajib ? total * 0.025 : 0;

    hasilJenis.textContent = labelJenis;
    hasilTotal.textContent = formatRp(total);
    hasilNisab.textContent = formatRp(nisab);
    hasilZakat.textContent = wajib ? formatRp(jumlahZakat) : "Rp 0";

    if (wajib) {
      statusBadge.innerHTML =
        '<div class="badge-wajib">' +
          '<div class="badge-dot-wajib"></div>' +
          '<div>' +
            '<p style="font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(253,230,138,.6);">Status Zakat</p>' +
            '<p class="font-serif" style="font-size:1.1rem;font-weight:600;color:#fde68a;line-height:1.3;margin-top:2px;">Wajib Zakat</p>' +
          '</div>' +
        '</div>';
      hasilInfo.className = "px-4 py-3 rounded-xl text-xs leading-relaxed bg-yellow-400/6 border border-yellow-500/15 text-amber-50/50";
      hasilInfo.innerHTML =
        "Total harta Anda sebesar <strong style='color:rgba(254,243,199,.75)'>" + formatRp(total) + "</strong> " +
        "telah melampaui nilai nisab <strong style='color:rgba(254,243,199,.75)'>" + formatRp(nisab) + "</strong>. " +
        "Zakat yang wajib ditunaikan sebesar <strong style='color:rgba(253,230,138,.9)'>" + formatRp(jumlahZakat) + "</strong> " +
        "(2.5% dari total harta). Segera tunaikan melalui lembaga zakat terpercaya.";
    } else {
      statusBadge.innerHTML =
        '<div class="badge-tidak-wajib">' +
          '<div class="badge-dot-tidak"></div>' +
          '<div>' +
            '<p style="font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(134,239,172,.5);">Status Zakat</p>' +
            '<p class="font-serif" style="font-size:1.1rem;font-weight:600;color:#86efac;line-height:1.3;margin-top:2px;">Belum Wajib Zakat</p>' +
          '</div>' +
        '</div>';
      hasilInfo.className = "px-4 py-3 rounded-xl text-xs leading-relaxed bg-green-500/6 border border-green-500/15 text-amber-50/50";
      hasilInfo.innerHTML =
        "Total harta Anda sebesar <strong style='color:rgba(254,243,199,.75)'>" + formatRp(total) + "</strong> " +
        "belum mencapai nilai nisab <strong style='color:rgba(254,243,199,.75)'>" + formatRp(nisab) + "</strong>. " +
        "Anda belum diwajibkan membayar zakat, namun tetap dianjurkan untuk bersedekah.";
    }

    showEl(hasilSection);
    setTimeout(() => {
      hasilSection.scrollIntoView({behavior: "smooth", block: "start"});
    }, 100);
  });

  btnResetHitung.addEventListener("click", () => {
    jenisSelect.value = "";
    if (inputGaji)      inputGaji.value = "";
    if (inputPengLain)  inputPengLain.value = "";
    if (inputTotalEmas) inputTotalEmas.value = "";
    if (inputHargaEmas) inputHargaEmas.value = "";
    hideEl(formPenghasilan);
    hideEl(formEmas);
    hideEl(formHargaEmas);
    hideEl(btnHitung);
    hideEl(hasilSection);
    clearError();
    document.querySelector("section[aria-labelledby='kalkulator-title']")
      ?.scrollIntoView({behavior: "smooth", block: "start"});
  });
}


/* ================================================
   THEME SWITCHER
   ================================================ */
function initTheme() {
  const THEMES = ["malam","sahur","pasir","madinah","fajar"];
  const saved  = localStorage.getItem("ramadhan-theme") || "malam";

  // Warna overlay hero per tema — disesuaikan agar gambar tetap terlihat
  // tapi nuansa warna body tema meresap ke hero
  const HERO_OVERLAYS = {
    malam:   { // Hijau gelap
      top:    "rgba(3, 30, 14, 0.62)",
      mid:    "rgba(5, 46, 22, 0.48)",
      low:    "rgba(3, 28, 12, 0.78)",
      bottom: "rgba(5, 46, 22, 1.0)",
      vignette: "rgba(2, 20, 10, 0.5)",
    },
    sahur:   { // Navy biru – langit malam menjelang sahur
      top:    "rgba(5, 10, 40, 0.65)",
      mid:    "rgba(8, 18, 60, 0.50)",
      low:    "rgba(5, 10, 40, 0.80)",
      bottom: "rgba(12, 20, 69, 1.0)",
      vignette: "rgba(3, 8, 30, 0.5)",
    },
    pasir:   { // Coklat hangat – padang pasir
      top:    "rgba(28, 12, 4, 0.62)",
      mid:    "rgba(40, 20, 6, 0.48)",
      low:    "rgba(25, 10, 2, 0.80)",
      bottom: "rgba(28, 16, 8, 1.0)",
      vignette: "rgba(18, 8, 2, 0.5)",
    },
    madinah: { // Ungu marun dalam
      top:    "rgba(20, 5, 30, 0.65)",
      mid:    "rgba(30, 8, 45, 0.50)",
      low:    "rgba(20, 5, 30, 0.80)",
      bottom: "rgba(21, 10, 30, 1.0)",
      vignette: "rgba(12, 3, 20, 0.5)",
    },
    fajar:   { // Teal gelap – menjelang fajar
      top:    "rgba(3, 22, 24, 0.62)",
      mid:    "rgba(5, 35, 38, 0.48)",
      low:    "rgba(3, 20, 22, 0.80)",
      bottom: "rgba(7, 30, 32, 1.0)",
      vignette: "rgba(2, 14, 16, 0.5)",
    },
  };

  function applyTheme(t) {
    document.body.classList.remove(...THEMES.map(x => "theme-" + x));
    document.body.classList.add("theme-" + t);
    localStorage.setItem("ramadhan-theme", t);
    document.querySelectorAll(".theme-option").forEach(el => {
      el.classList.toggle("active", el.dataset.theme === t);
    });

    // Update hero overlay warna sesuai tema
    const ov = HERO_OVERLAYS[t] || HERO_OVERLAYS.malam;
    const overlay = document.getElementById("hero-overlay");
    const fadeBot = document.getElementById("hero-fade-bottom");
    if (overlay) {
      overlay.style.background = `linear-gradient(
        to bottom,
        ${ov.top}   0%,
        ${ov.mid}  40%,
        ${ov.low}  72%,
        ${ov.bottom} 100%
      )`;
    }
    if (fadeBot) {
      fadeBot.style.background = `linear-gradient(to bottom, transparent 0%, ${ov.bottom} 100%)`;
    }
  }

  applyTheme(saved);

  const toggle  = document.getElementById("theme-toggle");
  const drawer  = document.getElementById("theme-drawer");
  if (!toggle || !drawer) return;

  toggle.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    drawer.setAttribute("aria-hidden", String(!open));
  });

  document.querySelectorAll(".theme-option").forEach(opt => {
    const activate = () => {
      applyTheme(opt.dataset.theme);
      drawer.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
    };
    opt.addEventListener("click", activate);
    opt.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }});
  });

  // Close drawer on outside click
  document.addEventListener("click", e => {
    const panel = document.getElementById("theme-panel");
    if (panel && !panel.contains(e.target)) {
      drawer.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
    }
  });
}

/* ================================================
   IBADAH TO-DO LIST
   ================================================ */
function initIbadah() {
  if (window.CURRENT_PAGE !== "ibadah") return;

  const TODAY = new Date().toDateString();
  const STORE_KEY = "ramadhan-ibadah-" + TODAY;

  // Hitung hari Ramadhan 1447H otomatis (mulai 1 Maret 2026)
  const RAMADHAN_START = new Date("2026-03-01T00:00:00");
  const now = new Date();
  const diffMs   = now - RAMADHAN_START;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const autoHari = Math.min(Math.max(diffDays + 1, 1), 30);

  // Load data harian – puasa.days disimpan terpisah agar persist lintas hari
  const PUASA_KEY = "ramadhan-puasa-days";
  const savedDays = JSON.parse(localStorage.getItem(PUASA_KEY) || "null") || Array(30).fill(false);

  let data = JSON.parse(localStorage.getItem(STORE_KEY) || "null") || {
    shalat:  { subuh:false, dzuhur:false, ashar:false, maghrib:false, isya:false },
    quran:   { target:0, dibaca:0, selesai:false },
    dzikir:  { pagi:false, petang:false, tasbih:false, istighfar:false },
  };
  // puasa.days dan hariRamadhan selalu ambil dari sumber persisten
  data.puasa = { days: savedDays };
  data.hariRamadhan = autoHari;

  function save(section) {
    // Simpan puasa.days ke key terpisah agar tidak direset tiap hari
    localStorage.setItem(PUASA_KEY, JSON.stringify(data.puasa.days));
    // Simpan data harian (tanpa puasa.days agar tidak membesar)
    const dailyData = { shalat: data.shalat, quran: data.quran, dzikir: data.dzikir };
    localStorage.setItem(STORE_KEY, JSON.stringify(dailyData));
    updateSummary();
    showToast("Tersimpan");
    if (section === "shalat") renderShalat();
    if (section === "quran")  renderQuran();
    if (section === "puasa")  renderPuasa();
    if (section === "dzikir") renderDzikir();
  }

  function showToast(msg) {
    const t = document.getElementById("save-toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ------ MOTIVASI helpers ------ */
  function motivasiClass(pct) {
    if (pct >= 100) return "motivasi-high";
    if (pct >= 40)  return "motivasi-mid";
    return "motivasi-low";
  }
  function shalatMotivasi(pct) {
    if (pct >= 100) return "MasyaAllah, lengkap!";
    if (pct >= 40)  return "Cukup baik";
    return "Belum optimal";
  }
  function quranMotivasi(pct) {
    if (pct >= 100) return "Target tercapai";
    if (pct >= 50)  return "Hampir selesai";
    return "Masih bisa ditambah";
  }
  function puasaMotivasi(pct) {
    if (pct >= 100) return "Alhamdulillah, sempurna!";
    if (pct >= 50)  return "Tetap istiqomah";
    return "Semangat berpuasa";
  }
  function dzikirMotivasi(pct) {
    if (pct >= 100) return "MasyaAllah, lengkap!";
    if (pct >= 40)  return "Cukup baik";
    return "Belum optimal";
  }

  function setMotivasi(el, pct, fn) {
    if (!el) return;
    el.className = "motivasi-badge " + motivasiClass(pct);
    el.textContent = fn(pct);
  }

  /* ------ SUMMARY ------ */
  function updateSummary() {
    const shalatDone  = Object.values(data.shalat).filter(Boolean).length;
    const shalatPct   = Math.round((shalatDone / 5) * 100);

    const qTarget = parseInt(data.quran.target) || 0;
    const qDibaca = parseInt(data.quran.dibaca) || 0;
    const quranPct = qTarget > 0 ? Math.min(Math.round((qDibaca / qTarget) * 100), 100) : 0;

    // Puasa: cukup cek apakah hari ini sudah puasa (0 atau 100%)
    const puasaHariIni = data.puasa.days[data.hariRamadhan - 1];
    const puasaPct  = puasaHariIni ? 100 : 0;
    const puasaDone = data.puasa.days.filter(Boolean).length;

    const dzikirDone = Object.values(data.dzikir).filter(Boolean).length;
    const dzikirPct  = Math.round((dzikirDone / 4) * 100);

    const overall = Math.round((shalatPct + quranPct + puasaPct + dzikirPct) / 4);

    const bar  = document.getElementById("summary-bar");
    const pct  = document.getElementById("summary-pct");
    const mot  = document.getElementById("summary-motivasi");
    const det  = document.getElementById("summary-detail");

    if (bar) bar.style.width = overall + "%";
    if (pct) pct.textContent = overall + "%";
    if (det) det.textContent =
      "Shalat " + shalatDone + "/5 · Quran " + quranPct + "% · Puasa " + puasaDone + "/30 · Dzikir " + dzikirDone + "/4";
    if (mot) {
      mot.className = "motivasi-badge " + motivasiClass(overall);
      if (overall >= 100) mot.textContent = "MasyaAllah!";
      else if (overall >= 60) mot.textContent = "Cukup baik";
      else if (overall >= 30) mot.textContent = "Terus tingkatkan";
      else mot.textContent = "Belum optimal";
    }
  }

  /* ------ SHALAT ------ */
  function renderShalat() {
    const items = document.querySelectorAll("#shalat-list .shalat-item");
    items.forEach(item => {
      const key = item.dataset.shalat;
      item.classList.toggle("checked", !!data.shalat[key]);
      item.setAttribute("aria-checked", String(!!data.shalat[key]));
    });
    const done = Object.values(data.shalat).filter(Boolean).length;
    const pct  = Math.round((done / 5) * 100);
    const bar  = document.getElementById("shalat-bar");
    const cnt  = document.getElementById("shalat-count");
    const p    = document.getElementById("shalat-pct");
    const st   = document.getElementById("shalat-status");
    if (bar) bar.style.width = pct + "%";
    if (cnt) cnt.textContent = done + " / 5";
    if (p)   p.textContent   = pct + "%";
    setMotivasi(st, pct, shalatMotivasi);
  }

  document.querySelectorAll("#shalat-list .shalat-item").forEach(item => {
    const toggle = () => {
      const key = item.dataset.shalat;
      data.shalat[key] = !data.shalat[key];
      renderShalat();
      updateSummary();
    };
    item.addEventListener("click", toggle);
    item.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }});
  });

  document.getElementById("save-shalat")?.addEventListener("click", () => save("shalat"));

  /* ------ QURAN ------ */
  function renderQuran() {
    const target  = parseInt(data.quran.target)  || 0;
    const dibaca  = parseInt(data.quran.dibaca)  || 0;
    const selesai = !!data.quran.selesai;
    const pct     = target > 0 ? Math.min(Math.round((dibaca / target) * 100), 100) : 0;
    const finalPct = selesai ? 100 : pct;

    const tEl = document.getElementById("quran-target");
    const dEl = document.getElementById("quran-dibaca");
    if (tEl && !tEl.matches(":focus")) tEl.value = target || "";
    if (dEl && !dEl.matches(":focus")) dEl.value = dibaca || "";

    const toggle = document.getElementById("quran-selesai-toggle");
    if (toggle) {
      toggle.classList.toggle("checked", selesai);
      toggle.setAttribute("aria-checked", String(selesai));
    }

    const bar  = document.getElementById("quran-bar");
    const disp = document.getElementById("quran-pct-display");
    const info = document.getElementById("quran-pages-info");
    const st   = document.getElementById("quran-status");
    if (bar)  bar.style.width      = finalPct + "%";
    if (disp) disp.textContent     = finalPct + "%";
    if (info) info.textContent     = dibaca + " dari " + (target || "—") + " halaman";
    setMotivasi(st, finalPct, quranMotivasi);
  }

  document.getElementById("quran-target")?.addEventListener("input", e => {
    data.quran.target = parseInt(e.target.value) || 0;
    renderQuran();
  });
  document.getElementById("quran-dibaca")?.addEventListener("input", e => {
    data.quran.dibaca = parseInt(e.target.value) || 0;
    renderQuran();
  });

  const qSelesai = document.getElementById("quran-selesai-toggle");
  if (qSelesai) {
    const tog = () => {
      data.quran.selesai = !data.quran.selesai;
      renderQuran();
      updateSummary();
    };
    qSelesai.addEventListener("click", tog);
    qSelesai.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tog(); }});
  }

  document.getElementById("save-quran")?.addEventListener("click", () => {
    const t = document.getElementById("quran-target");
    const d = document.getElementById("quran-dibaca");
    if (t) data.quran.target = parseInt(t.value) || 0;
    if (d) data.quran.dibaca = parseInt(d.value) || 0;
    save("quran");
  });

  /* ------ PUASA ------ */
  function buildCalendar() {
    const cal = document.getElementById("puasa-calendar");
    if (!cal) return;
    cal.innerHTML = "";
    for (let i = 1; i <= 30; i++) {
      const d = document.createElement("div");
      d.className = "puasa-day";
      d.setAttribute("role", "checkbox");
      d.setAttribute("aria-label", "Hari ke-" + i);
      d.setAttribute("tabindex", "0");
      d.dataset.day = i;
      if (data.puasa.days[i-1]) d.classList.add("done");
      if (i === data.hariRamadhan) d.classList.add("today");

      if (data.puasa.days[i-1]) {
        // checkmark SVG
        d.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
      } else {
        d.textContent = i;
      }

      const toggle = () => {
        data.puasa.days[i-1] = !data.puasa.days[i-1];
        buildCalendar();
        renderPuasa();
        updateSummary();
      };
      d.addEventListener("click", toggle);
      d.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }});
      cal.appendChild(d);
    }
  }

  function renderPuasa() {
    const done = data.puasa.days.filter(Boolean).length;
    const pct  = Math.round((done / 30) * 100);
    const bar  = document.getElementById("puasa-bar");
    const disp = document.getElementById("puasa-count-display");
    const p    = document.getElementById("puasa-pct");
    const st   = document.getElementById("puasa-status");
    const hr   = document.getElementById("hari-ramadhan");
    const hr2  = document.getElementById("hari-ramadhan-2");
    if (bar)  bar.style.width   = pct + "%";
    if (disp) disp.textContent  = done + " / 30";
    if (p)    p.textContent     = pct + "%";
    if (hr)   hr.textContent    = data.hariRamadhan;
    if (hr2)  hr2.textContent   = data.hariRamadhan;
    setMotivasi(st, pct, puasaMotivasi);

    const todayTog = document.getElementById("puasa-today-toggle");
    const todayDone = data.puasa.days[data.hariRamadhan - 1];
    if (todayTog) {
      todayTog.classList.toggle("checked", !!todayDone);
      todayTog.setAttribute("aria-checked", String(!!todayDone));
    }
  }

  const ptToggle = document.getElementById("puasa-today-toggle");
  if (ptToggle) {
    const tog = () => {
      const idx = data.hariRamadhan - 1;
      data.puasa.days[idx] = !data.puasa.days[idx];
      buildCalendar();
      renderPuasa();
      updateSummary();
    };
    ptToggle.addEventListener("click", tog);
    ptToggle.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tog(); }});
  }

  document.getElementById("save-puasa")?.addEventListener("click", () => save("puasa"));

  /* ------ DZIKIR ------ */
  function renderDzikir() {
    const items = document.querySelectorAll("#dzikir-list .shalat-item");
    items.forEach(item => {
      const key = item.dataset.dzikir;
      item.classList.toggle("checked", !!data.dzikir[key]);
      item.setAttribute("aria-checked", String(!!data.dzikir[key]));
    });
    const done = Object.values(data.dzikir).filter(Boolean).length;
    const pct  = Math.round((done / 4) * 100);
    const bar  = document.getElementById("dzikir-bar");
    const disp = document.getElementById("dzikir-pct-display");
    const info = document.getElementById("dzikir-info");
    const st   = document.getElementById("dzikir-status");
    if (bar)  bar.style.width  = pct + "%";
    if (disp) disp.textContent = pct + "%";
    if (info) info.textContent = done + " dari 4 dzikir";
    setMotivasi(st, pct, dzikirMotivasi);
  }

  document.querySelectorAll("#dzikir-list .shalat-item").forEach(item => {
    const toggle = () => {
      const key = item.dataset.dzikir;
      data.dzikir[key] = !data.dzikir[key];
      renderDzikir();
      updateSummary();
    };
    item.addEventListener("click", toggle);
    item.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }});
  });

  document.getElementById("save-dzikir")?.addEventListener("click", () => save("dzikir"));

  /* ------ TABS ------ */
  document.querySelectorAll(".ibadah-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ibadah-tab").forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".ibadah-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = document.getElementById("panel-" + tab.dataset.tab);
      if (panel) panel.classList.add("active");
    });
  });

  /* ------ INIT RENDER ------ */
  buildCalendar();
  renderShalat();
  renderQuran();
  renderPuasa();
  renderDzikir();
  updateSummary();
}


/* ================================================
   IMSAKIYAH
   ================================================ */
function initImsakiyah() {
  if (window.CURRENT_PAGE !== "imsakiyah") return;

  const API_BASE = "https://api.myquran.com/v2/sholat/jadwal";
  const NAMA_BULAN = ["Januari","Februari","Maret","April","Mei","Juni",
                      "Juli","Agustus","September","Oktober","November","Desember"];

  const now        = new Date();
  let currentKota  = "";
  let currentTahun = now.getFullYear();
  let currentBulan = now.getMonth() + 1; // 1-based
  const todayDate  = now.toISOString().split("T")[0]; // "2026-03-06"

  /* -- DOM refs -- */
  const kotaSelect   = document.getElementById("kota-select");
  const bulanLabel   = document.getElementById("bulan-label");
  const btnPrev      = document.getElementById("btn-prev-bulan");
  const btnNext      = document.getElementById("btn-next-bulan");
  const lokasiInfo   = document.getElementById("lokasi-info");
  const lokasiNama   = document.getElementById("lokasi-nama");
  const lokasiDaerah = document.getElementById("lokasi-daerah");
  const tabelTitle   = document.getElementById("tabel-title");
  const tabelSub     = document.getElementById("tabel-subtitle");
  const tbody        = document.getElementById("jadwal-tbody");
  const todaySection = document.getElementById("today-section");
  const todayStrip   = document.getElementById("today-strip");
  const todayTgl     = document.getElementById("today-tanggal");
  const errorDetail  = document.getElementById("error-detail");
  const btnRetry     = document.getElementById("btn-retry");

  /* -- State helpers -- */
  function setState(state) {
    ["loading","error","empty","table"].forEach(s => {
      const el = document.getElementById("state-" + s);
      if (el) el.classList.toggle("hidden", s !== state);
    });
  }

  function updateBulanLabel() {
    bulanLabel.textContent = NAMA_BULAN[currentBulan - 1] + " " + currentTahun;
  }

  function updateNavButtons() {
    // Limit: Jan currentTahun to Dec currentTahun+1
    const minReached = currentTahun === now.getFullYear() && currentBulan === 1;
    const maxReached = currentBulan === 12 && currentTahun > now.getFullYear();
    btnPrev.disabled = minReached;
    btnNext.disabled = maxReached;
  }

  /* -- Render today strip -- */
  function renderTodayStrip(jadwalList) {
    const todayRow = jadwalList.find(j => j.date === todayDate);
    if (!todayRow) { todaySection.classList.add("hidden"); return; }

    todaySection.classList.remove("hidden");
    todayTgl.textContent = todayRow.tanggal;

    const cols = [
      { label:"Imsak",   val: todayRow.imsak },
      { label:"Subuh",   val: todayRow.subuh },
      { label:"Dzuhur",  val: todayRow.dzuhur },
      { label:"Ashar",   val: todayRow.ashar },
      { label:"Maghrib", val: todayRow.maghrib },
      { label:"Isya",    val: todayRow.isya },
    ];

    todayStrip.innerHTML = cols.map(c =>
      `<div class="today-strip-item">
        <p class="today-strip-label">${c.label}</p>
        <p class="today-strip-time">${c.val}</p>
      </div>`
    ).join("");
  }

  /* -- Render tabel -- */
  function renderTable(jadwalList) {
    tbody.innerHTML = "";
    jadwalList.forEach(row => {
      const isToday = row.date === todayDate;
      const tr = document.createElement("tr");
      if (isToday) tr.classList.add("today-row");

      const tglCell = isToday
        ? `${row.tanggal}<span class="today-badge">Hari ini</span>`
        : row.tanggal;

      tr.innerHTML =
        `<td>${tglCell}</td>` +
        `<td>${row.imsak}</td>` +
        `<td>${row.subuh}</td>` +
        `<td>${row.dzuhur}</td>` +
        `<td>${row.ashar}</td>` +
        `<td>${row.maghrib}</td>` +
        `<td>${row.isya}</td>`;

      tbody.appendChild(tr);
    });

    // Auto scroll to today row
    const todayTr = tbody.querySelector(".today-row");
    if (todayTr) {
      setTimeout(() => todayTr.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
    }
  }

  /* -- Fetch data -- */
  async function fetchJadwal() {
    if (!currentKota) return;

    setState("loading");
    todaySection.classList.add("hidden");
    tabelSub.textContent = "Memuat data...";

    const url = `${API_BASE}/${currentKota}/${currentTahun}/${String(currentBulan).padStart(2,"0")}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();

      if (!json.status || !json.data || !json.data.jadwal) {
        throw new Error("Format data tidak sesuai");
      }

      const { lokasi, daerah, jadwal } = json.data;

      // Update lokasi info
      lokasiNama.textContent   = lokasi || "";
      lokasiDaerah.textContent = daerah || "";
      lokasiInfo.classList.remove("hidden");

      // Update tabel title
      tabelTitle.textContent = "Jadwal Imsakiyah " + NAMA_BULAN[currentBulan - 1];
      tabelSub.textContent   = jadwal.length + " hari";

      renderTodayStrip(jadwal);
      renderTable(jadwal);
      setState("table");

    } catch (err) {
      console.error("[Imsakiyah] fetch error:", err);
      if (errorDetail) errorDetail.textContent = err.message || "Periksa koneksi internet dan coba kembali.";
      setState("error");
      tabelSub.textContent = "Gagal memuat";
    }
  }

  /* -- Event listeners -- */
  kotaSelect.addEventListener("change", () => {
    currentKota = kotaSelect.value;
    if (!currentKota) {
      setState("empty");
      lokasiInfo.classList.add("hidden");
      todaySection.classList.add("hidden");
      bulanLabel.textContent = "Pilih kota";
      btnPrev.disabled = true;
      btnNext.disabled = true;
      return;
    }
    // Reset to current month when city changes
    currentTahun = now.getFullYear();
    currentBulan = now.getMonth() + 1;
    updateBulanLabel();
    updateNavButtons();
    btnPrev.disabled = false;
    btnNext.disabled = false;
    fetchJadwal();
  });

  btnPrev.addEventListener("click", () => {
    if (currentBulan === 1) { currentBulan = 12; currentTahun--; }
    else { currentBulan--; }
    updateBulanLabel();
    updateNavButtons();
    fetchJadwal();
  });

  btnNext.addEventListener("click", () => {
    if (currentBulan === 12) { currentBulan = 1; currentTahun++; }
    else { currentBulan++; }
    updateBulanLabel();
    updateNavButtons();
    fetchJadwal();
  });

  btnRetry?.addEventListener("click", fetchJadwal);

  /* -- Restore last kota from localStorage -- */
  const savedKota = localStorage.getItem("imsakiyah-kota");
  if (savedKota) {
    kotaSelect.value = savedKota;
    if (kotaSelect.value) {
      currentKota = savedKota;
      updateBulanLabel();
      updateNavButtons();
      btnPrev.disabled = false;
      btnNext.disabled = false;
      fetchJadwal();
    }
  }

  // Save kota selection
  kotaSelect.addEventListener("change", () => {
    if (kotaSelect.value) localStorage.setItem("imsakiyah-kota", kotaSelect.value);
  });
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
  initZakat();
  initTheme();
  initIbadah();
  initImsakiyah();
});
