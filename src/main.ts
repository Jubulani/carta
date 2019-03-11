// Start loading the wasm module asyncronously
load_wasm();

async function load_wasm() {
    start_wasm(await import("../wasm/pkg/carta_backend_bg"));
}

function start_wasm(mymod: typeof import("../wasm/pkg/carta_backend_bg")) {
    console.log("All wasm modules loaded");
    mymod.greet();
}
