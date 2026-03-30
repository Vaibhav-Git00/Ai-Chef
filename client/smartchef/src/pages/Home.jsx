import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import API_BASE from "../config/api";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const res = await authService.getCurrentUser(token);
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [nutrition, setNutrition] = useState("");

  const handleUpload = async () => {
    if (!image) {
      alert("Upload image first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);

      // upload image
      const uploadRes = await axios.post(
        `${API_BASE}/image/upload`,
        formData
      );

      const imageUrl = uploadRes.data.imageUrl;

      // AI detect
      const aiRes = await axios.post(
        `${API_BASE}/smart/from-image`,
        { imageUrl }
      );

      setResult(
        `🧠 Ingredients:\n${aiRes.data.detectedIngredients}\n\n🍽 Suggested Dishes:\n${aiRes.data.suggestedDishes}`
      );

      // first dish
      const firstDish = aiRes.data.suggestedDishes.split("\n")[0];

      // nutrition call
      const nutriRes = await axios.post(
        `${API_BASE}/nutrition/get-nutrition`,
        { dish: firstDish }
      );

      setNutrition(nutriRes.data.nutrition);

      // history save with JWT token
      if (user) {
        const token = authService.getToken();
        try {
          await axios.post(
            `${API_BASE}/history/save`,
            {
              imageUrl: imageUrl,
              ingredients: aiRes.data.detectedIngredients,
              dish: firstDish,
              nutrition: nutriRes.data.nutrition,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (err) {
          console.error("Error saving history:", err);
        }
      }

    } catch (err) {
      alert("Error detecting dish");
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <Navbar user={user} />

      {/* MAIN */}
      <div className="flex flex-col items-center justify-center mt-20">

        <h2 className="text-4xl font-bold mb-3">Cook Smart with AI 👨‍🍳</h2>
        <p className="text-gray-400 mb-8">
          Upload ingredients image & get instant dishes
        </p>

        {/* Upload Card */}
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-gray-700">

          <input
            type="file"
            className="mb-4"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <br />

          <button
            onClick={handleUpload}
            className="bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600"
          >
            {loading ? "Detecting..." : "Detect Dish"}
          </button>
        </div>

        {/* DISH LIST */}
        {result && (
          <div className="mt-10 bg-white/10 p-6 rounded-xl w-[420px] border border-gray-700">
            <h2 className="text-green-400 mb-3 font-bold">🍽 Suggested Dishes</h2>

            {result.split("🍽 Suggested Dishes:")[1]
              ?.split("\n")
              .filter((d) => d.trim() !== "")
              .map((dish, index) => (
                <div
                  key={index}
                  onClick={() =>
                    navigate("/recipe", { state: { dish } })
                  }
                  className="bg-black p-3 mb-2 rounded cursor-pointer hover:bg-gray-800"
                >
                  {dish}
                </div>
              ))}
          </div>
        )}

        {/* NUTRITION */}
        {nutrition && (
          <div className="mt-6 bg-white/10 p-6 rounded-xl w-[420px] border border-green-500">
            <h2 className="text-green-400 mb-2 font-bold">🥩 Nutrition Info</h2>
            <pre className="whitespace-pre-wrap">{nutrition}</pre>
          </div>
        )}

      </div>
    </div>
  );
}

export default Home;
