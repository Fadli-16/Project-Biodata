/* Penggunaan script berikut agar fungsi setiap fitur dapat dijalankan pada halaman website */
"use strict";

/* CONFIG EmailJS (optional) */
const EMAILJS_USER_ID = "TzQUpLxboTxHaafuf"; 
const EMAILJS_SERVICE_ID = "service_vwnjf9j";
const EMAILJS_TEMPLATE_ID = "template_7f2tbk7";
const ALLOWED_DOMAINS = null;

/* UTIL */
const byId = (id) => document.getElementById(id);
const escapeHtml = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function isAllowedDomain(email) {
  if (!ALLOWED_DOMAINS || !Array.isArray(ALLOWED_DOMAINS)) return true;
  const domain = (email.split("@")[1] || "").toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}
function parsePercentValue(p) {
  if (typeof p === "number") return Math.max(0, Math.min(100, Math.round(p)));
  if (!p) return 0;
  const n = parseInt(String(p).replace("%", ""), 10);
  return isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
}

/* DEFAULT DATA (pastikan properti konsisten) */
const defaultData = {
  name: "Nama Lengkap",
  role: "Mahasiswa / Web Developer",
  age: "22",
  email: "email@contoh.com",
  location: "Kota, Negara",
  avatar: "",
  socials: [],
  personality: [], 
  skillBars: [],
  timeline: [],
};

/* STORAGE helpers */
function loadData() {
  try {
    const cur = localStorage.getItem("bio:user");
    const key = cur ? "bio:data_" + cur : "bio:data";
    const raw = localStorage.getItem(key) || localStorage.getItem("bio:data");
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaultData));
  } catch {
    return JSON.parse(JSON.stringify(defaultData));
  }
}
function saveData(d) {
  try {
    const cur = localStorage.getItem("bio:user");
    if (cur) localStorage.setItem("bio:data_" + cur, JSON.stringify(d));
    localStorage.setItem("bio:data", JSON.stringify(d));
  } catch {}
}

/* EmailJS init (best-effort) */
function initEmailJSIfPresent(userId) {
  if (window.emailjs && typeof emailjs.init === "function" && userId) {
    try {
      emailjs.init(userId);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
let emailjsReady = initEmailJSIfPresent(EMAILJS_USER_ID);
window.addEventListener("load", () => {
  if (!emailjsReady) emailjsReady = initEmailJSIfPresent(EMAILJS_USER_ID);
});

/* DOM references (graceful: may be null) */
let data = loadData();
let radarChart = null;

const displayName = byId("displayName");
const displayRole = byId("displayRole");
const avatarPreview = byId("avatarPreview");
const socialLinks = byId("socialLinks");
const sosmedList = byId("sosmedList");

const personaChips = byId("personaChips");
const newPersonaInput = byId("newPersonaInput");
const addPersonaBtn = byId("addPersonaBtn");

const skillBarsEl = byId("skillBars");
const addBarBtn = byId("addBarBtn");

const timelineList = byId("timelineList");
const addTimelineBtn = byId("addTimeline");

const currentDateEl = byId("currentDate");
const currentTimeEl = byId("currentTime");

const modal = byId("modalContact");
const sendContactBtn = byId("sendContact");
const closeModalBtn = byId("closeModal");
const toastEl = byId("toast");

/* DATE/TIME */
function formatDateIndo(d) {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${
    months[d.getMonth()]
  } ${d.getFullYear()}`;
}
function formatTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function updateDateTime() {
  const n = new Date();
  if (currentDateEl) currentDateEl.textContent = formatDateIndo(n);
  if (currentTimeEl) currentTimeEl.textContent = formatTime(n);
}
updateDateTime();
setInterval(updateDateTime, 1000);

/* RENDER helpers */
function iconFor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("instagram"))
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.2"/><path d="M17.5 6.5H17.51" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
  if (n.includes("linkedin"))
    return '<svg width="20" height="20"><path d="M16 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM2 20V9h4v11H2zM10 20v-7c0-1.1.9-2 2-2h0c1.1 0 2 .9 2 2v7" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>';
  if (n.includes("github"))
    return '<svg width="20" height="20"><path d="M12 2c-5 0-9 4-9 9 0 4 2.5 7.3 6 8.5.4.1.5-.2.5-.4v-1.4c-2.4.5-2.9-1.1-2.9-1.1-.4-1-.9-1.3-.9-1.3-.7-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.7 1.2 2 0 2 0 .7-1.2 1.8-.9 2.2-.7.1-.6.3-1 .6-1.2-1.9-.2-3.9-.9-3.9-4 0-.9.3-1.6.8-2.2-.1-.2-.4-1.1.1-2.2 0 0 .6-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.6-1 2.2-.8 2.2-.8.5 1.1.2 2 .1 2.2.5.6.8 1.3.8 2.2 0 3.1-2 3.8-3.9 4 .3.3.6.9.6 1.8v2.6c0 .2.1.5.5.4 3.5-1.2 6-4.5 6-8.5 0-5-4-9-9-9z" fill="currentColor"/></svg>';
  return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" stroke-width="1.2"/></svg>';
}

/* Tambahkan data lainnya untuk biodata */
function renderProfile() {
  if (displayName) displayName.textContent = data.name;
  if (displayRole) displayRole.textContent = data.role;
  const vN = byId("valNama");
  if (vN) vN.textContent = data.name;
  const vU = byId("valUmur");
  if (vU) vU.textContent = data.age;
  const vE = byId("valEmail");
  if (vE) vE.textContent = data.email;
  const vL = byId("valLokasi");
  if (vL) vL.textContent = data.location;
  
  if (avatarPreview)
    avatarPreview.src =
      data.avatar || "https://via.placeholder.com/400x400.png?text=Foto+Profil";
}

function renderSocials() {
  if (socialLinks) socialLinks.innerHTML = "";
  if (sosmedList) sosmedList.innerHTML = "";
  (data.socials || []).forEach((s) => {
    if (socialLinks) {
      const a = document.createElement("a");
      a.href = s.href;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.title = s.name;
      a.innerHTML = iconFor(s.name);
      socialLinks.appendChild(a);
    }
    if (sosmedList) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "10px";
      row.style.marginTop = "8px";
      row.innerHTML = `<div style="width:36px;">${iconFor(s.name)}</div>
        <div style="flex:1"><div style='font-weight:600'>${escapeHtml(
          s.name
        )}</div><div class='muted' style='font-size:13px'>${escapeHtml(
        s.href
      )}</div></div>
        <div><button data-edit-social='${escapeHtml(
          s.name
        )}' class="icon-btn-plain">✏️</button></div>`;
      sosmedList.appendChild(row);
    }
  });
}

function renderPersonality() {
  if (!personaChips) return;
  personaChips.innerHTML = "";
  (data.personality || []).forEach((p, idx) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.innerHTML = `<span style="margin-right:8px">${escapeHtml(p)}</span>
      <button data-persona-edit="${idx}" title="Edit" style="background:transparent;border:0;cursor:pointer">✏️</button>
      <button data-persona-del="${idx}" title="Hapus" style="background:transparent;border:0;cursor:pointer">🗑️</button>`;
    personaChips.appendChild(span);
  });
}

function renderSkillBars() {
  if (!skillBarsEl) return;
  skillBarsEl.innerHTML = "";
  (data.skillBars || []).forEach((b, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "skill";
    wrapper.setAttribute("data-bar-index", idx);
    const percent = escapeHtml(b.percent || "");
    wrapper.innerHTML = `
      <div class="skill-row" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="bar-title">${escapeHtml(b.name)}</span>
          <span class="muted bar-percent">${percent}</span>
        </div>
        <div class="actions" style="display:flex;gap:8px;align-items:center">
          <button data-bar-edit="${idx}" title="Edit bar" class="icon-btn small">✏️</button>
          <button data-bar-del="${idx}" title="Hapus bar" class="icon-btn small ghost">🗑️</button>
        </div>
      </div>
      <div class="bar" role="progressbar" aria-valuenow="${parsePercentValue(
        percent
      )}" aria-valuemin="0" aria-valuemax="100" style="margin-top:8px">
        <div class="fill" data-fill="${percent}"></div>
      </div>`;
    skillBarsEl.appendChild(wrapper);
  });
  // animate
  document.querySelectorAll(".bar .fill").forEach((el) => {
    const w = el.getAttribute("data-fill") || "50%";
    el.style.width = "0";
    setTimeout(() => (el.style.width = w), 120);
  });
}

function renderTimeline() {
  if (!timelineList) return;
  timelineList.innerHTML = "";
  (data.timeline || []).forEach((it, idx) => {
    const div = document.createElement("div");
    div.className = "tl-item";
    div.innerHTML = `
      <div class="tl-header" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <h4 style="margin:0">${escapeHtml(it.title)}</h4>
        <div class="actions" style="display:flex;gap:8px;align-items:center">
          <button data-t-edit="${idx}" class="icon-btn small" title="Edit">✏️</button>
          <button data-t-del="${idx}" class="icon-btn small ghost" title="Hapus">🗑️</button>
        </div>
      </div>
      <p style="margin:8px 0 0 0">${escapeHtml(it.desc)}</p>`;
    timelineList.appendChild(div);
  });
}

/* RADAR (Chart.js) — gunakan skillBars; jika kosong, fallback ke personality (nilai 50%) */
function createOrUpdateRadar() {
  const canvas = byId("skillRadar");
  if (!canvas) return;

  const bars =
    Array.isArray(data.skillBars) && data.skillBars.length > 0
      ? data.skillBars
      : Array.isArray(data.personality) && data.personality.length > 0
      ? data.personality.map((p) => ({ name: p, percent: "50%" }))
      : [];

  const labels = bars.map((b) => String(b.name || "").slice(0, 20));
  const values = bars.map((b) => parsePercentValue(b.percent || 0));

  if (labels.length === 0) {
    if (radarChart) {
      radarChart.destroy();
      radarChart = null;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const note = byId("radarNote");
    if (note)
      note.textContent =
        "Belum ada skill bar — tambahkan Skill Bar untuk melihat radar.";
    return;
  }

  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim() || "#7c3aed";
  const accent2 =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-2")
      .trim() || "#3b82f6";

  const dataset = {
    label: data.name || "Skills",
    data: values,
    fill: true,
    backgroundColor: hexToRgba(accent2, 0.14),
    borderColor: accent,
    pointBackgroundColor: accent,
    pointBorderColor: "#fff",
    borderWidth: 1.6,
  };

  const cfg = {
    type: "radar",
    data: { labels, datasets: [dataset] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: 100,
          grid: { color: "rgba(0, 0, 0, 0.4)" },
          angleLines: { color: "rgba(0, 0, 0, 0.3)" },
          ticks: { display: false },
          pointLabels: { font: { size: 12 } },
        },
      },
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
    },
  };

  if (byId("radarWrap") && !byId("radarWrap").style.height)
    byId("radarWrap").style.height = "320px";
  const ctx = canvas.getContext("2d");
  if (radarChart) {
    radarChart.data.labels = labels;
    radarChart.data.datasets[0].data = values;
    radarChart.update();
  } else {
    radarChart = new Chart(ctx, cfg);
  }
  const note = byId("radarNote");
  if (note)
    note.textContent = "Skill Radar: menggambarkan Skill Bars saat ini.";
}

/* hex->rgba helper */
function hexToRgba(hex = "#000000", alpha = 1) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* EVENT BINDINGS (robust checks) */
document.addEventListener("click", (ev) => {
  // edit bio fields
  const btn = ev.target.closest(".edit, [data-edit]");
  if (btn) {
    const key = btn.getAttribute("data-edit");
    if (!key) return;
    const labelMap = {
      nama: "Nama",
      umur: "Umur",
      email: "Email",
      lokasi: "Lokasi",
    };
    const currentVal = {
      nama: data.name,
      umur: data.age,
      email: data.email,
      lokasi: data.location,
    }[key];
    const res = prompt("Edit " + (labelMap[key] || key), currentVal);
    if (res === null) return;
    const v = res.trim();
    if (key === "nama") data.name = v || currentVal;
    if (key === "umur") data.age = v || currentVal;
    if (key === "email") data.email = v || currentVal;
    if (key === "lokasi") data.location = v || currentVal;
    saveData(data);
    render();
    showToast("Data biodata diperbarui", true);
    return;
  }

  // timeline/socials delegation handled elsewhere (see specific listeners)
});

/* Personality: add/edit/delete */
if (addPersonaBtn) {
  addPersonaBtn.addEventListener("click", () => {
    const v = ((newPersonaInput && newPersonaInput.value) || "").trim();
    if (!v) return showToast("Isi personality terlebih dahulu", false);
    data.personality = data.personality || [];
    data.personality.push(v);
    saveData(data);
    render();
    if (newPersonaInput) newPersonaInput.value = "";
    showToast("Personality ditambahkan", true);
  });
}

if (personaChips) {
  personaChips.addEventListener("click", (ev) => {
    const edit = ev.target.closest("[data-persona-edit]");
    const del = ev.target.closest("[data-persona-del]");
    if (edit) {
      const idx = Number(edit.getAttribute("data-persona-edit"));
      const cur = data.personality[idx];
      const nw = prompt("Edit personality", cur);
      if (nw === null) return;
      data.personality[idx] = nw.trim() || cur;
      saveData(data);
      render();
      showToast("Personality diubah", true);
      return;
    }
    if (del) {
      const idx = Number(del.getAttribute("data-persona-del"));
      if (confirm("Hapus personality ini?")) {
        data.personality.splice(idx, 1);
        saveData(data);
        render();
        showToast("Personality dihapus", true);
      }
      return;
    }
  });
}

/* Skill bars: add/edit/delete */
if (addBarBtn) {
  addBarBtn.addEventListener("click", () => {
    const name = prompt("Nama skill baru (mis: DevOps)", "");
    if (name === null || !name.trim()) return;
    let pct = prompt("Persentase (mis: 70%)", "50%");
    if (pct === null) return;
    pct = String(pct).trim();
    if (/^\d+$/.test(pct)) pct = pct + "%";
    if (!/^\d{1,3}%$/.test(pct)) {
      alert("Format persentase salah. Contoh: 75%");
      return;
    }
    data.skillBars = data.skillBars || [];
    data.skillBars.push({ name: name.trim(), percent: pct });
    saveData(data);
    render();
    showToast("Skill bar ditambahkan", true);
  });
}
if (skillBarsEl) {
  skillBarsEl.addEventListener("click", (ev) => {
    const edit = ev.target.closest("[data-bar-edit]");
    const del = ev.target.closest("[data-bar-del]");
    if (edit) {
      const idx = Number(edit.getAttribute("data-bar-edit"));
      const cur = data.skillBars[idx];
      const newName = prompt("Nama skill:", cur.name);
      if (newName === null) return;
      let newPct = prompt("Persentase (contoh: 75%)", cur.percent);
      if (newPct === null) return;
      newPct = String(newPct).trim();
      if (/^\d+$/.test(newPct)) newPct = newPct + "%";
      if (!/^\d{1,3}%$/.test(newPct)) {
        alert("Format persentase salah.");
        return;
      }
      data.skillBars[idx] = {
        name: newName.trim() || cur.name,
        percent: newPct,
      };
      saveData(data);
      render();
      showToast("Skill bar diubah", true);
      return;
    }
    if (del) {
      const idx = Number(del.getAttribute("data-bar-del"));
      if (confirm("Hapus skill bar ini?")) {
        data.skillBars.splice(idx, 1);
        saveData(data);
        render();
        showToast("Skill bar dihapus", true);
      }
      return;
    }
  });

  // double click convenience to add
  skillBarsEl.addEventListener("dblclick", () => {
    const name = prompt("Nama skill baru (mis: DevOps)");
    if (name === null) return;
    let pct = prompt("Persentase (mis: 70%)", "50%");
    if (pct === null) return;
    pct = String(pct).trim();
    if (/^\d+$/.test(pct)) pct = pct + "%";
    if (!/^\d{1,3}%$/.test(pct)) {
      alert("Format persentase salah.");
      return;
    }
    data.skillBars = data.skillBars || [];
    data.skillBars.push({ name: name.trim(), percent: pct });
    saveData(data);
    render();
    showToast("Skill bar ditambahkan", true);
  });
}

/* Timeline */
if (addTimelineBtn) {
  addTimelineBtn.addEventListener("click", () => {
    const title = prompt("Judul (mis: 2024 — Pekerjaan baru)", "");
    if (title === null) return;
    const desc = prompt("Deskripsi / detail", "");
    if (desc === null) return;
    data.timeline = data.timeline || [];
    data.timeline.push({ title: title.trim(), desc: desc.trim() });
    saveData(data);
    render();
    showToast("Entri timeline ditambahkan", true);
  });
}
if (timelineList) {
  timelineList.addEventListener("click", (ev) => {
    const edit = ev.target.closest("[data-t-edit]");
    const del = ev.target.closest("[data-t-del]");
    if (edit) {
      const idx = Number(edit.getAttribute("data-t-edit"));
      const cur = data.timeline[idx];
      const newTitle = prompt("Edit judul", cur.title);
      if (newTitle === null) return;
      const newDesc = prompt("Edit deskripsi", cur.desc);
      if (newDesc === null) return;
      data.timeline[idx] = { title: newTitle.trim(), desc: newDesc.trim() };
      saveData(data);
      render();
      showToast("Entri timeline diubah", true);
      return;
    }
    if (del) {
      const idx = Number(del.getAttribute("data-t-del"));
      if (confirm("Hapus entri ini?")) {
        data.timeline.splice(idx, 1);
        saveData(data);
        render();
        showToast("Entri timeline dihapus", true);
      }
      return;
    }
  });
}

/* Social edit */
if (sosmedList) {
  sosmedList.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-edit-social]");
    if (!btn) return;
    const name = btn.getAttribute("data-edit-social");
    const idx = data.socials.findIndex((s) => s.name === name);
    if (idx === -1) return alert("Sosial media tidak ditemukan");
    const newHref = prompt("Ganti URL untuk " + name, data.socials[idx].href);
    if (newHref !== null) {
      data.socials[idx].href = newHref;
      saveData(data);
      render();
      showToast("Link sosial diubah", true);
    }
  });
}

/* Avatar upload & edit profile */
const avatarInput = byId("avatarInput");
if (avatarInput) {
  avatarInput.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      data.avatar = r.result;
      saveData(data);
      render();
      showToast("Foto profil diperbarui", true);
    };
    r.readAsDataURL(f);
  });
  const wrap = document.querySelector(".avatar-wrap");
  if (wrap) wrap.addEventListener("click", () => avatarInput.click());
}
const editProfileBtn = byId("editProfile");
if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {
    const n = prompt("Nama", data.name);
    if (n === null) return;
    const r = prompt("Pekerjaan / peran", data.role);
    if (r === null) return;
    data.name = n;
    data.role = r;
    saveData(data);
    render();
    showToast("Profil diperbarui", true);
  });
}

/* Tabs */
document.querySelectorAll(".tabs button[data-tab]").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".tabs button")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    const tab = b.getAttribute("data-tab");
    document
      .querySelectorAll("[data-panel]")
      .forEach(
        (p) =>
          (p.style.display =
            p.getAttribute("data-panel") === tab ? "block" : "none")
      );
  })
);

/* Contact modal open/close */
const openContact = byId("openContact");
if (openContact)
  openContact.addEventListener("click", () => {
    if (modal) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    }
  });
if (closeModalBtn)
  closeModalBtn.addEventListener("click", () => {
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  });

/* Send contact (dynamic recipient from #cto) */
if (sendContactBtn) {
  sendContactBtn.addEventListener("click", async (ev) => {
    ev && ev.preventDefault && ev.preventDefault();
    const n = ((byId("cname") && byId("cname").value) || "").trim();
    const e = ((byId("cemail") && byId("cemail").value) || "").trim();
    const m = ((byId("cmessage") && byId("cmessage").value) || "").trim();
    const to = ((byId("cto") && byId("cto").value) || "").trim();
    if (!n || !e || !m || !to)
      return alert("Isi semua kolom termasuk alamat penerima.");
    if (!isValidEmail(e)) return alert("Alamat email pengirim tidak valid.");
    if (!isValidEmail(to)) return alert("Alamat email penerima tidak valid.");
    if (!isAllowedDomain(to)) {
      if (
        !confirm(
          "Alamat penerima berada di luar domain yang diizinkan. Lanjutkan pengiriman?"
        )
      )
        return;
    }
    if (!confirm(`Kirim pesan ke: ${to}\nDari: ${n} <${e}>\n\nLanjutkan?`))
      return;

    const templateParams = {
      title: `Pesan dari ${n}`,
      name: n,
      email: e,
      message: m,
      time: new Date().toLocaleString(),
      to_email: to,
    };
    const haveIds =
      EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_USER_ID;
    if (window.emailjs && typeof emailjs.send === "function" && haveIds) {
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams
        );
        showToast("Pesan berhasil dikirim!", true);
        if (modal) {
          modal.classList.remove("open");
          modal.setAttribute("aria-hidden", "true");
        }
        ["cname", "cemail", "cmessage", "cto"].forEach((id) => {
          const el = byId(id);
          if (el) el.value = "";
        });
        return;
      } catch (err) {
        console.error("EmailJS send failed:", err);
      }
    }
    // fallback mailto
    showToast(
      "EmailJS belum siap — membuka klien email sebagai fallback.",
      false,
      2000
    );
    const subject = encodeURIComponent("Pesan dari " + n);
    const body = encodeURIComponent(m + "\n\n---\nFrom: " + n + " <" + e + ">");
    window.location.href = `mailto:${encodeURIComponent(
      to
    )}?subject=${subject}&body=${body}`;
  });
}

/* Export / vCard / theme / logout / keyboard */
const downloadVcard = byId("downloadVcard");
if (downloadVcard)
  downloadVcard.addEventListener("click", () => {
    const v = `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name}\nEMAIL:${data.email}\nORG:${data.role}\nADR:;;${data.location}\nEND:VCARD`;
    const blob = new Blob([v], { type: "text/vcard" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = data.name.replace(/\s+/g, "_") + ".vcf";
    a.click();
    URL.revokeObjectURL(a.href);
  });
const exportJson = byId("exportJson");
if (exportJson)
  exportJson.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (data.name || "profile") + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

const themeToggle = byId("themeToggle");
function applyTheme(t) {
  if (t === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (themeToggle) themeToggle.textContent = "🌙";
  }
  localStorage.setItem("bio:theme", t);
}
if (themeToggle)
  themeToggle.addEventListener("click", () => {
    const cur = localStorage.getItem("bio:theme") || "light";
    applyTheme(cur === "light" ? "dark" : "light");
  });
applyTheme(localStorage.getItem("bio:theme") || "light");

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "e") {
    e.preventDefault();
    const ex = byId("exportJson");
    if (ex) ex.click();
  }
});

(function setupLogout() {
  const logoutBtn = byId("logoutBtn");
  if (logoutBtn)
    logoutBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      try {
        localStorage.setItem("bio:logged", "0");
        localStorage.removeItem("bio:user");
      } catch {}
      window.location.href = "login.html";
    });
})();

/* TOAST */
function showToast(msg, success = true, ms = 2500) {
  if (!toastEl) return;
  toastEl.style.display = "block";
  toastEl.style.opacity = "1";
  toastEl.style.transform = "translateY(0)";
  toastEl.style.background = success
    ? "linear-gradient(90deg,var(--accent),var(--accent-2))"
    : "linear-gradient(90deg,#c53030,#f56565)";
  toastEl.textContent = msg;
  setTimeout(() => {
    toastEl.style.transition = "all 300ms ease";
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateY(12px)";
    setTimeout(() => {
      toastEl.style.display = "none";
      toastEl.style.transition = "";
    }, 300);
  }, ms);
}

/* MAIN render */
function render() {
  renderProfile();
  renderSocials();
  renderPersonality();
  renderSkillBars();
  renderTimeline();
  createOrUpdateRadar();
  const y = byId("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* ENFORCE login (early) */
(function enforceLogin() {
  const logged = localStorage.getItem("bio:logged");
  const cur = localStorage.getItem("bio:user");
  if (logged !== "1" || !cur) {
    window.location.href = "login.html";
  }
})();

/* BOOT */
render();

/* EOF */
