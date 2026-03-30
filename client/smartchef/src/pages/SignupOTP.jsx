import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function SignupOTP() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: basic, 2: preferences
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Basic Info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Preferences
  const [dietType, setDietType] = useState("omnivore");
  const [cuisinePreference, setCuisinePreference] = useState("");
  const [spiceLevel, setSpiceLevel] = useState("medium");
  const [allergies, setAllergies] = useState("");

  const handleBasicSignup = async () => {
    try {
      if (!name || !phone) {
        setError("Please fill in all required fields");
        return;
      }

      setError("");
      setStep(2);
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const handleCompleteSignup = async () => {
    try {
      setLoading(true);
      setError("");

      const allergiesList = allergies
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);

      const res = await authService.signup(
        name,
        phone,
        email || null,
        password || null,
        {
          dietType,
          cuisinePreference,
          spiceLevel,
          allergies: allergiesList,
          healthGoal: ""
        }
      );

      // Store token and user
      authService.setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Signup successful! Welcome to SmartChef AI 🎉");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black py-10">
      <div className="w-[420px]">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl border border-gray-700 shadow-2xl">
          <h2 className="text-white text-3xl mb-2 text-center font-bold">
            🍳 Join SmartChef AI
          </h2>
          <p className="text-gray-400 text-center text-sm mb-8">
            Step {step} of 2
          </p>

          {/* Step 1: Basic Info */}
          {step === 1 ? (
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Name *</label>
              <input
                className="w-full mb-4 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label className="text-gray-300 text-sm mb-2 block">
                Phone Number *
              </label>
              <input
                type="tel"
                className="w-full mb-4 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <label className="text-gray-300 text-sm mb-2 block">
                Email (Optional)
              </label>
              <input
                type="email"
                className="w-full mb-4 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="text-gray-300 text-sm mb-2 block">
                Password (Optional)
              </label>
              <input
                type="password"
                className="w-full mb-6 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <button
                onClick={handleBasicSignup}
                className="w-full bg-green-500 py-3 rounded-lg hover:bg-green-600 text-white font-semibold transition"
              >
                Next: Preferences
              </button>

              <p className="text-gray-400 text-sm mt-5 text-center">
                Already have an account?{" "}
                <span
                  className="text-green-400 cursor-pointer hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </p>
            </div>
          ) : (
            // Step 2: Preferences
            <div>
              <label className="text-gray-300 text-sm mb-2 block">
                Diet Type
              </label>
              <select
                className="w-full mb-4 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
              >
                <option value="omnivore">Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
              </select>

              <label className="text-gray-300 text-sm mb-2 block">
                Favorite Cuisine
              </label>
              <input
                className="w-full mb-4 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                placeholder="Indian, Italian, Asian..."
                value={cuisinePreference}
                onChange={(e) => setCuisinePreference(e.target.value)}
              />

              <label className="text-gray-300 text-sm mb-2 block">
                Spice Level
              </label>
              <select
                className="w-full mb-4 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value)}
              >
                <option value="mild">Mild</option>
                <option value="medium">Medium</option>
                <option value="spicy">Spicy</option>
                <option value="very-spicy">Very Spicy</option>
              </select>

              <label className="text-gray-300 text-sm mb-2 block">
                Allergies (Comma-separated)
              </label>
              <input
                className="w-full mb-6 p-3 rounded bg-black text-white border border-gray-600 focus:border-green-500 outline-none transition"
                placeholder="e.g., Nuts, Shellfish, Dairy"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <button
                onClick={handleCompleteSignup}
                disabled={loading}
                className="w-full bg-green-500 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold transition mb-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full bg-gray-700 py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-700 text-white font-semibold transition"
              >
                Back
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-sm mt-6 text-center">
          By signing up, you agree to our Terms & Conditions
        </p>
      </div>
    </div>
  );
}

export default SignupOTP;
