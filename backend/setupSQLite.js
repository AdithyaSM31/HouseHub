/**
 * SQLite Schema Setup and Seed Data
 * Creates tables and populates with sample data
 */

const { db } = require('./config/database_sqlite');
const bcrypt = require('bcryptjs');

console.log('🔧 Setting up SQLite database...\n');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    phone_number TEXT,
    profile_image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Properties table
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK(property_type IN ('apartment','house','pg','hostel','room','villa')),
    listing_type TEXT NOT NULL CHECK(listing_type IN ('rent','pg')),
    price REAL NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqft INTEGER,
    furnishing_status TEXT CHECK(furnishing_status IN ('furnished','semi-furnished','unfurnished')),
    amenities TEXT,
    is_active INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Property images table
  CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  -- Bookmarks table
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  -- Conversations table
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
  );

  -- Messages table
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log('✅ Tables created\n');

// Sample users
const users = [
  { email: 'john@example.com', password: 'password123', name: 'John Doe', phone: '+91 9876543210' },
  { email: 'jane@example.com', password: 'password123', name: 'Jane Smith', phone: '+91 9876543211' },
  { email: 'amit@example.com', password: 'password123', name: 'Amit Kumar', phone: '+91 9876543212' },
];

console.log('👥 Creating users...');
const insertUser = db.prepare('INSERT INTO users (email, password_hash, display_name, phone_number) VALUES (?, ?, ?, ?)');

const userIds = users.map(user => {
  const hash = bcrypt.hashSync(user.password, 10);
  const info = insertUser.run(user.email, hash, user.name, user.phone);
  console.log(`   ✓ ${user.email}`);
  return info.lastInsertRowid;
});

// Sample properties
const properties = [
  {title:'Spacious 2BHK Apartment in Koramangala',desc:'Beautiful 2BHK apartment with modern amenities in the heart of Koramangala.',type:'apartment',listing:'rent',price:25000,addr:'123 Main Road, Koramangala 5th Block',city:'Bangalore',state:'Karnataka',pin:'560095',bed:2,bath:2,sqft:1200,furnish:'semi-furnished',amen:['WiFi','Parking','Security','Power Backup','Lift'],imgs:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800']},
  {title:'Luxury 3BHK Villa with Garden',desc:'Stunning 3BHK independent villa with private garden and parking.',type:'villa',listing:'rent',price:45000,addr:'456 Palm Grove, Whitefield',city:'Bangalore',state:'Karnataka',pin:'560066',bed:3,bath:3,sqft:2500,furnish:'furnished',amen:['WiFi','Parking','Garden','Security','Power Backup','Gym'],imgs:['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800']},
  {title:'Affordable PG for Working Women',desc:'Safe and comfortable PG accommodation for working women.',type:'pg',listing:'pg',price:8000,addr:'789 Service Road, HSR Layout',city:'Bangalore',state:'Karnataka',pin:'560102',bed:1,bath:1,sqft:150,furnish:'furnished',amen:['WiFi','Meals','Laundry','TV','Fridge','AC'],imgs:['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']},
  {title:'Modern 1BHK in Indiranagar',desc:'Newly renovated 1BHK apartment in vibrant Indiranagar.',type:'apartment',listing:'rent',price:18000,addr:'321 CMH Road, Indiranagar',city:'Bangalore',state:'Karnataka',pin:'560038',bed:1,bath:1,sqft:650,furnish:'furnished',amen:['WiFi','Parking','Security','Lift'],imgs:['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']},
  {title:'Cozy Studio Apartment near MG Road',desc:'Compact and efficient studio apartment in prime location.',type:'apartment',listing:'rent',price:15000,addr:'567 Church Street, Ashok Nagar',city:'Bangalore',state:'Karnataka',pin:'560001',bed:1,bath:1,sqft:450,furnish:'furnished',amen:['WiFi','AC','TV','Fridge','Washing Machine'],imgs:['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800']},
  {title:'Premium Boys PG in Electronic City',desc:'Well-maintained PG with excellent facilities for working professionals.',type:'pg',listing:'pg',price:9500,addr:'890 Hosur Road, Electronic City Phase 1',city:'Bangalore',state:'Karnataka',pin:'560100',bed:2,bath:1,sqft:180,furnish:'furnished',amen:['WiFi','Meals','AC','TV','Gym','Parking'],imgs:['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800']},
  {title:'4BHK Penthouse in Jayanagar',desc:'Luxurious 4BHK penthouse with terrace garden and premium fittings.',type:'apartment',listing:'rent',price:55000,addr:'234 11th Main Road, Jayanagar 4th Block',city:'Bangalore',state:'Karnataka',pin:'560041',bed:4,bath:4,sqft:3000,furnish:'semi-furnished',amen:['WiFi','Parking','Security','Power Backup','Lift','Swimming Pool','Gym'],imgs:['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']},
  {title:'Budget-Friendly Single Room in Marathahalli',desc:'Affordable single occupancy room for students.',type:'room',listing:'pg',price:6000,addr:'678 Outer Ring Road, Marathahalli',city:'Bangalore',state:'Karnataka',pin:'560037',bed:1,bath:1,sqft:120,furnish:'semi-furnished',amen:['WiFi','Attached Bathroom','Cupboard'],imgs:['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800']},
  {title:'Spacious 2BHK in Hebbal',desc:'Well-ventilated 2BHK apartment near Manyata Tech Park.',type:'apartment',listing:'rent',price:22000,addr:'345 Bellary Road, Hebbal',city:'Bangalore',state:'Karnataka',pin:'560024',bed:2,bath:2,sqft:1100,furnish:'semi-furnished',amen:['WiFi','Parking','Security','Power Backup','Lift','Gym'],imgs:['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800']},
  {title:'Family House in JP Nagar',desc:'Independent 3BHK house with parking and small garden.',type:'house',listing:'rent',price:35000,addr:'789 24th Main, JP Nagar 6th Phase',city:'Bangalore',state:'Karnataka',pin:'560078',bed:3,bath:2,sqft:1800,furnish:'unfurnished',amen:['Parking','Garden','Security'],imgs:['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800']},
  {title:'Girls Hostel near BMS College',desc:'Safe and secure hostel for girl students.',type:'hostel',listing:'pg',price:7500,addr:'456 Bull Temple Road, Basavanagudi',city:'Bangalore',state:'Karnataka',pin:'560019',bed:1,bath:1,sqft:140,furnish:'furnished',amen:['WiFi','Meals','Laundry','Study Room','TV Room'],imgs:['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']},
  {title:'3BHK Apartment in Bellandur',desc:'Modern 3BHK apartment in gated community.',type:'apartment',listing:'rent',price:32000,addr:'123 Sarjapur Road, Bellandur',city:'Bangalore',state:'Karnataka',pin:'560103',bed:3,bath:3,sqft:1650,furnish:'semi-furnished',amen:['WiFi','Parking','Security','Power Backup','Lift','Swimming Pool','Clubhouse','Gym'],imgs:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800']},
  {title:'Luxury 1BHK in Richmond Town',desc:'Upscale 1BHK apartment in heritage area.',type:'apartment',listing:'rent',price:28000,addr:'234 Richmond Road',city:'Bangalore',state:'Karnataka',pin:'560025',bed:1,bath:1,sqft:750,furnish:'furnished',amen:['WiFi','Parking','Security','Lift','AC','Modular Kitchen'],imgs:['https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800']},
  {title:'Co-living Space in BTM Layout',desc:'Modern co-living space with private room and shared kitchen.',type:'pg',listing:'pg',price:10000,addr:'567 14th Main, BTM 2nd Stage',city:'Bangalore',state:'Karnataka',pin:'560076',bed:1,bath:1,sqft:160,furnish:'furnished',amen:['WiFi','AC','Housekeeping','Fridge','Washing Machine','TV Lounge'],imgs:['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800']},
  {title:'2BHK Near Yelahanka New Town',desc:'Spacious 2BHK apartment near airport.',type:'apartment',listing:'rent',price:20000,addr:'890 Doddaballapur Road, Yelahanka',city:'Bangalore',state:'Karnataka',pin:'560064',bed:2,bath:2,sqft:1050,furnish:'semi-furnished',amen:['WiFi','Parking','Security','Power Backup'],imgs:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']},
];

console.log('\n🏠 Creating properties...');
const insertProp = db.prepare(`INSERT INTO properties (user_id, title, description, property_type, listing_type, price, address, city, state, pincode, bedrooms, bathrooms, area_sqft, furnishing_status, amenities, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertImg = db.prepare('INSERT INTO property_images (property_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)');

properties.forEach((p, i) => {
  const userId = userIds[i % userIds.length];
  const info = insertProp.run(userId, p.title, p.desc, p.type, p.listing, p.price, p.addr, p.city, p.state, p.pin, p.bed, p.bath, p.sqft, p.furnish, JSON.stringify(p.amen), i < 3 ? 1 : 0);
  
  p.imgs.forEach((img, j) => {
    insertImg.run(info.lastInsertRowid, img, j === 0 ? 1 : 0, j);
  });
  
  console.log(`   ✓ ${p.title}`);
});

console.log('\n✅ Database setup complete!');
console.log('\n📊 Summary:');
console.log(`   - ${users.length} users`);
console.log(`   - ${properties.length} properties`);
console.log('\n👤 Login credentials:');
console.log('   Email: john@example.com');
console.log('   Password: password123');
console.log('\n🚀 Start the backend: npm start');

db.close();
