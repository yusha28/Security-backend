// write a function
// Importing package
// Always export the function

// Importing the package
import mongoose from'mongoose';

// Creating a function
 export const connectDB = () => {
    mongoose.connect(process.env.MONGODB_URL).then(()=>{
        console.log('Database connected Successful');
    })
    .catch((err) =>{
        console.log(`Some error occured. ${err}`);
    });
};

// Exporting the function
// module.exports = connectDB;
