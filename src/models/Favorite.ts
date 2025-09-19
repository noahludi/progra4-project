import { Schema, model, models, Types } from 'mongoose';

const favoriteSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, bookId: 1 }, { unique: true });

export default models.Favorite || model('Favorite', favoriteSchema);
