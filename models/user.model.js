import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    avatar: {
      public_id: String,
      url: String,
    },
    role: String,
  },
  {
    timestamps: true,
    collection: "users", // 👈 IMPORTANT
  }
);

export default mongoose.model("User", userSchema);
