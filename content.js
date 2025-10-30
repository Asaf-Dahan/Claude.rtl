// Claude RTL Toggle Extension
(function() {
  'use strict';

  // State management
  let isRTL = false;
  const STORAGE_KEY = 'claude_rtl_enabled';

  // Create toggle button
  function createToggleButton() {
    const button = document.createElement('div');
    button.id = 'claude-rtl-toggle';
    button.className = 'claude-rtl-toggle';
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', 'Toggle text direction');
    button.setAttribute('title', 'Toggle LTR/RTL');

    // Create inner content with SVG icons
    button.innerHTML = `
      <div class="toggle-inner">
        <svg class="icon-ltr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M13 6l6 6-6 6"/>
        </svg>
        <svg class="icon-rtl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12H3M11 6l-6 6 6 6"/>
        </svg>
      </div>
    `;

    document.body.appendChild(button);
    return button;
  }

  // Apply RTL/LTR direction
  function applyDirection(rtl) {
    isRTL = rtl;
    const direction = rtl ? 'rtl' : 'ltr';

    // Main selectors for Claude interface
    const selectors = [
      'body',
      'main',
      '[role="main"]',
      '.conversation',
      '.message',
      '.chat-message',
      '[data-testid*="message"]',
      '[data-testid*="conversation"]',
      '.prose',
      'article',
      '.dialog',
      '[role="dialog"]',
      '.search',
      '.history',
      '.sidebar',
      'textarea',
      'input[type="text"]',
      '.input',
      '.output',
      'p',
      'div[contenteditable]'
    ];

    // Apply direction to all matching elements
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.style.direction = direction;
          if (rtl) {
            element.classList.add('rtl-mode');
          } else {
            element.classList.remove('rtl-mode');
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });

    // Update button state
    const button = document.getElementById('claude-rtl-toggle');
    if (button) {
      if (rtl) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }

    // Save preference
    chrome.storage.sync.set({ [STORAGE_KEY]: rtl });
  }

  // Toggle between RTL and LTR
  function toggleDirection() {
    applyDirection(!isRTL);
  }

  // Load saved preference
  function loadPreference() {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        applyDirection(true);
      }
    });
  }

  // Observe DOM changes to apply direction to dynamically added content
  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      if (isRTL) {
        // Reapply direction to maintain consistency
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              node.style.direction = 'rtl';
              node.classList.add('rtl-mode');

              // Also apply to children
              const children = node.querySelectorAll('*');
              children.forEach(child => {
                child.style.direction = 'rtl';
                child.classList.add('rtl-mode');
              });
            }
          });
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize extension
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Create and attach button
    const button = createToggleButton();
    button.addEventListener('click', toggleDirection);

    // Load saved preference
    loadPreference();

    // Observe DOM changes
    observeDOM();

    // Add keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDirection();
      }
    });
  }

  // Start the extension
  init();
})();
