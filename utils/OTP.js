import speakeasy from "speakeasy";

export const generateOTP = () => {
    return speakeasy.totp({
        secret: process.env.JWT_SECRET,
        encoding: "base32",
        step: 300, // OTP expires in 5 minutes
    });
};

export const verifyOTP = (otp, secret) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: otp,
        window: 1, // Allows for slight delay in entry
    });
};
