import { Promise } from 'es6-promise';
export class Name{
    csv = require('csvtojson');
    jsonexport = require('jsonexport');
    settings: any;
    studentscsvFilePath: string;
    demographicscsvFilePath: string;
    

    constructor(settings: any) {
        this.studentscsvFilePath = settings.filePath + '/' + settings.studentFileName;
        console.log(this.studentscsvFilePath);
        this.demographicscsvFilePath = settings.filePath + '/' + settings.studentPrefFileName;
        console.log(this.demographicscsvFilePath);
        this.settings = settings;
    }

    mergeNames(){
        return this.mergePreferredNames();
        
    }

    zipFiles(){
        return this.zip();
    }

    mergePreferredNames(){
        const fs = require('fs');
        
        return new Promise((resolve, reject) => {
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
                            test['sis_student_preferred_name'] = demoFilterObj[this.settings.studentPrefFirstNameField];
                            test['sis_student_preferred_middle_name'] = demoFilterObj[this.settings.studentPrefMiddleNameField];
                            test['sis_student_preferred_last_name'] = demoFilterObj[this.settings.studentPrefLastNameField];
                        });
                    });
                    this.jsonexport(stuObj,(err: any, csv: any) =>{
                        if(err) return console.log(err);
                        // console.log(csv);
                        fs.writeFile(this.settings.filePath + '/students-new.csv', csv, 'utf8', (err: any) => {
                          if (err) {
                            console.log('Some error occured - file either not saved or corrupted file saved.');
                          } else{
                            resolve({
                                status: 'merging...'
                            });
                          }
                        });
                    });
                });
            }).catch((error : any) => {
                reject(
                    error
                );
  
            });
        });
    }


    zip() {
        return new Promise((resolve) => {
            const fs = require('fs');
            var archiver = require('archiver');
            var output = fs.createWriteStream(this.settings.filePath + '/archive.zip');
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
            archive.file(this.settings.filePath + '/teachers.csv', {name: '/teachers.csv'});
            archive.file(this.studentscsvFilePath, {name: '/students.csv'});
            archive.file(this.settings.filePath + '/sections.csv', {name: '/sections.csv'});
            archive.file(this.settings.filePath + '/schools.csv', {name: '/schools.csv'});
            archive.file(this.settings.filePath + '/parents.csv', {name: '/parents.csv'});
            archive.file(this.settings.filePath + '/enrollments.csv', {name: '/enrollments.csv'});
        
            archive.finalize();

            resolve({
                status: 'zipping...'
            });

        });
    }

}
