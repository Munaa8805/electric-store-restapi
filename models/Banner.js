import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      minlength: 3,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
      minlength: 2,
    },
    image: {
      type: String,
      trim: true,

    },
    cta: {
      type: String,
      trim: true,
      maxlength: 100,
      minlength: 1,
    },
    link: {
      type: String,
      trim: true,
      maxlength: 200,
      minlength: 1,
    },
    color: {
      type: String,
      trim: true,
      maxlength: 100,
      minlength: 1,
    },
  },
  { timestamps: true },
);

export const Banner = mongoose.model("Banner", bannerSchema);
