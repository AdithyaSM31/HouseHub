/**
 * MongoDB Seed Script
 * Seeds database with sample users and properties
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Property } = require('../models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🔧 Seeding MongoDB database...\n');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const password_hash = await bcrypt.hash('password123', 10);

    const users = await User.create([
      {
        email: 'john@example.com',
        password_hash,
        display_name: 'John Doe',
        phone_number: '+91 98765 43210'
      },
      {
        email: 'jane@example.com',
        password_hash,
        display_name: 'Jane Smith',
        phone_number: '+91 98765 43211'
      },
      {
        email: 'amit@example.com',
        password_hash,
        display_name: 'Amit Kumar',
        phone_number: '+91 98765 43212'
      }
    ]);

    console.log(`   ✓ ${users.length} users created`);

    // Create properties
    console.log('🏠 Creating properties...');

    const properties = [
      {
        user_id: users[0]._id,
        title: 'Spacious 2BHK Apartment in Koramangala',
        description: 'Beautiful 2BHK apartment with modern amenities in the heart of Koramangala. Close to shops, restaurants, and metro station.',
        property_type: 'apartment',
        listing_type: 'rent',
        price: 25000,
        address: '123 Main Street, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        bedrooms: 2,
        bathrooms: 2,
        area_sqft: 1200,
        furnishing_status: 'semi-furnished',
        amenities: JSON.stringify(['Parking', 'WiFi', 'Power Backup', 'Security']),
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
        ],
        is_featured: true
      },
      {
        user_id: users[0]._id,
        title: 'Luxury 3BHK Villa with Garden',
        description: 'Stunning 3BHK villa with private garden, perfect for families.',
        property_type: 'villa',
        listing_type: 'rent',
        price: 75000,
        address: '456 Garden Road, Whitefield',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        bedrooms: 3,
        bathrooms: 3,
        area_sqft: 2500,
        furnishing_status: 'furnished',
        amenities: JSON.stringify(['Parking', 'WiFi', 'Swimming Pool', 'Gym', 'Garden']),
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'
        ],
        is_featured: true
      },
      {
        user_id: users[1]._id,
        title: 'Affordable PG for Working Women',
        description: 'Safe and comfortable PG accommodation for working women with all meals included.',
        property_type: 'pg',
        listing_type: 'pg',
        price: 8000,
        address: '789 Church Street, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: 150,
        furnishing_status: 'furnished',
        amenities: JSON.stringify(['WiFi', 'Meals', 'Laundry', 'Security']),
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5'],
        is_featured: true
      },
      {
        user_id: users[1]._id,
        title: 'Modern 1BHK in Indiranagar',
        description: 'Contemporary 1BHK apartment with all modern amenities.',
        property_type: 'apartment',
        listing_type: 'rent',
        price: 18000,
        address: '234 100 Feet Road, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: 650,
        furnishing_status: 'furnished',
        amenities: JSON.stringify(['WiFi', 'Parking', 'Power Backup']),
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
        is_featured: true
      },
      {
        user_id: users[2]._id,
        title: 'Cozy Studio Apartment near MG Road',
        description: 'Perfect studio apartment for singles or young couples.',
        property_type: 'apartment',
        listing_type: 'rent',
        price: 15000,
        address: '567 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: 400,
        furnishing_status: 'furnished',
        amenities: JSON.stringify(['WiFi', 'AC', 'Power Backup']),
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
        is_featured: true
      }
    ];

    const createdProperties = await Property.insertMany(properties);
    console.log(`   ✓ ${createdProperties.length} properties created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${createdProperties.length} properties`);
    console.log('\n👤 Login credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Run seed
connectDB().then(seedDatabase);
