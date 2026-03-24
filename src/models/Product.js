import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      minlength: 3,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      minlength: 10,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    imageGallery: {
      type: [String],
      default: [],
      validate: {
        validator(v) {
          return !v || v.length <= 10;
        },
        message: 'imageGallery may contain at most 10 URLs',
      },
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    specs: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, averageRating: -1 });

export const Product = mongoose.model('Product', productSchema);
