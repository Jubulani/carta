// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.js` file does the single async import, so
// that we don't need to worry about it again.
import("./main")
    .catch(e => console.error("Error importing `main`:", e));