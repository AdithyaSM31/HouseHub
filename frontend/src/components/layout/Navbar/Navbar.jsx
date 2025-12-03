/**
 * Navbar Component
 * Main navigation bar with user menu and links
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiMessageCircle, FiUser, FiPlus, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🏠</span>
          <span className={styles.logoText}>HouseHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Link to="/properties" className={styles.navLink}>
            <FiSearch /> Browse
          </Link>

          {currentUser ? (
            <>
              <Link to="/bookmarks" className={styles.navLink}>
                <FiHeart /> Saved
              </Link>
              <Link to="/messages" className={styles.navLink}>
                <FiMessageCircle /> Messages
              </Link>
              <Link to="/post-property" className={styles.postButton}>
                <FiPlus /> Post Property
              </Link>
              
              <div className={styles.userMenu} ref={userMenuRef}>
                <button 
                  className={styles.userButton}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {currentUser?.profileImage || currentUser?.profile_image_url ? (
                    <img src={currentUser.profileImage || currentUser.profile_image_url} alt="Profile" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <FiUser />
                    </div>
                  )}
                </button>
                
                {showUserMenu && (
                  <div className={styles.dropdown}>
                    <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                      Dashboard
                    </Link>
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                      Profile
                    </Link>
                    <button onClick={handleSignOut} className={styles.dropdownItem}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className={styles.loginButton}>
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className={styles.mobileNav}>
          <Link to="/properties" className={styles.mobileNavLink}>
            <FiSearch /> Browse Properties
          </Link>
          {currentUser ? (
            <>
              <Link to="/bookmarks" className={styles.mobileNavLink}>
                <FiHeart /> Saved Properties
              </Link>
              <Link to="/messages" className={styles.mobileNavLink}>
                <FiMessageCircle /> Messages
              </Link>
              <Link to="/post-property" className={styles.mobileNavLink}>
                <FiPlus /> Post Property
              </Link>
              <Link to="/dashboard" className={styles.mobileNavLink}>
                <FiUser /> Dashboard
              </Link>
              <button onClick={handleSignOut} className={styles.mobileNavLink}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.mobileNavLink}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
