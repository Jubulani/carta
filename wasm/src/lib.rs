use log::{trace, debug, info, warn, error, Level};

use wasm_bindgen::prelude::*;


#[wasm_bindgen]
pub fn init() {

    // Set panic hook to print panic messages to browser console
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    // Init logging to browser console
    console_log::init_with_level(Level::Trace).expect("error initializing log");

    info!("Carta backend init complete");

    //info!("Memory: {:?}", wasm_bindgen::memory().dyn_into::<WebAssembly::Memory>().unwrap());
}

#[wasm_bindgen]
pub fn new_file(name: &str, data: &[u8]) {
    info!("Read new file: {}", name);
    info!("Data size: {} bytes", data.len());
}

#[wasm_bindgen]
pub fn new_schema(name: &str, data: &[u8]) {
    info!("Read new schema file: {}", name);
    info!("Data size: {} bytes", data.len());
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}