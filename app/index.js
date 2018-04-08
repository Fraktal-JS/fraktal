const { app, BrowserWindow, ipcMain } = require("electron");
const storage = require("./utility/storage.js");
const path = require("path");
const url = require("url");

const developerMode = "ELECTRON_IS_DEV" in process.env ?
    parseInt(process.env.ELECTRON_IS_DEV, 10) === 1 :
    (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));

let window;

function create() {
    window = new BrowserWindow({
        titleBarStyle: "customButtonsOnHover",
        frame: false,
        show: false
    });

    window.maximize();

    window.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.setMenu(null);

    if (developerMode) {
        require("devtron").install();
        window.webContents.openDevTools();
    }

    window.on("closed", () => { window = null; });

    window.once("ready-to-show", () => window.show());
}

app.on("ready", () => {
    create();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (!window) create();
});

ipcMain.on("podcast-search", (event, arg) => {
    console.log("A search was started:", arg);
});

ipcMain.on("podcast-add", (event, arg) => {
    if (!storage.podcasts) storage.podcasts = [];

    console.log("Podcast add:", arg);
    storage.podcasts.push(arg);

    console.log(storage.podcasts);
});