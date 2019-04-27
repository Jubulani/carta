import { init, apply_schema, load_schema, get_schema_name } from '../wasm/pkg/carta_wasm';
import { add_div } from './carta_util';
init();

// We were called asynchronously, so we don't know what state the document is in
switch (document.readyState) {
    case "loading":
        document.addEventListener("DOMContentLoaded", document_loaded);
        break;
    case "interactive":
    case "complete":
        document_loaded();
        break;
    default:
        console.error('Document state unknown');
}

function document_loaded() {
    addEventListeners();
    update_schema_name();
}

function addEventListeners() {
    let fileElem = document.getElementById('file-upload');
    if (fileElem) {
        fileElem.addEventListener('change', readFiles);
    } else {
        console.error('Could not find file upload element');
    }

    let schemaFileElem = document.getElementById('schema-file-upload');
    if (schemaFileElem) {
        schemaFileElem.addEventListener('change', readSchemaFiles);
    } else {
        console.error('Could not find file upload element');
    }

    console.log('Event listeners added');
}

// Handle new file(s) to read
function readFiles() {
    let input = <HTMLInputElement>document.querySelector("#file-upload");
    let files = input.files;

    if (files) {
        for (let i = 0; i < files.length; ++i) {
            let file = files[i];
            let reader = new FileReader();

            reader.onloadend = function () {
                let res = <ArrayBuffer>reader.result;
                let arr = new Uint8Array(res);
                try {
                    display_new_file(file.name, arr);
                    apply_schema(file.name, arr);
                }
                catch (err) {
                    alert(err);
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }
}

function display_new_file(name: string, data: Uint8Array) {
    add_div(name, "main-container");
}

function readSchemaFiles() {
    let input = <HTMLInputElement>document.querySelector("#schema-file-upload");
    let files = input.files;

    if (files) {
        for (let i = 0; i < files.length; ++i) {
            let file = files[i];
            let reader = new FileReader();

            reader.onloadend = function () {
                let res = <ArrayBuffer>reader.result;
                let arr = new Uint8Array(res);
                try {
                    load_schema(file.name, arr);
                    update_schema_name();
                }
                catch (err) {
                    alert(err);
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }
}

function update_schema_name() {
    let schema_name_elem = document.querySelector(".schema-name");
    if (schema_name_elem) {
        let name = get_schema_name();
        schema_name_elem.textContent = name;
    } else {
        console.error('Could not find schema-name element');
    }
}

// Make me a module
export default function () { }