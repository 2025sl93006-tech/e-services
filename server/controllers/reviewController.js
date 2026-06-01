const Review = require('../models/Review');
const ServiceProvider = require('../models/ServiceProvider');

exports.create = async (req, res) => {
  try {
    const { providerId, orderId, rating, comment } = req.body;

    const provider = await ServiceProvider.findById(providerId);
    if (!provider || !provider.isActive)
      return res.status(404).json({ message: 'Service provider not found' });

    const existing = await Review.findOne({ user: req.user.id, provider: providerId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this provider' });

    const review = await Review.create({
      user: req.user.id,
      provider: providerId,
      order: orderId || undefined,
      rating,
      comment,
    });

    await Review.recomputeRating(providerId);

    const populated = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByProvider = async (req, res) => {
  try {
    const reviews = await Review.find({
      provider: req.params.providerId,
      isVisible: true,
    }).populate('user', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('provider', 'name location imageUrl')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('provider', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.body.rating !== undefined) review.rating  = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();
    await Review.recomputeRating(review.provider);
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id, { isVisible: false }, { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await Review.recomputeRating(review.provider);
    res.json({ message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
