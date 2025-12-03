/**
 * API Service for Bookmarks
 */

import { bookmarksAPI } from './api';

export const bookmarkService = {
  // Get bookmarked properties
  getBookmarks: async () => {
    return await bookmarksAPI.getAll();
  },

  // Toggle bookmark
  toggleBookmark: async (propertyId) => {
    return await bookmarksAPI.toggle(propertyId);
  },

  // Check if property is bookmarked
  checkBookmark: async (propertyId) => {
    return await bookmarksAPI.check(propertyId);
  }
};
