# Claude RTL Toggle

A beautiful Chrome extension that allows you to toggle Claude AI's interface between LTR (Left-to-Right) and RTL (Right-to-Left) text direction with a simple, animated button.

## Features

### User Interface
- **Easy Toggle**: Beautiful floating button with smooth animations
- **Draggable Button**: Move the button anywhere on screen - position is saved!
- **Compact Design**: Small 45px button that doesn't obstruct your view (40px on mobile)
- **Keyboard Shortcut**: Quick toggle with `Ctrl+Shift+D`
- **Pure CSS**: No external assets required - all styling and icons generated via code
- **Accessible**: Full keyboard support and screen reader friendly

### Smart RTL Application (v2.1.0)
- **Text-Only Conversion**: Changes ONLY text direction, preserves all layouts
- **Comprehensive Coverage**: All text elements including:
  - ✅ Conversations (user and Claude messages)
  - ✅ **Tables** (headers AND cells) - NEW in v2.1.0!
  - ✅ **Subtitles and Headings** (h1-h6) - Enhanced in v2.1.0!
  - ✅ Artifacts content
  - ✅ Dialogs and modals
  - ✅ History items
  - ✅ Text formatting (bold, italic, emphasis)
  - ✅ Lists, blockquotes, captions
  - ✅ Chat input textarea
- **Layout Preservation**: Buttons, navigation, and windows stay in place
- **Performance Optimized**: Throttled updates prevent page slowdowns
- **Persistent Settings**: Remembers your preference and button position across sessions

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
2. Look for the floating button in the bottom-right corner (purple gradient)
3. **Click** the button to toggle between LTR and RTL
4. **Drag** the button to move it anywhere on screen
5. The button changes to pink and glows when RTL is active
6. Your preference and button position are automatically saved

### Keyboard Shortcut

Press `Ctrl+Shift+D` to quickly toggle text direction without clicking

## How It Works

The extension:
- Injects a content script that monitors Claude's interface
- Applies RTL direction to all relevant elements (conversations, dialogs, inputs, etc.)
- Preserves LTR for code blocks and technical content
- Uses throttled MutationObserver to handle dynamically loaded content (prevents crashes)
- Stores preferences and button position using Chrome's sync storage
- Drag detection with smart click/drag differentiation
- Touch support for mobile devices

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

## Changelog

### v2.1.0 (2025) - Enhanced Table and Subtitle Support 🎉
**NEW FEATURES:**
- ✨ **Full Table Support**: Table headers (th) and cells (td) now properly convert to RTL
- ✨ **Enhanced Subtitle Coverage**: All heading levels (h1-h6) and role="heading" elements
- ✨ **Text Formatting**: Bold, italic, emphasis, mark, small, and other text formatting elements
- ✨ **Additional Elements**: Blockquotes, captions, labels, legends, time, cite, and more
- 📊 **Better Logging**: Console shows count of affected elements for debugging

**IMPROVEMENTS:**
- 🎯 Expanded selector coverage to 100+ text element types
- 💪 Stronger CSS rules for table RTL handling
- 🔧 Blockquotes now show right border in RTL mode
- 📝 Better documentation and feature list

### v2.0.0 (2025) - TEXT ONLY Revolution
**BREAKING CHANGES:**
- 🔄 Complete rewrite: Only text direction changes, no layout modifications
- 🎯 Surgical targeting of text elements (p, span, li, h1-h6, textarea)
- 🚫 Never touches layout containers (div, main, section, article)

**FIXES:**
- ✅ Artifact windows no longer move
- ✅ Buttons stay in correct positions
- ✅ Navigation preserved
- ✅ Overall layout intact

### v1.3.0 (2025) - Comprehensive Coverage Attempt
- Attempted broad RTL application (caused layout issues)
- Led to v2.0.0 complete rewrite

### v1.2.0 (2025) - Selective Application
- Tried selective RTL targeting
- Still had layout shifting issues

### v1.1.0 (2025) - Draggable Button
- ✨ Added drag-and-drop functionality
- 💾 Position persistence
- ⚡ Performance improvements
- 🐛 Fixed page crash issues

### v1.0.0 (2025) - Initial Release
- 🎉 First release
- Basic RTL toggle functionality
- Floating button with animations

## License

MIT License - Feel free to use and modify

## Support

For issues or feature requests, please create an issue on the repository.
