const app           = require('electron').app;
const BrowserWindow = require('electron').BrowserWindow;
const ipcMain       = require('electron').ipcMain;
const Menu          = require('electron').Menu;
const path          = require('path');
const vmWindow      = require('./vmWindow');

let mainWindow = null;
let vmData     = null;

const moveToApplicationsFolder = function(app) {
        app.moveToApplicationsFolder({
            conflictHandler: function(conflictType) {
                if (conflictType === 'exists') {
                    return dialog.showMessageBoxSync({
                        type:      'question',
                        buttons:   ['Halt Move', 'Continue Move'],
                        defaultId: 0,
                        message:   'An app of this name already exists'
                    }) === 1;
                }
                return true;
            }
        });
    };

exports.isOpen = function() {
    return !!mainWindow;
};

exports.createMainWindow = function() {
    mainWindow = new BrowserWindow({
        width:  1200,
        height: 800,
        show:   false,
        webPreferences: {
            enableRemoteModule: false,
            allowEval:          false,
            preload:            path.join(__dirname, './mainWindowPreload.js')
        }
    });
    mainWindow.removeMenu();
    if (process.platform === 'darwin') {
        let menu = Menu.buildFromTemplate([
                {
                    label: 'Wheel',
                    submenu: [
                        {
                            label:'Exit',
                            click: function() {
                                app.quit();
                            }
                        }
                    ]
                }
            ]);
        if (app.isPackaged) {
            Menu.setApplicationMenu(menu);
        }
    } else {
        mainWindow.setMenu(null);
    }
    mainWindow.loadFile('html/electron.html');
    mainWindow.on(
        'move',
        (event) => {
            let position = mainWindow.getPosition();
            mainWindow.webContents.send(
                'postMessage',
                JSON.stringify({
                    message: 'move',
                    data:    {x: position[0], y: position[1]}
                })
            );
        }
    );
    mainWindow.on(
        'resized',
        (event) => {
            let position = mainWindow.getPosition();
            let size     = mainWindow.getSize();
            mainWindow.webContents.send(
                'postMessage',
                JSON.stringify({
                    message: 'resize',
                    data:    {x: position[0], y: position[1], width: size[0], height: size[1]}
                })
            );
        }
    );
    mainWindow.on(
        'close',
        (event) => {
            if (!vmWindow.isOpen()) {
                app.quit();
            }
            mainWindow = null;
        }
    );
    mainWindow.webContents.openDevTools();
};

ipcMain.on(
    'postMessage',
    function(event, arg) {
        switch (arg.command) {
            case 'documentPath': // The document path is requested from the preload file!
                let homedir = (process.platform === 'darwin') ? app.getPath('documents') : os.homedir();
                event.reply('postMessage', JSON.stringify({message: 'documentPath', data: homedir, isPackaged: app.isPackaged}));
                break;
            case 'quit':
                app.quit();
                break;
            case 'console':
                mainWindow.webContents.openDevTools();
                break;
            case 'settings':
                let settings = arg.settings;
                if (('windowPosition' in settings) && settings.windowPosition.x && settings.windowPosition.y) {
                    mainWindow.setPosition(settings.windowPosition.x, settings.windowPosition.y);
                }
                if ('windowSize' in settings) {
                    mainWindow.setSize(Math.max(settings.windowSize.width, 800), Math.max(settings.windowSize.height, 640));
                }
                event.reply(
                    'postMessage',
                    JSON.stringify({
                        message:                'settings',
                        version:                app.getVersion(),
                        isPackaged:             app.isPackaged,
                        isInApplicationsFolder: (process.platform === 'darwin') ? app.isInApplicationsFolder() : true
                    })
                );
                mainWindow.show();
                break;
            case 'moveToApplicationsFolder':
                moveToApplicationsFolder(app);
                break;
            case 'vm':
                vmData = {
                    projectFilename: arg.projectFilename,
                    program:         arg.program,
                    settings:        arg.settings
                };
                vmWindow.createVMWindow(app);
                if (arg.settings.closeIDEonVMRun) {
                    mainWindow.close();
                }
                break;
            case 'vmProgram':
                event.reply(
                    'postMessage',
                    JSON.stringify({
                        message: 'vmProgram',
                        data:    vmData
                    })
                );
                break;
        }
    }
);
