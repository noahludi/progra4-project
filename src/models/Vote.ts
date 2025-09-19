import { Schema, model, models, Types } from 'mongoose';

const voteSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    review: { type: Types.ObjectId, ref: 'Review', required: true, index: true },
    value: { type: Number, enum: [-1, 1], required: true },
  },
  { timestamps: true }
);

voteSchema.index({ user: 1, review: 1 }, { unique: true });

export default models.Vote || model('Vote', voteSchema);
