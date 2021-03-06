import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import * as monaco from '../node_modules/monaco-editor/esm/vs/editor/editor.api';
import * as schema from './schema';
import * as carta_lang from './carta_lang';

var editor: monaco.editor.IStandaloneCodeEditor | null = null;
const schema_default_text = `// The root struct encloses the
// entire file
struct root {
    sample_elem: uint8,
}`

export function init_editor(initial_value: string | null) {
    carta_lang.init_monarch();

    // Use the default text, unless we've been provided with an alternative
    if (!initial_value) {
        initial_value = schema_default_text;
    }

    let container = document.getElementById('editor-container');
    if (!container) {
        console.error('Could not find editor-container');
        return;
    }
    editor = monaco.editor.create(container, {
        value: initial_value,
        language: 'carta',
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        lineDecorationsWidth: "0ch",
        lineNumbersMinChars: 3
    });
    editor.onDidChangeModelContent(onContentChange);

    schema.compile_schema("<unnamed>", initial_value);
}

export function resize() {
    if (editor) {
        editor.layout();
    }
}

export function get_editor_text(): string {
    if (editor) {
        return editor.getValue();
    } else {
        return "";
    }
}


var timeoutId: number | null;
function onContentChange(e: monaco.editor.IModelContentChangedEvent) {
    //console.debug('Change model content!');

    if (timeoutId) {
        window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(checkEditorContent, 1000);

    schema.set_syntax_unknown();
}

function checkEditorContent() {
    timeoutId = null;

    const text = get_editor_text();
    schema.compile_schema("<unnamed>", text);
}

export function set_marker_for_line(line_no: number, msg: string) {
    if (!editor) {
        console.error("No current editor for markers");
        return;
    }

    const marker_data = {
        message: msg,
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: line_no,
        endLineNumber: line_no,
        startColumn: 0,
        endColumn: 100,
    };
    const model = editor.getModel();
    if (!model) {
        console.error("No current model found for markers");
        return;
    }
    monaco.editor.setModelMarkers(model, "owner??", [marker_data]);
}

export function clear_model_markers() {
    if (!editor) {
        console.error("No current editor for markers");
        return;
    }
    const model = editor.getModel();
    if (!model) {
        console.error("No current model found for markers");
        return;
    }
    monaco.editor.setModelMarkers(model, "owner??", []);
}