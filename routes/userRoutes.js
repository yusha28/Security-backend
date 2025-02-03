import express from "express";
import { 
    login, 
    register, 
    logout, 
    getUser, 
    getEmployers, 
    updateEmployerStatus, 
    unlockAccount, 
    adminUnlockAccount 
} from "../controllers/userController.js";

import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @desc Register a new user
 * @route POST /api/v1/user/register
 */
router.post("/register", register);

/**
 * @desc Login user
 * @route POST /api/v1/user/login
 */
router.post("/login", login);

/**
 * @desc Logout user (Requires authentication)
 * @route POST /api/v1/user/logout
 */
router.post("/logout", isAuthenticated, logout);

/**
 * @desc Get user profile (Requires authentication)
 * @route GET /api/v1/user/profile
 */
router.get("/profile", isAuthenticated, getUser);

/**
 * @desc Get all employers (Admin only)
 * @route GET /api/v1/user/employers
 */
router.get("/employers", isAuthenticated, getEmployers);

/**
 * @desc Update employer activation status (Admin only)
 * @route PATCH /api/v1/user/employer/:id
 */
router.patch("/employer/:id", isAuthenticated, updateEmployerStatus);

/**
 * @desc Unlock a user account (Admin only)
 * @route POST /api/v1/user/unlock/:userId
 */
router.post("/unlock/:userId", isAuthenticated, unlockAccount);

/**
 * @desc Admin unlocks user account (Admin only)
 * @route POST /api/v1/user/admin-unlock/:userId
 */
router.post("/admin-unlock/:userId", isAuthenticated, adminUnlockAccount);

export default router;
// import express from "express";
// import { login, register, logout, getUser, employer, patchEmployer } from "../controllers/userController.js";
// import {isAuthenticated}  from "../middlewares/auth.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/employer", employer);
// router.patch("/employer/:id", patchEmployer);
// router.get("/logout", isAuthenticated, logout);
// router.get("/getuser", isAuthenticated, getUser);

// export default router;

