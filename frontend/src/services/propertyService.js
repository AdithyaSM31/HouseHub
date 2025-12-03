/**
 * API Service for Properties
 */

import { propertiesAPI } from './api';

export const propertyService = {
  // Get all properties with filters
  getProperties: async (params = {}) => {
    return await propertiesAPI.getAll(params);
  },

  // Get featured properties
  getFeaturedProperties: async () => {
    return await propertiesAPI.getFeatured();
  },

  // Get property by ID
  getPropertyById: async (id) => {
    return await propertiesAPI.getById(id);
  },

  // Create new property
  createProperty: async (propertyData) => {
    return await propertiesAPI.create(propertyData);
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    return await propertiesAPI.update(id, propertyData);
  },

  // Delete property
  deleteProperty: async (id) => {
    return await propertiesAPI.delete(id);
  },

  // Get user's properties
  getUserProperties: async () => {
    return await propertiesAPI.getUserProperties();
  }
};
