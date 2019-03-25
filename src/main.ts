import { init, new_file, new_schema } from '../wasm/pkg/carta_wasm';
init();

// We were called asynchronously, so we don't know what state the document is in
switch (document.readyState) {
    case "loading":
        document.addEventListener("DOMContentLoaded", addEventListeners);
        break;
    case "interactive":
    case "complete":
        addEventListeners();
        break;
    default:
        console.error('Document state unknown');
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
                    new_file(file.name, arr);
                }
                catch (err) {
                    alert(err);
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }
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
                    new_schema(file.name, arr);
                }
                catch (err) {
                    alert(err);
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }
}

// Make me a module
export default function () { }