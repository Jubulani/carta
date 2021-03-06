import { append_div, append_div_with_class, get_closest_parent } from './carta_util';
import * as wasm from '../wasm/pkg/carta_wasm';
import * as editor from './editor';
import * as binfiles from './binfiles';

export function init() {
    wasm.init();
}

export function compile_schema(name: string, schema_data: string) {
    try {
        const date_before = Date.now();
        wasm.load_schema(name, schema_data);

        const date_after = Date.now();
        const elapsed = date_after - date_before;
        console.info(`Schema compiled in ${elapsed / 1000} seconds`)

        set_syntax_ok();
        binfiles.apply_new_schema();
    }
    catch (err) {
        set_syntax_error(err);
    }
}

export function apply_schema(name: string, arr: Uint8Array): any {
    const date_before = Date.now();
    const nugget = wasm.apply_schema(arr);

    const date_after = Date.now();
    const elapsed = date_after - date_before;

    console.info(`Schema applied to ${name} in ${elapsed / 1000} seconds`)

    return nugget;
}

export function set_syntax_unknown() {
    const syntaxResultElem = document.getElementById("syntax-results");
    if (!syntaxResultElem) {
        console.error("Could not find 'syntax-results' element");
        return;
    }

    syntaxResultElem.textContent = "checking...";
    syntaxResultElem.classList.remove("syntax-error");
    syntaxResultElem.classList.remove("syntax-ok");
}

function set_syntax_ok() {
    const syntaxResultElem = document.getElementById("syntax-results");
    if (!syntaxResultElem) {
        console.error("Could not find 'syntax-results' element");
        return;
    }

    syntaxResultElem.textContent = "Ok";
    syntaxResultElem.classList.remove("syntax-error");
    syntaxResultElem.classList.add("syntax-ok");

    editor.clear_model_markers();
}

function set_syntax_error(error: any) {
    const syntaxResultElem = document.getElementById("syntax-results");
    if (!syntaxResultElem) {
        console.error("Could not find 'syntax-results' element");
        return;
    }

    let msg;
    if (error.line_no > 0) {
        msg = `Line ${error.line_no}: ${error.msg}`;
        editor.set_marker_for_line(error.line_no, error.msg);
    } else {
        msg = error.msg;
        editor.clear_model_markers();
    }

    syntaxResultElem.textContent = msg;
    syntaxResultElem.classList.remove("syntax-ok");
    syntaxResultElem.classList.add("syntax-error");
}