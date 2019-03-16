use log::{trace, debug, info, warn, error, Level};

use wasm_bindgen::prelude::*;


#[wasm_bindgen]
pub fn init() {
    console_log::init_with_level(Level::Trace).expect("error initializing log");

    trace!("Trace log");
    debug!("Debug log");
    info!("Info log");
    warn!("Warning log");
    error!("Error log");
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
