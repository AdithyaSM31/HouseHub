/**
 * Login Page
 * User authentication page with email/password and Google OAuth
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { getErrorMessage } from '../../utils/helpers';
import styles from './Auth.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Welcome Back</h1>
            <p className={styles.authSubtitle}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {errors.submit && (
              <div className={styles.errorAlert}>
                {errors.submit}
              </div>
            )}

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
              placeholder="Enter your password"
              required
            />

            <Button type="submit" loading={loading} fullWidth>
              Sign In
            </Button>
          </form>

          <p className={styles.authFooter}>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.authLink}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
