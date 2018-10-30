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
                            if(it[this.settings.studentPrefFirstNameField] != '' || it[this.settings.studentPrefMiddleNameField] != '' || it[this.settings.studentPrefLastNameField] != ''){
                                return it;
                            }
                        }
                    );
                    demoFilterObj.forEach((demoFilterObj) => {
                        if(demoFilterObj[this.settings.studentPrefIdField] == null){
                            let error = new Error ('Student Id field does not match a column in the preferred names file');
                            reject(
                                error
                            );
                        }
                        let students: any =  stuObj.filter(
                            (it) => {
                                return it[this.settings.studentIdField] == demoFilterObj[this.settings.studentPrefIdField];
                            }
                        );
                        students.forEach((student: any) =>{
                            student['usualFirstName'] = demoFilterObj[this.settings.studentPrefFirstNameField];
                            student['usualMiddleName'] = demoFilterObj[this.settings.studentPrefMiddleNameField];
                            student['usualSurname'] = demoFilterObj[this.settings.studentPrefLastNameField];
                        });
                    });
                    this.jsonexport(stuObj,(err: any, csv: any) =>{
                        if(err) return console.log(err);
                        fs.writeFile(this.settings.filePath + '/StudentCourseSelection.txt', csv, 'utf8', (err: any) => {
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
            archive.file(this.settings.filePath + '/ClassInformation.txt', {name: '/ClassInformation.txt'});
            archive.file(this.settings.filePath + '/StudentCourseSelection.txt', {name: '/StudentCourseSelection.txt'});
            archive.file(this.settings.filePath + '/CourseInformation.txt', {name: '/CourseInformation.txt'});
            archive.file(this.settings.filePath + '/ParentInformation.txt', {name: '/ParentInformation.txt'});
            archive.file(this.settings.filePath + '/SchoolDetails.txt', {name: '/SchoolDetails.txt'});
            archive.file(this.settings.filePath + '/StaffInformation.txt', {name: '/StaffInformation.txt'});

        
            archive.finalize();

            resolve({
                status: 'zipping...'
            });

        });
    }

}
