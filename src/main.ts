// Modules to control application life and create native browser window
import { app, BrowserWindow } from "electron";
import * as path from "path";
import {Store} from './main/store';
import {Name} from './main/name';
import {SendtoFAS} from './main/send';
const {ipcMain} = require('electron');
const { dialog } = require('electron');

const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'fg-user-preferences',
  defaults: {
    settings: {
      windowBounds:{width: 900 , height: 800},
      filePath: '',
      notificationEmail: '',
      studentFileName : 'StudentCourseSelection.txt',
      studentIdField : 'Student Number',
      studentPrefFileName : 'StudentDemographicInformation.txt',
      studentPrefIdField: 'Student number',
      studentPrefFirstNameField: 'Usual first name',
      studentPrefMiddleNameField: 'Usual middle name',
      studentPrefLastNameField: 'Usual surname',
      fgUserName: '',
      fgPassword: ''
    }
  }
});

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  let { width, height } = store.get('windowBounds');

  // Create the browser window.
  mainWindow = new BrowserWindow({ width, height, title : 'FreshGrade'});

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

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


ipcMain.on('selectDirectory', function(event: any) {
  let dir = dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  event.sender.send('set-file-path', dir);
});

ipcMain.on('set-settings', function(event: any, obj: string){
  let settings = JSON.parse(JSON.stringify(obj));

  Object.keys(settings).forEach(setting => {
    store.set(setting, settings[setting]);
  });
  // store.set('settings', obj);
  // event.sender.send('settings', settings);
});

ipcMain.on('get-settings', function(event: any){
  event.sender.send('settings', store.get('all'));
});

ipcMain.on('merge-names', function(event: any){
  let name = new Name(store.get('all')); 
  name.mergeNames()
    .then((res) => {
      name.zip()
        .then((res) => {
          event.sender.send('message-success', 'Preferred Names Applied');
      });
  }).catch(error =>{
    console.log( error.toString());
    event.sender.send('message-error', error.toString()); 
  });
});

ipcMain.on('send-files', function(event: any){
  let send = new SendtoFAS(); 
  send.uploadData(store.get('all')).then((res) => {
    event.sender.send('api-response', res);
  });
});