const { dialog } = require('electron').remote
const Backend = require('carta-backend')

let eventFunc = () => dialog.showOpenDialog(
    { properties: ['openFile', 'openDirectory',] },
    (filepaths) => {
        try {
            // Only pass the first filepath for now
            if(filepaths) {
                var result = Backend.openFile(filepaths[0]);
                console.log(result);
            } else {
                console.log("No filenames returned")
            }
        } catch (err) {
            console.log(err);
        }
    }
    )

let uploadArea = document.getElementById('file-upload-area');
uploadArea.addEventListener('click', eventFunc)