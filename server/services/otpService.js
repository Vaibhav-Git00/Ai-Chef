const OTP = require("../models/OTP");
const { generateOTP, sanitizePhone } = require("../utils/validators");

// Using Twilio for SMS OTP
const twilio = process.env.TWILIO_ACCOUNT_SID ? require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
) : null;

/**
 * Send OTP to phone number using Twilio Verify Service
 */
exports.sendOTP = async (phone) => {
    try {
        const cleanPhone = sanitizePhone(phone);
        
        // Ensure phone has country code
        const phoneWithCode = cleanPhone.startsWith("+") 
            ? cleanPhone 
            : (cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone}`);

        // If Twilio Verify Service is configured, use it
        if (twilio && process.env.TWILIO_VERIFY_SERVICE_SID) {
            try {
                const verification = await twilio.verify.v2
                    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verifications
                    .create({
                        to: phoneWithCode,
                        channel: "sms"
                    });
                
                console.log(`✅ TWILIO LIVE! SMS OTP sent to ${phoneWithCode}`);
                return {
                    success: true,
                    message: "OTP sent to your phone via SMS",
                    phone: cleanPhone,
                    verificationSid: verification.sid
                };
            } catch (twilioError) {
                console.error("❌ Twilio Verify Error:", twilioError.message);
                throw twilioError;
            }
        } else {
            // Fallback: generate and save OTP locally (for development/testing)
            const otp = generateOTP();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await OTP.findOneAndUpdate(
                { phone: cleanPhone },
                {
                    phone: cleanPhone,
                    otp: otp,
                    expiresAt: expiresAt,
                    attempts: 0,
                    isVerified: false
                },
                { upsert: true, new: true, returnDocument: "after" }
            );

            console.log(`[DEV MODE - No Twilio] OTP for ${cleanPhone}: ${otp}`);
            return {
                success: true,
                message: "OTP sent successfully (Development Mode)",
                phone: cleanPhone
            };
        }
    } catch (error) {
        console.error("OTP Send Error:", error);
        throw new Error(error.message || "Failed to send OTP");
    }
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (phone, otp) => {
    try {
        const cleanPhone = sanitizePhone(phone);
        
        // Ensure phone has country code
        const phoneWithCode = cleanPhone.startsWith("+") 
            ? cleanPhone 
            : (cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone}`);

        // If Twilio Verify Service is configured, verify via Twilio
        if (twilio && process.env.TWILIO_VERIFY_SERVICE_SID) {
            try {
                const verificationCheck = await twilio.verify.v2
                    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verificationChecks
                    .create({
                        to: phoneWithCode,
                        code: otp
                    });

                if (verificationCheck.status === "approved") {
                    console.log(`✅ TWILIO VERIFIED! OTP correct for ${phoneWithCode}`);
                    
                    // Save verification in our DB for reference
                    await OTP.findOneAndUpdate(
                        { phone: cleanPhone },
                        {
                            isVerified: true,
                            verifiedAt: new Date()
                        },
                        { upsert: true, new: true, returnDocument: "after" }
                    );

                    return {
                        success: true,
                        message: "OTP verified successfully",
                        phone: cleanPhone
                    };
                } else {
                    throw new Error("Invalid OTP");
                }
            } catch (twilioError) {
                console.error("❌ Twilio Verify Failed:", twilioError.message);
                throw new Error(twilioError.message || "OTP verification failed");
            }
        } else {
            // Fallback: verify local OTP (for development)
            const otpRecord = await OTP.findOne({ phone: cleanPhone });

            if (!otpRecord) {
                throw new Error("OTP not found. Please request a new OTP.");
            }

            // Check if OTP is expired
            if (new Date() > otpRecord.expiresAt) {
                await OTP.deleteOne({ phone: cleanPhone });
                throw new Error("OTP expired. Please request a new OTP.");
            }

            // Check attempts
            if (otpRecord.attempts >= otpRecord.maxAttempts) {
                throw new Error("Maximum attempts exceeded. Please request a new OTP.");
            }

            // Verify OTP
            if (otpRecord.otp !== otp) {
                otpRecord.attempts += 1;
                await otpRecord.save();
                const remaining = otpRecord.maxAttempts - otpRecord.attempts;
                throw new Error(`Invalid OTP. ${remaining} attempts remaining.`);
            }

            // Mark as verified
            otpRecord.isVerified = true;
            await otpRecord.save();

            console.log(`✅ OTP VERIFIED for ${cleanPhone}`);

            return {
                success: true,
                message: "OTP verified successfully",
                phone: cleanPhone
            };
        }
    } catch (error) {
        throw new Error(error.message || "OTP verification failed");
    }
};

/**
 * Check if phone is OTP verified
 */
exports.isOTPVerified = async (phone) => {
    try {
        const cleanPhone = sanitizePhone(phone);
        const otpRecord = await OTP.findOne({ phone: cleanPhone });
        return otpRecord && otpRecord.isVerified;
    } catch (error) {
        return false;
    }
};

/**
 * Clean up verified OTP
 */
exports.cleanupOTP = async (phone) => {
    try {
        const cleanPhone = sanitizePhone(phone);
        await OTP.deleteOne({ phone: cleanPhone });
    } catch (error) {
        console.error("OTP Cleanup Error:", error);
    }
};
