/**
 * Property Details Page
 * View detailed information about a property
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiMapPin, FiHome, FiDroplet, FiMaximize2, FiMail } from 'react-icons/fi';
import { propertyService } from '../../services/propertyService';
import { bookmarkService } from '../../services/bookmarkService';
import { formatPrice, formatDate, propertyTypeLabels } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import styles from './PropertyDetails.module.css';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await propertyService.getPropertyById(id);
      setProperty(response.property);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      await bookmarkService.toggleBookmark(id);
      setProperty(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleContactOwner = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate(`/messages?userId=${property.owner_id}&propertyId=${property.id}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.errorContainer}>
        <h2>Property not found</h2>
      </div>
    );
  }

  const images = property.images || [];

  return (
    <div className={styles.propertyDetails}>
      <div className={styles.container}>
        {/* Image Gallery */}
        <div className={styles.gallery}>
          {images.length > 0 ? (
            <>
              <div className={styles.mainImage}>
                <img src={images[currentImageIndex]} alt={property.title} />
              </div>
              {images.length > 1 && (
                <div className={styles.thumbnails}>
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${property.title} ${index + 1}`}
                      className={index === currentImageIndex ? styles.active : ''}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noImage}>No images available</div>
          )}
        </div>

        <div className={styles.content}>
          {/* Main Info */}
          <div className={styles.mainInfo}>
            <div className={styles.header}>
              <div>
                <span className={styles.badge}>{propertyTypeLabels[property.property_type]}</span>
                <h1 className={styles.title}>{property.title}</h1>
                <div className={styles.location}>
                  <FiMapPin />
                  <span>{property.address}, {property.city}, {property.state}</span>
                </div>
              </div>
              <button onClick={handleBookmark} className={styles.bookmarkButton}>
                <FiHeart className={property.isBookmarked ? styles.bookmarked : ''} />
              </button>
            </div>

            <div className={styles.price}>
              {formatPrice(property.price)}<span>/month</span>
            </div>

            <div className={styles.features}>
              {property.bedrooms && (
                <div className={styles.feature}>
                  <FiHome />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
              )}
              {property.bathrooms && (
                <div className={styles.feature}>
                  <FiDroplet />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              )}
              {property.area_sqft && (
                <div className={styles.feature}>
                  <FiMaximize2 />
                  <span>{property.area_sqft} sqft</span>
                </div>
              )}
            </div>

            <div className={styles.description}>
              <h3>Description</h3>
              <p>{property.description}</p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className={styles.amenities}>
                <h3>Amenities</h3>
                <div className={styles.amenitiesList}>
                  {property.amenities.map((amenity, index) => (
                    <span key={index} className={styles.amenity}>{amenity}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Owner Card */}
          <div className={styles.ownerCard}>
            <h3>Contact Owner</h3>
            <div className={styles.ownerInfo}>
              {property.owner_image ? (
                <img src={property.owner_image} alt={property.owner_name} className={styles.ownerAvatar} />
              ) : (
                <div className={styles.ownerAvatarPlaceholder}>
                  {property.owner_name?.charAt(0)}
                </div>
              )}
              <div>
                <h4>{property.owner_name}</h4>
                <p>Property Owner</p>
              </div>
            </div>
            <Button fullWidth onClick={handleContactOwner}>
              <FiMail /> Contact Owner
            </Button>
            {property.owner_phone && (
              <p className={styles.phone}>Phone: {property.owner_phone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
