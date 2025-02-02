import app from "./app.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET,
});
app.listen(process.env.PORT, ()=> {
    console.log(`Server is Running on port ${process.env.PORT}`);
})
// const PORT = process.env.PORT;





// import app from './app.js';  // Import the configured app instance
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// // You can also handle uncaught exceptions or unhandled promise rejections here
// process.on('uncaughtException', (err) => {
//     console.error('There was an uncaught error:', err);
//     process.exit(1);  // Mandatory (as per the Node.js docs)
// });

// process.on('unhandledRejection', (err) => {
//     console.error('Unhandled rejection:', err);
//     process.exit(1);
// });
