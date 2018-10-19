// Modules to control application life and create native browser window
import { app, BrowserWindow } from "electron";
import * as path from "path";
import {Store} from './main/store';
import {Name} from './main/name';
const {ipcMain} = require('electron');

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow); 

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    // 800x600 is the default size of our window
    windowBounds:{width: 800, height: 600},
    settings: {
      filePath: '/Users/freshgrade/Downloads/Example_DirectConnect_CSVs/',
      studentFileName : 'students.csv',
      studentIdField : 'sis_student_id',
      studentNameField : 'sis_student_first_name',
      studentPrefFileName : 'demographic.csv',
      studentPrefIdField: 'sis_student_id',
      studentPrefNameField: 'student_preferred_name',
      fgUserName: '',
      fgPassword: ''
    }
  }
});

ipcMain.on('set-settings', function(event: any, obj: string){
  store.set('settings', obj);
  // event.sender.send('settings', settings);
});

ipcMain.on('get-settings', function(event: any){
  
  event.sender.send('settings', store.get('settings'));
});

ipcMain.on('merge-names', function(event: any){
  const name = new Name(store.get('settings')); 
  name.mergePreferredNames();
});