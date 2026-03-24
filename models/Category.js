import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      minlength: 1,
      unique: true,
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

export const Category = mongoose.model('Category', categorySchema);
