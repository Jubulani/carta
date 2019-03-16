// Start loading the wasm module asyncronously
load_wasm();

async function load_wasm() {
    start_wasm(await import("../wasm/pkg/carta_backend_bg"));
}

function start_wasm(carta_backend: typeof import("../wasm/pkg/carta_backend_bg")) {
    console.log("Carta backend wasm module loaded");
    carta_backend.init();
}

document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Document loaded');
    let fileElem = document.getElementById('file-upload');
    if (fileElem) {
        fileElem.addEventListener('change', readFiles);
    } else {
        console.log('Could not find file upload element');
    }
});

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
    }
}
