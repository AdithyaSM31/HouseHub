import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiHeart, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { propertyService } from '../../services/propertyService';
import { authService } from '../../services/authService';
import PropertyCard from '../../components/property/PropertyCard/PropertyCard';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchDashboardData);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchDashboardData);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [propertiesRes, profileRes] = await Promise.all([
        propertyService.getUserProperties(),
        authService.getProfile()
      ]);
      
      setProperties(propertiesRes.properties);
      setStats({
        totalListings: propertiesRes.properties?.length || 0,
        totalBookmarks: profileRes.user.totalBookmarks || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (propertyId) => {
    navigate(`/edit-property/${propertyId}`);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertyService.deleteProperty(propertyId);
      setProperties(properties.filter(p => p.id !== propertyId));
      setStats(prev => ({ ...prev, totalListings: prev.totalListings - 1 }));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Dashboard</h1>
          <Link to="/post-property" className={styles.postButton}>
            <FiPlus /> Post Property
          </Link>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FiHome className={styles.statIcon} />
            <div>
              <h3>{stats.totalListings}</h3>
              <p>My Listings</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <FiHeart className={styles.statIcon} />
            <div>
              <h3>{stats.totalBookmarks}</h3>
              <p>Saved Properties</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>My Listings</h2>
          
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="spinner"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className={styles.propertiesGrid}>
              {properties.map(property => (
                <div key={property.id} className={styles.propertyItem}>
                  <PropertyCard property={property} />
                  <div className={styles.propertyActions}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEdit(property.id)}
                      title="Edit property"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(property.id)}
                      title="Delete property"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>You haven't posted any properties yet</p>
              <Link to="/post-property" className={styles.startButton}>
                Post Your First Property
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
