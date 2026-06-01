require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const ServiceProvider = require('./models/ServiceProvider');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kt_eservices');
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Category.deleteMany({});
  await ServiceProvider.deleteMany({});

  // --- Users ---
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedUser  = await bcrypt.hash('user123', 10);

  await User.insertMany([
    { name: 'Admin', email: 'admin@eservices.com', password: hashedAdmin, role: 'admin', phone: '9000000001', address: 'Bangalore', isActive: true },
    { name: 'Rahul Sharma', email: 'rahul@example.com', password: hashedUser, role: 'enduser', phone: '9000000002', address: 'Chennai', isActive: true },
    { name: 'Priya Nair', email: 'priya@example.com', password: hashedUser, role: 'enduser', phone: '9000000003', address: 'Hyderabad', isActive: true },
  ]);
  console.log('Users seeded');

  // --- Categories ---
  const catData = [
    { name: 'Civil', description: 'Construction, renovation and civil works', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
    { name: 'Electrical', description: 'Wiring, panel work and electrical repairs', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { name: 'Electronics', description: 'TV, AC, appliance repair and installation', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400' },
    { name: 'Carpentry', description: 'Furniture making, repair and woodwork', imageUrl: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=400' },
    { name: 'Sanitary', description: 'Plumbing, pipe fitting and sanitary work', imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400' },
    { name: 'Hardware', description: 'Lock, gate, window and hardware solutions', imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400' },
    { name: 'Software', description: 'IT support, networking and software services', imageUrl: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=400' },
    { name: 'Interior Decorators', description: 'Interior design, painting and decoration', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
  ];

  const categories = await Category.insertMany(catData);
  console.log('Categories seeded');

  const catMap = {};
  categories.forEach(c => { catMap[c.name] = c._id; });

  // --- Service Providers (2 per category) ---
  const providers = [
    // Civil
    { name: 'Rajan Civil Works', category: catMap['Civil'], description: 'Expert in residential and commercial construction', location: 'Bangalore', address: 'JP Nagar, Bangalore', phone: '9811000001', email: 'rajan@civil.com', chargePerHour: 800, minCharge: 1500, experience: 12, availability: 'available' },
    { name: 'Suresh Constructions', category: catMap['Civil'], description: 'Specializes in renovation and tiling work', location: 'Chennai', address: 'T Nagar, Chennai', phone: '9811000002', email: 'suresh@civil.com', chargePerHour: 750, minCharge: 1200, experience: 8, availability: 'available' },
    // Electrical
    { name: 'Vikram Electricals', category: catMap['Electrical'], description: 'Licensed electrician with 15 years experience', location: 'Bangalore', address: 'Koramangala, Bangalore', phone: '9811000003', email: 'vikram@elec.com', chargePerHour: 600, minCharge: 800, experience: 15, availability: 'available' },
    { name: 'PowerFix Solutions', category: catMap['Electrical'], description: 'Panel wiring, CCTV and home automation', location: 'Hyderabad', address: 'Madhapur, Hyderabad', phone: '9811000004', email: 'powerfix@elec.com', chargePerHour: 650, minCharge: 1000, experience: 10, availability: 'available' },
    // Electronics
    { name: 'CoolAir Services', category: catMap['Electronics'], description: 'AC installation, service and repair', location: 'Chennai', address: 'Anna Nagar, Chennai', phone: '9811000005', email: 'coolair@electronics.com', chargePerHour: 700, minCharge: 500, experience: 9, availability: 'available' },
    { name: 'SmartFix Electronics', category: catMap['Electronics'], description: 'TV, washing machine and home appliance repair', location: 'Bangalore', address: 'Indiranagar, Bangalore', phone: '9811000006', email: 'smartfix@electronics.com', chargePerHour: 500, minCharge: 400, experience: 7, availability: 'available' },
    // Carpentry
    { name: 'WoodCraft Furniture', category: catMap['Carpentry'], description: 'Custom furniture and modular kitchen fittings', location: 'Hyderabad', address: 'Banjara Hills, Hyderabad', phone: '9811000007', email: 'woodcraft@carp.com', chargePerHour: 900, minCharge: 1000, experience: 14, availability: 'available' },
    { name: 'Timber Touch', category: catMap['Carpentry'], description: 'Doors, windows, wardrobes and repair', location: 'Bangalore', address: 'Whitefield, Bangalore', phone: '9811000008', email: 'timbertouch@carp.com', chargePerHour: 800, minCharge: 800, experience: 11, availability: 'available' },
    // Sanitary
    { name: 'AquaFix Plumbers', category: catMap['Sanitary'], description: 'All plumbing works, leak repair and fitting', location: 'Chennai', address: 'Velachery, Chennai', phone: '9811000009', email: 'aquafix@sanitary.com', chargePerHour: 550, minCharge: 600, experience: 10, availability: 'available' },
    { name: 'PipeMaster Services', category: catMap['Sanitary'], description: 'Bathroom renovation and sanitary ware installation', location: 'Hyderabad', address: 'Kukatpally, Hyderabad', phone: '9811000010', email: 'pipemaster@sanitary.com', chargePerHour: 600, minCharge: 700, experience: 8, availability: 'available' },
    // Hardware
    { name: 'LockTech Hardware', category: catMap['Hardware'], description: 'Locks, grills, gates and security hardware', location: 'Bangalore', address: 'Rajajinagar, Bangalore', phone: '9811000011', email: 'locktech@hardware.com', chargePerHour: 500, minCharge: 500, experience: 6, availability: 'available' },
    { name: 'MetalWorks Solutions', category: catMap['Hardware'], description: 'Window fabrication, shutters and hardware fitting', location: 'Chennai', address: 'Ambattur, Chennai', phone: '9811000012', email: 'metalworks@hardware.com', chargePerHour: 550, minCharge: 600, experience: 9, availability: 'available' },
    // Software
    { name: 'TechSupport Pro', category: catMap['Software'], description: 'Computer repair, OS install and networking setup', location: 'Hyderabad', address: 'Gachibowli, Hyderabad', phone: '9811000013', email: 'techsupport@software.com', chargePerHour: 1000, minCharge: 500, experience: 7, availability: 'available' },
    { name: 'NetFix IT Services', category: catMap['Software'], description: 'WiFi setup, server installation and IT support', location: 'Bangalore', address: 'Electronic City, Bangalore', phone: '9811000014', email: 'netfix@software.com', chargePerHour: 1200, minCharge: 800, experience: 10, availability: 'available' },
    // Interior Decorators
    { name: 'DreamSpace Interiors', category: catMap['Interior Decorators'], description: 'Complete home interior design and execution', location: 'Chennai', address: 'Nungambakkam, Chennai', phone: '9811000015', email: 'dreamspace@interior.com', chargePerHour: 1500, minCharge: 5000, experience: 13, availability: 'available' },
    { name: 'ColorCraft Decors', category: catMap['Interior Decorators'], description: 'Painting, wallpaper and decorative finishes', location: 'Hyderabad', address: 'Jubilee Hills, Hyderabad', phone: '9811000016', email: 'colorcraft@interior.com', chargePerHour: 1200, minCharge: 3000, experience: 8, availability: 'available' },
  ];

  await ServiceProvider.insertMany(providers);
  console.log('Service providers seeded (16)');

  console.log('\nSeed complete!');
  console.log('Admin:  admin@eservices.com  / admin123');
  console.log('User 1: rahul@example.com   / user123');
  console.log('User 2: priya@example.com   / user123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
