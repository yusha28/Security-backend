import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import { Log } from "../models/logSchema.js"; // Import Log model
import ErrorHandler from "../middlewares/error.js";

/**
 * @desc Get all active job listings
 * @route GET /api/v1/jobs
 */
export const getAllJobs = catchAsyncError(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });

  res.status(200).json({
    success: true,
    jobs,
  });
});

/**
 * @desc Get all jobs posted by the logged-in employer
 * @route GET /api/v1/jobs/my-jobs
 */
export const getMyJobs = catchAsyncError(async (req, res, next) => {
  const { role, _id } = req.user;

  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seekers are not allowed to access this resource.", 400));
  }

  const myJobs = await Job.find({ postedBy: _id });

  if (!myJobs.length) {
    return next(new ErrorHandler("No jobs found under your account.", 404));
  }

  // ✅ Log job retrieval activity
  await Log.create({
    userId: _id,
    action: "Viewed My Jobs",
    details: { jobCount: myJobs.length },
  });

  res.status(200).json({
    success: true,
    myJobs,
  });
});

/**
 * @desc Post a new job listing
 * @route POST /api/v1/jobs
 */
export const postJob = catchAsyncError(async (req, res, next) => {
  console.log(req.user);
  const { role, _id } = req.user;

  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seekers are not allowed to post jobs.", 400));
  }

  const { title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo } = req.body;

  if (!title || !description || !category || !country || !city || !location) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(new ErrorHandler("Please either provide a fixed salary or a salary range.", 400));
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(new ErrorHandler("Cannot enter both fixed and ranged salary.", 400));
  }

  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    postedBy,
  });

  // ✅ Log job posting activity
  await Log.create({
    userId: _id,
    action: "Posted a Job",
    details: { jobId: job._id, title, category, location },
  });

  res.status(201).json({
    success: true,
    message: "Job Posted Successfully!",
    job,
  });
});

/**
 * @desc Update an existing job listing
 * @route PATCH /api/v1/jobs/:id
 */
export const updateJob = catchAsyncError(async (req, res, next) => {
  const { role, _id } = req.user;

  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seekers are not allowed to update jobs.", 400));
  }

  const { id } = req.params;
  let job = await Job.findById(id);

  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  const updatedFields = req.body;
  job = await Job.findByIdAndUpdate(id, updatedFields, { new: true, runValidators: true });

  // ✅ Log job update activity
  await Log.create({
    userId: _id,
    action: "Updated a Job",
    details: { jobId: id, updatedFields },
  });

  res.status(200).json({
    success: true,
    message: "Job Updated Successfully!",
    job,
  });
});

/**
 * @desc Delete a job listing
 * @route DELETE /api/v1/jobs/:id
 */
export const deleteJob = catchAsyncError(async (req, res, next) => {
  const { role, _id } = req.user;

  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seekers are not allowed to delete jobs.", 400));
  }

  const { id } = req.params;
  const job = await Job.findById(id);

  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  await job.deleteOne();

  // ✅ Log job deletion activity
  await Log.create({
    userId: _id,
    action: "Deleted a Job",
    details: { jobId: id, title: job.title },
  });

  res.status(200).json({
    success: true,
    message: "Job Deleted Successfully!",
  });
});

/**
 * @desc Get details of a single job listing
 * @route GET /api/v1/jobs/:id
 */
export const getSingleJob = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }

    // ✅ Log job view activity
    await Log.create({
      userId: req.user ? req.user._id : null, // If user is logged in, log their ID
      action: "Viewed Job",
      details: { jobId: id, title: job.title },
    });

    res.status(200).json({
      success: true,
      job,
    });

  } catch (error) {
    return next(new ErrorHandler("Invalid Job ID / CastError", 404));
  }
});
