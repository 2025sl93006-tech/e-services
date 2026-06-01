const ServiceProvider = require('../models/ServiceProvider');

exports.getAll = async (req, res) => {
  try {
    const { category, location, minCost, maxCost, search, availability } = req.query;
    const filter = { isActive: true };

    if (category)     filter.category = category;
    if (location)     filter.location = { $regex: location, $options: 'i' };
    if (availability) filter.availability = availability;
    if (minCost || maxCost) {
      filter.chargePerHour = {};
      if (minCost) filter.chargePerHour.$gte = parseFloat(minCost);
      if (maxCost) filter.chargePerHour.$lte = parseFloat(maxCost);
    }
    if (search) filter.$text = { $search: search };

    const providers = await ServiceProvider.find(filter)
      .populate('category', 'name imageUrl')
      .sort({ averageRating: -1, createdAt: -1 });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const providers = await ServiceProvider.find({
      category: req.params.categoryId,
      isActive: true,
    }).populate('category', 'name').sort({ averageRating: -1 });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id).populate('category');
    if (!provider) return res.status(404).json({ message: 'Service provider not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const provider = await ServiceProvider.create(req.body);
    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('category');
    if (!provider) return res.status(404).json({ message: 'Service provider not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!provider) return res.status(404).json({ message: 'Service provider not found' });
    res.json({ message: 'Service provider deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
