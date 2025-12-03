/**
 * Main App Component
 * Sets up routing and context providers
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Properties from './pages/Properties/Properties';
import PropertyDetails from './pages/PropertyDetails/PropertyDetails';
import PostProperty from './pages/PostProperty/PostProperty';
import EditProperty from './pages/EditProperty/EditProperty';
import Dashboard from './pages/Dashboard/Dashboard';
import Bookmarks from './pages/Bookmarks/Bookmarks';
import Messages from './pages/Messages/Messages';
import Profile from './pages/Profile/Profile';
import PrivateRoute from './components/common/PrivateRoute';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              
              {/* Protected Routes */}
              <Route path="/post-property" element={
                <PrivateRoute><PostProperty /></PrivateRoute>
              } />
              <Route path="/edit-property/:id" element={
                <PrivateRoute><EditProperty /></PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              <Route path="/bookmarks" element={
                <PrivateRoute><Bookmarks /></PrivateRoute>
              } />
              <Route path="/messages" element={
                <PrivateRoute><Messages /></PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute><Profile /></PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
