const { dialog } = require('electron').remote
const Backend = require('carta-backend')


let btn = document.getElementById('file-selector');
btn.addEventListener('click', (e:Event) => dialog.showOpenDialog(
    { properties: ['openFile', 'openDirectory',] },
    (filepaths) => {
    // Only pass the first filepath for now
        Backend.openFile(filepaths[0]);
        }
    )
);
