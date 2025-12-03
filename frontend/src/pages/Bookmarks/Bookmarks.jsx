import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookmarkService } from '../../services/bookmarkService';
import PropertyCard from '../../components/property/PropertyCard/PropertyCard';
import styles from './Bookmarks.module.css';

const Bookmarks = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await bookmarkService.getBookmarks();
      setProperties(response.properties);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (propertyId) => {
    try {
      await bookmarkService.toggleBookmark(propertyId);
      setProperties(props => props.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <div className={styles.bookmarksPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Saved Properties</h1>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className="spinner"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className={styles.propertiesGrid}>
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} onBookmarkToggle={handleBookmarkToggle} isBookmarked={true} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>No saved properties yet</h2>
            <p>Start exploring and save your favorite properties</p>
            <button onClick={() => navigate('/properties')} className={styles.browseButton}>
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
