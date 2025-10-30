// Claude RTL Toggle Extension - Fixed and Enhanced
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

      // Create inner content with SVG icons
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

      // Load saved position
      loadButtonPosition(button);

      // Setup drag functionality
      setupDragging(button);

      return button;
    } catch (e) {
      console.error('Claude RTL: Error creating button', e);
      return null;
    }
  }

  // Setup dragging functionality
  function setupDragging(button) {
    let clickTimeout = null;
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

      // Keep button within viewport
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

        // Save position
        const rect = button.getBoundingClientRect();
        saveButtonPosition(rect.left, rect.top);

        // If didn't move much, treat as click
        if (!hasMoved || (Math.abs(e.clientX - dragStartX) < 5 && Math.abs(e.clientY - dragStartY) < 5)) {
          toggleDirection();
        }
      }
    });

    // Touch support for mobile
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

    // Keyboard accessibility
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
      chrome.storage.sync.set({
        [POSITION_KEY]: { x, y }
      });
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

  // Apply RTL/LTR direction
  function applyDirection(rtl) {
    try {
      isRTL = rtl;
      const direction = rtl ? 'rtl' : 'ltr';

      // Apply to body
      document.body.style.direction = direction;
      document.body.setAttribute('dir', direction);

      // Main selectors for Claude interface
      const selectors = [
        'main',
        '[role="main"]',
        'article',
        '[role="dialog"]',
        'textarea',
        'input[type="text"]',
        'p',
        'div[contenteditable]',
        '.font-user-message',
        '.font-claude-message'
      ];

      // Apply direction to all matching elements
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            // Skip the toggle button itself
            if (element.id === 'claude-rtl-toggle' || element.closest('#claude-rtl-toggle')) {
              return;
            }

            element.style.direction = direction;
            element.setAttribute('dir', direction);

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

  // Throttle function to limit execution rate
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

  // Observe DOM changes with throttling
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
    } catch (e) {
      console.error('Claude RTL: Error setting up observer', e);
    }
  }

  // Initialize extension
  function init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
      }

      // Wait a bit for Claude to load
      setTimeout(() => {
        // Create and attach button
        const button = createToggleButton();
        if (!button) {
          console.error('Claude RTL: Failed to create button');
          return;
        }

        // Load saved preference
        loadPreference();

        // Observe DOM changes with throttling
        observeDOM();

        // Add keyboard shortcut (Ctrl+Shift+D)
        document.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleDirection();
          }
        });

        console.log('Claude RTL Toggle: Initialized successfully');
      }, 1000);
    } catch (e) {
      console.error('Claude RTL: Initialization error', e);
    }
  }

  // Start the extension
  init();
})();
