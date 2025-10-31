# Code Highlighter

A professional VS Code extension to **highlight code with custom names and colors**.  
Highlights are **persistent**, automatically load when opening files, and appear in a **sidebar panel**.

## Features

- **Add Highlights**: Right-click selected text and add custom highlights with names and colors
- **Persistent Storage**: Highlights automatically save and reload when you reopen VS Code
- **Sidebar Panel**: View all highlights for the current file in an organized sidebar
- **Quick Navigation**: Click any highlight in the sidebar to jump directly to that code section
- **Visual Customization**: Choose any color for your highlights (hex codes or named colors)
- **Non-Intrusive Design**: Subtle transparent highlights that don't obstruct your code
- **Hover Information**: Hover over any highlight to see its custom name
- **Bulk Management**: Remove all highlights from current file or clear everything at once

## Usage

### Adding Highlights
1. Select some text in your code file
2. Right-click and choose **"Add Highlight"**
3. Enter a descriptive name for your highlight
4. Choose a color (hex format like `#FF5733` or named colors like `yellow`)
5. Your highlight appears instantly with a subtle background and border

### Managing Highlights
- **View All Highlights**: Open the "Highlights" sidebar in the Explorer panel
- **Jump to Code**: Click any highlight in the sidebar to navigate to that section
- **Remove Highlights**: 
  - Right-click in editor → "Remove All Highlights in Current File"
  - Use Command Palette (Ctrl+Shift+P) → "Remove All Highlights"

### Color Examples
- `#FF5733` - Orange red
- `#33FF57` - Bright green  
- `#3357FF` - Blue
- `yellow` - Named color yellow
- `#FFFF88` - Default light yellow

## Extension Settings

This extension currently doesn't require any configuration. All highlights are automatically saved to VS Code's global storage.

## Commands

- `code-highlighter.addHighlight` - Add a new highlight to selected text
- `code-highlighter.removeAllHighlightsInFile` - Remove all highlights from current file
- `code-highlighter.removeAllHighlights` - Remove all highlights from all files
- `code-highlighter.revealHighlight` - Jump to a specific highlight (used by sidebar)

## Known Issues

- Highlights are file-specific and tied to absolute file paths
- Individual highlight removal is not yet implemented (use bulk removal options)
- Line number changes may require highlights to be repositioned

## Release Notes

### 1.0.0
- Initial release of Code Highlighter
- Add custom-named highlights with colors
- Persistent storage across VS Code sessions
- Sidebar panel for highlight management
- Bulk removal options

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This extension is licensed under the MIT License.