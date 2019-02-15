'use strict';

const { dialog } = require('electron').remote;
import { BinFiles } from './BinFile';

let binfiles = new BinFiles();


let processFiles = (filenames: string[]) => {
    // Expects a list of string filepaths
    filenames.forEach(filepath => {
        let b = binfiles.open_file(filepath);
    });
}

let makeArrayOfFilePaths = (fileList): string[] => {
    /* A fileList looks like this:
    {
        0: {path: '/some/path/file0.txt', name: file0.txt ...},
        1: {path: '/some/path/file1.txt', name: file1.txt ...},
        2: {path: '/some/path/file2.txt', name: file2.txt ...},
        length: 3
        item: some function
    }
    */

    let filepaths = [];

    for (let idx in fileList) {
        if (idx !== 'length' && idx !== 'item') {
            filepaths.push(fileList[idx].path);
        }
    }
    return filepaths
}

let clickEventFunc = () => dialog.showOpenDialog(
    {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    },
    (filepaths) => {
        try {
            processFiles(filepaths);
        } catch (err) {
            console.log(err);
        }
    }
)

// Areas

let uploadArea = document.getElementById('file-upload-area');
let infoBoxes = document.getElementsByClassName('info-box');
//Events

// We need to preventDefaults for these 4 events for drag and drop
// to work correctly
['dragenter', 'dragleave', 'dragover', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

let dragEnter = () => {
    uploadArea.style.backgroundColor = '#eee';
}
let dragLeave = () => {
    uploadArea.style.backgroundColor = 'white';
}
let drop = (event) => {
    processFiles(makeArrayOfFilePaths(event.dataTransfer.files))
    uploadArea.style.backgroundColor = 'white';
}

uploadArea.addEventListener('click', clickEventFunc);
uploadArea.addEventListener('dragenter', dragEnter, false);
uploadArea.addEventListener('dragleave', dragLeave, false);
uploadArea.addEventListener('drop', drop, false);
