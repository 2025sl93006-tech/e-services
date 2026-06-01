const Order = require('../models/Order');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const { sendOrderConfirmation } = require('../services/emailService');

exports.create = async (req, res) => {
  try {
    const { providerId, serviceDate, serviceAddress, description, estimatedHours } = req.body;

    const provider = await ServiceProvider.findById(providerId).populate('category');
    if (!provider || !provider.isActive)
      return res.status(404).json({ message: 'Service provider not found' });

    const hours = parseInt(estimatedHours) || 1;
    const estimatedCost = Math.max(provider.chargePerHour * hours, provider.minCharge);

    const order = await Order.create({
      user: req.user.id,
      provider: providerId,
      category: provider.category._id,
      serviceDate,
      serviceAddress,
      description,
      estimatedHours: hours,
      estimatedCost,
    });

    const populated = await Order.findById(order._id)
      .populate('provider', 'name phone email location')
      .populate('category', 'name');

    const user = await User.findById(req.user.id);
    sendOrderConfirmation(user.email, user.name, order, provider)
      .then(() => Order.findByIdAndUpdate(order._id, { emailSent: true }))
      .catch((err) => console.error('Email error:', err));

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;

    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('provider', 'name location')
      .populate('category', 'name')
      .skip(skip).limit(limit).sort({ createdAt: -1 });

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('provider', 'name phone email location imageUrl averageRating totalReviews')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('provider')
      .populate('category');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ message: 'Only pending or confirmed orders can be cancelled' });
    }
    order.orderStatus = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by user';
    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
