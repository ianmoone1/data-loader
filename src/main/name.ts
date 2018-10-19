export class Name{
    csv = require('csvtojson');
    jsonexport = require('jsonexport');
    settings: any;
    studentscsvFilePath: string;
    demographicscsvFilePath: string;

    constructor(settings: any) {
        this.studentscsvFilePath = settings.filePath + settings.studentFileName;
        this.demographicscsvFilePath = settings.filePath + settings.studentPrefFileName;
        this.settings = settings;
    }

    mergePreferredNames(){
        this.csv()
        .fromFile(this.studentscsvFilePath)
        .then((stuObj: string[])=>{
            this.csv()
            .fromFile(this.demographicscsvFilePath)
            .then((demoObj: String[])=>{
                let  demoFilterObj =  demoObj.filter(
                (it) => {
                    return it[this.settings.studentPrefNameField] != '';
                }
                );

                demoFilterObj.forEach((demoFilterObj) => {
                    let test: any =  stuObj.filter(
                        (it) => {
                            return it[this.settings.studentIdField] == demoFilterObj[this.settings.studentPrefIdField];
                        }
                    );
                   
                    test.forEach((test: any) =>{
                        test[this.settings.studentNameField] = demoFilterObj[this.settings.studentPrefNameField];
                    });
                });
                
                this.saveFile(stuObj);
            });
        });
    }

    saveFile(obj: Object){
        const fs = require('fs');
        this.jsonexport(obj,(err: any, csv: any) =>{
          if(err) return console.log(err);
          // console.log(csv);
          fs.writeFile(this.settings.filePath + 'students-new.csv', csv, 'utf8', (err: any) => {
            if (err) {
              console.log('Some error occured - file either not saved or corrupted file saved.');
            } else{
              console.log('It\'s saved!');
              this.zip();
            }
          });
        });
    }

    zip() {
        const fs = require('fs');
        var archiver = require('archiver');
        var output = fs.createWriteStream(this.settings.filePath + 'archive.zip');
        var archive = archiver('zip', {
            gzip: true,
            zlib: { level: 9 } // Sets the compression level.
        });
      
        archive.on('error', function(err: any) {
          throw err;
        });
      
        // pipe archive data to the output file
        archive.pipe(output);
      
        // append files
        archive.file(this.settings.filePath + 'teachers.csv', {name: '/teachers.csv'});
        archive.file(this.settings.filePath + 'students.csv', {name: '/students.csv'});
        archive.file(this.settings.filePath + 'sections.csv', {name: '/sections.csv'});
        archive.file(this.settings.filePath + 'schools.csv', {name: '/schools.csv'});
        archive.file(this.settings.filePath + 'parents.csv', {name: '/parents.csv'});
        archive.file(this.settings.filePath + 'enrollments.csv', {name: '/enrollments.csv'});
      
        archive.finalize();
    }
}
