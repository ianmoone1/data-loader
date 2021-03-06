const electron = require('electron');
const fs = require('fs');

type StoreData ={
  configName: string;
  defaults: Object;
}

export class Store {
  path  = require('path');
  data: any;
  constructor(opts: StoreData) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = this.path.join(userDataPath, opts.configName + '.json');
    this.data = parseDataFile(this.path, opts.defaults);
  }

  // This will just return the property on the `data` object
  get(key: any) {
    if(key == 'all'){
      return this.data['settings'];
    }else{
      return this.data['settings'][key];
    }
    
  }

  // ...and this will set it
  set(key: any, val: String) {
    this.data['settings'][key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath: String, defaults: Object) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

