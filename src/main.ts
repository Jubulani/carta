alert('This is Typescript again');

function start(mymod: typeof import("../wasm/pkg/carta_backend_bg")) {
    console.log("All modules loaded");
    mymod.greet();
}

async function load() {
    start(await import("../wasm/pkg/carta_backend_bg"));
}

load();
