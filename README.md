# Claude RTL Toggle

A beautiful Chrome extension that allows you to toggle Claude AI's interface between LTR (Left-to-Right) and RTL (Right-to-Left) text direction with a simple, animated button.

## Features

- **Easy Toggle**: Beautiful floating button with smooth animations
- **Smart Detection**: Automatically applies RTL to all Claude elements (conversations, dialogs, search, history)
- **Persistent Settings**: Remembers your preference across sessions
- **Keyboard Shortcut**: Quick toggle with `Ctrl+Shift+D`
- **Pure CSS**: No external assets required - all styling and icons generated via code
- **Responsive**: Works on all screen sizes
- **Accessible**: Full keyboard support and screen reader friendly

## Installation

### From Source (For Development/Testing)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked"
5. Select the `Claude.rtl` folder
6. The extension is now installed!

### For Chrome Web Store Upload

The extension is ready to be uploaded to the Chrome Web Store:

1. Create a ZIP file containing all files in this directory:
   - manifest.json
   - content.js
   - styles.css
   - icon16.svg
   - icon48.svg
   - icon128.svg

2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Click "New Item"
4. Upload the ZIP file
5. Fill in the store listing details
6. Submit for review

## Usage

1. Visit [claude.ai](https://claude.ai)
2. Look for the floating button in the bottom-right corner
3. Click the button to toggle between LTR and RTL
4. The button will pulse and change color when RTL is active
5. Your preference is automatically saved

### Keyboard Shortcut

Press `Ctrl+Shift+D` to quickly toggle text direction

## How It Works

The extension:
- Injects a content script that monitors Claude's interface
- Applies RTL direction to all relevant elements (conversations, dialogs, inputs, etc.)
- Preserves LTR for code blocks and technical content
- Uses MutationObserver to handle dynamically loaded content
- Stores preferences using Chrome's sync storage

## Customization

You can modify the button position by editing `styles.css`:

```css
.claude-rtl-toggle {
  bottom: 30px;  /* Distance from bottom */
  right: 30px;   /* Distance from right */
}
```

## Technical Details

- **Manifest Version**: 3
- **Permissions**: Storage (for saving preferences)
- **Content Script**: Runs on claude.ai
- **No External Dependencies**: Everything is self-contained

## Browser Support

- Chrome 88+
- Edge 88+
- Any Chromium-based browser supporting Manifest V3

## License

MIT License - Feel free to use and modify

## Support

For issues or feature requests, please create an issue on the repository.
