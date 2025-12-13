/**
 * Property Controller - SQLite Version
 * Simplified for demonstration with sample data
 */

const { db } = require('../config/database');

/**
 * Get all properties with search and filters
 * GET /api/properties
 */
exports.getAllProperties = (req, res) => {
  try {
    const { search, city, propertyType, listingType, minPrice, maxPrice, bedrooms, furnishingStatus } = req.query;

    let query = `
      SELECT p.*, 
        GROUP_CONCAT(pi.image_url) as images,
        p.user_id as owner_id,
        u.display_name as owner_name,
        u.phone_number as owner_phone
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_active = 1
    `;

    const params = [];

    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.city LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (city) {
      query += ` AND p.city = ?`;
      params.push(city);
    }

    if (propertyType) {
      query += ` AND p.property_type = ?`;
      params.push(propertyType);
    }

    if (listingType) {
      query += ` AND p.listing_type = ?`;
      params.push(listingType);
    }

    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }

    if (bedrooms) {
      query += ` AND p.bedrooms = ?`;
      params.push(Number(bedrooms));
    }

    if (furnishingStatus) {
      query += ` AND p.furnishing_status = ?`;
      params.push(furnishingStatus);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const properties = db.prepare(query).all(...params);

    // Parse amenities and images
    properties.forEach(prop => {
      prop.amenities = prop.amenities ? JSON.parse(prop.amenities) : [];
      prop.images = prop.images ? prop.images.split(',') : [];
    });

    res.json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

/**
 * Get featured properties (latest properties)
 * GET /api/properties/featured
 */
exports.getFeaturedProperties = (req, res) => {
  try {
    const query = `
      SELECT p.*, 
        GROUP_CONCAT(pi.image_url) as images,
        p.user_id as owner_id,
        u.display_name as owner_name
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 6
    `;

    const properties = db.prepare(query).all();

    properties.forEach(prop => {
      prop.amenities = prop.amenities ? JSON.parse(prop.amenities) : [];
      prop.images = prop.images ? prop.images.split(',') : [];
    });

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({ error: 'Failed to fetch featured properties' });
  }
};

/**
 * Get single property by ID
 * GET /api/properties/:id
 */
exports.getPropertyById = (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT p.*, 
        GROUP_CONCAT(pi.image_url) as images,
        p.user_id as owner_id,
        u.display_name as owner_name,
        u.phone_number as owner_phone,
        u.email as owner_email,
        u.profile_image_url as owner_image
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
      GROUP BY p.id
    `;

    const property = db.prepare(query).get(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    property.amenities = property.amenities ? JSON.parse(property.amenities) : [];
    property.images = property.images ? property.images.split(',') : [];

    // Increment view count
    db.prepare('UPDATE properties SET views_count = views_count + 1 WHERE id = ?').run(id);

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

/**
 * Get properties by user (current user's listings)
 * GET /api/properties/user/me
 */
exports.getUserProperties = (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT p.*, 
        GROUP_CONCAT(pi.image_url) as images
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const properties = db.prepare(query).all(userId);

    properties.forEach(prop => {
      prop.amenities = prop.amenities ? JSON.parse(prop.amenities) : [];
      prop.images = prop.images ? prop.images.split(',') : [];
    });

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
};

/**
 * Create new property
 * POST /api/properties
 */
exports.createProperty = (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title, description, propertyType, listingType, price,
      address, city, state, pincode,
      bedrooms, bathrooms, areaSqft, furnishingStatus,
      amenities, images
    } = req.body;

    // Insert property
    const stmt = db.prepare(`
      INSERT INTO properties 
      (user_id, title, description, property_type, listing_type, price,
       address, city, state, pincode, bedrooms, bathrooms, area_sqft, 
       furnishing_status, amenities, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const result = stmt.run(
      userId, title, description, propertyType, listingType, price,
      address, city, state, pincode,
      bedrooms || null, bathrooms || null, areaSqft || null,
      furnishingStatus || null,
      amenities ? JSON.stringify(amenities) : null
    );

    const propertyId = result.lastInsertRowid;

    // Insert images if provided
    if (images && Array.isArray(images)) {
      const imgStmt = db.prepare('INSERT INTO property_images (property_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)');
      images.forEach((img, i) => {
        imgStmt.run(propertyId, img, i === 0 ? 1 : 0, i);
      });
    }

    // Get created property
    const property = db.prepare(`
      SELECT p.*, GROUP_CONCAT(pi.image_url) as images
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(propertyId);

    property.amenities = property.amenities ? JSON.parse(property.amenities) : [];
    property.images = property.images ? property.images.split(',') : [];

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

/**
 * Update property
 * PUT /api/properties/:id
 */
exports.updateProperty = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      title, description, propertyType, listingType, price,
      address, city, state, pincode,
      bedrooms, bathrooms, areaSqft, furnishingStatus,
      amenities
    } = req.body;

    // Check ownership
    const property = db.prepare('SELECT user_id FROM properties WHERE id = ?').get(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }

    // Update property
    const stmt = db.prepare(`
      UPDATE properties SET
        title = ?, description = ?, property_type = ?, listing_type = ?, price = ?,
        address = ?, city = ?, state = ?, pincode = ?,
        bedrooms = ?, bathrooms = ?, area_sqft = ?, furnishing_status = ?,
        amenities = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title, description, propertyType, listingType, price,
      address, city, state, pincode,
      bedrooms || null, bathrooms || null, areaSqft || null, furnishingStatus || null,
      amenities ? JSON.stringify(amenities) : null,
      id
    );

    // Get updated property
    const updated = db.prepare(`
      SELECT p.*, GROUP_CONCAT(pi.image_url) as images
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(id);

    updated.amenities = updated.amenities ? JSON.parse(updated.amenities) : [];
    updated.images = updated.images ? updated.images.split(',') : [];

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: updated
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
};

/**
 * Delete property
 * DELETE /api/properties/:id
 */
exports.deleteProperty = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check ownership
    const property = db.prepare('SELECT user_id FROM properties WHERE id = ?').get(id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }

    // Delete property (images will be deleted via CASCADE)
    db.prepare('DELETE FROM properties WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};
