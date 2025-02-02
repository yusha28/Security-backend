// import { catchAsyncError } from "./catchAsyncError.js";
// import ErrorHandler from "./error.js";
// import jwt from "jsonwebtoken"
// import { User } from "../models/userSchema.js";

// export const isAuthenticated = catchAsyncError(async(req,res,next)=>{
//     console.log("Hello")
//     const token = req.headers["authorization"].split(" ")[1];
//     console.log(req.headers)
//     if(!token){
//         return next(new ErrorHandler("User not authorized", 401));
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = await User.findById(decoded.id);

//     next();
// });


import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken"
import { User } from "../models/userSchema.js";

export const isAuthenticated = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("User not authorized", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
});