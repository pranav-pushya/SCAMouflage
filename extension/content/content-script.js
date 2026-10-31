/**
 * PhishShield India - Content Script
 * Injected into WhatsApp Web, Gmail, Telegram Web, Outlook, and all web pages.
 * Provides real-time text selection scanning HUD, active URL threat banner,
 * and context-action triggers.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__PHISHSHIELD_INJECTED__) return;
  window.__PHISHSHIELD_INJECTED__ = true;

  let currentSettings = {
    floatingHudEnabled: true,
    autoScanSelection: false,
    urlWarningBannerEnabled: true,
    theme: 'dark'
  };

  // Sync settings
  chrome.storage.local.get(currentSettings, (stored) => {
    Object.assign(currentSettings, stored);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      for (const [key, change] of Object.entries(changes)) {
        currentSettings[key] = change.newValue;
      }
      applyThemeToElements();
    }
  });

  // Host detection helper
  function detectHostApp() {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('whatsapp.com')) return 'WhatsApp Web';
    if (host.includes('mail.google.com')) return 'Gmail';
    if (host.includes('telegram.org')) return 'Telegram Web';
    if (host.includes('outlook.')) return 'Outlook Web';
    if (host.includes('mail.yahoo.')) return 'Yahoo Mail';
    if (host.includes('discord.com')) return 'Discord';
    if (host.includes('slack.com')) return 'Slack';
    if (host.includes('linkedin.com')) return 'LinkedIn';
    if (host.includes('x.com') || host.includes('twitter.com')) return 'X / Twitter';
    return 'Web Page';
  }

  // --- FLOATING SELECTION SCANNER ---
  let floatingBtn = null;
  let inspectorCard = null;
  let activeSelectionText = '';
  let activeRangeRect = null;

  function removeFloatingBtn() {
    if (floatingBtn && floatingBtn.parentNode) {
      floatingBtn.parentNode.removeChild(floatingBtn);
    }
    floatingBtn = null;
  }

  function removeInspectorCard() {
    if (inspectorCard && inspectorCard.parentNode) {
      inspectorCard.parentNode.removeChild(inspectorCard);
    }
    inspectorCard = null;
  }

  function getCleanSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return '';
    const text = sel.toString().trim();
    if (text.length < 5) return '';
    return text;
  }

  // Handle text selection
  document.addEventListener('mouseup', (e) => {
    // Ignore clicks inside our own UI elements
    if (e.target.closest('#ps-inspector-card') || e.target.closest('#ps-floating-btn') || e.target.closest('#ps-url-banner')) {
      return;
    }

    setTimeout(() => {
      const selectedText = getCleanSelection();
      if (!selectedText || !currentSettings.floatingHudEnabled) {
        removeFloatingBtn();
        return;
      }

      activeSelectionText = selectedText;

      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      activeRangeRect = range.getBoundingClientRect();

      if (currentSettings.autoScanSelection) {
        showInspectorCard(activeSelectionText, activeRangeRect);
      } else {
        showFloatingBtn(activeRangeRect);
      }
    }, 100);
  });

  // Dismiss HUD on outside click or Esc
  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('#ps-inspector-card') || e.target.closest('#ps-floating-btn') || e.target.closest('#ps-url-banner')) {
      return;
    }
    removeFloatingBtn();
    removeInspectorCard();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeFloatingBtn();
      removeInspectorCard();
    }
  });

  function showFloatingBtn(rect) {
    removeFloatingBtn();

    floatingBtn = document.createElement('div');
    floatingBtn.id = 'ps-floating-btn';
    floatingBtn.className = `ps-reset ps-theme-${currentSettings.theme}`;
    floatingBtn.innerHTML = `
      <button type="button" class="ps-trigger-btn" title="Scan selected message for scams and phishing with PhishShield">
        <svg class="ps-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span class="ps-label">Scan with PhishShield</span>
      </button>
    `;

    // Position above or below selection
    const top = window.scrollY + rect.top - 38;
    const left = window.scrollX + Math.max(10, rect.left + (rect.width / 2) - 80);

    floatingBtn.style.top = `${Math.max(10, top)}px`;
    floatingBtn.style.left = `${left}px`;

    document.body.appendChild(floatingBtn);

    floatingBtn.querySelector('.ps-trigger-btn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      removeFloatingBtn();
      showInspectorCard(activeSelectionText, rect);
    });
  }

  function showInspectorCard(text, rect) {
    removeInspectorCard();

    const hostApp = detectHostApp();

    inspectorCard = document.createElement('div');
    inspectorCard.id = 'ps-inspector-card';
    inspectorCard.className = `ps-reset ps-theme-${currentSettings.theme} ps-card-entering`;

    // Position card
    let top = window.scrollY + (rect ? rect.bottom + 10 : 80);
    let left = window.scrollX + (rect ? Math.max(16, rect.left) : 80);

    // Keep inside viewport width
    const maxWidth = 380;
    if (left + maxWidth > window.innerWidth + window.scrollX) {
      left = Math.max(16, window.innerWidth + window.scrollX - maxWidth - 24);
    }

    inspectorCard.style.top = `${top}px`;
    inspectorCard.style.left = `${left}px`;

    // Initial loading state
    inspectorCard.innerHTML = `
      <div class="ps-card-header">
        <div class="ps-card-brand">
          <span class="ps-pulse-dot"></span>
          <span class="ps-brand-title">PHISHSHIELD // INDIA</span>
          <span class="ps-badge-source">${hostApp}</span>
        </div>
        <button type="button" class="ps-close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="ps-card-body ps-loading-state">
        <div class="ps-spinner"></div>
        <div class="ps-loading-text">Analyzing message against Indian cyber scam vectors...</div>
      </div>
    `;

    document.body.appendChild(inspectorCard);

    inspectorCard.querySelector('.ps-close-btn').addEventListener('click', () => {
      removeInspectorCard();
    });

    // Request analysis from background worker
    chrome.runtime.sendMessage({ action: 'ANALYZE_TEXT', text }, (res) => {
      if (!inspectorCard) return;

      const analysis = res || {
        verdict: 'low',
        score: 0,
        summary: 'No response from analysis engine.',
        reasons: [],
        flags: [],
        next_steps: []
      };

      renderInspectorResult(analysis, text, hostApp);
    });
  }

  function renderInspectorResult(data, snippetText, hostApp) {
    if (!inspectorCard) return;

    const isHigh = data.verdict === 'high' || data.score >= 65;
    const isMed = !isHigh && (data.verdict === 'medium' || data.score >= 35);
    const isSafe = !isHigh && !isMed;

    const verdictLabel = isHigh ? 'SCAM / PHISHING DETECTED' : isMed ? 'SUSPICIOUS MESSAGE' : 'VERIFIED SAFE';
    const verdictClass = isHigh ? 'ps-verdict-danger' : isMed ? 'ps-verdict-warning' : 'ps-verdict-safe';
    const scoreColor = isHigh ? '#EF4444' : isMed ? '#FBBF24' : '#34D399';

    const reasonsList = (data.reasons && data.reasons.length > 0)
      ? data.reasons.map(r => `<li>${escapeHtml(r)}</li>`).join('')
      : '<li>No overt phishing heuristics detected in this text.</li>';

    const nextStepsList = (data.next_steps && data.next_steps.length > 0)
      ? data.next_steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')
      : '<li>Stay vigilant when receiving unexpected links or calls.</li>';

    inspectorCard.innerHTML = `
      <div class="ps-card-header">
        <div class="ps-card-brand">
          <svg class="ps-header-icon" viewBox="0 0 24 24" fill="none" stroke="${scoreColor}" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span class="ps-brand-title">PHISHSHIELD // INDIA</span>
          <span class="ps-badge-source">${escapeHtml(hostApp)}</span>
        </div>
        <button type="button" class="ps-close-btn" aria-label="Close">&times;</button>
      </div>

      <div class="ps-card-body">
        <!-- Verdict Banner -->
        <div class="ps-verdict-box ${verdictClass}">
          <div class="ps-verdict-header">
            <span class="ps-verdict-text">${verdictLabel}</span>
            <span class="ps-score-badge" style="color:${scoreColor}">${data.score}/100</span>
          </div>
          <div class="ps-meter-track">
            <div class="ps-meter-fill" style="width:${Math.max(5, data.score)}%; background-color:${scoreColor}"></div>
          </div>
        </div>

        <!-- Summary -->
        <div class="ps-summary-text">${escapeHtml(data.summary || '')}</div>

        <!-- Reasons -->
        <div class="ps-section">
          <div class="ps-section-title">DETECTION SIGNALS</div>
          <ul class="ps-reasons-list">
            ${reasonsList}
          </ul>
        </div>

        <!-- Next Steps & Helpline -->
        <div class="ps-section">
          <div class="ps-section-title">RECOMMENDED ACTION</div>
          <ul class="ps-advice-list">
            ${nextStepsList}
          </ul>
        </div>

        <!-- National Cyber Helpline Alert -->
        <div class="ps-helpline-box">
          <span class="ps-hl-icon">🚨</span>
          <div>
            <div>National Cyber Helpline: <strong>1930</strong></div>
            <div class="ps-hl-sub">File complaint: <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a></div>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="ps-card-footer">
          <button type="button" class="ps-btn-secondary" id="ps-copy-report-btn">📋 Copy Report</button>
          <button type="button" class="ps-btn-primary" id="ps-open-dashboard-btn">🛡️ Full Dashboard</button>
        </div>
      </div>
    `;

    inspectorCard.querySelector('.ps-close-btn').addEventListener('click', () => {
      removeInspectorCard();
    });

    const copyBtn = inspectorCard.querySelector('#ps-copy-report-btn');
    copyBtn.addEventListener('click', () => {
      const report = `[PhishShield India Report]\nVerdict: ${verdictLabel}\nThreat Score: ${data.score}/100\nReasons:\n- ${data.reasons.join('\n- ')}\nHelpline: 1930 (cybercrime.gov.in)`;
      navigator.clipboard.writeText(report).then(() => {
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => { if (copyBtn) copyBtn.textContent = '📋 Copy Report'; }, 2000);
      });
    });

    inspectorCard.querySelector('#ps-open-dashboard-btn').addEventListener('click', () => {
      window.open('http://localhost:5173', '_blank');
    });
  }

  // --- REAL-TIME URL THREAT WARNING BANNER ---
  let urlWarningBanner = null;

  function showUrlWarningBanner(analysis) {
    if (urlWarningBanner && urlWarningBanner.parentNode) {
      urlWarningBanner.parentNode.removeChild(urlWarningBanner);
    }

    urlWarningBanner = document.createElement('div');
    urlWarningBanner.id = 'ps-url-banner';
    urlWarningBanner.className = `ps-reset ps-theme-${currentSettings.theme} ps-banner-danger`;

    urlWarningBanner.innerHTML = `
      <div class="ps-banner-inner">
        <div class="ps-banner-left">
          <span class="ps-banner-icon">🚨</span>
          <span class="ps-banner-alert-tag">PHISHSHIELD SECURITY ALERT</span>
          <span class="ps-banner-msg">
            High-risk phishing / scam site detected! Threat Score: <strong>${analysis.score}/100</strong>.
            Do not enter passwords, OTPs, or bank details.
          </span>
        </div>
        <div class="ps-banner-right">
          <button type="button" class="ps-banner-btn" id="ps-view-threat-btn">View Analysis</button>
          <button type="button" class="ps-banner-dismiss" id="ps-dismiss-banner-btn" title="Dismiss warning">&times;</button>
        </div>
      </div>
    `;

    document.body.prepend(urlWarningBanner);

    urlWarningBanner.querySelector('#ps-view-threat-btn').addEventListener('click', () => {
      showInspectorCard(window.location.href, { top: 60, left: 24, bottom: 60, width: 200 });
    });

    urlWarningBanner.querySelector('#ps-dismiss-banner-btn').addEventListener('click', () => {
      if (urlWarningBanner && urlWarningBanner.parentNode) {
        urlWarningBanner.parentNode.removeChild(urlWarningBanner);
      }
      urlWarningBanner = null;
    });
  }

  // Apply theme classes
  function applyThemeToElements() {
    const themeClass = `ps-theme-${currentSettings.theme}`;
    if (floatingBtn) {
      floatingBtn.className = `ps-reset ${themeClass}`;
    }
    if (inspectorCard) {
      inspectorCard.className = `ps-reset ${themeClass}`;
    }
    if (urlWarningBanner) {
      urlWarningBanner.className = `ps-reset ${themeClass} ps-banner-danger`;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Listen for messages from background script (Context menu or URL scan)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SHOW_URL_WARNING_BANNER' && request.analysis) {
      if (currentSettings.urlWarningBannerEnabled) {
        showUrlWarningBanner(request.analysis);
      }
      sendResponse({ status: 'ok' });
    }

    if (request.action === 'TRIGGER_MANUAL_SELECTION_SCAN' && request.text) {
      const sel = window.getSelection();
      let rect = { top: 120, left: 100, bottom: 120, width: 200 };
      if (sel && sel.rangeCount > 0) {
        rect = sel.getRangeAt(0).getBoundingClientRect();
      }
      showInspectorCard(request.text, rect);
      sendResponse({ status: 'ok' });
    }

    if (request.action === 'TRIGGER_LINK_SCAN' && request.url) {
      showInspectorCard(request.url, { top: 120, left: 100, bottom: 120, width: 200 });
      sendResponse({ status: 'ok' });
    }

    if (request.action === 'TRIGGER_PAGE_SCAN' && request.url) {
      showInspectorCard(request.url, { top: 60, left: 40, bottom: 60, width: 200 });
      sendResponse({ status: 'ok' });
    }
  });

})();
