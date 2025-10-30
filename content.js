// Claude RTL Toggle Extension - TEXT ONLY VERSION
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

  // Check if element contains actual text (not just whitespace)
  function hasTextContent(element) {
    if (!element) return false;

    // Check if element has direct text nodes with content
    for (let node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
        return true;
      }
    }
    return false;
  }

  // Apply RTL/LTR direction - TEXT ONLY, NO LAYOUT CHANGES
  function applyDirection(rtl) {
    try {
      isRTL = rtl;

      // Add/remove global class for CSS targeting
      if (rtl) {
        document.documentElement.classList.add('claude-rtl-active');
      } else {
        document.documentElement.classList.remove('claude-rtl-active');
      }

      // STRATEGY: Only target TEXT elements, never layout containers
      // Only apply to leaf text nodes and text-containing elements

      const textOnlySelectors = [
        // Direct text in messages - paragraphs and spans
        '.font-user-message p',
        '.font-claude-message p',
        '.font-user-message span',
        '.font-claude-message span',
        '.font-user-message strong',
        '.font-claude-message strong',
        '.font-user-message em',
        '.font-claude-message em',

        // Text in any message container
        '[class*="message"] p',
        '[class*="Message"] p',
        '[data-testid*="message"] p',
        '[class*="message"] span',
        '[class*="message"] strong',
        '[class*="message"] em',

        // All headings and subtitles
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        '[role="heading"]',

        // List items
        'li',

        // Table elements - CRITICAL for tables
        'th',  // Table headers
        'td',  // Table cells
        'caption',  // Table captions
        'thead th',
        'tbody td',
        'tfoot td',

        // Text formatting elements
        'strong',
        'b',
        'em',
        'i',
        'u',
        'mark',
        'small',
        'del',
        'ins',
        'sub',
        'sup',

        // Other text containers
        'blockquote',
        'figcaption',
        'legend',
        'label',
        'time',
        'address',
        'cite',
        'q',

        // Text in dialogs
        '[role="dialog"] p',
        '[role="dialog"] span',
        '[role="dialog"] li',
        '[role="dialog"] h1',
        '[role="dialog"] h2',
        '[role="dialog"] h3',
        '[role="dialog"] strong',
        '[role="dialog"] td',
        '[role="dialog"] th',

        // Artifacts text content - comprehensive
        '[class*="artifact"] p',
        '[class*="artifact"] span',
        '[class*="artifact"] li',
        '[class*="artifact"] h1',
        '[class*="artifact"] h2',
        '[class*="artifact"] h3',
        '[class*="artifact"] h4',
        '[class*="artifact"] strong',
        '[class*="artifact"] td',
        '[class*="artifact"] th',
        '[class*="artifact"] caption',
        '[class*="artifact"] blockquote',

        // History items text
        '[class*="history"] p',
        '[class*="history"] span',
        '[class*="history"] strong',

        // Prose content (common in Claude)
        '.prose p',
        '.prose li',
        '.prose h1',
        '.prose h2',
        '.prose h3',
        '.prose th',
        '.prose td',
        '.prose blockquote',
        '.prose span',

        // Text input areas
        'textarea',
        'div[contenteditable="true"]',
        'input[type="text"]'
      ];

      textOnlySelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            // Skip toggle button
            if (element.closest('#claude-rtl-toggle')) return;

            // Skip code blocks
            if (element.closest('pre') || element.closest('code')) return;

            // Skip buttons
            if (element.closest('button')) return;

            // Skip navigation
            if (element.closest('nav')) return;

            // Only apply to elements that have text content
            if (selector.includes('textarea') ||
                selector.includes('contenteditable') ||
                hasTextContent(element) ||
                element.textContent.trim().length > 0) {

              // Apply only text-align, not direction on container
              if (rtl) {
                element.style.textAlign = 'right';
                element.style.direction = 'rtl';
                element.classList.add('rtl-text');
              } else {
                element.style.textAlign = 'left';
                element.style.direction = 'ltr';
                element.classList.remove('rtl-text');
              }
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

      // Count affected elements for logging
      const affectedElements = document.querySelectorAll('.rtl-text').length;
      console.log(`Claude RTL: Applied ${rtl ? 'RTL' : 'LTR'} to ${affectedElements} text elements (including tables, headings, and text formatting)`);
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

  // Observe DOM changes
  function observeDOM() {
    try {
      const throttledApply = throttle(() => {
        if (isRTL) {
          applyDirection(true);
        }
      }, 1000); // Increased to 1 second for better performance

      const observer = new MutationObserver(throttledApply);

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
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

        console.log('Claude RTL Toggle: Initialized (TEXT ONLY mode)');
      }, 1000);
    } catch (e) {
      console.error('Claude RTL: Initialization error', e);
    }
  }

  // Start the extension
  init();
})();
