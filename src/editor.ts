import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import * as monaco from '../node_modules/monaco-editor/esm/vs/editor/editor.api';

export function init_editor() {
    let container = document.getElementById('editor-container');
    if (!container) {
        console.error('Could not find editor-container');
        return;
    }
    monaco.editor.create(container, {
        value: 'console.log("Hello, world")',
        language: 'rust',
        minimap: { enabled: false },
        lineNumbers: 'off',
        scrollBeyondLastLine: false,
    });
}