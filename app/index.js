const { app, BrowserWindow, ipcMain } = require("electron");
const storage = require("fraktal-storage");
const request = require("snekfetch");
const parsePodcast = require("node-podcast-parser");

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

    window.storage = storage;

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

ipcMain.on("podcast-add", (event, url) => {
    request.get(url).then(r => {
        parsePodcast(r.text, (err, data) => {
            if (err) throw err.stack;

            if (!storage.podcasts) storage.podcasts = [];

            const podcasts = storage.podcasts;
            podcasts.push({ title: data.title, url });

            storage.podcasts = podcasts;

            window.send("podcast-list", storage.podcasts);
        });

    }).catch(err => { throw err.stack; });
});

ipcMain.on("podcast-load", (event, url) => {
    request.get(url).then(r => {
        parsePodcast(r.text, (err, data) => {
            if (err) throw err.stack;

            window.send("podcast-open", data);
        });

    }).catch(err => { throw err.stack; });
});