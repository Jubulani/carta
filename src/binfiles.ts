import { append_div, append_div_with_class, get_closest_parent } from './carta_util';
import * as schema from './schema';

class BinFile {
    data: Uint8Array;
    file_data_div: Element;
    constructor(file_input: ArrayBuffer) {
        this.data = new Uint8Array(file_input);
        this.file_data_div = display_file(this.data);
        this.apply_schema();
    }

    apply_schema() {
        // Remove the schema display if we have one, so we can display a new one
        let schema_data_divs = this.file_data_div.getElementsByClassName("schema-data");
        if (schema_data_divs.length > 0) {
            schema_data_divs[0].remove();
        }

        try {
            let nugget = schema.apply_schema(this.data);
            if (nugget) {
                display_schema_data(this.file_data_div, nugget);
            }
        }
        catch (err) {
            alert(err);
        }
    }
}

var all_files: BinFile[] = [];

export function new_file(file_input: ArrayBuffer) {
    let file = new BinFile(file_input);
    all_files.push(file);
}

export function apply_new_schema() {
    for (let i = 0; i < all_files.length; ++i) {
        all_files[i].apply_schema();
    }
}

function display_file(data: Uint8Array): Element {
    let file_div = append_div(name, "data-area");
    file_div.classList.add("file-container");

    let name_div = append_div_with_class(file_div, "filename");
    name_div.textContent = name;

    let file_data_div = append_div_with_class(file_div, "file-data");
    let hex_data_div = append_div_with_class(file_data_div, "hex-data");
    hex_data_div.textContent = get_hex_data(data);

    let ascii_data_div = append_div_with_class(file_data_div, "ascii-data");
    ascii_data_div.textContent = get_ascii_data(data);

    return file_data_div;
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

function byte_to_str(b: number): string {
    let ret = b.toString(16);
    if (ret.length % 2) {
        ret = '0' + ret;
    }
    return ret;
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

function byte_to_ascii(b: number): string {
    if (b >= 32 && b <= 126) {
        return String.fromCharCode(b);
    } else {
        return '.';
    }
}

function display_schema_data(file_data_div: Element, nugget: any) {
    let schema_data_div = append_div_with_class(file_data_div, "schema-data");
    schema_data_div.innerHTML = get_root_schema_data(nugget);
    update_schema_event_listeners();
}

var nugget_id = 0;
function get_nugget_text(nugget: any, depth: number): string {
    let value = new Array(depth + 1).join('  ');
    value += `<span class=schema-nugget data-idx-start=${nugget.start} data-idx-len=${nugget.len} data-nugget-id=${nugget_id++}>`;
    if (nugget.children.length > 0) {
        value += `<span class="far fa-minus-square"></span> `;
    } else {
        value += '  ';
    }
    value += nugget.name;
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

function get_root_schema_data(nugget: any): string {
    let schema_data = '';
    for (let i = 0; i < nugget.children.length; ++i) {
        schema_data += get_schema_data(nugget.children[i], 0);
    }
    return schema_data;
}

function update_schema_event_listeners() {
    let elems = document.getElementsByClassName('schema-nugget');
    Array.from(elems).forEach(function (elem) {
        elem.addEventListener('mouseenter', nugget_mouseenter);
        elem.addEventListener('mouseleave', nugget_mouseleave);
    })
}

function nugget_mouseleave(e: Event) {
    // Clear highlighting
    let target = e.target;
    if (!(target instanceof Element)) {
        console.error('Expected element, got ' + target);
        return;
    }

    let parent = get_closest_parent(target.parentElement);

    let hex_elem = parent.getElementsByClassName('hex-data')[0];
    let hex_text = hex_elem.textContent;
    if (!hex_text) {
        console.error('Cound not get hex elem text');
        return;
    }
    hex_elem.textContent = hex_text;

    let ascii_elem = parent.getElementsByClassName('ascii-data')[0];
    let ascii_text = ascii_elem.textContent;
    if (!ascii_text) {
        console.error('Cound not get ascii elem text');
        return;
    }
    ascii_elem.textContent = ascii_text;
}

function nugget_mouseenter(e: Event) {
    let target = e.target;
    if (!(target instanceof Element)) {
        console.error('Expected element, got ' + target);
        return;
    }

    let start_attr = target.attributes.getNamedItem('data-idx-start');
    if (!start_attr) {
        console.error('data-idx-start attribute not found');
        return;
    }
    let start = parseInt(start_attr.value);

    let len_attr = target.attributes.getNamedItem('data-idx-len');
    if (!len_attr) {
        console.error('data-idx-len attribute not found');
        return;
    }
    let len = parseInt(len_attr.value);

    let parent = get_closest_parent(target.parentElement);

    highlight_hexdata(start, len, parent);
    highlight_asciidata(start, len, parent);
}

function highlight_hexdata(start: number, len: number, parent: Element) {
    // '*2 '    - Each byte is composed of two displayed chars
    // '* 1.25' - Each block of four displayed chars is followed by a single separator char
    // '- 0.01' - If the end char is a separator, don't include it
    let start_char = Math.floor((start * 2) * 1.25);
    let end_char = Math.floor(((start + len) * 2) * 1.25 - 0.01);

    let hex_elem = parent.getElementsByClassName('hex-data')[0];
    let hex_text = hex_elem.textContent;
    if (!hex_text) {
        console.error('Cound not get hex elem text');
        return;
    }

    let pre = hex_text.substring(0, start_char);
    let highlight = hex_text.substring(start_char, end_char);
    let post = hex_text.substring(end_char);

    hex_elem.innerHTML = `${pre}<span class="highlight">${highlight}</span>${post}`;
}

function highlight_asciidata(start: number, len: number, parent: Element) {
    // 16 displayed chars are followed by one separator char
    let start_char = Math.floor(start * 1.0625);
    let end_char = Math.floor((start + len) * 1.0625);

    let ascii_elem = parent.getElementsByClassName('ascii-data')[0];
    let ascii_text = ascii_elem.innerHTML;
    if (!ascii_text) {
        console.error('Cound not get ascii elem text');
        return;
    }

    let pre = ascii_text.substring(0, start_char);
    let highlight = ascii_text.substring(start_char, end_char);
    let post = ascii_text.substring(end_char);

    ascii_elem.innerHTML = `${pre}<span class="highlight">${highlight}</span>${post}`;
}