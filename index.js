const { GoogleSpreadsheet } = require('google-spreadsheet');
 
// spreadsheet key is the long id in the sheets URL

exports.helloWorld = async (req, res) => {
    
    console.log("1")
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

    // use service account creds
    // await doc.useServiceAccountAuth({
    //     client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    //     private_key: process.env.GOOGLE_PRIVATE_KEY,
    // });
    // // OR load directly from json file if not in secure environment
    console.log("2")
    
    await doc.useServiceAccountAuth(require('./creds-from-google.json'));
    // // OR use service account to impersonate a user (see https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)
    // await doc.useServiceAccountAuth(require('./creds-from-google.json'), 'some-user@my-domain.com');
    // // OR use API key -- only for read-only access to public sheets
    // doc.useApiKey('YOUR-API-KEY');
    

    console.log("3")
    try {
        await doc.loadInfo(); // loads document properties and worksheets
    } catch (e) {

        console.error(e);
        return;
    }

    console.log("4")
    console.log(doc.title);
    await doc.updateProperties({ title: 'renamed doc' });
    
    const attendanceSheet = doc.sheetsByTitle["attendances"];
    console.log(attendanceSheet.title);
    console.log(attendanceSheet.rowCount);
    
    console.log("Request")
    console.log(req.query);

    const userID = req.query.userid;

    const date = new Date().toLocaleString('en-PH', { options: { dateStyle: 'full', timeStyle: 'full' }});
    console.log(date);

    const row = await attendanceSheet.addRow([
        date, userID, 'entry', 'valid'
    ])
    
    res.send("Successfully inserted");
  };
