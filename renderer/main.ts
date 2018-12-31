const { dialog } = require('electron').remote
const Backend = require('carta-backend')


let btn = document.getElementById('file-selector');
btn.addEventListener('click', (e:Event) => dialog.showOpenDialog(
    { properties: ['openFile', 'openDirectory',] },
    (filepaths) => {
        try {
            // Only pass the first filepath for now
            var result = Backend.openFile(filepaths[0]);
            console.log(result);
        } catch (err) {
            alert(err);
        }
    }
    )
);
