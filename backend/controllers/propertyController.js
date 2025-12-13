/**
 * Property Controller (MongoDB)
 * Handles property CRUD operations
 */

const { Property, User } = require('../models');

/**
 * Get all properties with search and filters
 * GET /api/properties
 */
exports.getAllProperties = async (req, res) => {
  try {
    const { search, city, propertyType, listingType, minPrice, maxPrice, bedrooms, furnishingStatus } = req.query;

    // Build query
    const query = { is_active: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    if (city) query.city = city;
    if (propertyType) query.property_type = propertyType;
    if (listingType) query.listing_type = listingType;
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    if (bedrooms) query.bedrooms = Number(bedrooms);
    if (furnishingStatus) query.furnishing_status = furnishingStatus;

    const properties = await Property.find(query)
      .populate('user_id', 'display_name phone_number email')
      .sort({ created_at: -1 })
      .lean();

    // Format response
    const formattedProperties = properties.map(prop => ({
      ...prop,
      id: prop._id,
      owner_id: prop.user_id._id,
      owner_name: prop.user_id.display_name,
      owner_phone: prop.user_id.phone_number,
      owner_email: prop.user_id.email,
      amenities: prop.amenities ? JSON.parse(prop.amenities) : []
    }));

    res.json({
      success: true,
      count: formattedProperties.length,
      properties: formattedProperties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

/**
 * Get featured properties
 * GET /api/properties/featured
 */
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ is_active: true, is_featured: true })
      .populate('user_id', 'display_name phone_number email')
      .sort({ created_at: -1 })
      .limit(6)
      .lean();

    const formattedProperties = properties.map(prop => ({
      ...prop,
      id: prop._id,
      owner_id: prop.user_id._id,
      owner_name: prop.user_id.display_name,
      owner_phone: prop.user_id.phone_number,
      owner_email: prop.user_id.email,
      amenities: prop.amenities ? JSON.parse(prop.amenities) : []
    }));

    res.json({
      success: true,
      count: formattedProperties.length,
      properties: formattedProperties
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({ error: 'Failed to fetch featured properties' });
  }
};

/**
 * Get property by ID
 * GET /api/properties/:id
 */
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('user_id', 'display_name phone_number email profile_image_url')
      .lean();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment views
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views_count: 1 } });

    const formattedProperty = {
      ...property,
      id: property._id,
      owner_id: property.user_id._id,
      owner_name: property.user_id.display_name,
      owner_phone: property.user_id.phone_number,
      owner_email: property.user_id.email,
      owner_profile_image: property.user_id.profile_image_url,
      amenities: property.amenities ? JSON.parse(property.amenities) : []
    };

    res.json({
      success: true,
      property: formattedProperty
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

/**
 * Create new property
 * POST /api/properties
 */
exports.createProperty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const propertyData = req.body;

    // Convert amenities array to JSON string
    if (Array.isArray(propertyData.amenities)) {
      propertyData.amenities = JSON.stringify(propertyData.amenities);
    }

    // Transform camelCase to snake_case for MongoDB
    const transformedData = {
      user_id: userId,
      title: propertyData.title,
      description: propertyData.description,
      property_type: propertyData.propertyType || propertyData.property_type,
      listing_type: propertyData.listingType || propertyData.listing_type,
      price: propertyData.price,
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      pincode: propertyData.pincode,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      area_sqft: propertyData.areaSqft || propertyData.area_sqft,
      furnishing_status: propertyData.furnishingStatus || propertyData.furnishing_status,
      amenities: propertyData.amenities,
      images: propertyData.images || []
    };

    const property = await Property.create(transformedData);

    const populatedProperty = await Property.findById(property._id)
      .populate('user_id', 'display_name phone_number email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: {
        ...populatedProperty,
        id: populatedProperty._id,
        amenities: populatedProperty.amenities ? JSON.parse(populatedProperty.amenities) : []
      }
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
exports.updateProperty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const propertyId = req.params.id;

    // Check if property belongs to user
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this property' });
    }

    // Convert amenities array to JSON string
    if (Array.isArray(req.body.amenities)) {
      req.body.amenities = JSON.stringify(req.body.amenities);
    }

    // Transform camelCase to snake_case for MongoDB
    const transformedData = {
      title: req.body.title,
      description: req.body.description,
      property_type: req.body.propertyType || req.body.property_type,
      listing_type: req.body.listingType || req.body.listing_type,
      price: req.body.price,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      area_sqft: req.body.areaSqft || req.body.area_sqft,
      furnishing_status: req.body.furnishingStatus || req.body.furnishing_status,
      amenities: req.body.amenities,
      images: req.body.images,
      updated_at: Date.now()
    };

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      transformedData,
      { new: true }
    ).populate('user_id', 'display_name phone_number email').lean();

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: {
        ...updatedProperty,
        id: updatedProperty._id,
        amenities: updatedProperty.amenities ? JSON.parse(updatedProperty.amenities) : []
      }
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
exports.deleteProperty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const propertyId = req.params.id;

    // Check if property belongs to user
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this property' });
    }

    await Property.findByIdAndDelete(propertyId);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};

/**
 * Get user's properties
 * GET /api/properties/user/my-listings
 */
exports.getUserProperties = async (req, res) => {
  try {
    const userId = req.user.userId;

    const properties = await Property.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean();

    const formattedProperties = properties.map(prop => ({
      ...prop,
      id: prop._id,
      amenities: prop.amenities ? JSON.parse(prop.amenities) : []
    }));

    res.json({
      success: true,
      count: formattedProperties.length,
      properties: formattedProperties
    });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
};
