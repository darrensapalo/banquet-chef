const { GoogleSpreadsheet } = require('google-spreadsheet');
 
// spreadsheet key is the long id in the sheets URL

exports.contactTrace = async (req, res) => {
    process.env.GOOGLE_SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "1aZELho45USPIxhXysshkApzPxWaCkXqCSJ0EFhLLuNQ";
    console.log("Loading Google Sheet: " + process.env.GOOGLE_SPREADSHEET_ID)
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

    // use service account creds
    // await doc.useServiceAccountAuth({
    //     client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    //     private_key: process.env.GOOGLE_PRIVATE_KEY,
    // });
    // // OR load directly from json file if not in secure environment
    
    
    await doc.useServiceAccountAuth(require('./creds-from-google.json'));
    // // OR use service account to impersonate a user (see https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)
    // await doc.useServiceAccountAuth(require('./creds-from-google.json'), 'some-user@my-domain.com');
    // // OR use API key -- only for read-only access to public sheets
    // doc.useApiKey('YOUR-API-KEY');
    

    try {
        await doc.loadInfo(); // loads document properties and worksheets
    } catch (e) {

        console.error(e);
        return;
    }

    const allowedOrigins = [
        'https://olfp-makati.netlify.app',
        'http://localhost:3000'
    ]

    const origin = req.header('Origin');
    if (allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Access-Control-Allow-Credentials', 'true');

    const traceUserId = req.query.traceUserId;
    const getUserId = req.query.getUserId;

    if (traceUserId) {
        const attendanceSheet = doc.sheetsByTitle["attendances"];

        const currentTimestampAsString = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date())
        
        const row = await attendanceSheet.addRow([
            currentTimestampAsString, traceUserId, 'entry', 'valid'
        ])
        

        res.send("Successfully inserted");
    } else if (getUserId) {
        console.log("Getting user" + getUserId)
        const usersSheet = doc.sheetsByTitle["users"];
            
        const rows = await usersSheet.getRows()
        console.log("Got rows" + rows.length);

        const responses = rows.map(row => ({
            user_id: row.user_id,
            name: row.name,
            address: row.address,
            mobile_number: row.mobile_number
        }));

        const response = responses.find(r => r.user_id === getUserId)

        if (response) {
            res.send(JSON.stringify(response, null, 2));
        } else {
            res.status(404).send(JSON.stringify({
                "message": "not found"
            }, null, 2));
        }
    } else {
        console.log("Getting attendances")
        const attendanceSheet = doc.sheetsByTitle["attendances"];
            
        const rows = await attendanceSheet.getRows()
        console.log("Got total attendance count: " + rows.length);

        const responses = rows.map(row => ({
            created_at: row.created_at,
            user_id: row.user_id,
            type: row.type,
            status: row.status
        }));

        res.send(JSON.stringify(responses, null, 2));
    }
  };
