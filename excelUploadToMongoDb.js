const mongoose = require('mongoose');
const XLSX = require('xlsx');


const readline = require('readline-sync');
const getDatabaseName = () => {
    const dbName = readline.question('Please enter the MongoDB database name: ');
    return dbName;
  };

// Function to sanitize column names by removing spaces and converting to camelCase
const sanitizeColumnName = (name) => {
    return name.replace(/\s+/g, '_').toLowerCase();
  };
const connectToMongoDB = (dbName) => {
    const mongoURI = `mongodb+srv://yusufsmasher:L9qtDTMk24i3RQKu@fmbashara1446.c8l53jz.mongodb.net/your_database_name_placeholder`; // Placeholder for the connection string
  
    // Replace the placeholder with the actual database name
    const finalMongoURI = mongoURI.replace('your_database_name_placeholder', dbName);
  
    mongoose.connect(finalMongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('Connected to MongoDB Atlas'))
      .catch(err => console.error('Could not connect to MongoDB Atlas', err));
  };


// Define a schema and model for your data
const dataSchema = new mongoose.Schema({
  // Define your schema fields based on the columns you will extract
  Sno:String,
  Category: String,
  Item_Name: String,
  UOM: String,
  // Add more fields as needed
});

const DataModel = mongoose.model('Itemlist', dataSchema);


const uploadExcel = (filePath, startRow, columns) => {
  const workbook = XLSX.readFile(filePath);
  const sheet_name_list = workbook.SheetNames;
  const worksheet = workbook.Sheets[sheet_name_list[0]];

  // Get the headers from the worksheet
  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 2 })[0];

  console.log('Headers:', headers);
  // Sanitize headers
  //const sanitizedHeaders = headers.map(header => sanitizeColumnName(header));


   // Exclude the first column
  const columnsToInclude = columns.slice(1);

  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: headers,
    range: startRow - 1, // XLSX uses 0-based indexing for rows
    defval: '', // Default value for empty cells
  });

  const filteredData = data.map(row => {
    const filteredRow = {};
    columnsToInclude.forEach((col, index) => {
      if (row[col] !== null && row[col] !== undefined && row[col] !== '') {
        filteredRow[col] = row[col];
      }
    });
    return filteredRow;
  }).filter(row => Object.keys(row).length > 0); // Filter out empty rows

  DataModel.insertMany(filteredData)
    .then(() => {
      console.log('Excel data uploaded to MongoDB');
      mongoose.connection.close();
    })
    .catch(err => {
      console.error('Error uploading data to MongoDB', err);
    });
};

const dbName = getDatabaseName();
connectToMongoDB(dbName);
// Example usage
const filePath = 'C:/Users/YusufHK/Downloads/Copy of Muwaid_Store_Inventory(1).xlsx';
const startRow = 2; // Define the row to start from
const columns = ['Sno','Category', 'Item_Name', 'UOM']; // Define the columns to include (as per Excel column names)

uploadExcel(filePath, startRow, columns);
