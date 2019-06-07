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
    hex_data_div.textContent = get_hex_data(data);

    let ascii_data_div = append_div_with_class(file_data_div, "ascii-data");
    ascii_data_div.textContent = get_ascii_data(data);

    if (nugget) {
        let schema_data_div = append_div_with_class(file_data_div, "schema-data");
        schema_data_div.innerHTML = get_schema_data(nugget, 0);
        update_schema_event_listeners();
    }
}

function byte_to_str(b: number): string {
    let ret = b.toString(16);
    if (ret.length % 2) {
        ret = '0' + ret;
    }
    return ret;
}

function get_hex_data(data: Uint8Array): string {
    // Process data into array of two-byte strings
    let words: string[] = Array();
    let i = 0;
    for (; i < data.length - 1; i += 2) {
        let r = byte_to_str(data[i]);
        r += byte_to_str(data[i + 1]);
        words.push(r);
    }
    //  Might have one last byte to process
    if (i < data.length) {
        let r = byte_to_str(data[i]);
        words.push(r);
    }

    // Process array of strings into formatted output
    let hex_data = String();
    let index = 0;
    while (index < words.length) {
        let slice_end = 0;
        if (words.length - index > 8) {
            slice_end = index + 8;
        } else {
            slice_end = words.length;
        }
        hex_data += words.slice(index, slice_end).join(' ') + '\n';
        index = slice_end;
    }
    return hex_data;
}

function byte_to_ascii(b: number): string {
    if (b >= 32 && b <= 126) {
        return String.fromCharCode(b);
    } else {
        return '.';
    }
}

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

var nugget_id = 0;
function get_nugget_text(nugget: any, depth: number): string {
    let value = new Array(depth + 1).join('  ');
    value += `<span class=schema-nugget data-idx-start=${nugget.start} data-idx-len=${nugget.len} data-nugget-id=${nugget_id++}>${nugget.name}`;
    if (nugget.value) {
        value += `: ${nugget.value}`;
    }
    return value + '</span>\n';
}

function get_schema_data(nugget: any, depth: number): string {
    let schema_data = get_nugget_text(nugget, depth);
    for (let i = 0; i < nugget.children.length; ++i) {
        schema_data += get_schema_data(nugget.children[i], depth + 1);
    }
    return schema_data;
}

function update_schema_event_listeners() {
    let elems = document.getElementsByClassName('schema-nugget');
    Array.from(elems).forEach(function(elem) {
        elem.addEventListener('mouseenter', nugget_mouseenter);
        elem.addEventListener('mouseleave', e => {
            console.log('Mouse leave: ' + e);
        });
    })
}

function nugget_mouseenter(e: Event) {
    console.log('Mouse enter: ' + e);
    console.log('Target: ' + e.target);
    let target = e.target;
    if (!(target instanceof Element)) {
        console.error('Expected element, got ' + target);
        return;
    }

    console.log(`Attributes: ${target.attributes}`);
    let attrs = target.attributes;
    for (let i = 0; i < attrs.length; ++i) {
        console.log(`  ${attrs[i].name} = ${attrs[i].value}`)
    }
    let start_attr = attrs.getNamedItem('data-idx-start');
    if (!start_attr) {
        console.error('data-idx-start attribute not found');
        return;
    }
    let start = parseInt(start_attr.value);

    let len_attr = attrs.getNamedItem('data-idx-len');
    if (!len_attr) {
        console.error('data-idx-len attribute not found');
        return;
    }
    let len = parseInt(len_attr.value);

    console.log('Start: ' + start);
    console.log('Length: ' + len);

    // '*2 '    - Each byte is composed of two displayed chars
    // '* 1.25' - Each block of four displayed chars is followed by a single separator char
    // '- 0.01' - If the end char is a separator, don't include it
    let start_char = Math.floor((start * 2) * 1.25);
    let end_char = Math.floor(((start + len) * 2) * 1.25 - 0.01);
    console.log(`Chars between: ${start_char} and ${end_char}`);

    let parent = target.parentElement;
    while (parent && !parent.classList.contains('file-data')) {
        parent = parent.parentElement;
    }
    if (!parent) {
        console.error('Could not find parent file_data element');
        return;
    }

    let hex_elem = parent.getElementsByClassName('hex-data')[0];
    let hex_text = hex_elem.textContent;
    if (!hex_text) {
        console.error('Cound not get hex elem text');
        return;
    }

    let pre = hex_text.substring(0, start_char);
    let highlight = hex_text.substring(start_char, end_char);
    console.log(`Highlighted data: '${highlight}'`)
    let post = hex_text.substring(end_char);

    hex_elem.innerHTML = `${pre}<span class="highlight">${highlight}</span>${post}`;
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