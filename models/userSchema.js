import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Ensure ENCRYPTION_KEY exists and is valid
if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
  throw new Error("ENCRYPTION_KEY must be at least 32 characters long!");
}

// ✅ Encrypt Data Helper Function
const encryptData = (value) => {
  if (!value) return value;
  return CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString();
};

// ✅ Decrypt Data Helper Function
const decryptData = (value) => {
  if (!value) return value;
  try {
    return CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return value; // If decryption fails, return the encrypted value.
  }
};

// ✅ Mongoose User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minLength: [3, "Name must contain at least 3 characters!"],
    maxLength: [30, "Name cannot exceed 30 characters!"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (email) {
        return validator.isEmail(email); // 🔹 Validate before encryption
      },
      message: "Please provide a valid Email!",
    },
  },
  phone: {
    type: String,
    required: [true, "Please enter your Phone Number!"],
    trim: true,
    validate: {
      validator: function (phone) {
        return /^\d{10}$/.test(phone); // 🔹 Validate before encryption
      },
      message: "Please enter a valid 10-digit phone number!",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a Password!"],
    select: false, // Ensures password is not returned in queries
  },
  role: {
    type: String,
    required: [true, "Please select a role"],
    enum: ["Job Seeker", "Employer"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
});

// ✅ Encrypt Email & Phone AFTER Validation
userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = encryptData(this.email); // Encrypt email after validation
  }
  if (this.isModified("phone")) {
    this.phone = encryptData(this.phone); // Encrypt phone after validation
  }
  next();
});

// ✅ Decrypt Email & Phone when retrieving
userSchema.set("toJSON", { getters: true });
userSchema.set("toObject", { getters: true });

// ✅ Encrypt Password Before Saving (Hashing, Not Encryption)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password.length < 8 || this.password.length > 32) {
    return next(new Error("Password must be between 8 and 32 characters!"));
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// ✅ Reset failed attempts when password is changed
userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
  }
  next();
});

// ✅ Compare user-entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Generate JWT Token for authentication
userSchema.methods.getJWTToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const User = mongoose.model("User", userSchema);
