// Start loading the wasm module asyncronously
load_wasm();

async function load_wasm() {
    start_wasm(await import("../wasm/pkg/carta_backend_bg"));
}

function start_wasm(mymod: typeof import("../wasm/pkg/carta_backend_bg")) {
    console.log("All wasm modules loaded");
    mymod.greet();
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
}
