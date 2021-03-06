const { app, BrowserWindow, ipcMain } = require("electron");
const storage = require("fraktal-storage");
const request = require("snekfetch");
const parsePodcast = require("node-podcast-parser");
const rpc = new (require("discord-rpc").Client)({ transport: "ipc" });

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
        show: false,
        height: 575,
        width: 1000
    });

    window.storage = storage;

    window.maximize();
    window.focus();
    window.setMenu(null);

    window.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    if (developerMode) {
        require("devtron").install();
        //window.webContents.openDevTools();
    }

    window.on("closed", () => { window = null; });
    window.once("ready-to-show", () => window.show());
}

function resetRPC() { 
    rpc.setActivity({
        details: "Browsing podcasts...",
        startTimestamp: new Date(),
        largeImageKey: "fraktal",
        largeImageText: "Fraktal: A Podcast Manager"
    });
}

app.on("ready", () => {
    if (!storage.settings) storage.settings = { volume: 0.25 };
    if (!storage.podcasts) storage.podcasts = [];

    create();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

app.on("activate", () => { if (!window) create(); });

ipcMain.on("podcast::search", (event, arg) => {
    // Podcast Search stuff
});

ipcMain.on("podcast::add", (event, url) => {
    request.get(url).then(r => {
        parsePodcast(r.text, (err, data) => {
            if (err) return window.send("err-reset", err);

            const podcasts = storage.podcasts;
            podcasts.push({ title: data.title, url });

            storage.podcasts = podcasts;

            window.send("podcast-list::reload", null);
        });

    }).catch(err => window.send("err-reset", err));
});

ipcMain.on("podcast::remove", (event, url) => {
    const list = storage.podcasts;

    const newList = list.filter(p => p.url !== url);

    storage.podcasts = newList;

    window.send("podcast-list::reload", null);
});

ipcMain.on("podcast::load", (event, url) => {
    request.get(url).then(r => {
        parsePodcast(r.text, (err, data) => {
            if (err) return window.send("err-reset", err);

            window.send("podcast::open", data);
        });

    }).catch(err => window.send("err-reset", err));
});

ipcMain.on("podcast::rpcReset", () =>  resetRPC());

ipcMain.on("podcast::play", (event, arg) => {
    if (!rpc) return;
    
    rpc.setActivity({
        details: arg.podcast,
        state: arg.title,
        startTimestamp: new Date(),
        largeImageKey: "fraktal",
        largeImageText: "Fraktal: A Podcast Manager"
    });
});

rpc.login("434490770611896320")
    .then(() => resetRPC())
    .catch(console.error);