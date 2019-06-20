use std::str;

use log::{info, warn, Level};
use wasm_bindgen::prelude::*;

use carta_schema::TSchema;

static mut SCHEMA: Option<Schema> = None;

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
}

#[wasm_bindgen]
pub fn apply_schema(data: &[u8]) -> JsValue {

    let nugget = match get_schema() {
        Some(schema) => {
            info!("Apply schema to file");
            carta_schema::apply_schema(&schema.tschema, data)
        },
        None => {
            info!("No current schema, nothing to do");
            return JsValue::undefined();
        }
    };

    info!("Have nugget: {:?}", nugget);
    JsValue::from_serde(&nugget).unwrap()
}

#[wasm_bindgen]
pub fn load_schema(name: &str, data: &str) -> Result<(), JsValue> {
    info!("Read new schema file: {}", name);
    info!("Data size: {} bytes", data.len());

    match carta_schema::compile_schema_file(data) {
        Err(e) => {
            let msg = format!("Error compiling schema - {}", e);
            warn!("Error, line {}, code: {}", e.line_no, e.code);
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

fn get_schema() -> &'static Option<Schema> {
    unsafe {
        return &SCHEMA;
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
