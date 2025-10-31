"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    console.log('Code Highlighter extension is now active!');
    const highlightsFile = path.join(context.globalStorageUri.fsPath, 'highlights.json');
    // Ensure directory exists
    if (!fs.existsSync(path.dirname(highlightsFile))) {
        fs.mkdirSync(path.dirname(highlightsFile), { recursive: true });
    }
    // Generate unique ID for highlights
    const generateId = () => {
        return `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    const getHighlights = () => {
        try {
            if (fs.existsSync(highlightsFile)) {
                const data = fs.readFileSync(highlightsFile, 'utf8');
                if (!data.trim()) {
                    return [];
                }
                const serializedHighlights = JSON.parse(data);
                // Convert serialized positions to vscode.Position objects
                return serializedHighlights.map(h => ({
                    file: h.file,
                    name: h.name,
                    color: h.color,
                    id: h.id,
                    range: {
                        start: new vscode.Position(h.range.start.line, h.range.start.character),
                        end: new vscode.Position(h.range.end.line, h.range.end.character)
                    }
                }));
            }
            return [];
        }
        catch (error) {
            console.error('Error reading highlights:', error);
            return [];
        }
    };
    const saveHighlights = (data) => {
        // Convert vscode.Position objects to serializable objects
        const serializableData = data.map(h => ({
            file: h.file,
            name: h.name,
            color: h.color,
            id: h.id,
            range: {
                start: { line: h.range.start.line, character: h.range.start.character },
                end: { line: h.range.end.line, character: h.range.end.character }
            }
        }));
        fs.writeFileSync(highlightsFile, JSON.stringify(serializableData, null, 2));
    };
    const decorationMap = new Map();
    const applyHighlights = (editor) => {
        if (!editor) {
            return;
        }
        const allHighlights = getHighlights().filter(h => h.file === editor.document.uri.fsPath);
        console.log(`Applying ${allHighlights.length} highlights to ${path.basename(editor.document.fileName)}`);
        // Clear existing decorations for this editor first
        decorationMap.forEach(decoration => {
            editor.setDecorations(decoration, []);
        });
        // Group highlights by color for efficient decoration application
        const highlightsByColor = new Map();
        for (const h of allHighlights) {
            const key = h.color;
            if (!highlightsByColor.has(key)) {
                highlightsByColor.set(key, []);
            }
            highlightsByColor.get(key).push(h);
        }
        // Create decorations and apply them
        highlightsByColor.forEach((highlights, color) => {
            let decorationType;
            const key = color;
            if (decorationMap.has(key)) {
                decorationType = decorationMap.get(key);
            }
            else {
                decorationType = vscode.window.createTextEditorDecorationType({
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}50`,
                    borderRadius: '3px'
                });
                decorationMap.set(key, decorationType);
                // Add to context subscriptions for cleanup
                context.subscriptions.push(decorationType);
            }
            const decorationOptions = highlights.map(h => ({
                range: new vscode.Range(h.range.start, h.range.end),
                hoverMessage: `Highlight: ${h.name}`
            }));
            editor.setDecorations(decorationType, decorationOptions);
        });
    };
    // Command to add a new highlight
    const addHighlight = async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active text editor found.');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showWarningMessage('Please select some text first.');
            return;
        }
        const name = await vscode.window.showInputBox({ prompt: 'Name this highlight' });
        if (!name) {
            return;
        }
        const colorInput = await vscode.window.showInputBox({
            prompt: 'Color (e.g. yellow, #ff0000)',
            value: '#FFFF88'
        });
        const color = colorInput || '#FFFF88';
        const highlight = {
            file: editor.document.uri.fsPath,
            range: {
                start: selection.start,
                end: selection.end
            },
            name,
            color,
            id: generateId()
        };
        const data = getHighlights();
        data.push(highlight);
        saveHighlights(data);
        applyHighlights(editor);
        highlightsProvider.refresh();
        vscode.window.showInformationMessage(`Saved highlight "${name}".`);
    };
    // Command to remove all highlights in current file
    const removeAllHighlightsInFile = async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active text editor found.');
            return;
        }
        const currentFile = editor.document.uri.fsPath;
        const highlightsInFile = getHighlights().filter(h => h.file === currentFile);
        if (highlightsInFile.length === 0) {
            vscode.window.showInformationMessage('No highlights found in current file.');
            return;
        }
        const response = await vscode.window.showWarningMessage(`Are you sure you want to remove all ${highlightsInFile.length} highlights in this file?`, { modal: true }, 'Yes', 'No');
        if (response !== 'Yes') {
            return;
        }
        const data = getHighlights();
        const updatedData = data.filter(h => h.file !== currentFile);
        saveHighlights(updatedData);
        // Refresh all visible editors
        vscode.window.visibleTextEditors.forEach(editor => {
            applyHighlights(editor);
        });
        highlightsProvider.refresh();
        vscode.window.showInformationMessage(`Removed all highlights from current file.`);
    };
    // Command to remove all highlights everywhere
    const removeAllHighlights = async () => {
        const allHighlights = getHighlights();
        if (allHighlights.length === 0) {
            vscode.window.showInformationMessage('No highlights found.');
            return;
        }
        const response = await vscode.window.showWarningMessage(`Are you sure you want to remove all ${allHighlights.length} highlights?`, { modal: true }, 'Yes', 'No');
        if (response !== 'Yes') {
            return;
        }
        saveHighlights([]);
        // Refresh all visible editors
        vscode.window.visibleTextEditors.forEach(editor => {
            applyHighlights(editor);
        });
        highlightsProvider.refresh();
        vscode.window.showInformationMessage('Removed all highlights.');
    };
    // Sidebar TreeDataProvider
    class HighlightsProvider {
        _onDidChangeTreeData = new vscode.EventEmitter();
        onDidChangeTreeData = this._onDidChangeTreeData.event;
        refresh() {
            this._onDidChangeTreeData.fire();
        }
        getTreeItem(element) {
            const item = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
            item.tooltip = `File: ${path.basename(element.file)}\nLines: ${element.range.start.line + 1}-${element.range.end.line + 1}\nColor: ${element.color}`;
            item.description = `Lines ${element.range.start.line + 1}-${element.range.end.line + 1}`;
            item.contextValue = 'highlight';
            item.command = {
                command: 'code-highlighter.revealHighlight',
                title: 'Reveal Highlight',
                arguments: [element]
            };
            return item;
        }
        getChildren() {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return Promise.resolve([]);
            }
            return Promise.resolve(getHighlights().filter(h => h.file === editor.document.uri.fsPath));
        }
    }
    const highlightsProvider = new HighlightsProvider();
    vscode.window.registerTreeDataProvider('highlightsView', highlightsProvider);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('code-highlighter.addHighlight', addHighlight), vscode.commands.registerCommand('code-highlighter.removeAllHighlightsInFile', removeAllHighlightsInFile), vscode.commands.registerCommand('code-highlighter.removeAllHighlights', removeAllHighlights), vscode.commands.registerCommand('code-highlighter.revealHighlight', (highlight) => {
        vscode.workspace.openTextDocument(highlight.file).then(doc => {
            vscode.window.showTextDocument(doc).then(editor => {
                editor.selection = new vscode.Selection(highlight.range.start, highlight.range.end);
                editor.revealRange(new vscode.Range(highlight.range.start, highlight.range.end), vscode.TextEditorRevealType.InCenter);
                applyHighlights(editor);
            });
        });
    }));
    // Apply highlights for all visible editors on activation
    console.log('Applying highlights to visible editors...');
    vscode.window.visibleTextEditors.forEach(editor => {
        applyHighlights(editor);
    });
    highlightsProvider.refresh();
    // Listen for new editor being opened
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            console.log('Active editor changed, applying highlights...');
            applyHighlights(editor);
        }
        highlightsProvider.refresh();
    }));
    // Listen for documents opened
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => {
        const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
        if (editor) {
            console.log('Document opened, applying highlights...');
            applyHighlights(editor);
        }
        highlightsProvider.refresh();
    }));
    // Refresh when document changes
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
        if (editor) {
            applyHighlights(editor);
        }
    }));
}
function deactivate() {
    console.log('Code Highlighter extension deactivated');
}
//# sourceMappingURL=extension.js.map