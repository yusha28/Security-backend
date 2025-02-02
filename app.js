import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // to connect backend and frontend
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import userRouter from './routes/userRoutes.js'
import applicationRouter from './routes/applicationRoutes.js'
import jobRouter from './routes/jobRoutes.js'
import { connectDB } from "./database/database.js";
import { errorMiddleware } from "./middlewares/error.js";
import morgan from "morgan";


const app = express();
dotenv.config();

app.use(cors({
    origin : true,
    optionSuccessStatus:200,
    credentials : true, 
}));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp",
}));

app.use('/api/v1/user', userRouter);
app.use('/api/v1/application', applicationRouter);
app.use('/api/v1/job',jobRouter);
connectDB();


app.use(errorMiddleware);
export default app;


    
    
    
 