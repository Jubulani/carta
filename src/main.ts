
import { append_div, append_div_with_class, get_closest_parent } from './carta_util';
import * as editor from './editor';
import * as binfiles from './binfiles';
import * as schema from './schema';

schema.init();

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
}

function addEventListeners() {
    let fileElem = document.getElementById('file-upload');
    if (fileElem) {
        fileElem.addEventListener('change', readFiles);
    } else {
        console.error('Could not find file upload element');
    }

    let schemaElem = document.getElementById('open-schema-input');
    if (schemaElem) {
        schemaElem.addEventListener('change', readSchemaFiles);
    } else {
        console.error('Could not find schema file upload input');
    }

    let newSchemaButton = document.getElementById('new-schema');
    if (newSchemaButton) {
        newSchemaButton.addEventListener('click', new_schema);
    } else {
        console.error('Could not find new schema button');
    }

    let openSchemaButton = document.getElementById('open-schema');
    if (openSchemaButton) {
        openSchemaButton.addEventListener('click', open_schema);
    } else {
        console.error('Could not find open schema button');
    }

    window.addEventListener("resize", editor.resize);
}

function new_schema() {
    init_editor(null);
}

function init_editor(default_data: string | null) {
    // Remove schema buttons
    let newSchemaButton = document.getElementById('new-schema');
    if (newSchemaButton) {
        newSchemaButton.remove();
    }
    let openSchemaButton = document.getElementById('open-schema');
    if (openSchemaButton) {
        openSchemaButton.remove();
    }

    let parent = document.getElementById("sidebar");
    if (!parent) {
        console.error("Could not find div with id: 'sidebar'");
        return;
    }

    // Add editor element
    let editorElem = append_div_with_class(parent, "editor");
    editorElem.id = "editor-container";

    // And schema status element
    let statusElem = append_div_with_class(parent, "schema-status");
    statusElem.textContent = "Syntax: ";

    let syntaxResults = document.createElement("span");
    syntaxResults.id = "syntax-results";
    statusElem.appendChild(syntaxResults);

    editor.init_editor(default_data);
}

function open_schema() {
    let openSchemaInput = document.getElementById('open-schema-input');
    if (!openSchemaInput) {
        console.error('Could not find open schema input');
        return;
    }

    // Simulate a click on the hidden input, to open the 'choose file' dialog
    openSchemaInput.click();
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
                binfiles.new_file(file.name, res);
            }
            reader.readAsArrayBuffer(file);
        }

        // Remove the large 'open file' element
        let fileUploadArea = document.getElementById('file-upload-area');
        if (fileUploadArea) {
            fileUploadArea.remove();
        }
    }
}

function readSchemaFiles() {
    let input = <HTMLInputElement>document.getElementById("open-schema-input");
    let files = input.files;

    if (files) {
        if (files.length != 1) {
            // How did this happen?  It's not a multi input
            console.error('Must specify only one file');
            return;
        }

        let file = files[0];
        let reader = new FileReader();

        reader.onloadend = function () {
            let res = <string>reader.result;
            init_editor(res);
        }
        reader.readAsText(file);
    }
}

// Make me a module
export default function () { }