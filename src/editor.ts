import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import * as monaco from '../node_modules/monaco-editor/esm/vs/editor/editor.api';

var editor: monaco.editor.IStandaloneCodeEditor | null = null;
const schema_default_text = `// The root struct encloses the
// entire file
struct root {
    sample_elem: uint8,
}`

export function init_editor() {
    let container = document.getElementById('editor-container');
    if (!container) {
        console.error('Could not find editor-container');
        return;
    }
    editor = monaco.editor.create(container, {
        value: schema_default_text,
        language: 'rust',
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        lineDecorationsWidth: "0ch",
        lineNumbersMinChars: 3
    });
    editor.onDidChangeModelContent(onContentChange);
}

export function resize() {
    if (editor) {
        editor.layout();
    }
}

var timeoutId: number | null;
function onContentChange(e: monaco.editor.IModelContentChangedEvent) {
    //console.debug('Change model content!');

    if (timeoutId) {
        console.log('Reset timeout');
        window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(checkEditorContent, 500);
}

function checkEditorContent() {
    timeoutId = null;
    console.log('Check editor content');
}