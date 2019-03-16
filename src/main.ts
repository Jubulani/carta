import { init, new_file } from '../wasm/pkg/carta_backend_bg';
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

    console.log('Read file event');

    let input = <HTMLInputElement>document.querySelector("#file-upload");
    let files = input.files;

    if (files) {
        for (let i = 0; i < files.length; ++i) {
            let file = files[i];
            console.log('Have file: ' + file.name + ', size: ' + file.size + ' bytes');
            let slice = file.slice(0, 10);
            let reader = new FileReader();

            reader.onloadend = function () {
                let res = <ArrayBuffer>reader.result;
                let arr = new Uint8Array(res);
                console.log('File read complete (' + arr.length + ' bytes)');
                for (let i = 0; i < arr.length; ++i) {
                    console.log(arr[i]);
                }
            }
            reader.readAsArrayBuffer(slice);
        }
        new_file();
    }
}


// Make me a module
export default function () { }