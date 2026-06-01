const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    category:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description:   { type: String, trim: true },
    location:      { type: String, required: true, trim: true },
    address:       { type: String, trim: true },
    phone:         { type: String, trim: true },
    email:         { type: String, lowercase: true, trim: true },
    imageUrl:      { type: String, trim: true },
    chargePerHour: { type: Number, required: true, min: 0 },
    minCharge:     { type: Number, default: 0, min: 0 },
    experience:    { type: Number, default: 0, min: 0 },
    availability:  { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
    isActive:      { type: Boolean, default: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceProviderSchema.index({ category: 1 });
serviceProviderSchema.index({ location: 1 });
serviceProviderSchema.index({ name: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
