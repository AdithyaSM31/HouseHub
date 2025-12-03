import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Profile.module.css';

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({ displayName: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || currentUser.display_name || '',
        phoneNumber: currentUser.phoneNumber || currentUser.phone_number || ''
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(formData);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <h1 className={styles.title}>My Profile</h1>
        
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {currentUser?.profileImage || currentUser?.profile_image_url ? (
                <img src={currentUser.profileImage || currentUser.profile_image_url} alt={currentUser.displayName || currentUser.display_name} />
              ) : (
                <span>{currentUser?.displayName?.charAt(0) || currentUser?.display_name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}</span>
              )}
            </div>
            <p className={styles.email}>{currentUser?.email}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formField}>
              <label className={styles.label}>Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your display name"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your phone number"
              />
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
