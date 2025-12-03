/**
 * Home Page
 * Landing page with hero section and featured properties
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import PropertyCard from '../../components/property/PropertyCard/PropertyCard';
import { propertyService } from '../../services/propertyService';
import { bookmarkService } from '../../services/bookmarkService';
import { useAuth } from '../../context/AuthContext';
import styles from './Home.module.css';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await propertyService.getFeaturedProperties();
      setProperties(response.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/properties');
    }
  };

  const handleBookmarkToggle = async (propertyId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      await bookmarkService.toggleBookmark(propertyId);
      // Update local state
      setProperties(props => 
        props.map(p => p.id === propertyId ? {...p, isBookmarked: !p.isBookmarked} : p)
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Find Your Perfect Home
          </h1>
          <p className={styles.heroSubtitle}>
            Discover thousands of rental properties and PG accommodations across India
          </p>
          
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by city, locality, or property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
          </form>

          <div className={styles.quickFilters}>
            <Link to="/properties?listingType=rent" className={styles.quickFilterButton}>
              For Rent
            </Link>
            <Link to="/properties?listingType=pg" className={styles.quickFilterButton}>
              PG/Hostel
            </Link>
            <Link to="/properties?propertyType=apartment" className={styles.quickFilterButton}>
              Apartments
            </Link>
            <Link to="/properties?propertyType=house" className={styles.quickFilterButton}>
              Houses
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className={styles.featured}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Properties</h2>
            <Link to="/properties" className={styles.viewAllLink}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="spinner"></div>
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose HouseHub?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🏠</span>
              <h3>Wide Selection</h3>
              <p>Browse thousands of verified properties across major cities</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>💬</span>
              <h3>Direct Contact</h3>
              <p>Message property owners directly without any middlemen</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>⚡</span>
              <h3>Quick & Easy</h3>
              <p>Find and book your perfect home in minutes</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔒</span>
              <h3>Secure & Safe</h3>
              <p>All listings are verified for your safety and security</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Have a property to rent?</h2>
            <p className={styles.ctaText}>
              List your property for free and reach millions of potential tenants
            </p>
            <Link to={currentUser ? "/post-property" : "/login"} className={styles.ctaButton}>
              Post Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
