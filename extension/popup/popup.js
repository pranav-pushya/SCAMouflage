/**
 * PhishShield India - Extension Popup Controller
 * Manages tabs, theme toggling, active page scanning, message scanning, and settings.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');
  const backendStatusText = document.getElementById('backend-status-text');

  // Tab elements
  const tabBtns = document.querySelectorAll('.ps-tab-btn');
  const tabContents = document.querySelectorAll('.ps-tab-content');

  // URL Tab elements
  const activeTabUrlEl = document.getElementById('active-tab-url');
  const urlScoreVal = document.getElementById('url-score-val');
  const urlVerdictPill = document.getElementById('url-verdict-pill');
  const urlSummaryText = document.getElementById('url-summary-text');
  const urlFlagsContainer = document.getElementById('url-flags-container');
  const urlGauge = document.getElementById('url-gauge');
  const btnRescanUrl = document.getElementById('btn-rescan-url');

  // Message Tab elements
  const msgInput = document.getElementById('msg-input');
  const btnScanMsg = document.getElementById('btn-scan-msg');
  const btnImportSel = document.getElementById('btn-import-selection');
  const msgResultBox = document.getElementById('msg-result-box');
  const msgVerdictPill = document.getElementById('msg-verdict-pill');
  const msgScoreBadge = document.getElementById('msg-score-badge');
  const msgSummaryText = document.getElementById('msg-summary-text');
  const msgReasonsList = document.getElementById('msg-reasons-list');
  const msgAdviceList = document.getElementById('msg-advice-list');
  const sampleTags = document.querySelectorAll('.ps-sample-tag');

  // Settings elements
  const settingFloatingHud = document.getElementById('setting-floating-hud');
  const settingAutoScan = document.getElementById('setting-auto-scan');
  const settingUrlBanner = document.getElementById('setting-url-banner');
  const settingBackendUrl = document.getElementById('setting-backend-url');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnOpenDashboard = document.getElementById('btn-open-dashboard');

  let activeTab = null;

  // 1. Load Settings and Theme
  chrome.storage.local.get({
    floatingHudEnabled: true,
    autoScanSelection: false,
    urlWarningBannerEnabled: true,
    backendUrl: 'http://localhost:8000',
    theme: 'dark'
  }, (stored) => {
    applyTheme(stored.theme);
    settingFloatingHud.checked = stored.floatingHudEnabled;
    settingAutoScan.checked = stored.autoScanSelection;
    settingUrlBanner.checked = stored.urlWarningBannerEnabled;
    settingBackendUrl.value = stored.backendUrl;
  });

  // 2. Theme Toggle Handler
  function applyTheme(theme) {
    if (theme === 'light') {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = body.classList.contains('theme-dark');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    chrome.storage.local.set({ theme: newTheme });
  });

  // 3. Tab Navigation
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // 4. Backend Health Status
  chrome.runtime.sendMessage({ action: 'CHECK_BACKEND_STATUS' }, (res) => {
    if (res && res.online) {
      backendStatusText.textContent = 'PhishShield Core: Online';
      backendStatusText.style.color = 'var(--success-emerald)';
    } else {
      backendStatusText.textContent = 'Standalone Heuristics Active';
      backendStatusText.style.color = 'var(--warning-amber)';
    }
  });

  // 5. Active Tab URL Inspection
  async function scanActiveTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) return;
      activeTab = tabs[0];

      if (!activeTab.url || !/^https?:\/\//i.test(activeTab.url)) {
        activeTabUrlEl.textContent = activeTab.url || 'Internal Browser Page';
        urlScoreVal.textContent = '0';
        urlVerdictPill.textContent = 'BROWSER PAGE';
        urlVerdictPill.className = 'ps-verdict-pill safe';
        urlSummaryText.textContent = 'Internal browser or settings page. No remote threats.';
        return;
      }

      activeTabUrlEl.textContent = activeTab.url;
      urlVerdictPill.textContent = 'SCANNING...';
      urlVerdictPill.className = 'ps-verdict-pill';

      chrome.runtime.sendMessage({ action: 'ANALYZE_URL', url: activeTab.url }, (data) => {
        if (!data) return;

        urlScoreVal.textContent = data.score;
        const isHigh = data.score >= 65;
        const isMed = !isHigh && data.score >= 35;

        if (isHigh) {
          urlVerdictPill.textContent = 'SCAM / PHISHING';
          urlVerdictPill.className = 'ps-verdict-pill danger';
          urlGauge.style.borderColor = 'var(--danger-red)';
          urlScoreVal.style.color = 'var(--danger-red)';
        } else if (isMed) {
          urlVerdictPill.textContent = 'SUSPICIOUS';
          urlVerdictPill.className = 'ps-verdict-pill warn';
          urlGauge.style.borderColor = 'var(--warning-amber)';
          urlScoreVal.style.color = 'var(--warning-amber)';
        } else {
          urlVerdictPill.textContent = 'SAFE DOMAIN';
          urlVerdictPill.className = 'ps-verdict-pill safe';
          urlGauge.style.borderColor = 'var(--success-emerald)';
          urlScoreVal.style.color = 'var(--success-emerald)';
        }

        urlSummaryText.textContent = data.summary || (isHigh ? 'High risk spoofing detected.' : 'Domain looks clean.');

        // Render flags
        urlFlagsContainer.innerHTML = '';
        const flags = data.flags || [];
        if (flags.length > 0) {
          flags.forEach(f => {
            const pill = document.createElement('span');
            pill.className = `ps-flag-pill ${isHigh ? 'danger' : ''}`;
            pill.textContent = f;
            urlFlagsContainer.appendChild(pill);
          });
        } else {
          const pill = document.createElement('span');
          pill.className = 'ps-flag-pill';
          pill.textContent = 'No heuristic red-flags';
          urlFlagsContainer.appendChild(pill);
        }
      });
    } catch (e) {
      console.warn('Failed to scan active tab:', e);
    }
  }

  scanActiveTab();
  btnRescanUrl.addEventListener('click', scanActiveTab);

  // 6. Message Scanner
  function executeMessageScan(text) {
    if (!text || !text.trim()) return;

    btnScanMsg.textContent = 'Scanning...';
    btnScanMsg.disabled = true;

    chrome.runtime.sendMessage({ action: 'ANALYZE_TEXT', text: text.trim() }, (data) => {
      btnScanMsg.textContent = '🛡️ Scan Message';
      btnScanMsg.disabled = false;

      if (!data) return;

      msgResultBox.classList.remove('hidden');
      msgScoreBadge.textContent = `${data.score}/100`;

      const isHigh = data.score >= 65 || data.verdict === 'high';
      const isMed = !isHigh && (data.score >= 35 || data.verdict === 'medium');

      if (isHigh) {
        msgVerdictPill.textContent = 'SCAM / PHISHING DETECTED';
        msgVerdictPill.className = 'ps-verdict-pill danger';
        msgScoreBadge.style.color = 'var(--danger-red)';
      } else if (isMed) {
        msgVerdictPill.textContent = 'SUSPICIOUS MESSAGE';
        msgVerdictPill.className = 'ps-verdict-pill warn';
        msgScoreBadge.style.color = 'var(--warning-amber)';
      } else {
        msgVerdictPill.textContent = 'VERIFIED SAFE';
        msgVerdictPill.className = 'ps-verdict-pill safe';
        msgScoreBadge.style.color = 'var(--success-emerald)';
      }

      msgSummaryText.textContent = data.summary || 'Scan finished.';

      // Reasons
      msgReasonsList.innerHTML = '';
      const reasons = data.reasons || [];
      if (reasons.length > 0) {
        reasons.forEach(r => {
          const li = document.createElement('li');
          li.textContent = r;
          msgReasonsList.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No scam keywords or spoofing heuristics detected.';
        msgReasonsList.appendChild(li);
      }

      // Advice
      msgAdviceList.innerHTML = '';
      const advice = data.next_steps || [];
      if (advice.length > 0) {
        advice.forEach(a => {
          const li = document.createElement('li');
          li.textContent = a;
          msgAdviceList.appendChild(li);
        });
      }
    });
  }

  btnScanMsg.addEventListener('click', () => {
    executeMessageScan(msgInput.value);
  });

  // Sample Tags Click
  sampleTags.forEach(tag => {
    tag.addEventListener('click', () => {
      msgInput.value = tag.dataset.sample;
      executeMessageScan(tag.dataset.sample);
    });
  });

  // Import Selection from Active Tab
  btnImportSel.addEventListener('click', async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) return;

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => window.getSelection().toString()
      });

      if (result && result.trim()) {
        msgInput.value = result.trim();
        btnImportSel.textContent = '✅ Imported!';
        setTimeout(() => { btnImportSel.textContent = '📥 Import Selection'; }, 1500);
        executeMessageScan(result.trim());
      } else {
        btnImportSel.textContent = '❌ No selection';
        setTimeout(() => { btnImportSel.textContent = '📥 Import Selection'; }, 1500);
      }
    } catch (e) {
      btnImportSel.textContent = '⚠️ Cannot read page';
      setTimeout(() => { btnImportSel.textContent = '📥 Import Selection'; }, 1500);
    }
  });

  // 7. Save Settings
  btnSaveSettings.addEventListener('click', () => {
    const updated = {
      floatingHudEnabled: settingFloatingHud.checked,
      autoScanSelection: settingAutoScan.checked,
      urlWarningBannerEnabled: settingUrlBanner.checked,
      backendUrl: settingBackendUrl.value.trim() || 'http://localhost:8000'
    };

    chrome.storage.local.set(updated, () => {
      btnSaveSettings.textContent = '✅ Settings Saved!';
      setTimeout(() => { btnSaveSettings.textContent = 'Save Settings'; }, 1500);
    });
  });

  btnOpenDashboard.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });
});
