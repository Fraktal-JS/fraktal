const { app, BrowserWindow } = require('electron'),
    path = require('path'),
    url = require('url');

let window;

function create() {
    window = new BrowserWindow({ width: 954, height: 516, frame: false, titleBarStyle: "customButtonsOnHover" });

    window.loadURL(url.format({ pathname: path.join(__dirname, 'main', 'index.html'), protocol: 'file:', slashes: true }));

    window.setMenu(null);
    //window.webContents.openDevTools();

    window.on('closed', () => { window = null; });
}

app.on('ready', create);

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

app.on('activate', () => { if (window === null) { create(); } });
