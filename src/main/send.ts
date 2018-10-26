export class SendtoFAS{
    req = require('request');
    fs = require('fs');

    uploadData(settings: any){
        var filePath = settings.filePath + '/archive.zip';
        var file = this.fs.createReadStream(filePath);
        var options = {
            auth : {
                username : settings.fgUserName,
                password : settings.fgPassword
            }
        };
        
        console.log(filePath);
        var r = this.req.post('https://dc.onboarding.freshgrade.com/upload',options,function(err: any, httpsResponse: any, body: any){
            if ( err ) {
                console.log('err', err);
            } else {
                console.log(httpsResponse.statusCode);
                console.log(body);
            }
        });
        var form = r.form();
        form.append('file', file);
        form.append('emailAddress', '');
    }
}
