const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

let window;

function create() {
    window = new BrowserWindow({
        titleBarStyle: "customButtonsOnHover",
        frame: false,
        width: 954,
        height: 516,
        show: false
    });

    window.maximize();

    window.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.setMenu(null);
    //window.webContents.openDevTools();

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
