/**
 * PhishShield India - Content Script
 * Injected into WhatsApp Web, Gmail, Telegram Web, Outlook, and all web pages.
 * Features:
 *  1. Real-time on-demand "Scan Page" button (Floating Action Button + Popup trigger)
 *  2. On-screen message & hyperlink threat crawler
 *  3. Visual on-page threat highlighting (red/amber warning glow on scam messages)
 *  4. Real-time text selection scanner HUD
 *  5. Active URL threat banner
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__PHISHSHIELD_INJECTED__) return;
  window.__PHISHSHIELD_INJECTED__ = true;

  let currentSettings = {
    floatingHudEnabled: true,
    floatingPageScanFabEnabled: true,
    autoScanSelection: false,
    urlWarningBannerEnabled: true,
    theme: 'dark'
  };

  // Sync settings
  chrome.storage.local.get(currentSettings, (stored) => {
    Object.assign(currentSettings, stored);
    initFloatingScanFab();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      for (const [key, change] of Object.entries(changes)) {
        currentSettings[key] = change.newValue;
      }
      applyThemeToElements();
      if ('floatingPageScanFabEnabled' in changes) {
        if (currentSettings.floatingPageScanFabEnabled) {
          initFloatingScanFab();
        } else {
          removeFloatingScanFab();
        }
      }
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

  // --- 1. FLOATING "SCAN PAGE" ON-SCREEN BUTTON (FAB) ---
  let pageScanFab = null;
  let pageScanModal = null;
  let activeHighlightedElements = [];

  function initFloatingScanFab() {
    if (!currentSettings.floatingPageScanFabEnabled) return;
    if (document.getElementById('ps-page-scan-fab')) return;

    pageScanFab = document.createElement('div');
    pageScanFab.id = 'ps-page-scan-fab';
    pageScanFab.className = `ps-reset ps-theme-${currentSettings.theme}`;
    pageScanFab.innerHTML = `
      <button type="button" class="ps-fab-main-btn" title="PhishShield: Scan entire page, messages & links">
        <svg class="ps-fab-shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span class="ps-fab-label">Scan Page</span>
      </button>
    `;

    document.body.appendChild(pageScanFab);

    const btn = pageScanFab.querySelector('.ps-fab-main-btn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.add('ps-fab-scanning');
      btn.querySelector('.ps-fab-label').textContent = 'Scanning...';

      setTimeout(() => {
        const report = runFullPageScan(true);
        btn.classList.remove('ps-fab-scanning');
        btn.querySelector('.ps-fab-label').textContent = 'Scan Page';
      }, 150);
    });
  }

  function removeFloatingScanFab() {
    if (pageScanFab && pageScanFab.parentNode) {
      pageScanFab.parentNode.removeChild(pageScanFab);
    }
    pageScanFab = null;
  }

  // --- 2. FULL PAGE MESSAGE & LINK CRAWLER ---
  function extractPageContent() {
    const host = window.location.hostname.toLowerCase();
    const messages = [];
    const links = [];

    // Platform-specific message extraction
    if (host.includes('whatsapp.com')) {
      const bubbleSelectors = [
        'div.copyable-text',
        'span.selectable-text',
        'div[role="row"] span[dir="ltr"]',
        'div._amkd span',
        'div[data-pre-plain-text]'
      ];
      const elements = document.querySelectorAll(bubbleSelectors.join(','));
      elements.forEach(el => {
        const text = (el.innerText || el.textContent || '').trim();
        if (text.length >= 8 && !messages.some(m => m.text === text)) {
          messages.push({ element: el, text, type: 'WhatsApp Message' });
        }
      });
    } else if (host.includes('mail.google.com')) {
      const subjectEl = document.querySelector('h2.hP') || document.querySelector('div[role="main"] h2');
      if (subjectEl) {
        const subj = (subjectEl.innerText || subjectEl.textContent || '').trim();
        if (subj.length >= 5) {
          messages.push({ element: subjectEl, text: `Subject: ${subj}`, type: 'Email Subject' });
        }
      }
      const bodySelectors = ['.a3s', '.adn', 'div[role="listitem"] .ii.gt', 'div[aria-label="Message Body"]'];
      const bodyEls = document.querySelectorAll(bodySelectors.join(','));
      bodyEls.forEach(el => {
        const text = (el.innerText || el.textContent || '').trim();
        if (text.length >= 15 && !messages.some(m => m.text === text)) {
          messages.push({ element: el, text, type: 'Email Body' });
        }
      });
    } else if (host.includes('telegram.org')) {
      const tgSelectors = ['.message', '.bubble', '.text-content', '.message-content'];
      const elements = document.querySelectorAll(tgSelectors.join(','));
      elements.forEach(el => {
        const text = (el.innerText || el.textContent || '').trim();
        if (text.length >= 8 && !messages.some(m => m.text === text)) {
          messages.push({ element: el, text, type: 'Telegram Message' });
        }
      });
    } else {
      // General web page: search headings, paragraphs, comment boxes, cards
      const genSelectors = [
        'article p', 'main p', '.post-content', '.comment-text',
        'div[role="article"]', '.card-text', 'p', 'blockquote'
      ];
      const elements = document.querySelectorAll(genSelectors.join(','));
      elements.forEach(el => {
        if (el.offsetParent === null) return; // skip hidden
        if (el.closest('#ps-inspector-card') || el.closest('#ps-page-scan-modal') || el.closest('#ps-url-banner') || el.closest('#ps-page-scan-fab')) return;
        const text = (el.innerText || el.textContent || '').trim();
        if (text.length >= 20 && text.length <= 1500 && !messages.some(m => m.text === text)) {
          messages.push({ element: el, text, type: 'Page Text' });
        }
      });
    }

    // Extract links
    const linkElements = document.querySelectorAll('a[href]');
    linkElements.forEach(a => {
      if (a.offsetParent === null) return;
      if (a.closest('#ps-inspector-card') || a.closest('#ps-page-scan-modal') || a.closest('#ps-page-scan-fab')) return;
      const href = a.href;
      if (href && /^https?:\/\//i.test(href) && !links.some(l => l.url === href)) {
        try {
          const parsed = new URL(href);
          // Don't flag local internal site links
          if (parsed.hostname !== window.location.hostname) {
            links.push({ element: a, url: href, text: (a.innerText || href).trim() });
          }
        } catch (e) {}
      }
    });

    return {
      messages: messages.slice(0, 40), // cap for instant scanning
      links: links.slice(0, 30)
    };
  }

  function clearThreatHighlights() {
    activeHighlightedElements.forEach(item => {
      if (item.element) {
        item.element.classList.remove('ps-threat-highlight-danger', 'ps-threat-highlight-warning');
        if (item.badge && item.badge.parentNode) {
          item.badge.parentNode.removeChild(item.badge);
        }
      }
    });
    activeHighlightedElements = [];
  }

  function highlightThreatOnPage(element, threat) {
    if (!element) return;
    const isDanger = threat.score >= 65 || threat.verdict === 'high';
    const highlightClass = isDanger ? 'ps-threat-highlight-danger' : 'ps-threat-highlight-warning';

    element.classList.add(highlightClass);

    // Injected warning badge above element
    const badge = document.createElement('div');
    badge.className = `ps-reset ps-threat-pill ${isDanger ? 'ps-threat-pill-danger' : 'ps-threat-pill-warning'}`;
    badge.innerHTML = `<span>⚠️ PhishShield Alert: ${escapeHtml(threat.title || 'Scam Element')} (${threat.score}/100)</span>`;

    // Insert badge before element
    try {
      element.parentNode.insertBefore(badge, element);
      activeHighlightedElements.push({ element, badge });
    } catch (e) {
      activeHighlightedElements.push({ element, badge: null });
    }
  }

  function runFullPageScan(showModal = true) {
    clearThreatHighlights();

    const hostApp = detectHostApp();
    const { messages, links } = extractPageContent();
    const flaggedThreats = [];

    // 1. Scan Current Page URL
    const pageUrlAnalysis = (window.PhishDetector && window.PhishDetector.analyzeUrl)
      ? window.PhishDetector.analyzeUrl(window.location.href)
      : { score: 0, verdict: 'low', summary: '', reasons: [] };

    if (pageUrlAnalysis.score >= 35) {
      flaggedThreats.push({
        type: 'URL_RISK',
        title: pageUrlAnalysis.summary,
        snippet: window.location.href,
        score: pageUrlAnalysis.score,
        verdict: pageUrlAnalysis.verdict,
        reasons: pageUrlAnalysis.reasons,
        element: null,
        sourceType: 'Current Tab URL'
      });
    }

    // 2. Scan Messages
    messages.forEach(msg => {
      if (!window.PhishDetector) return;
      const res = window.PhishDetector.analyzeText(msg.text);
      if (res.score >= 35) {
        const threat = {
          type: 'MESSAGE_THREAT',
          title: (res.flags && res.flags.length > 0) ? res.flags.join(', ') : 'Scam / Phishing Vector',
          snippet: msg.text.length > 150 ? msg.text.substring(0, 150) + '...' : msg.text,
          score: res.score,
          verdict: res.verdict,
          reasons: res.reasons,
          next_steps: res.next_steps,
          element: msg.element,
          sourceType: msg.type
        };
        flaggedThreats.push(threat);
        highlightThreatOnPage(msg.element, threat);
      }
    });

    // 3. Scan Links
    links.forEach(link => {
      if (!window.PhishDetector) return;
      const res = window.PhishDetector.analyzeUrl(link.url);
      if (res.score >= 35) {
        const threat = {
          type: 'LINK_THREAT',
          title: res.summary || 'Suspicious Hyperlink',
          snippet: link.url,
          score: res.score,
          verdict: res.verdict,
          reasons: res.reasons,
          next_steps: res.next_steps,
          element: link.element,
          sourceType: 'Hyperlink'
        };
        flaggedThreats.push(threat);
        highlightThreatOnPage(link.element, threat);
      }
    });

    // Calculate composite score
    let maxScore = pageUrlAnalysis.score;
    flaggedThreats.forEach(t => {
      if (t.score > maxScore) maxScore = t.score;
    });

    let overallVerdict = 'safe';
    if (maxScore >= 65 || flaggedThreats.some(t => t.score >= 65)) {
      overallVerdict = 'danger';
    } else if (maxScore >= 35 || flaggedThreats.length > 0) {
      overallVerdict = 'warning';
    }

    const report = {
      hostApp,
      url: window.location.href,
      messagesCount: messages.length,
      linksCount: links.length,
      threatsCount: flaggedThreats.length,
      overallVerdict,
      maxScore,
      threats: flaggedThreats
    };

    // Scroll to first threat if found
    if (flaggedThreats.length > 0 && flaggedThreats[0].element) {
      try {
        flaggedThreats[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {}
    }

    if (showModal) {
      showPageScanModal(report);
    }

    return report;
  }

  // --- 3. ON-SCREEN PAGE SCAN REPORT MODAL ---
  function removePageScanModal() {
    if (pageScanModal && pageScanModal.parentNode) {
      pageScanModal.parentNode.removeChild(pageScanModal);
    }
    pageScanModal = null;
  }

  function showPageScanModal(report) {
    removePageScanModal();

    pageScanModal = document.createElement('div');
    pageScanModal.id = 'ps-page-scan-modal';
    pageScanModal.className = `ps-reset ps-theme-${currentSettings.theme} ps-modal-enter`;

    const isDanger = report.overallVerdict === 'danger';
    const isWarn = report.overallVerdict === 'warning';
    const isSafe = !isDanger && !isWarn;

    const verdictLabel = isDanger
      ? 'CRITICAL SCAM DETECTED'
      : isWarn
      ? 'SUSPICIOUS ELEMENTS DETECTED'
      : 'ALL ON-SCREEN ELEMENTS SAFE';

    const verdictBadgeClass = isDanger ? 'ps-verdict-danger' : isWarn ? 'ps-verdict-warning' : 'ps-verdict-safe';
    const scoreColor = isDanger ? '#EF4444' : isWarn ? '#FBBF24' : '#34D399';

    // Build threats list HTML
    let threatsListHtml = '';
    if (report.threats.length > 0) {
      threatsListHtml = report.threats.map((t, idx) => `
        <div class="ps-threat-item ${t.score >= 65 ? 'danger' : 'warning'}">
          <div class="ps-threat-item-header">
            <span class="ps-threat-type-badge">${escapeHtml(t.sourceType || 'Threat')}</span>
            <span class="ps-threat-name">${escapeHtml(t.title || 'Suspicious Vector')}</span>
            <span class="ps-threat-score">${t.score}/100</span>
          </div>
          <div class="ps-threat-snippet">"${escapeHtml(t.snippet)}"</div>
          ${t.reasons && t.reasons.length > 0 ? `<div class="ps-threat-reason">• ${escapeHtml(t.reasons[0])}</div>` : ''}
        </div>
      `).join('');
    } else {
      threatsListHtml = `
        <div class="ps-no-threats-box">
          <span class="ps-check-icon">✅</span>
          <div>
            <strong>No active phishing or scam vectors found on this screen.</strong>
            <p>Analyzed ${report.messagesCount} message bubbles and ${report.linksCount} external links.</p>
          </div>
        </div>
      `;
    }

    pageScanModal.innerHTML = `
      <div class="ps-modal-backdrop"></div>
      <div class="ps-modal-card">
        <!-- Header -->
        <div class="ps-modal-header">
          <div class="ps-modal-brand">
            <span class="ps-pulse-dot"></span>
            <span class="ps-brand-title">PHISHSHIELD // INDIA</span>
            <span class="ps-badge-source">${escapeHtml(report.hostApp)}</span>
          </div>
          <button type="button" class="ps-close-btn" id="ps-modal-close-btn" aria-label="Close">&times;</button>
        </div>

        <!-- Body -->
        <div class="ps-modal-body">
          <!-- Verdict Bar -->
          <div class="ps-verdict-box ${verdictBadgeClass}">
            <div class="ps-verdict-header">
              <span class="ps-verdict-text">${verdictLabel}</span>
              <span class="ps-score-badge" style="color:${scoreColor}">${report.maxScore}/100</span>
            </div>
            <div class="ps-meter-track">
              <div class="ps-meter-fill" style="width:${Math.max(8, report.maxScore)}%; background-color:${scoreColor}"></div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="ps-stats-bar">
            <div class="ps-stat-col">
              <span class="ps-stat-num">${report.messagesCount}</span>
              <span class="ps-stat-lbl">Messages Scanned</span>
            </div>
            <div class="ps-stat-col">
              <span class="ps-stat-num">${report.linksCount}</span>
              <span class="ps-stat-lbl">Links Checked</span>
            </div>
            <div class="ps-stat-col">
              <span class="ps-stat-num" style="color:${scoreColor}">${report.threatsCount}</span>
              <span class="ps-stat-lbl">Threats Flagged</span>
            </div>
          </div>

          <!-- Threats Container -->
          <div class="ps-section">
            <div class="ps-section-title">DETECTION RESULTS ON THIS SCREEN</div>
            <div class="ps-threats-container">
              ${threatsListHtml}
            </div>
          </div>

          <!-- Helpline Alert -->
          <div class="ps-helpline-box">
            <span class="ps-hl-icon">🚨</span>
            <div>
              <div>National Cyber Fraud Helpline: <strong>1930</strong></div>
              <div class="ps-hl-sub">File online report: <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a></div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="ps-card-footer">
            <button type="button" class="ps-btn-secondary" id="ps-btn-rescan-page">🔄 Re-Scan Screen</button>
            <button type="button" class="ps-btn-primary" id="ps-btn-dismiss-modal">Done</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(pageScanModal);

    pageScanModal.querySelector('#ps-modal-close-btn').addEventListener('click', removePageScanModal);
    pageScanModal.querySelector('#ps-btn-dismiss-modal').addEventListener('click', removePageScanModal);
    pageScanModal.querySelector('.ps-modal-backdrop').addEventListener('click', removePageScanModal);

    pageScanModal.querySelector('#ps-btn-rescan-page').addEventListener('click', () => {
      runFullPageScan(true);
    });
  }

  // --- 4. FLOATING SELECTION SCANNER ---
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
    if (e.target.closest('#ps-inspector-card') || e.target.closest('#ps-floating-btn') || e.target.closest('#ps-url-banner') || e.target.closest('#ps-page-scan-modal') || e.target.closest('#ps-page-scan-fab')) {
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

  // Dismiss on outside click or Esc
  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('#ps-inspector-card') || e.target.closest('#ps-floating-btn') || e.target.closest('#ps-url-banner') || e.target.closest('#ps-page-scan-modal') || e.target.closest('#ps-page-scan-fab')) {
      return;
    }
    removeFloatingBtn();
    removeInspectorCard();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeFloatingBtn();
      removeInspectorCard();
      removePageScanModal();
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

    let top = window.scrollY + (rect ? rect.bottom + 10 : 80);
    let left = window.scrollX + (rect ? Math.max(16, rect.left) : 80);

    const maxWidth = 380;
    if (left + maxWidth > window.innerWidth + window.scrollX) {
      left = Math.max(16, window.innerWidth + window.scrollX - maxWidth - 24);
    }

    inspectorCard.style.top = `${top}px`;
    inspectorCard.style.left = `${left}px`;

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
        <div class="ps-verdict-box ${verdictClass}">
          <div class="ps-verdict-header">
            <span class="ps-verdict-text">${verdictLabel}</span>
            <span class="ps-score-badge" style="color:${scoreColor}">${data.score}/100</span>
          </div>
          <div class="ps-meter-track">
            <div class="ps-meter-fill" style="width:${Math.max(5, data.score)}%; background-color:${scoreColor}"></div>
          </div>
        </div>

        <div class="ps-summary-text">${escapeHtml(data.summary || '')}</div>

        <div class="ps-section">
          <div class="ps-section-title">DETECTION SIGNALS</div>
          <ul class="ps-reasons-list">
            ${reasonsList}
          </ul>
        </div>

        <div class="ps-section">
          <div class="ps-section-title">RECOMMENDED ACTION</div>
          <ul class="ps-advice-list">
            ${nextStepsList}
          </ul>
        </div>

        <div class="ps-helpline-box">
          <span class="ps-hl-icon">🚨</span>
          <div>
            <div>National Cyber Helpline: <strong>1930</strong></div>
            <div class="ps-hl-sub">File complaint: <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a></div>
          </div>
        </div>

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

  // --- 5. REAL-TIME URL THREAT WARNING BANNER ---
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
    if (pageScanFab) {
      pageScanFab.className = `ps-reset ${themeClass}`;
    }
    if (pageScanModal) {
      pageScanModal.className = `ps-reset ${themeClass}`;
    }
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

  // Listen for runtime messages from background script or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // On-Demand Page Scan triggered by popup button or context menu
    if (request.action === 'TRIGGER_FULL_PAGE_SCAN') {
      const report = runFullPageScan(true);
      sendResponse(report);
      return true;
    }

    if (request.action === 'SHOW_URL_WARNING_BANNER' && request.analysis) {
      if (currentSettings.urlWarningBannerEnabled) {
        showUrlWarningBanner(request.analysis);
      }
      sendResponse({ status: 'ok' });
      return true;
    }

    if (request.action === 'TRIGGER_MANUAL_SELECTION_SCAN' && request.text) {
      const sel = window.getSelection();
      let rect = { top: 120, left: 100, bottom: 120, width: 200 };
      if (sel && sel.rangeCount > 0) {
        rect = sel.getRangeAt(0).getBoundingClientRect();
      }
      showInspectorCard(request.text, rect);
      sendResponse({ status: 'ok' });
      return true;
    }

    if (request.action === 'TRIGGER_LINK_SCAN' && request.url) {
      showInspectorCard(request.url, { top: 120, left: 100, bottom: 120, width: 200 });
      sendResponse({ status: 'ok' });
      return true;
    }

    if (request.action === 'TRIGGER_PAGE_SCAN') {
      const report = runFullPageScan(true);
      sendResponse(report);
      return true;
    }
  });

})();
