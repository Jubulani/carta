import { append_div, append_div_with_class, get_closest_parent } from './carta_util';
import * as wasm from '../wasm/pkg/carta_wasm';

export function init() {
    wasm.init();
}

export function compile_schema(name: string, schema_data: string) {
    try {
        wasm.load_schema(name, schema_data);
        set_syntax_ok();
    }
    catch (err) {
        set_syntax_error(err);
    }
}

export function apply_schema(arr: Uint8Array): any {
    return wasm.apply_schema(arr);
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
}

function set_syntax_error(msg: string) {
    const syntaxResultElem = document.getElementById("syntax-results");
    if (!syntaxResultElem) {
        console.error("Could not find 'syntax-results' element");
        return;
    }

    syntaxResultElem.textContent = msg;
    syntaxResultElem.classList.remove("syntax-ok");
    syntaxResultElem.classList.add("syntax-error");
}