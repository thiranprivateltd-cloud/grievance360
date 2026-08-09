const mongoose = require('mongoose');

const uri = 'mongodb+srv://thiranprivateltd_db_user:jOPhPP08L08xHVQ9@cluster0.tnhhvdi.mongodb.net/grievance360?appName=Cluster0';

console.log('Attempting to connect to MongoDB Atlas...');
mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB Atlas successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE: Connection error details:');
    console.error(err);
    process.exit(1);
  });
