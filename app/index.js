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

    const podcasts = storage.podcasts;
    podcasts.push(arg);

    storage.podcasts = podcasts;
});

ipcMain.on("podcast-load", (event, url) => {
    //console.log(url);
    request.get(url).then(r => {
        parsePodcast(r.body, (err, { title, description, episodes }) => {
            if (err) throw err;

            window.send("podcast-open", { title, description, episodes });
        });

    }).catch(err => window.send("invalid-url", err));
});