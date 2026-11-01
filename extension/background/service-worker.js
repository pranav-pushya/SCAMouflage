/**
 * PhishShield India - Chrome Extension Service Worker
 * Manages real-time URL scanning, context menus, badge indicators,
 * and communicates with the FastAPI backend (with offline engine fallback).
 */

importScripts('../rules/detector-engine.js');

const DEFAULT_SETTINGS = {
  floatingPageScanFabEnabled: true,
  floatingHudEnabled: true,
  autoScanSelection: false,
  urlWarningBannerEnabled: true,
  backendUrl: 'http://localhost:8000',
  theme: 'dark'
};

// Initialize settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(DEFAULT_SETTINGS, (stored) => {
    chrome.storage.local.set(stored);
  });

  // Setup right-click Context Menus
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'ps_scan_selection',
      title: '🛡️ PhishShield: Scan Selected Message',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'ps_scan_link',
      title: '🛡️ PhishShield: Scan This Link',
      contexts: ['link']
    });

    chrome.contextMenus.create({
      id: 'ps_scan_page',
      title: '🛡️ PhishShield: Scan Active Page URL',
      contexts: ['page']
    });
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'ps_scan_selection' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'TRIGGER_MANUAL_SELECTION_SCAN',
      text: info.selectionText
    });
  } else if (info.menuItemId === 'ps_scan_link' && info.linkUrl) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'TRIGGER_LINK_SCAN',
      url: info.linkUrl
    });
  } else if (info.menuItemId === 'ps_scan_page' && tab.url) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'TRIGGER_FULL_PAGE_SCAN',
      url: tab.url
    });
  }
});

// Real-time tab URL scanning
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab && tab.url && /^https?:\/\//i.test(tab.url)) {
    try {
      const settings = await getSettings();
      const analysis = await scanUrlWithFallback(tab.url, settings.backendUrl);

      // Update extension badge
      updateTabBadge(tabId, analysis.score);

      // If high risk and banner enabled, notify content script to show on-screen warning banner
      if (analysis.score >= 65 && settings.urlWarningBannerEnabled) {
        chrome.tabs.sendMessage(tabId, {
          action: 'SHOW_URL_WARNING_BANNER',
          analysis
        }).catch(() => {
          // Tab may not have injected content script yet or closed
        });
      }
    } catch (e) {
      console.warn('[PhishShield] Error scanning tab on update:', e);
    }
  }
});

/** Update extension icon badge */
function updateTabBadge(tabId, score) {
  if (score >= 65) {
    chrome.action.setBadgeText({ tabId, text: '!' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#EF4444' }); // Red
    chrome.action.setTitle({ tabId, title: `PhishShield: High-Risk Phishing Warning! (Score: ${score}/100)` });
  } else if (score >= 35) {
    chrome.action.setBadgeText({ tabId, text: 'WARN' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#FBBF24' }); // Amber
    chrome.action.setTitle({ tabId, title: `PhishShield: Suspicious Link/Page (Score: ${score}/100)` });
  } else {
    chrome.action.setBadgeText({ tabId, text: 'OK' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#34D399' }); // Emerald Green
    chrome.action.setTitle({ tabId, title: `PhishShield: Verified Safe Page (Score: ${score}/100)` });
  }
}

/** Get settings helper */
function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_SETTINGS, (res) => resolve(res));
  });
}

/** Analyze text with backend priority, seamlessly falling back to client-side detector */
async function scanTextWithFallback(text, backendUrl) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${backendUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'auto', content: text }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        verdict: data.verdict || 'low',
        score: typeof data.score === 'number' ? data.score : 0,
        summary: data.summary || 'Scan complete.',
        reasons: data.reasons || [],
        next_steps: data.next_steps || [],
        flags: data.engines?.text?.flags || [],
        source: 'backend'
      };
    }
  } catch (err) {
    // Backend offline or timed out, proceed to offline engine
  }

  // Fallback to local rule engine
  const offline = PhishDetector.analyzeText(text);
  offline.source = 'offline_rules';
  return offline;
}

/** Analyze URL with backend priority, seamlessly falling back to client-side detector */
async function scanUrlWithFallback(url, backendUrl) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${backendUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'url', content: url }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        verdict: data.verdict || 'low',
        score: typeof data.score === 'number' ? data.score : 0,
        summary: data.summary || 'Scan complete.',
        reasons: data.reasons || [],
        next_steps: data.next_steps || [],
        flags: data.engines?.url?.flags || [],
        source: 'backend',
        target: url
      };
    }
  } catch (err) {
    // Backend offline, fallback to offline rules
  }

  const offline = PhishDetector.analyzeUrl(url);
  offline.source = 'offline_rules';
  return offline;
}

// Handle runtime messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ANALYZE_TEXT') {
    getSettings().then(async (settings) => {
      const result = await scanTextWithFallback(request.text, settings.backendUrl);
      sendResponse(result);
    });
    return true; // async sendResponse
  }

  if (request.action === 'ANALYZE_URL') {
    getSettings().then(async (settings) => {
      const result = await scanUrlWithFallback(request.url, settings.backendUrl);
      sendResponse(result);
    });
    return true;
  }

  if (request.action === 'CHECK_BACKEND_STATUS') {
    getSettings().then(async (settings) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(`${settings.backendUrl}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        sendResponse({ online: res.ok, url: settings.backendUrl });
      } catch (e) {
        sendResponse({ online: false, url: settings.backendUrl });
      }
    });
    return true;
  }

  if (request.action === 'GET_SETTINGS') {
    getSettings().then(sendResponse);
    return true;
  }

  if (request.action === 'SAVE_SETTINGS') {
    chrome.storage.local.set(request.settings, () => {
      sendResponse({ status: 'ok' });
    });
    return true;
  }
});
