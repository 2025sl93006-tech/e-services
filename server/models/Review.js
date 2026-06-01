const mongoose = require('mongoose');
const ServiceProvider = require('./ServiceProvider');

const reviewSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider:  { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
    order:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, trim: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, provider: 1 }, { unique: true });

reviewSchema.statics.recomputeRating = async function (providerId) {
  const result = await this.aggregate([
    { $match: { provider: new mongoose.Types.ObjectId(providerId), isVisible: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg   = result[0]?.avg   || 0;
  const count = result[0]?.count || 0;
  await ServiceProvider.findByIdAndUpdate(providerId, {
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: count,
  });
};

module.exports = mongoose.model('Review', reviewSchema);
