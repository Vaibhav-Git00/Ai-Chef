import { useState } from "react";
import axios from "axios";
import API_BASE from "../config/api";

function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

const handleLogin = async () => {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });

    alert("Login successful 🔥");

    // save user in local storage
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // redirect home
    window.location.href = "/";
  } catch (err) {
    alert("Invalid login");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-xl border border-gray-700 w-[350px]">
        <h2 className="text-white text-2xl mb-6 text-center">Login</h2>

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
          onClick={handleLogin}
          className="w-full bg-green-500 py-2 rounded hover:bg-green-600"
        >
          Login
        </button>
      </div>

    </div>
  );
}

export default Login;
