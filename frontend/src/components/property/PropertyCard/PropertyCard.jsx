/**
 * PropertyCard Component
 * Displays property information in a card layout
 */

import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiHome, FiDroplet, FiMaximize2 } from 'react-icons/fi';
import { formatPrice, propertyTypeLabels } from '../../../utils/helpers';
import styles from './PropertyCard.module.css';

const PropertyCard = ({ property, onBookmarkToggle, isBookmarked }) => {
  const {
    id,
    title,
    price,
    city,
    state,
    property_type,
    bedrooms,
    bathrooms,
    area_sqft,
    images,
    furnishing_status
  } = property;

  const primaryImage = images && images.length > 0 ? images[0] : null;

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    if (onBookmarkToggle) {
      onBookmarkToggle(id);
    }
  };

  return (
    <Link to={`/property/${id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {primaryImage ? (
          <img src={primaryImage} alt={title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>No Image</span>
          </div>
        )}
        
        <div className={styles.badges}>
          <span className={styles.badge}>{propertyTypeLabels[property_type]}</span>
          {furnishing_status && (
            <span className={styles.badgeSecondary}>
              {furnishing_status.replace('-', ' ')}
            </span>
          )}
        </div>

        {onBookmarkToggle && (
          <button 
            className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={handleBookmarkClick}
            aria-label="Bookmark property"
          >
            <FiHeart />
          </button>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        
        <div className={styles.location}>
          <FiMapPin />
          <span>{city}, {state}</span>
        </div>

        <div className={styles.features}>
          {bedrooms && (
            <div className={styles.feature}>
              <FiHome />
              <span>{bedrooms} Bed</span>
            </div>
          )}
          {bathrooms && (
            <div className={styles.feature}>
              <FiDroplet />
              <span>{bathrooms} Bath</span>
            </div>
          )}
          {area_sqft && (
            <div className={styles.feature}>
              <FiMaximize2 />
              <span>{area_sqft} sqft</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(price)}/month</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
