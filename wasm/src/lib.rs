use std::str;

use log::{info, warn, Level};

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
pub fn new_schema(name: &str, data: &[u8]) -> Result<(), JsValue> {
    info!("Read new schema file: {}", name);
    info!("Data size: {} bytes", data.len());

    let data = match str::from_utf8(data) {
        Ok(d) => d,
        Err(e) => {
            warn!("Could not read schema file as utf-8: {}", e);
            return Err(JsValue::from_str(&format!("{}", e)));
        }
    };

    info!("Have file data: {}", data);

    match carta_schema::compile_schema_file(data) {
        Err(e) => {
            let msg = format!("Error compiling schema - {}", e);
            warn!("{}", msg);
            return Err(JsValue::from_str(&format!("{}", e)));
        }
        Ok(_) => info!("Schema successfully compiled"),
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
