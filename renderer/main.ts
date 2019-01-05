const { dialog } = require('electron').remote
const Backend = require('carta-backend')

Backend.init();

let eventFunc = () => dialog.showOpenDialog(
    {
        properties: ['openFile',],
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    },
    (filepaths) => {
        try {
            // Only pass the first filepath for now
            if(filepaths) {
                var handle = Backend.openFile(filepaths[0]);
                console.log(`Using handle: ${handle}`);

                var arr = Backend.getBinaryData(handle, 10);
                console.log(`Have data: ${arr}`);
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