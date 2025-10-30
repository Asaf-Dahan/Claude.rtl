// Claude RTL Toggle Extension - AGGRESSIVE TEXT RTL VERSION
(function() {
  'use strict';

  // State management
  let isRTL = false;
  const STORAGE_KEY = 'claude_rtl_enabled';
  const POSITION_KEY = 'claude_rtl_button_position';

  // Drag state
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let buttonStartX = 0;
  let buttonStartY = 0;

  // Create toggle button
  function createToggleButton() {
    try {
      const button = document.createElement('div');
      button.id = 'claude-rtl-toggle';
      button.className = 'claude-rtl-toggle';
      button.setAttribute('role', 'button');
      button.setAttribute('aria-label', 'Toggle text direction - Drag to move');
      button.setAttribute('title', 'Toggle LTR/RTL (Drag to move)');
      button.setAttribute('tabindex', '0');

      button.innerHTML = `
        <div class="toggle-inner">
          <svg class="icon-ltr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 12h18M13 6l6 6-6 6"/>
          </svg>
          <svg class="icon-rtl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 12H3M11 6l-6 6 6 6"/>
          </svg>
        </div>
      `;

      document.body.appendChild(button);
      loadButtonPosition(button);
      setupDragging(button);
      return button;
    } catch (e) {
      console.error('Claude RTL: Error creating button', e);
      return null;
    }
  }

  // Setup dragging functionality
  function setupDragging(button) {
    let hasMoved = false;

    button.addEventListener('mousedown', (e) => {
      isDragging = true;
      hasMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = button.getBoundingClientRect();
      buttonStartX = rect.left;
      buttonStartY = rect.top;

      button.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      hasMoved = true;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;

      let newX = buttonStartX + deltaX;
      let newY = buttonStartY + deltaY;

      const maxX = window.innerWidth - button.offsetWidth;
      const maxY = window.innerHeight - button.offsetHeight;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      button.style.left = newX + 'px';
      button.style.top = newY + 'px';
      button.style.right = 'auto';
      button.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', (e) => {
      if (isDragging) {
        isDragging = false;
        button.classList.remove('dragging');

        const rect = button.getBoundingClientRect();
        saveButtonPosition(rect.left, rect.top);

        if (!hasMoved || (Math.abs(e.clientX - dragStartX) < 5 && Math.abs(e.clientY - dragStartY) < 5)) {
          toggleDirection();
        }
      }
    });

    button.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      isDragging = true;
      hasMoved = false;
      dragStartX = touch.clientX;
      dragStartY = touch.clientY;

      const rect = button.getBoundingClientRect();
      buttonStartX = rect.left;
      buttonStartY = rect.top;

      button.classList.add('dragging');
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;

      hasMoved = true;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartX;
      const deltaY = touch.clientY - dragStartY;

      let newX = buttonStartX + deltaX;
      let newY = buttonStartY + deltaY;

      const maxX = window.innerWidth - button.offsetWidth;
      const maxY = window.innerHeight - button.offsetHeight;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      button.style.left = newX + 'px';
      button.style.top = newY + 'px';
      button.style.right = 'auto';
      button.style.bottom = 'auto';
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (isDragging) {
        isDragging = false;
        button.classList.remove('dragging');

        const rect = button.getBoundingClientRect();
        saveButtonPosition(rect.left, rect.top);

        if (!hasMoved) {
          toggleDirection();
        }
      }
    });

    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDirection();
      }
    });
  }

  // Save button position
  function saveButtonPosition(x, y) {
    try {
      chrome.storage.sync.set({ [POSITION_KEY]: { x, y } });
    } catch (e) {
      console.error('Claude RTL: Error saving position', e);
    }
  }

  // Load button position
  function loadButtonPosition(button) {
    try {
      chrome.storage.sync.get([POSITION_KEY], (result) => {
        if (result[POSITION_KEY]) {
          const { x, y } = result[POSITION_KEY];
          button.style.left = x + 'px';
          button.style.top = y + 'px';
          button.style.right = 'auto';
          button.style.bottom = 'auto';
        }
      });
    } catch (e) {
      console.error('Claude RTL: Error loading position', e);
    }
  }

  // Check if element should be skipped
  function shouldSkipElement(element) {
    if (!element || !element.tagName) return true;

    // Skip toggle button
    if (element.id === 'claude-rtl-toggle' || element.closest('#claude-rtl-toggle')) return true;

    // Skip navigation, sidebar, buttons
    if (element.closest('nav') ||
        element.closest('aside') ||
        element.closest('button') ||
        element.closest('[role="button"]') ||
        element.closest('[role="navigation"]')) return true;

    // Skip code blocks
    if (element.tagName === 'PRE' ||
        element.tagName === 'CODE' ||
        element.closest('pre') ||
        element.closest('code')) return true;

    // Skip SVG and other media
    if (element.tagName === 'SVG' ||
        element.tagName === 'IMG' ||
        element.tagName === 'VIDEO' ||
        element.tagName === 'IFRAME') return true;

    return false;
  }

  // Check if element is a text-bearing element
  function isTextElement(element) {
    const textTags = [
      // ONLY text elements - NO layout containers like DIV!
      'P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'LI', 'TD', 'TH', 'CAPTION', 'LABEL', 'LEGEND',
      'STRONG', 'B', 'EM', 'I', 'U', 'MARK', 'SMALL',
      'BLOCKQUOTE', 'Q', 'CITE', 'TIME', 'ADDRESS',
      'FIGCAPTION', 'DEL', 'INS', 'SUB', 'SUP',
      'TEXTAREA', 'INPUT'
    ];

    return textTags.includes(element.tagName);
  }

  // Apply RTL/LTR to a single element with INLINE STYLES (most aggressive)
  function applyToElement(element, rtl) {
    if (!element || !element.style) return;

    if (rtl) {
      element.style.setProperty('direction', 'rtl', 'important');
      element.style.setProperty('text-align', 'right', 'important');
      element.setAttribute('dir', 'rtl');
      element.classList.add('claude-rtl-text');
    } else {
      element.style.setProperty('direction', 'ltr', 'important');
      element.style.setProperty('text-align', 'left', 'important');
      element.setAttribute('dir', 'ltr');
      element.classList.remove('claude-rtl-text');
    }
  }

  // Walk through DOM and apply RTL to ALL text elements
  function walkAndApplyRTL(root, rtl) {
    if (!root) return;

    let count = 0;

    // Use TreeWalker for efficient DOM traversal
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: function(node) {
          if (shouldSkipElement(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (isTextElement(node)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      applyToElement(node, rtl);
      count++;
    }

    return count;
  }

  // Apply RTL/LTR direction - AGGRESSIVE DOM WALKING
  function applyDirection(rtl) {
    try {
      isRTL = rtl;

      console.log(`Claude RTL: Starting ${rtl ? 'RTL' : 'LTR'} application...`);

      // Find main content area
      const mainContent = document.querySelector('main') || document.body;

      // Walk through and apply to all text elements
      const count = walkAndApplyRTL(mainContent, rtl);

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

      console.log(`Claude RTL: Applied ${rtl ? 'RTL' : 'LTR'} to ${count} text elements`);
      console.log(`Claude RTL: ✅ Tables (th/td): Converted`);
      console.log(`Claude RTL: ✅ Headings (h1-h6): Converted`);
      console.log(`Claude RTL: ✅ Paragraphs (p): Converted`);
      console.log(`Claude RTL: ✅ All text elements: Converted`);

    } catch (e) {
      console.error('Claude RTL: Error applying direction', e);
    }
  }

  // Toggle between RTL and LTR
  function toggleDirection() {
    applyDirection(!isRTL);
  }

  // Load saved preference
  function loadPreference() {
    try {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          applyDirection(true);
        }
      });
    } catch (e) {
      console.error('Claude RTL: Error loading preference', e);
    }
  }

  // Throttle function
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Observe DOM changes and reapply
  function observeDOM() {
    try {
      const throttledApply = throttle(() => {
        if (isRTL) {
          applyDirection(true);
        }
      }, 500);

      const observer = new MutationObserver(throttledApply);

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('Claude RTL: DOM observer started');
    } catch (e) {
      console.error('Claude RTL: Error setting up observer', e);
    }
  }

  // Initialize extension
  function init() {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
      }

      setTimeout(() => {
        const button = createToggleButton();
        if (!button) {
          console.error('Claude RTL: Failed to create button');
          return;
        }

        loadPreference();
        observeDOM();

        document.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleDirection();
          }
        });

        console.log('Claude RTL Toggle: Initialized (AGGRESSIVE DOM WALKING mode)');
      }, 1000);
    } catch (e) {
      console.error('Claude RTL: Initialization error', e);
    }
  }

  // Start the extension
  init();
})();
