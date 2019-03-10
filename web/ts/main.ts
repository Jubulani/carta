alert('This is Typescript');

function start(mymod: typeof import("../../backend/pkg/backend_bg")) {
    console.log("All modules loaded");
    mymod.greet();
}

async function load() {
    start(await import("../../backend/pkg/backend_bg"));
}

load();
