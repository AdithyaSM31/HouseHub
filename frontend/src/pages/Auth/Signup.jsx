/**
 * Signup Page
 * User registration page
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { getErrorMessage } from '../../utils/helpers';
import styles from './Auth.module.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName) {
      newErrors.displayName = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await signup(formData.email, formData.password, formData.displayName);
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Create Account</h1>
            <p className={styles.authSubtitle}>Join HouseHub today</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {errors.submit && (
              <div className={styles.errorAlert}>
                {errors.submit}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              error={errors.displayName}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />

            <Button type="submit" loading={loading} fullWidth>
              Sign Up
            </Button>
          </form>

          <p className={styles.authFooter}>
            Already have an account?{' '}
            <Link to="/login" className={styles.authLink}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
