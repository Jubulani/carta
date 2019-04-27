use std::str;

use log::{info, warn, Level};

use wasm_bindgen::prelude::*;

use carta_schema::TSchema;

static mut SCHEMA: Option<Schema> = None;//Mutex::new(RefCell::new(None));

struct Schema {
    name: String,
    tschema: TSchema,
}

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
pub fn apply_schema(name: &str, data: &[u8]) {
    info!("Read new file: {}", name);
    info!("Data size: {} bytes", data.len());
}

#[wasm_bindgen]
pub fn load_schema(name: &str, data: &[u8]) -> Result<(), JsValue> {
    info!("Read new schema file: {}", name);
    info!("Data size: {} bytes", data.len());

    let data = match str::from_utf8(data) {
        Ok(d) => d,
        Err(e) => {
            warn!("Could not read schema file as utf-8: {}", e);
            return Err(JsValue::from_str(&format!("{}", e)));
        }
    };

    match carta_schema::compile_schema_file(data) {
        Err(e) => {
            let msg = format!("Error compiling schema - {}", e);
            warn!("{}", msg);
            return Err(JsValue::from_str(&format!("{}", e)));
        }
        Ok(schema) => {
            info!("Schema successfully compiled");
            set_schema(name, schema);
        }
    }

    Ok(())
}

#[wasm_bindgen]
pub fn get_schema_name() -> String {
    match unsafe { &SCHEMA } {
        None => "<None>".to_string(),
        Some(schema) => schema.name.clone(),
    }
}

fn set_schema(name: &str, tschema: TSchema) {
    unsafe {
        SCHEMA = Some(Schema {
            name: name.to_string(),
            tschema
        });
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
