import { init, new_file } from '../wasm/pkg/carta_backend';
init();

// We were called asynchronously, so we don't know what state the document is in
switch (document.readyState) {
    case "loading":
        document.addEventListener("DOMContentLoaded", addEventListener);
        break;
    case "interactive":
    case "complete":
        addEventListener();
        break;
    default:
        console.error('Document state unknown');
}

function addEventListener() {
    let fileElem = document.getElementById('file-upload');
    if (fileElem) {
        fileElem.addEventListener('change', readFiles);
    } else {
        console.error('Could not find file upload element');
    }
    console.log('Event listener added');
}

// Handle new file(s) to read
function readFiles(event: Event) {
    let input = <HTMLInputElement>document.querySelector("#file-upload");
    let files = input.files;

    if (files) {
        for (let i = 0; i < files.length; ++i) {
            let file = files[i];
            let reader = new FileReader();

            reader.onloadend = function () {
                let res = <ArrayBuffer>reader.result;
                let arr = new Uint8Array(res);
                new_file(file.name, arr);
            }
            reader.readAsArrayBuffer(file);
        }
    }
}

// Make me a module
export default function () { }