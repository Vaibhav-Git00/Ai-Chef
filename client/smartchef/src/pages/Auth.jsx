import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Phone, User, Loader } from "lucide-react";
import OTPInput from "../components/OTPInput";
import authService from "../services/authService";

export default function AuthPage() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState("form"); // form (login or signup), otp
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);
    
    // Form data
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Check if user is already logged in
    useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate("/dashboard");
        }
    }, [navigate]);

    // Countdown timer for OTP resend
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // For signup, send name and email along with phone
            if (!isLogin) {
                // Create user during send OTP for signup
                const payload = {
                    name,
                    phone: phoneNumber,
                    email: email || undefined
                };
                await authService.sendOTP(phoneNumber, payload);
            } else {
                // For login, just send phone
                await authService.sendOTP(phoneNumber);
            }
            setStep("otp");
            setCountdown(30);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTPLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await authService.loginWithOTP(phoneNumber, otp);
            authService.setToken(response.data.token, response.data.user);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTPSignup = async () => {
        setError("");
        setLoading(true);

        try {
            // Complete signup after OTP verification
            const response = await authService.signup({
                name,
                phone: phoneNumber,
                email: email || undefined,
                password: password || undefined,
                otp // Include OTP for verification
            });
            authService.setToken(response.data.token, response.data.user);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setStep("form");
        setPhoneNumber("");
        setOtp("");
        setName("");
        setEmail("");
        setPassword("");
        setError("");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large animated orbs */}
                {[...Array(5)].map((_, i) => {
                    const colors = [
                        'from-purple-600 to-blue-600',
                        'from-blue-600 to-cyan-600',
                        'from-pink-600 to-purple-600',
                        'from-orange-600 to-red-600',
                        'from-green-600 to-cyan-600'
                    ];
                    return (
                        <motion.div
                            key={i}
                            className={`absolute rounded-full bg-gradient-to-br ${colors[i % colors.length]} blur-3xl opacity-20`}
                            style={{
                                width: Math.random() * 600 + 300,
                                height: Math.random() * 600 + 300,
                                top: Math.random() * 100 + "%",
                                left: Math.random() * 100 + "%"
                            }}
                            animate={{
                                y: [0, Math.random() * 100 - 50],
                                x: [0, Math.random() * 100 - 50],
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 20 + i * 7,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    );
                })}
                
                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        style={{
                            top: Math.random() * 100 + "%",
                            left: Math.random() * 100 + "%"
                        }}
                        animate={{
                            y: [0, -100 - Math.random() * 100],
                            opacity: [0.3, 0],
                            x: Math.random() * 50 - 25
                        }}
                        transition={{
                            duration: 8 + Math.random() * 12,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                ))}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/80"></div>
            </div>

            {/* Main Container */}
            <motion.div
                className="relative z-10 w-full max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <motion.h1 
                        className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                        animate={{
                            backgroundPosition: ['0% center', '100% center', '0% center']
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            backgroundSize: '200% 200%'
                        }}
                    >
                        SmartChef
                    </motion.h1>
                    <motion.p 
                        className="text-purple-200 text-lg font-medium"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        Premium AI Meal Planning
                    </motion.p>
                </motion.div>

                {/* Card */}
                <motion.div
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {/* Toggle Buttons */}
                    <motion.div variants={itemVariants} className="flex gap-2 mb-8 bg-white/5 p-1 rounded-full border border-white/10">
                        <motion.button
                            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                                isLogin
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                    : "text-white/60 hover:text-white"
                            }`}
                            onClick={() => !loading && toggleMode()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Login
                        </motion.button>
                        <motion.button
                            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                                !isLogin
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                    : "text-white/60 hover:text-white"
                            }`}
                            onClick={() => !loading && toggleMode()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Signup
                        </motion.button>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {/* Login/Signup Form Step */}
                        {step === "form" && (
                            <motion.form
                                key="form"
                                onSubmit={handleSendOTP}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {/* Signup: Full Name Field */}
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                                disabled={loading}
                                                className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Phone Number Field */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: !isLogin ? 0.2 : 0.1 }}
                                >
                                    <label className="block text-sm font-medium text-white/80 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" />
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            disabled={loading}
                                            className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                {/* Signup: Email Field */}
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="block text-sm font-medium text-white/80 mb-2">Email (Optional)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="john@example.com"
                                                disabled={loading}
                                                className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Signup: Password Field (Optional) */}
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <label className="block text-sm font-medium text-white/80 mb-2">Password (Optional)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                disabled={loading}
                                                className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-3.5 text-purple-400 hover:text-purple-300"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={loading || !phoneNumber || (!isLogin && !name)}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : "Send OTP"}
                                </motion.button>

                                {!isLogin && (
                                    <p className="text-center text-white/60 text-sm">
                                        {name ? `Hi ${name}! We'll send a verification code to ${phoneNumber}` : "Enter your details to continue"}
                                    </p>
                                )}
                            </motion.form>
                        )}

                        {/* OTP Step */}
                        {step === "otp" && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-4">Enter OTP</label>
                                    <OTPInput
                                        value={otp}
                                        onChange={setOtp}
                                        isLoading={loading}
                                    />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    onClick={() => isLogin ? handleVerifyOTPLogin() : handleVerifyOTPSignup()}
                                    disabled={loading || otp.length !== 6}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : "Verify OTP"}
                                </motion.button>

                                <div className="text-center">
                                    {countdown > 0 ? (
                                        <p className="text-white/60 text-sm">Resend OTP in {countdown}s</p>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setOtp("");
                                                setStep("form");
                                            }}
                                            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                                        >
                                            Change Phone Number
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}


                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <motion.p variants={itemVariants} className="text-center text-white/50 text-sm mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={toggleMode} className="text-purple-400 hover:text-purple-300 font-semibold">
                        {isLogin ? "Sign up" : "Log in"}
                    </button>
                </motion.p>
            </motion.div>
        </div>
    );
}
