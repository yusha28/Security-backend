// // export const sendToken = (user, statusCode, res, message) => {
// //     const token = user.getJWTToken();

// //     const options = {
// //         expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000), 
// //         httpOnly: true,  // Prevents JavaScript access (XSS protection)
// //         secure: process.env.NODE_ENV === "production",  // Ensures HTTPS usage in production
// //         sameSite: "Lax",  // Allows secure requests while preventing CSRF attacks
// //     };

// //     res.status(statusCode)
// //         .cookie("token", token, options)
// //         .json({
// //             success: true,
// //             user: {
// //                 _id: user._id,
// //                 name: user.name,
// //                 email: user.email,
// //                 role: user.role,
// //             },
// //             message,
// //             token,
// //         });
// // };

// export const sendToken = (user, statusCode, res, message) => {
//   const token = user.getJWTToken();

//   const options = {
//       expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Strict",
//   };

//   res.status(statusCode)
//       .cookie("token", token, options)
//       .json({
//           success: true,
//           user,
//           message,
//           token,
//       });
// };
