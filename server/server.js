const express = require('express');
const fs = require('fs');
const app = express();
const parse = require("csv-parse").parse;

const cors = require('cors');
app.use(cors());

app.use(express.json());

let hdbdata2023;

async function readAllHDBData() {
   return new Promise((resolve, reject) => {
      const rData = [];

      fs.createReadStream(".\\data\\Resaleflatprices_2023_6month.csv")
         .pipe(parse({ delimiter: ',', from_line: 2 }))
         .on('data', function (csvrow) {
            let newRecord = {
               month               : csvrow[0],
               town                : csvrow[1],
               flat_type           : csvrow[2],
               block               : csvrow[3],
               street_name         : csvrow[4],
               storey_range        : csvrow[5],
               floor_area_sqm      : parseFloat(csvrow[6]),
               flat_model          : csvrow[7],
               lease_commence_date : csvrow[8],
               remaining_lease     : csvrow[9],
               resale_price        : parseFloat(csvrow[10])
            };
            rData.push(newRecord);
         })
         .on('end', function () {
            resolve(rData)
         })
         .on('error', function (err) {
            reject(err);
         });
   });
}

// This responds with " Nothing" on the homepage
app.get('/', function (req, res) {
   console.log("Host data ready");
   res.send('Your Data Host!');
})

// Endpoint All Model e.g. http://localhost:8081/allhdbdata
app.get('/allhdbdata', function (req, res) {
   console.log("All HDB Data");
   res.send(hdbdata2023);
})

// Endpoint Query Model Town e.g. http://localhost:8081/bytown/ANG%20MO%20KIO
app.get('/bytown/:town', (req, res) => {
   let town = req.params.town;
   const result = hdbdata2023.filter((flat) => { return flat.town == town})
   res.status(200);
   res.type('application/json');
   res.json(result);   
});

// Endpoint Query Flat Type e.g. http://localhost:8081/byflattype/4%20ROOM
app.get('/byflattype/:flattype', (req, res) => {
   let flattype = req.params.flattype;
   const result = hdbdata2023.filter((flat) => { return flat.flat_type == flattype})
   res.status(200);
   res.type('application/json');
   res.json(result);     
});

// Endpoint Query Month Year e.g. http://localhost:8081/byyrmoth/2023-07
app.get('/byyrmoth/:yrmonth', (req, res) => {   
   let yrmonth = req.params.yrmonth ;
   const result = hdbdata2023.filter((flat) => { return flat.month == yrmonth})
   res.status(200);
   res.type('application/json');
   res.json(result);     
});

readAllHDBData().then((alldata) => {
   hdbdata2023 = alldata;
   const server = app.listen(8081, 'localhost', () => {
      const host = server.address().address
      const port = server.address().port
      console.log(`Example app listening at http://${host}:${port}`);
   })
}).catch((error) => {
   console.log("Error:", error)
});
// to run the server: node server