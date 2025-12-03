/**
 * Input Component
 * Reusable text input with label and error message
 */

import styles from './Input.module.css';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${styles.input} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Input;
