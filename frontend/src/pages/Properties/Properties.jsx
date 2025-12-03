/**
 * Properties Page
 * Browse and search properties with filters
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiFilter } from 'react-icons/fi';
import PropertyCard from '../../components/property/PropertyCard/PropertyCard';
import { propertyService } from '../../services/propertyService';
import { bookmarkService } from '../../services/bookmarkService';
import { useAuth } from '../../context/AuthContext';
import { propertyTypeLabels, furnishingStatusLabels } from '../../utils/helpers';
import styles from './Properties.module.css';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    listingType: searchParams.get('listingType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnishingStatus: searchParams.get('furnishingStatus') || ''
  });

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const response = await propertyService.getProperties(params);
      setProperties(response.properties || []);
      setPagination({ total: response.count || 0 });
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      setPagination({ total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      propertyType: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      furnishingStatus: ''
    });
    setSearchParams({});
  };

  const handleBookmarkToggle = async (propertyId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      await bookmarkService.toggleBookmark(propertyId);
      setProperties(props => 
        props.map(p => p.id === propertyId ? {...p, isBookmarked: !p.isBookmarked} : p)
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <div className={styles.propertiesPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Browse Properties</h1>
            <p className={styles.subtitle}>
              {pagination.total || 0} properties found
            </p>
          </div>
          
          <button 
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
          </button>
        </div>

        <div className={styles.content}>
          {/* Filters Sidebar */}
          <aside className={`${styles.filters} ${showFilters ? styles.showFilters : ''}`}>
            <div className={styles.filtersHeader}>
              <h3>Filters</h3>
              <button onClick={clearFilters} className={styles.clearButton}>
                Clear All
              </button>
            </div>

            <div className={styles.filterGroup}>
              <label>Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search properties..."
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Enter city"
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Listing Type</label>
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange('listingType', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="rent">For Rent</option>
                <option value="pg">PG/Hostel</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                {Object.keys(propertyTypeLabels).map(key => (
                  <option key={key} value={key}>{propertyTypeLabels[key]}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Price Range</label>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="Min"
                  className={styles.filterInput}
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Max"
                  className={styles.filterInput}
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Furnishing</label>
              <select
                value={filters.furnishingStatus}
                onChange={(e) => handleFilterChange('furnishingStatus', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                {Object.keys(furnishingStatusLabels).map(key => (
                  <option key={key} value={key}>{furnishingStatusLabels[key]}</option>
                ))}
              </select>
            </div>

            <button onClick={applyFilters} className={styles.applyButton}>
              Apply Filters
            </button>
          </aside>

          {/* Properties Grid */}
          <div className={styles.propertiesContainer}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className="spinner"></div>
              </div>
            ) : properties.length > 0 ? (
              <div className={styles.propertiesGrid}>
                {properties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onBookmarkToggle={handleBookmarkToggle}
                    isBookmarked={property.isBookmarked}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No properties found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
