const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderRef:        { type: String, unique: true },
    user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider:        { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
    category:        { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    serviceDate:     { type: Date, required: true },
    serviceAddress:  { type: String, required: true, trim: true },
    description:     { type: String, trim: true },
    estimatedHours:  { type: Number, default: 1, min: 1 },
    estimatedCost:   { type: Number, default: 0 },
    orderStatus:     {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes:               { type: String, trim: true },
    emailSent:           { type: Boolean, default: false },
    cancellationReason:  { type: String },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (this.isNew && !this.orderRef) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderRef = `ES-${year}-${rand}`;
  }
  next();
});

orderSchema.index({ user: 1 });
orderSchema.index({ provider: 1 });

module.exports = mongoose.model('Order', orderSchema);
