import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOTP = async () => {
    try {
      if (!phone) {
        setError("Please enter phone number");
        return;
      }

      setLoading(true);
      setError("");
      
      await authService.sendOTP(phone);
      
      setMessage("OTP sent successfully! Check your phone.");
      setStep(2);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!otp) {
        setError("Please enter OTP");
        return;
      }

      setLoading(true);
      setError("");

      const res = await authService.loginWithOTP(phone, otp);
      
      // Store token and user
      authService.setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login successful! 🎉");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError("");
      
      await authService.sendOTP(phone);
      
      setMessage("OTP resent successfully!");
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-[400px]">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl border border-gray-700 shadow-2xl">
          <h2 className="text-white text-3xl mb-8 text-center font-bold">
            🍳 SmartChef Login
          </h2>

          {/* Step 1: Phone Number */}
          {step === 1 ? (
            <div>
              <label className="text-gray-300 text-sm mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full mb-3 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
              
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              {message && <p className="text-green-400 text-sm mb-3">{message}</p>}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-green-500 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold transition"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <p className="text-gray-400 text-sm mt-5 text-center">
                Don't have an account?{" "}
                <span
                  className="text-green-400 cursor-pointer hover:underline"
                  onClick={() => navigate("/signup")}
                >
                  Signup
                </span>
              </p>
            </div>
          ) : (
            // Step 2: OTP Verification
            <div>
              <label className="text-gray-300 text-sm mb-2">Enter OTP</label>
              <input
                type="text"
                className="w-full mb-3 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                maxLength="6"
                disabled={loading}
              />

              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              {message && <p className="text-green-400 text-sm mb-3">{message}</p>}

              <p className="text-gray-400 text-sm mb-4">
                Sent to: <span className="text-green-400">{phone}</span>
              </p>

              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-green-500 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold transition mb-2"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setMessage("");
                }}
                disabled={loading}
                className="w-full bg-gray-700 py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-700 text-white font-semibold transition mb-3"
              >
                Change Phone
              </button>

              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full text-green-400 hover:text-green-300 text-sm font-semibold transition"
              >
                Didn't receive OTP? Resend
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-sm mt-6 text-center">
          By logging in, you agree to our Terms & Conditions
        </p>
      </div>
    </div>
  );
}

export default Login;
