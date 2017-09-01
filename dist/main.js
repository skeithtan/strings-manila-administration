'use strict';

var electron = require('electron');

var app = electron.app,
    BrowserWindow = electron.BrowserWindow,
    ipcMain = electron.ipcMain;


var path = require('path');
var url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = void 0;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        minHeight: 600,
        minWidth: 1200,
        titleBarStyle: "hiddenInset",
        frame: false
    });

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/views/templates/sign-in.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function loadOrdersReportWindow(reportData) {
    var window = new BrowserWindow({
        width: 1000,
        height: 900,
        title: "Orders Report",
        minWidth: 1000,
        minHeight: 500
    });

    window.loadURL(url.format({
        pathname: path.join(__dirname, '/views/templates/order-report-window.html'),
        protocol: 'file:',
        slashes: true
    }));

    window.webContents.on('did-finish-load', function () {
        window.webContents.send('message', reportData);
    });
}

ipcMain.on('generate-report', function (event, arg) {
    loadOrdersReportWindow(arg);
});
//# sourceMappingURL=main.js.map