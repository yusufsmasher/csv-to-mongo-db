const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');


// MongoDB connection string
const mongoURI =
 'mongodb+srv://yusufsmasher:L9qtDTMk24i3RQKu@fmbashara1446.c8l53jz.mongodb.net/?retryWrites=true&w=majority&appName=fmbashara1446';


 var MongoClient = require('mongodb').MongoClient

const client = new MongoClient(mongoURI, {useUnifiedTopology: true});

client.connect().then((client)=>{
    var db = client.db('ItemDetails')
    db.collection('ItemDetials').find().toArray(function (err, result) {
        if (err) throw err
        console.log(result);
    })
})


// Define a schema and model for your data
const dataSchema = new mongoose.Schema({
  Category: String,
  Item_Name: String,
  UOM: String,
  // Add more fields based on your CSV/Excel structure
});

const DataModel = mongoose.model('ItemDetails', dataSchema);

// Connect to MongoDB
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Could not connect to MongoDB', err));

// Function to upload CSV data to MongoDB
const uploadCSV = (filePath) => {
  const dataArray = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      dataArray.push(row);
    })
    .on('end', async () => {
      try {
        await DataModel.insertMany(dataArray);
        console.log('CSV data uploaded to MongoDB');
        mongoose.connection.close();
      } catch (err) {
        console.error('Error uploading data to MongoDB', err);
      }
    });
};



// Change the file path and type accordingly
const filePath = './asharafmb1446ItemEntry.csv'; // or 'path_to_your_file.xlsx'
const fileType = 'csv'; // or 'excel'

if (fileType === 'csv') {
  uploadCSV(filePath);
} else {
  console.error('Unsupported file type');
}
