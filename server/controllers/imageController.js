const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const file = req.files.image;

    console.log("📤 Uploading image to Cloudinary:", file.name);

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "smartchef",
      resource_type: "auto"
    });

    console.log("✅ Image uploaded successfully:", result.secure_url);

    res.json({
      message: "Image uploaded 🔥",
      imageUrl: result.secure_url
    });

  } catch (error) {
    console.error("❌ IMAGE UPLOAD ERROR:");
    console.error("Message:", error.message);
    console.error("Status:", error.status);

    // Check for specific Cloudinary configuration issues
    if (error.message.includes("Must supply cloud_name")) {
      return res.status(500).json({
        error: "Cloudinary is not configured",
        details: "CLOUD_NAME environment variable is missing"
      });
    }

    if (error.message.includes("Invalid authentication")) {
      return res.status(500).json({
        error: "Cloudinary authentication failed",
        details: "Check your Cloudinary credentials (API_KEY or API_SECRET)"
      });
    }

    res.status(500).json({
      error: "Failed to upload image",
      details: error.message
    });
  }
};
