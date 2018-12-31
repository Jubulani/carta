const { dialog } = require('electron').remote
const Backend = require('carta-backend')


let btn = document.getElementById('file-selector');
btn.addEventListener('click', (e:Event) => dialog.showOpenDialog(
    { properties: ['openFile', 'openDirectory',] },
    (filepaths) => {
        try {
            // Only pass the first filepath for now
            Backend.openFile(filepaths[0]);
        } catch (err) {
            alert(err);
        }
    }
    )
);
