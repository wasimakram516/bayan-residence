import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video", "pdf"],
      required: true,
    },
    fileName: { type: String, required: true },

    // AWS
    s3Key: { type: String, required: true },
    fileUrl: { type: String, required: true },

    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const kioskConfigSchema = new mongoose.Schema(
  {
    media: [mediaSchema],
    location: { type: String, default: "" },
    signupLink: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.KioskConfig ||
  mongoose.model("KioskConfig", kioskConfigSchema);
