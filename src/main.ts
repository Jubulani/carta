import { init, apply_schema, load_schema, get_schema_name } from '../wasm/pkg/carta_wasm';
import { append_div, append_div_with_class } from './carta_util';

init();

// We were called asynchronously, so we don't know what state the document is in
switch (document.readyState) {
    case "loading":
        document.addEventListener("DOMContentLoaded", document_loaded);
        break;
    case "interactive":
    case "complete":
        document_loaded();
        break;
    default:
        console.error('Document state unknown');
}

function document_loaded() {
    addEventListeners();
    update_schema_name();
}

function addEventListeners() {
    let fileElem = document.getElementById('file-upload');
    if (fileElem) {
        fileElem.addEventListener('change', readFiles);
    } else {
        console.error('Could not find file upload element');
    }

    let schemaFileElem = document.getElementById('schema-file-upload');
    if (schemaFileElem) {
        schemaFileElem.addEventListener('change', readSchemaFiles);
    } else {
        console.error('Could not find file upload element');
    }

    console.log('Event listeners added');
}

function readFiles() {
    let input = <HTMLInputElement>document.querySelector("#file-upload");
    let files = input.files;

    if (files) {
        for (let i = 0; i < files.length; ++i) {
            let file = files[i];
            let reader = new FileReader();

            reader.onloadend = function () {
                let res = <ArrayBuffer>reader.result;
                let arr = new Uint8Array(res);
                try {
                    let nugget = apply_schema(file.name, arr);
                    if (nugget) {
                        console.log('Nugget: {start: ' + nugget.start + ', len: ' + nugget.len + ', name: ' + nugget.name + ', value: ' + nugget.value + ', children: ' + nugget.children + '}');
                    } else {
                        console.log('No return value');
                    }
                    display_new_file(file.name, arr, nugget);
                }
                catch (err) {
                    alert(err);
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }
}

function display_new_file(name: string, data: Uint8Array, nugget: any) {
    let file_div = append_div(name, "data-area");
    file_div.classList.add("file-container");

    let name_div = append_div_with_class(file_div, "filename");
    name_div.textContent = name;

    let file_data_div = append_div_with_class(file_div, "file-data");
    let hex_data_div = append_div_with_class(file_data_div, "hex-data");
    let hex_data = get_hex_data(data);
    hex_data_div.innerHTML = get_html_data(hex_data);

    let ascii_data_div = append_div_with_class(file_data_div, "ascii-data");
    ascii_data_div.textContent = get_ascii_data(data);

    let schema_data_div = append_div_with_class(file_data_div, "schema-data");
    schema_data_div.textContent = get_schema_data(data, nugget);
}

function byte_to_str(b: number): string {
    let ret = b.toString(16);
    if (ret.length % 2) {
        ret = '0' + ret;
    }
    return ret;
}

function get_hex_data(data: Uint8Array): string[] {
    let ret: string[] = Array();
    let i = 0;
    for (; i < data.length - 1; i += 2) {
        let r = byte_to_str(data[i]);
        r += byte_to_str(data[i + 1]);
        ret.push(r);
    }
    //  Might have one last byte to process
    if (i < data.length) {
        let r = byte_to_str(data[i]);
        ret.push(r);
    }
    return ret;
}

function get_html_data(data: string[]): string {
    let ret = String();
    let index = 0;
    while (index < data.length) {
        let slice_end = 0;
        if (data.length - index > 8) {
            slice_end = index + 8;
        } else {
            slice_end = data.length;
        }
        ret += data.slice(index, slice_end).join(' ');
        ret += '<br>'
        index = slice_end;
    }
    return ret;
}

function byte_to_ascii(b: number): string {
    if (b >= 32 && b <= 126) {
        return String.fromCharCode(b);
    } else {
        return '.';
    }
}

/* Returns a text string, that is *NOT* html encoded */
function get_ascii_data(data: Uint8Array): string {
    let ret = String();
    for (let i = 0; i < data.length; ++i) {
        if (i > 0 && !(i % 16)) {
            ret += '\n';
        }
        ret += byte_to_ascii(data[i]);
    }
    return ret;
}

function get_schema_data(data: Uint8Array, nugget: any): string {
    return nugget.name;
}

function readSchemaFiles() {
    let input = <HTMLInputElement>document.querySelector("#schema-file-upload");
    let files = input.files;

    if (files) {
        for (let i = 0; i < files.length; ++i) {
            let file = files[i];
            let reader = new FileReader();

            reader.onloadend = function () {
                let res = <ArrayBuffer>reader.result;
                let arr = new Uint8Array(res);
                try {
                    load_schema(file.name, arr);
                    update_schema_name();
                }
                catch (err) {
                    alert(err);
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }
}

function update_schema_name() {
    let schema_name_elem = document.querySelector(".schema-name");
    if (schema_name_elem) {
        let name = get_schema_name();
        schema_name_elem.textContent = name;
    } else {
        console.error('Could not find schema-name element');
    }
}

// Make me a module
export default function () { }