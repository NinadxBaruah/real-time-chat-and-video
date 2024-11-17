const cloudinary = require("../utils/cloudinary");
const getRandomString = require("../utils/getRandomString");
const mime = require("mime-types");
const fs = require("fs");
const path = require("path");
const { pipeline } = require('stream/promises');

const handleSendImage = async (req, res) => {
  let tempFilePath = null;
  
  
  try {
    if (!req.files?.image) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const imageFile = req.files.image;

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, "..", "uploads", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate temp file path with correct extension
    const fileExtension = mime.extension(imageFile.mimetype);
    tempFilePath = path.join(
      tempDir,
      `image_${Date.now()}-${getRandomString(5)}.${fileExtension}`
    );

    // Move the file using express-fileupload's built-in method
    await imageFile.mv(tempFilePath);

    // Upload to Cloudinary using streams
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Create read stream and pipe to Cloudinary
      fs.createReadStream(tempFilePath)
        .pipe(uploadStream)
        .on('error', reject);
    });

    // Send response
    res.json({ url: result.secure_url });

  } catch (error) {
    console.log("error from file upload controller: ", error);
    res.status(500).json({ error: "Failed to upload image" });
  } finally {
    // Clean up: Delete temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};

module.exports = handleSendImage;