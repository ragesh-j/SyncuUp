const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [2000, "Content cannot exceed 2000 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [100, "Author cannot exceed 100 characters"],
    },
    category: {
      type: String,
      enum: ["mindset", "technique", "nutrition", "recovery", "strategy", "general"],
      default: "general",
    },
    tags: [{ type: String, trim: true }],
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for common query patterns
feedSchema.index({ createdAt: -1 });
feedSchema.index({ category: 1 });
feedSchema.index({ pinned: -1, createdAt: -1 });

module.exports = mongoose.model("Feed", feedSchema);