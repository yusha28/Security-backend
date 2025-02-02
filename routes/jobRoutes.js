import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  getAllJobs,
  postJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getSingleJob
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getAllJobs);
router.post("/", isAuthenticated, postJob);
router.get("/my-jobs", isAuthenticated, getMyJobs);
router.patch("/:id", isAuthenticated, updateJob);
router.delete("/:id", isAuthenticated, deleteJob);
router.get("/:id", getSingleJob);
router.post("/post", isAuthenticated, postJob);

export default router;

// import express from 'express';
// import { isAuthenticated } from '../middlewares/auth.js'; // Adjust the path based on your directory structure
// import { postJob, getMyJobs, updateJob, deleteJob } from '../controllers/jobController.js';

// const router = express.Router();

// // Protected route: Only authenticated users can post a job
// router.post('/job/post', isAuthenticated, postJob);

// // Protected route: Only authenticated users can get their jobs
// router.get('/job/getmyjobs', isAuthenticated, getMyJobs);

// // Protected route: Only authenticated users can update their jobs
// router.put('/job/update/:id', isAuthenticated, updateJob);

// // Protected route: Only authenticated users can delete their jobs
// router.delete('/job/delete/:id', isAuthenticated, deleteJob);

// // Export the router so it can be used in your main app
// export default router;

// const express = require('express');
// const router = express.Router();
// const { isAuthenticated } = require('../middlewares/auth'); 
// const { postJob } = require('../controllers/jobController'); 

// const checkEmployerRole = (req, res, next) => {
//     if (req.user.role !== 'Employer') {
//         return res.status(403).json({ message: 'Access denied. Employers only.' });
//     }
//     next();
// };

// router.post('/job/post', isAuthenticated, checkEmployerRole, postJob);

// module.exports = router;
