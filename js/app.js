/**
 * Maktabah Maftoohah Master Portal Application
 * Zero-Build Vanilla ES6
 */

import { translations } from './i18n.js';

let catalogueData = { works: [] };
let currentLang = localStorage.getItem('mm_lang') || 'ms';
let currentTheme = localStorage.getItem('mm_theme') || 'light';
let selectedCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initLanguage();
  initServiceWorker();
  setupEventListeners();
  await loadCatalogue();
});

function initTheme() {
  document.body.setAttribute('data-theme', currentTheme);
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  }
}

function initLanguage() {
  applyTranslations();
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.textContent = currentLang.toUpperCase();
  }
}

function applyTranslations() {
  const t = translations[currentLang] || translations.ms;
  
  // Update static text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Update inputs with data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (t[key]) {
      el.placeholder = t[key];
    }
  });

  document.documentElement.lang = currentLang;
}

function initServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('ServiceWorker registration skipped or failed:', err);
    });
  }
}

function setupEventListeners() {
  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', currentTheme);
      localStorage.setItem('mm_theme', currentTheme);
      themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    });
  }

  // Language Toggle
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'ms' ? 'en' : 'ms';
      localStorage.setItem('mm_lang', currentLang);
      langToggle.textContent = currentLang.toUpperCase();
      applyTranslations();
      renderWorks();
    });
  }

  // Search Input
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (searchClear) {
        searchClear.style.display = searchQuery ? 'block' : 'none';
      }
      renderWorks();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        renderWorks();
      }
    });
  }

  // Category Filter Pills
  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.getAttribute('data-category');
      renderWorks();
    });
  });
}

async function loadCatalogue() {
  const container = document.getElementById('worksGrid');
  try {
    const response = await fetch('./data/catalogue.json');
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    catalogueData = await response.json();
    updateStats();
    renderWorks();
  } catch (err) {
    console.error('Failed to load catalogue:', err);
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <p>Gagal memuatkan data katalog. Sila muat semula halaman.</p>
        </div>
      `;
    }
  }
}

function updateStats() {
  const works = catalogueData.works || [];
  const statWorks = document.getElementById('statWorks');
  const statLive = document.getElementById('statLive');

  if (statWorks) statWorks.textContent = works.length;
  if (statLive) {
    const liveCount = works.filter(w => w.status === 'active' || w.status === 'in-development').length;
    statLive.textContent = liveCount;
  }
}

function renderWorks() {
  const container = document.getElementById('worksGrid');
  if (!container) return;

  const t = translations[currentLang] || translations.ms;
  let filtered = (catalogueData.works || []).filter(work => {
    // Category match
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'quran' && work.category !== 'quran') return false;
      if (selectedCategory === 'kutub-as-sittah' && work.collection !== 'kutub-as-sittah') return false;
      if (selectedCategory === 'musnad' && work.collection !== 'musnad' && work.collection !== 'early-musannaf') return false;
      if (selectedCategory === 'ahkam' && work.collection !== 'ahadith-al-ahkam' && work.collection !== 'compilations') return false;
      if (selectedCategory === 'tafsir' && work.category !== 'tafsir') return false;
      if (selectedCategory === 'rijal' && work.category !== 'rijal') return false;
      if (selectedCategory === 'seerah' && work.category !== 'seerah') return false;
    }

    // Search query match
    if (searchQuery) {
      const q = searchQuery;
      const matchTitle = (work.title || '').toLowerCase().includes(q);
      const matchTitleAr = (work.title_ar || '').toLowerCase().includes(q);
      const matchAuthor = (work.author || '').toLowerCase().includes(q);
      const matchDesc = (work.description || '').toLowerCase().includes(q);
      const matchName = (work.name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchTitleAr && !matchAuthor && !matchDesc && !matchName) {
        return false;
      }
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>${currentLang === 'ms' ? 'Tiada kitab ditemui yang sepadan dengan carian.' : 'No works found matching your search.'}</p>
      </div>
    `;
    return;
  }

  // Prioritize active and in-development works at top
  filtered.sort((a, b) => {
    const order = { 'active': 1, 'in-development': 2, 'planned': 3 };
    const diff = (order[a.status] || 9) - (order[b.status] || 9);
    if (diff !== 0) return diff;
    return (a.priority || 99) - (b.priority || 99);
  });

  container.innerHTML = filtered.map(work => {
    const isLive = work.status === 'active' || work.status === 'in-development';
    const statusClass = work.status === 'active' ? 'live' : (work.status === 'in-development' ? 'in-development' : 'planned');
    const statusText = work.status === 'active' ? t.badgeLive : (work.status === 'in-development' ? t.badgeDev : t.badgePlanned);

    const liveLink = work.live_url || `./${work.name}/`;
    const githubLink = work.github_url || `https://github.com/maktabah-maftoohah/${work.name}`;

    return `
      <article class="work-card ${isLive ? 'featured' : ''}">
        <div>
          <div class="work-header">
            <span class="status-badge ${statusClass}">${statusText}</span>
            ${work.collection ? `<span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">#${escapeHtml(work.collection)}</span>` : ''}
          </div>
          <h2 class="work-title">${escapeHtml(work.title)}</h2>
          ${work.title_ar ? `<p class="work-title-ar">${escapeHtml(work.title_ar)}</p>` : ''}
          ${work.author ? `<p class="work-author"><strong>${t.labelAuthor}</strong> ${escapeHtml(work.author)}</p>` : ''}
          <p class="work-desc">${escapeHtml(work.description || '')}</p>
        </div>

        <div>
          <div class="work-meta">
            ${work.metrics && work.metrics.surahs ? `
              <div class="meta-row"><span class="meta-label">Surah / Ayat:</span><span class="meta-val">${work.metrics.surahs} Surah (${work.metrics.ayahs || 6236} Ayat)</span></div>
            ` : ''}
            ${work.metrics && work.metrics.books ? `
              <div class="meta-row"><span class="meta-label">Kitab (Bab):</span><span class="meta-val">${work.metrics.books} Kitab</span></div>
            ` : ''}
            ${work.metrics && work.metrics.estimated_hadiths ? `
              <div class="meta-row"><span class="meta-label">Anggaran Hadis:</span><span class="meta-val">${work.metrics.estimated_hadiths.toLocaleString()} Hadis</span></div>
            ` : ''}
            <div class="meta-row"><span class="meta-label">Format:</span><span class="meta-val">Zero-Build PWA</span></div>
          </div>

          <div class="work-actions">
            ${isLive ? `
              <a href="${escapeHtml(liveLink)}" class="btn-open">
                <span>📖</span> ${t.btnOpenReader}
              </a>
            ` : `
              <span class="btn-open" style="background:var(--border); color:var(--text-muted); cursor:not-allowed;">
                <span>⏳</span> ${t.badgePlanned}
              </span>
            `}
            <a href="${escapeHtml(githubLink)}" target="_blank" rel="noopener noreferrer" class="btn-repo" title="${t.btnGitHub}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
