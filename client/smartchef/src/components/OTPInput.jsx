import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function OTPInput({ value, onChange, onComplete, isLoading }) {
    const [otp, setOtp] = useState(Array(6).fill(""));
    const inputRefs = useRef([]);
    const [focusedIndex, setFocusedIndex] = useState(0);

    useEffect(() => {
        setOtp(value ? value.split("").slice(0, 6).concat(Array(6).fill("")).slice(0, 6) : Array(6).fill(""));
    }, [value]);

    const handleChange = (index, e) => {
        const val = e.target.value;
        if (!/^[0-9]*$/.test(val)) return;

        const newOtp = [...otp];
        newOtp[index] = val.slice(-1);
        setOtp(newOtp);
        onChange(newOtp.join(""));

        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
            setFocusedIndex(index + 1);
        }

        // Check if complete
        if (newOtp.join("").length === 6) {
            onComplete?.(newOtp.join(""));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index]) {
            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                setFocusedIndex(index - 1);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
            setFocusedIndex(index - 1);
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
            setFocusedIndex(index + 1);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        const pastedOtp = pastedData.replace(/\D/g, "").slice(0, 6);

        if (pastedOtp.length === 6) {
            const newOtp = pastedOtp.split("");
            setOtp(newOtp);
            onChange(newOtp.join(""));
            onComplete?.(newOtp.join(""));
            inputRefs.current[5]?.blur();
        }
    };

    return (
        <div className="w-full">
            <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <input
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onFocus={() => setFocusedIndex(index)}
                            disabled={isLoading}
                            className={`w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200 ${
                                focusedIndex === index && !isLoading
                                    ? "border-blue-500 shadow-lg shadow-blue-500/50 bg-white"
                                    : digit
                                    ? "border-green-400 bg-green-50"
                                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                            } ${
                                isLoading ? "opacity-60 cursor-not-allowed" : "cursor-text"
                            }`}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
