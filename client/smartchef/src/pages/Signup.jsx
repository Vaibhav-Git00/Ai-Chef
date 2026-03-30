import { useState } from "react";
import axios from "axios";
import API_BASE from "../config/api";

function Signup() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const handleSignup = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/auth/signup`,
        { name, email, password }
      );

      alert("Signup successful 🔥 Now login");

      // redirect to login
      window.location.href = "/login";

    } catch (err) {
      alert("Signup error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-xl border border-gray-700 w-[350px]">
        <h2 className="text-white text-2xl mb-6 text-center font-bold">
          Create Account
        </h2>

        <input
          className="w-full mb-3 p-2 rounded bg-black text-white border border-gray-600"
          placeholder="Name"
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 rounded bg-black text-white border border-gray-600"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 rounded bg-black text-white border border-gray-600"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-green-500 py-2 rounded hover:bg-green-600"
        >
          Signup
        </button>

        <p className="text-gray-400 text-sm mt-4 text-center">
          Already have account?{" "}
          <span
            className="text-green-400 cursor-pointer"
            onClick={()=>window.location.href="/login"}
          >
            Login
          </span>
        </p>
      </div>

    </div>
  );
}

export default Signup;
