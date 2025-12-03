/**
 * Utility Functions
 * Common helper functions used across the application
 */

// Format price with currency
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Debounce function
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Get error message from error object
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An error occurred. Please try again.';
};

// Property type labels
export const propertyTypeLabels = {
  apartment: 'Apartment',
  house: 'House',
  pg: 'PG',
  hostel: 'Hostel',
  room: 'Room',
  villa: 'Villa'
};

// Listing type labels
export const listingTypeLabels = {
  rent: 'For Rent',
  pg: 'PG/Hostel'
};

// Furnishing status labels
export const furnishingStatusLabels = {
  furnished: 'Fully Furnished',
  'semi-furnished': 'Semi Furnished',
  unfurnished: 'Unfurnished'
};

// Common amenities list
export const commonAmenities = [
  'WiFi',
  'Parking',
  'Power Backup',
  'Lift',
  'Security',
  'Water Supply',
  'Gym',
  'Swimming Pool',
  'Garden',
  'Playground',
  'Club House',
  'Air Conditioning',
  'Balcony',
  'Furnished',
  'Refrigerator',
  'Washing Machine',
  'TV',
  'Microwave',
  'Gas Connection',
  'Study Table',
  'Wardrobe'
];

// Indian states list
export const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Puducherry'
];
