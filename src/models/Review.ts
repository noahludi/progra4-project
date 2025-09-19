import { Schema, model, models, Types } from 'mongoose';

const reviewSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

export default models.Review || model('Review', reviewSchema);
