/**
 * Property Controller
 * Handles property listing CRUD operations, search, and filtering
 */

const { db } = require('../config/database');
// Image uploads now use direct URLs (Unsplash) - no cloud storage needed

/**
 * Create new property listing
 * POST /api/properties
 */
const createProperty = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      title, description, propertyType, listingType, price,
      address, city, state, pincode, latitude, longitude,
      bedrooms, bathrooms, areaSqft, furnishingStatus, availableFrom,
      amenities
    } = req.body;

    // Insert property
    const [result] = await connection.query(
      `INSERT INTO properties 
       (user_id, title, description, property_type, listing_type, price,
        address, city, state, pincode, latitude, longitude,
        bedrooms, bathrooms, area_sqft, furnishing_status, available_from, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, title, description, propertyType, listingType, price,
        address, city, state, pincode, latitude || null, longitude || null,
        bedrooms || null, bathrooms || null, areaSqft || null, 
        furnishingStatus || null, availableFrom || null,
        amenities ? JSON.stringify(amenities) : null
      ]
    );

    const propertyId = result.insertId;

    // Upload images if provided
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const uploadResult = await uploadImage(file.buffer, 'househub/properties');
        
        await connection.query(
          `INSERT INTO property_images (property_id, image_url, is_primary, display_order)
           VALUES (?, ?, ?, ?)`,
          [propertyId, uploadResult.secure_url, i === 0, i]
        );
      }
    }

    await connection.commit();

    // Get the created property with images
    const [properties] = await connection.query(
      `SELECT p.*, 
        GROUP_CONCAT(pi.image_url ORDER BY pi.display_order) as images,
        u.display_name as owner_name,
        u.phone_number as owner_phone,
        u.profile_image_url as owner_image
       FROM properties p
       LEFT JOIN property_images pi ON p.id = pi.property_id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [propertyId]
    );

    const property = properties[0];
    property.amenities = property.amenities ? JSON.parse(property.amenities) : [];
    property.images = property.images ? property.images.split(',') : [];

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Get all properties with search and filters
 * GET /api/properties
 */
const getProperties = async (req, res) => {
  try {
    const {
      search, city, propertyType, listingType, minPrice, maxPrice,
      bedrooms, furnishingStatus, amenities, page = 1, limit = 12
    } = req.query;

    let query = `
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count,
        u.display_name as owner_name,
        u.profile_image_url as owner_image
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status = 'active'
    `;

    const params = [];

    // Search by title or description
    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.city LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by city
    if (city) {
      query += ` AND p.city = ?`;
      params.push(city);
    }

    // Filter by property type
    if (propertyType) {
      query += ` AND p.property_type = ?`;
      params.push(propertyType);
    }

    // Filter by listing type
    if (listingType) {
      query += ` AND p.listing_type = ?`;
      params.push(listingType);
    }

    // Filter by price range
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(maxPrice);
    }

    // Filter by bedrooms
    if (bedrooms) {
      query += ` AND p.bedrooms >= ?`;
      params.push(bedrooms);
    }

    // Filter by furnishing status
    if (furnishingStatus) {
      query += ` AND p.furnishing_status = ?`;
      params.push(furnishingStatus);
    }

    // Filter by amenities
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : [amenities];
      amenityList.forEach(amenity => {
        query += ` AND JSON_CONTAINS(p.amenities, ?)`;
        params.push(JSON.stringify(amenity));
      });
    }

    // Get total count
    const countQuery = query.replace(/SELECT p\.\*.*FROM/s, 'SELECT COUNT(DISTINCT p.id) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));

    const [properties] = await pool.query(query, params);

    // Parse amenities JSON
    properties.forEach(property => {
      property.amenities = property.amenities ? JSON.parse(property.amenities) : [];
    });

    res.status(200).json({
      success: true,
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get properties',
      error: error.message
    });
  }
};

/**
 * Get property by ID
 * GET /api/properties/:id
 */
const getPropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Increment views count
    await pool.query(
      'UPDATE properties SET views_count = views_count + 1 WHERE id = ?',
      [propertyId]
    );

    // Get property with all details
    const [properties] = await pool.query(
      `SELECT p.*, 
        u.display_name as owner_name,
        u.phone_number as owner_phone,
        u.email as owner_email,
        u.profile_image_url as owner_image,
        u.id as owner_id
       FROM properties p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Get images
    const [images] = await pool.query(
      'SELECT image_url, is_primary, display_order FROM property_images WHERE property_id = ? ORDER BY display_order',
      [propertyId]
    );

    const property = properties[0];
    property.amenities = property.amenities ? JSON.parse(property.amenities) : [];
    property.images = images.map(img => img.image_url);

    // Check if bookmarked by current user
    if (req.user) {
      const [bookmarks] = await pool.query(
        'SELECT id FROM bookmarks WHERE user_id = ? AND property_id = ?',
        [req.user.id, propertyId]
      );
      property.isBookmarked = bookmarks.length > 0;
    }

    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get property',
      error: error.message
    });
  }
};

/**
 * Update property
 * PUT /api/properties/:id
 */
const updateProperty = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const propertyId = req.params.id;

    // Check if user owns the property
    const [properties] = await connection.query(
      'SELECT user_id FROM properties WHERE id = ?',
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (properties[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this property'
      });
    }

    await connection.beginTransaction();

    const {
      title, description, propertyType, listingType, price,
      address, city, state, pincode, latitude, longitude,
      bedrooms, bathrooms, areaSqft, furnishingStatus, availableFrom,
      amenities, status
    } = req.body;

    // Build update query
    const updates = [];
    const values = [];

    if (title) { updates.push('title = ?'); values.push(title); }
    if (description) { updates.push('description = ?'); values.push(description); }
    if (propertyType) { updates.push('property_type = ?'); values.push(propertyType); }
    if (listingType) { updates.push('listing_type = ?'); values.push(listingType); }
    if (price) { updates.push('price = ?'); values.push(price); }
    if (address) { updates.push('address = ?'); values.push(address); }
    if (city) { updates.push('city = ?'); values.push(city); }
    if (state) { updates.push('state = ?'); values.push(state); }
    if (pincode) { updates.push('pincode = ?'); values.push(pincode); }
    if (latitude !== undefined) { updates.push('latitude = ?'); values.push(latitude); }
    if (longitude !== undefined) { updates.push('longitude = ?'); values.push(longitude); }
    if (bedrooms !== undefined) { updates.push('bedrooms = ?'); values.push(bedrooms); }
    if (bathrooms !== undefined) { updates.push('bathrooms = ?'); values.push(bathrooms); }
    if (areaSqft !== undefined) { updates.push('area_sqft = ?'); values.push(areaSqft); }
    if (furnishingStatus) { updates.push('furnishing_status = ?'); values.push(furnishingStatus); }
    if (availableFrom) { updates.push('available_from = ?'); values.push(availableFrom); }
    if (amenities) { updates.push('amenities = ?'); values.push(JSON.stringify(amenities)); }
    if (status) { updates.push('status = ?'); values.push(status); }

    if (updates.length > 0) {
      values.push(propertyId);
      await connection.query(
        `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      // Get current image count
      const [currentImages] = await connection.query(
        'SELECT COUNT(*) as count FROM property_images WHERE property_id = ?',
        [propertyId]
      );
      
      let displayOrder = currentImages[0].count;

      for (const file of req.files) {
        const uploadResult = await uploadImage(file.buffer, 'househub/properties');
        
        await connection.query(
          `INSERT INTO property_images (property_id, image_url, is_primary, display_order)
           VALUES (?, ?, ?, ?)`,
          [propertyId, uploadResult.secure_url, displayOrder === 0, displayOrder]
        );
        
        displayOrder++;
      }
    }

    await connection.commit();

    // Get updated property
    const [updatedProperties] = await connection.query(
      `SELECT p.*, 
        GROUP_CONCAT(pi.image_url ORDER BY pi.display_order) as images
       FROM properties p
       LEFT JOIN property_images pi ON p.id = pi.property_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [propertyId]
    );

    const property = updatedProperties[0];
    property.amenities = property.amenities ? JSON.parse(property.amenities) : [];
    property.images = property.images ? property.images.split(',') : [];

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete property
 * DELETE /api/properties/:id
 */
const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Check if user owns the property
    const [properties] = await pool.query(
      'SELECT user_id FROM properties WHERE id = ?',
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (properties[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this property'
      });
    }

    // Delete property (images will be deleted via CASCADE)
    await pool.query('DELETE FROM properties WHERE id = ?', [propertyId]);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: error.message
    });
  }
};

/**
 * Get user's properties
 * GET /api/properties/user/my-listings
 */
const getUserProperties = async (req, res) => {
  try {
    const { status, page = 1, limit = 12 } = req.query;

    let query = `
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count,
        (SELECT COUNT(*) FROM bookmarks WHERE property_id = p.id) as bookmark_count
      FROM properties p
      WHERE p.user_id = ?
    `;

    const params = [req.user.id];

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    // Get total count
    const countQuery = query.replace(/SELECT p\.\*.*FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));

    const [properties] = await pool.query(query, params);

    // Parse amenities
    properties.forEach(property => {
      property.amenities = property.amenities ? JSON.parse(property.amenities) : [];
    });

    res.status(200).json({
      success: true,
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get properties',
      error: error.message
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUserProperties
};
