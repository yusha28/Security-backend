import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";

/**
 * @desc Register a new user
 * @route POST /api/v1/user/register
 */
export const register = catchAsyncError(async (req, res, next) => {
    console.log("Register route is hit");

    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
        return next(new ErrorHandler("Please fill in all required fields!", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("Email already registered!", 400));
    }

    const is_active = role === "Employer" ? false : true;

    const user = await User.create({
        name,
        email,
        password,
        phone,
        role,
        is_active,
    });

    sendToken(user, 201, res, "User Registered!");
});

/**
 * @desc User Login with Account Lockout Prevention
 * @route POST /api/v1/user/login
 */
export const login = catchAsyncError(async (req, res, next) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return next(new ErrorHandler("Please provide email, password, and role.", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password.", 401));
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        return next(new ErrorHandler("Account locked due to multiple failed attempts. Try again later.", 403));
    }

    // Verify password
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
        }

        await user.save();
        return next(new ErrorHandler("Invalid Email or Password.", 401));
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    sendToken(user, 200, res, "User Logged In!");
});

/**
 * @desc Logout User
 * @route POST /api/v1/user/logout
 */
export const logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        expires: new Date(0),
    });

    res.status(200).json({
        success: true,
        message: "Logged Out Successfully.",
    });
});

/**
 * @desc Unlock User Account (Admin Feature)
 * @route POST /api/v1/user/unlock/:userId
 */
export const unlockAccount = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Account has been unlocked successfully.",
    });
});

/**
 * @desc Get User Profile
 * @route GET /api/v1/user/profile
 */
export const getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

/**
 * @desc Get All Employers (Admin Only)
 * @route GET /api/v1/user/employers
 */
export const getEmployers = catchAsyncError(async (req, res, next) => {
    if (req.user.role !== "Admin") {
        return next(new ErrorHandler("Unauthorized access.", 403));
    }

    const employers = await User.find({ role: "Employer" });

    res.status(200).json({
        success: true,
        employers,
    });
});

/**
 * @desc Update Employer Activation Status (Admin Only)
 * @route PATCH /api/v1/user/employer/:id
 */
export const updateEmployerStatus = catchAsyncError(async (req, res, next) => {
    if (req.user.role !== "Admin") {
        return next(new ErrorHandler("Unauthorized access.", 403));
    }

    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "Invalid status value. It must be a boolean.",
        });
    }

    const updatedEmployer = await User.findByIdAndUpdate(
        id,
        { is_active },
        { new: true }
    );

    if (!updatedEmployer) {
        return res.status(404).json({
            success: false,
            message: "Employer not found.",
        });
    }

    res.status(200).json({
        success: true,
        user: updatedEmployer,
    });
});

/**
 * @desc Admin Unlock User
 * @route POST /api/v1/user/admin-unlock/:userId
 */
export const adminUnlockAccount = catchAsyncError(async (req, res, next) => {
    if (req.user.role !== "Admin") {
        return next(new ErrorHandler("Unauthorized access.", 403));
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: "User account has been unlocked by admin.",
    });
});

// import { catchAsyncError} from "../middlewares/catchAsyncError.js";
// import { User } from "../models/userSchema.js";
// import ErrorHandler from "../middlewares/error.js";
// import {sendToken} from "../utlis/jwtToken.js";



// /**
//  * @desc Register a new user
//  * @route POST /api/v1/user/register
//  */
// export const register = catchAsyncError(async (req, res, next) => {
//     console.log("Register route is hit");

//     const { name, email, phone, password, role } = req.body;

//     if (!name || !email || !password || !phone || !role) {
//         return next(new ErrorHandler("Please fill in all required fields!", 400));
//     }

//     // Check if email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//         return next(new ErrorHandler("Email already registered!", 400));
//     }

//     // Set activation status based on role
//     const is_active = role === "Employer" ? false : true;

//     const user = await User.create({
//         name,
//         email,
//         password,
//         phone,
//         role,
//         is_active,
//     });

//     sendToken(user, 201, res, "User Registered!");
// });

// /**
//  * @desc User Login with account lockout prevention
//  * @route POST /api/v1/user/login
//  */
// export const login = catchAsyncError(async (req, res, next) => {
//     const { email, password, role } = req.body;

//     if (!email || !password || !role) {
//         return next(new ErrorHandler("Please provide email, password, and role.", 400));
//     }

//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//         return next(new ErrorHandler("Invalid Email or Password.", 401));
//     }

//     // Check if account is locked
//     if (user.lockUntil && user.lockUntil > Date.now()) {
//         return next(new ErrorHandler("Account locked due to multiple failed attempts. Try again later.", 403));
//     }

//     // Verify password
//     const isPasswordMatched = await user.comparePassword(password);

//     if (!isPasswordMatched) {
//         user.failedLoginAttempts += 1;

//         // Lock the account after 5 failed attempts for 30 minutes
//         if (user.failedLoginAttempts >= 5) {
//             user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
//         }

//         await user.save();
//         return next(new ErrorHandler("Invalid Email or Password.", 401));
//     }

//     // Reset failed attempts on successful login
//     user.failedLoginAttempts = 0;
//     user.lockUntil = null;
//     await user.save();

//     sendToken(user, 200, res, "User Logged In!");
// });

// /**
//  * @desc Logout User
//  * @route POST /api/v1/user/logout
//  */
// export const logout = catchAsyncError(async (req, res, next) => {
//     res.cookie("token", "", {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "Strict",
//         expires: new Date(0),
//     });

//     res.status(200).json({
//         success: true,
//         message: "Logged Out Successfully.",
//     });
// });

// /**
//  * @desc Get Logged-in User Profile
//  * @route GET /api/v1/user/profile
//  */
// export const getUser = catchAsyncError((req, res, next) => {
//     res.status(200).json({
//         success: true,
//         user: req.user,
//     });
// });

// /**
//  * @desc Get All Employers
//  * @route GET /api/v1/user/employers
//  */
// export const getEmployers = catchAsyncError(async (req, res, next) => {
//     const employers = await User.find({ role: "Employer" });
//     res.status(200).json({
//         success: true,
//         employers,
//     });
// });

// /**
//  * @desc Update Employer Activation Status
//  * @route PATCH /api/v1/user/employer/:id
//  */
// export const updateEmployerStatus = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     const { is_active } = req.body;

//     if (typeof is_active !== "boolean") {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid status value. It must be a boolean.",
//         });
//     }

//     const updatedEmployer = await User.findByIdAndUpdate(
//         id,
//         { is_active },
//         { new: true }
//     );

//     if (!updatedEmployer) {
//         return res.status(404).json({
//             success: false,
//             message: "Employer not found.",
//         });
//     }

//     res.status(200).json({
//         success: true,
//         user: updatedEmployer,
//     });
// });

// /**
//  * @desc Unlock User Account (Admin Feature)
//  * @route POST /api/v1/user/unlock/:userId
//  */
// export const unlockAccount = catchAsyncError(async (req, res, next) => {
//     const { userId } = req.params;

//     const user = await User.findById(userId);
//     if (!user) {
//         return next(new ErrorHandler("User not found.", 404));
//     }

//     user.failedLoginAttempts = 0;
//     user.lockUntil = null;
//     await user.save();

//     res.status(200).json({
//         success: true,
//         message: "Account has been unlocked successfully.",
//     });
// });




// import { catchAsyncError } from "../middlewares/catchAsyncError.js";
// import { User } from "../models/userSchema.js";
// import ErrorHandler from "../middlewares/error.js";
// import { sendToken } from "../utils/jwtToken.js";

// export const login = catchAsyncError(async (req, res, next) => {
//   const { email, password, role } = req.body;

//   // Validate user input
//   if (!email || !password || !role) {
//     return next(new ErrorHandler('Please provide email, password, and role.', 400));
//   }

//   // Find user
//   const user = await User.findOne({ email }).select('+password');
//   if (!user) {
//     return next(new ErrorHandler('Invalid Email or Password.', 401));
//   }

//   // Check password match
//   const isPasswordMatched = await user.comparePassword(password);
//   if (!isPasswordMatched) {
//     return next(new ErrorHandler('Invalid Email or Password.', 401));
//   }

//   // Ensure role matches
//   if (user.role !== role) {
//     return next(new ErrorHandler(`User with role ${role} not found.`, 404));
//   }

  
//   sendToken(user, 200, res, 'Logged in successfully');
// });


// export const sendToken = (user, statusCode, res, message) => {
//   const token = user.getJWTToken();  // Generate token
//   const options = {
//     expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
//     httpOnly: true,
//   };

//   res.status(statusCode).cookie('token', token, options).json({
//     success: true,
//     user,
//     message,
//     token,  
//   });
// };
