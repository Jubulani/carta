const Backend = require('carta-backend');

const util = require('./util');

export class BinFiles {
    files: {};
    constructor() {
        this.files = {};
        Backend.init();
    }

    open_file(filename: string) {
        let file = new BinFile(filename);
        this.files[file.handle] = file;

        show_header_and_footer();
    }
}

class BinFile {
    // Unique id generated by the Backend when we open a file
    handle: number;
    constructor(filename: string) {
        this.handle = Backend.openFile(filename);
        this.create_divs();
    }

    create_divs() {
        let node = document.createElement('div');
        node.className = 'info-box';
        node.setAttribute('id', 'info-box-' + this.handle);

        node.innerHTML = Backend.getBinaryData(this.handle, 10);

        let fileUpload = document.getElementById('file-upload-area');
        let container = document.getElementById('main-container');
        container.insertBefore(node, fileUpload);
    }
}

function show_header_and_footer() {
    util.removeClassFromElement('header', 'hidden');
    util.removeClassFromElement('footer', 'hidden');

    // Set the grid style appropriately for a visible header and footer
    let gridParent = document.getElementById('html-body');
    gridParent.style.gridTemplateRows = '60px auto 1.5em';
}
