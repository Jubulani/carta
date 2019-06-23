import { append_div, append_div_with_class, get_closest_parent } from './carta_util';
import * as schema from './schema';

class BinFile {
    data: Uint8Array;
    filename: string;
    file_data_div: Element;
    unique_id: string;
    nugget: any = null;

    constructor(filename: string, file_data: ArrayBuffer, file_idx: number) {
        this.data = new Uint8Array(file_data);
        this.filename = filename;
        this.unique_id = `file-${file_idx}`;
        this.file_data_div = display_file(this.filename, this.data, this.unique_id);
        this.apply_schema();
    }

    apply_schema() {
        try {
            this.nugget = schema.apply_schema(this.data);
            if (this.nugget) {
                set_nugget_ids(this.nugget, 0);
            }
            this.display_schema();
        }
        catch (err) {
            alert(err);
        }
    }

    display_schema() {
        display_schema_data(this.file_data_div, this.nugget);
    }
}

var all_files: BinFile[] = [];

export function new_file(filename: string, file_data: ArrayBuffer) {
    let file = new BinFile(filename, file_data, all_files.length);
    all_files.push(file);
}

export function apply_new_schema() {
    all_files.forEach(e => e.apply_schema());
}

function display_file(filename: string, data: Uint8Array, unique_id: string): Element {
    let file_div = append_div(unique_id, "data-area");
    file_div.classList.add("file-container");

    let name_div = append_div_with_class(file_div, "filename");
    name_div.textContent = filename;

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
    // Remove the schema display if we have one, so we can display a new one
    let schema_data_divs = file_data_div.getElementsByClassName("schema");
    for (let i = 0; i < schema_data_divs.length; ++i) {
        schema_data_divs[i].remove();
    }

    if (nugget) {
        let schema_div = append_div_with_class(file_data_div, "schema");

        let schema_minmax_div = append_div_with_class(schema_div, "schema-minmax");
        schema_minmax_div.innerHTML = get_root_minmax_buttons(nugget);

        let schema_data_div = append_div_with_class(schema_div, "schema-data");
        schema_data_div.innerHTML = get_root_schema_data(nugget);

        update_schema_event_listeners(file_data_div);
    }
}

var nugget_id = 0;
function get_nugget_text(nugget: any, depth: number): string {
    let value = new Array(depth + 1).join('  ');
    value += `<span class=schema-nugget data-idx-start=${nugget.start} data-idx-len=${nugget.len} data-nugget-id=${nugget_id++}>`;
    value += nugget.name;
    if (nugget.value) {
        value += `: ${nugget.value}`;
    }
    return value + '</span>\n';
}

function get_schema_data(nugget: any, depth: number): string {
    let schema_data = get_nugget_text(nugget, depth);
    if (nugget.minimised) {
        return schema_data;
    } else {
        return nugget.children.reduce(
            (accu: string, val: any) => accu += get_schema_data(val, depth + 1),
            schema_data,
        );
    }
}

function get_root_schema_data(nugget: any): string {
    return nugget.children.reduce(
        (accu: string, val: any) => accu += get_schema_data(val, 0),
        ''
    );
}

function get_minmax_data(nugget: any) {
    if (nugget.children.length) {
        if (nugget.minimised) {
            return `<span class="maximise" data-nugget-id="${nugget.id}"><i class="far fa-plus-square"></i></span>\n`;
        } else {
            return nugget.children.reduce(
                (accu: string, val: any) => accu += get_minmax_data(val),
                `<span class="minimise" data-nugget-id="${nugget.id}"><i class="far fa-minus-square"></i></span>\n`
            );
        }
    } else {
        return '\n';
    }
}

function get_root_minmax_buttons(nugget: any): string {
    return nugget.children.reduce(
        (accu: string, val: any) => accu += get_minmax_data(val),
        ''
    );
}

function get_span_parent(elem: Element): Element | null {
    // Might have a path or svg element from fontawesome instead of the span that we need
    // If so, get the parent or parent's parent.  We might need to go path -> svg -> span
    let result: Element | null = elem;
    if (elem.tagName.toLowerCase() !== 'span') {
        result = elem.parentElement;
    }
    if (result && result.tagName.toLowerCase() !== 'span') {
        result = result.parentElement;
    }
    return result;
}

function click_minimise(e: Event) {
    // Make sure e.target is an Element for typescript
    if (!(e.target instanceof Element)) {
        console.error('Expected element, got ' + e.target);
        return;
    }
    let target = get_span_parent(e.target);
    if (!target) {
        console.error('Could not find parent span element');
        return;
    }

    let nugget_id_attr = target.attributes.getNamedItem('data-nugget-id');
    if (!nugget_id_attr) {
        console.error('data-nugget-id attribute not found');
        return;
    }
    let nugget_id = parseInt(nugget_id_attr.value);
    minimise_nugget_from_span(nugget_id, target, true);
}

function click_maximise(e: Event) {
    // Make sure e.target is an Element for typescript
    if (!(e.target instanceof Element)) {
        console.error('Expected element, got ' + e.target);
        return;
    }
    let target = get_span_parent(e.target);
    if (!target) {
        console.error('Could not find parent span element');
        return;
    }

    let nugget_id_attr = target.attributes.getNamedItem('data-nugget-id');
    if (!nugget_id_attr) {
        console.error('data-nugget-id attribute not found');
        return;
    }
    let nugget_id = parseInt(nugget_id_attr.value);
    minimise_nugget_from_span(nugget_id, target, false);
}

function minimise_nugget_from_span(nugget_id: number, clicked_elem: Element, min_value: boolean) {
    // Find the unique file-id.  Go up the parent divs until we reach the file-container,
    // checking each one as we go
    let p1 = clicked_elem.parentElement;
    if (!p1 || !p1.classList.contains('schema-minmax')) {
        console.error('Could not find schema-minmax div');
        return;
    }

    let p2 = p1.parentElement;
    if (!p2 || !p2.classList.contains('schema')) {
        console.error('Could not find schema div');
        return;
    }

    let p3 = p2.parentElement;
    if (!p3 || !p3.classList.contains('file-data')) {
        console.error('Could not find file-date div');
        return;
    }

    let p4 = p3.parentElement;
    if (!p4 || !p4.classList.contains('file-container')) {
        console.error('Could not find file-container div');
        return;
    }

    let file_id = p4.id;
    const binfile = all_files.find(file => file.unique_id === file_id);
    if (!binfile) {
        console.error('Could not find appropriate BinFile object');
        return;
    }

    minimise_nugget(nugget_id, binfile.nugget, min_value);
    binfile.display_schema();
}

function minimise_nugget(nugget_id: number, nugget: any, min_value: boolean) {
    // Find the appropriuate nugget to minimise
    if (nugget.id === nugget_id) {
        nugget.minimised = min_value;
        return;
    } else if (nugget.children.length) {
        for (let i = 0; i < nugget.children.length; ++i) {
            if (nugget.children.id > nugget_id) {
                return;
            } else if (i < nugget.children.length - 1 && nugget.children[i + 1].id < nugget_id) {
                // Can't be in this child, skip to the next one
                continue;
            } else {
                minimise_nugget(nugget_id, nugget.children[i], min_value);
            }
        }
    }
}

function update_schema_event_listeners(file_data_div: Element) {
    const elems = file_data_div.getElementsByClassName('schema-nugget');
    Array.from(elems).forEach(function (elem) {
        elem.addEventListener('mouseenter', nugget_mouseenter);
        elem.addEventListener('mouseleave', nugget_mouseleave);
    });

    const min_elems = file_data_div.getElementsByClassName("minimise");
    Array.from(min_elems).forEach(elem => {
        elem.addEventListener('click', click_minimise);
    });
    const max_elems = file_data_div.getElementsByClassName("maximise");
    Array.from(max_elems).forEach(elem => {
        elem.addEventListener('click', click_maximise);
    });
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
    let start_char = Math.floor((start * 2) * 1.25);
    let end_char = Math.floor(((start + len) * 2) * 1.25);

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

function set_nugget_ids(nugget: any, id: number): number {
    nugget.id = id++;
    id = nugget.children.reduce((accu: number, n: any) => {
        return set_nugget_ids(n, accu);
    },
        id
    );
    return id;
}
