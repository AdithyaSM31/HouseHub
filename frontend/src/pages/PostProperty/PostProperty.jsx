import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { propertyTypeLabels, furnishingStatusLabels, commonAmenities, indianStates } from '../../utils/helpers';

const PostProperty = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', propertyType: '', listingType: '',
    price: '', address: '', city: '', state: '', pincode: '',
    bedrooms: '', bathrooms: '', areaSqft: '', furnishingStatus: '',
    amenities: []
  });
  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        areaSqft: formData.areaSqft ? parseInt(formData.areaSqft) : null,
        images: imageUrls.split('\n').filter(url => url.trim()).map(url => url.trim())
      };
      await propertyService.createProperty(propertyData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Failed to create property. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Post Property</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Title" name="title" value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} required />
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description *</label>
          <textarea name="description" value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})} required
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '8px', fontFamily: 'inherit' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Property Type *</label>
            <select value={formData.propertyType} onChange={(e) => setFormData({...formData, propertyType: e.target.value})} required
              style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '8px' }}>
              <option value="">Select Type</option>
              {Object.entries(propertyTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Listing Type *</label>
            <select value={formData.listingType} onChange={(e) => setFormData({...formData, listingType: e.target.value})} required
              style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '8px' }}>
              <option value="">Select Type</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>
        </div>

        <Input label="Price (₹)" type="number" name="price" value={formData.price} 
          onChange={(e) => setFormData({...formData, price: e.target.value})} required />

        <Input label="Address" name="address" value={formData.address} 
          onChange={(e) => setFormData({...formData, address: e.target.value})} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Input label="City" name="city" value={formData.city} 
            onChange={(e) => setFormData({...formData, city: e.target.value})} required />
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>State *</label>
            <select value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} required
              style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '8px' }}>
              <option value="">Select State</option>
              {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>
          
          <Input label="Pincode" name="pincode" value={formData.pincode} 
            onChange={(e) => setFormData({...formData, pincode: e.target.value})} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Input label="Bedrooms" type="number" name="bedrooms" value={formData.bedrooms} 
            onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} />
          <Input label="Bathrooms" type="number" name="bathrooms" value={formData.bathrooms} 
            onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} />
          <Input label="Area (sqft)" type="number" name="areaSqft" value={formData.areaSqft} 
            onChange={(e) => setFormData({...formData, areaSqft: e.target.value})} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Furnishing Status</label>
          <select value={formData.furnishingStatus} onChange={(e) => setFormData({...formData, furnishingStatus: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '8px' }}>
            <option value="">Select Status</option>
            {Object.entries(furnishingStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Image URLs (one per line)</label>
          <textarea value={imageUrls} onChange={(e) => setImageUrls(e.target.value)}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '8px', fontFamily: 'monospace' }} />
          <small style={{ color: '#6b7280' }}>Enter image URLs from Unsplash or other sources, one per line</small>
        </div>

        <Button type="submit" loading={loading} fullWidth>Post Property</Button>
      </form>
    </div>
  );
};

export default PostProperty;
