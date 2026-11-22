import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, Navigation, Calendar, Info, Trash2, ArrowUp, ArrowDown, 
  Lock, LogIn, LogOut, PlusCircle, Edit3, X, CheckCircle 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PlaceCard from './PlaceCard'; 

// Leaflet default marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'planner' | 'admin'
  const [itinerary, setItinerary] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin Auth State
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Location Form (Create / Edit) State
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    description: '',
    distance_km: '',
    opening_hours: '',
    travel_tips: '',
    latitude: '',
    longitude: '',
    image_url1: '',
    image_url2: '',
    image_url3: ''
  });

  useEffect(() => {
    fetchLocations();
    fetchCategories();
  }, []);

  const fetchLocations = async (category = 'All') => {
    try {
      setLoading(true);
      const url = category === 'All' ? `${API_BASE}/locations` : `${API_BASE}/locations?category=${category}`;
      const res = await axios.get(url);
      setLocations(res.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    fetchLocations(categoryName);
  };

  // Itinerary Controls
  const addToItinerary = (location) => {
    const locId = location.location_id || location.id;
    if (!itinerary.some(item => (item.location_id || item.id) === locId)) {
      setItinerary([...itinerary, location]);
    }
  };

  const removeFromItinerary = (id) => {
    setItinerary(itinerary.filter(item => (item.location_id || item.id) !== id));
  };

  const moveItem = (index, direction) => {
    const newItinerary = [...itinerary];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newItinerary.length) {
      const temp = newItinerary[index];
      newItinerary[index] = newItinerary[targetIndex];
      newItinerary[targetIndex] = temp;
      setItinerary(newItinerary);
    }
  };

  const totalDistance = itinerary.reduce((acc, curr) => acc + parseFloat(curr.distance_from_ampara || curr.distance_km || 0), 0).toFixed(1);

  // Admin Authentication Handlers
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_BASE}/admin/login`, loginForm);
      localStorage.setItem('adminToken', res.data.token);
      setAdminToken(res.data.token);
      setLoginForm({ username: '', password: '' });
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  // Admin CRUD Handlers
  const resetForm = () => {
    setFormData({
      name: '',
      category_id: categories[0]?.category_id || categories[0]?.id || 1,
      description: '',
      distance_km: '',
      opening_hours: '',
      travel_tips: '',
      latitude: '',
      longitude: '',
      image_url1: '',
      image_url2: '',
      image_url3: ''
    });
    setEditingLocationId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      if (editingLocationId) {
        await axios.put(`${API_BASE}/admin/locations/${editingLocationId}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/admin/locations`, formData, config);
      }
      resetForm();
      fetchLocations(selectedCategory);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEditClick = (loc) => {
    const locId = loc.location_id || loc.id;
    setEditingLocationId(locId);
    setFormData({
      name: loc.name,
      category_id: loc.category_id,
      description: loc.description,
      distance_km: loc.distance_from_ampara || loc.distance_km,
      opening_hours: loc.opening_hours || '',
      travel_tips: loc.travel_tips || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
      image_url1: loc.image_url1 || '',
      image_url2: loc.image_url2 || '',
      image_url3: loc.image_url3 || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attraction?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.delete(`${API_BASE}/admin/locations/${id}`, config);
      fetchLocations(selectedCategory);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-amber-300" />
            <h1 className="text-xl font-bold tracking-wide">Visit Digamadulla</h1>
          </div>
          <nav className="flex space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'explore' ? 'bg-white text-emerald-800 shadow' : 'hover:bg-emerald-600'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'planner' ? 'bg-white text-emerald-800 shadow' : 'hover:bg-emerald-600'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Planner ({itinerary.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'admin' ? 'bg-white text-emerald-800 shadow' : 'hover:bg-emerald-600'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {/* TAB 1: EXPLORE VIEW */}
        {activeTab === 'explore' && (
          <div>
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2">Category:</span>
              <button
                onClick={() => handleCategoryChange('All')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedCategory === 'All'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-300 hover:bg-slate-100'
                }`}
              >
                All Places
              </button>
              {categories.map((cat) => {
                const catName = cat.category_name || cat.name;
                const catId = cat.category_id || cat.id;
                return (
                  <button
                    key={catId}
                    onClick={() => handleCategoryChange(catName)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                      selectedCategory === catName
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>

            {/* Content Split: Cards Grid & Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                {loading ? (
                  <p className="text-center py-12 text-slate-400">Loading attractions...</p>
                ) : locations.length === 0 ? (
                  <p className="text-center py-12 text-slate-400">No attractions found for this category.</p>
                ) : (
                  /* Places Grid with 3 Photos */
                  <div className="grid grid-cols-1 gap-5">
                    {locations.map((place) => {
                      const placeId = place.location_id || place.id;
                      const isAdded = itinerary.some(i => (i.location_id || i.id) === placeId);
                      return (
                        <div key={placeId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                          <PlaceCard loc={place} />
                          
                          {/* Action Buttons */}
                          <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => setSelectedPlace(place)}
                              className="flex-1 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center space-x-1"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                            <button
                              onClick={() => addToItinerary(place)}
                              disabled={isAdded}
                              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                                isAdded
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isAdded ? 'Added' : '+ Add to Plan'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Map Section */}
              <div className="lg:col-span-5 h-[560px] sticky top-20">
                <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 p-2">
                  <MapContainer
                    center={[7.2954, 81.6782]}
                    zoom={10}
                    scrollWheelZoom={false}
                    className="h-full w-full rounded-lg"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {locations.map((place) => {
                      const placeId = place.location_id || place.id;
                      return (
                        <Marker
                          key={placeId}
                          position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
                        >
                          <Popup>
                            <div className="text-xs p-1">
                              <strong className="block text-emerald-800 text-sm font-bold">{place.name}</strong>
                              <p className="mt-1 text-slate-600">
                                {place.distance_from_ampara || place.distance_km} km from town
                              </p>
                              <button
                                onClick={() => addToItinerary(place)}
                                className="mt-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2 rounded w-full font-semibold"
                              >
                                Add to Itinerary
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ITINERARY PLANNER VIEW */}
        {activeTab === 'planner' && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Your One-Day Travel Route</h2>
                <p className="text-xs text-slate-500">Plan and optimize the sequence of your regional stops</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total Est. Distance</span>
                <span className="text-xl font-black text-emerald-700">{totalDistance} km</span>
              </div>
            </div>

            {itinerary.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Your itinerary is empty.</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="mt-3 text-xs text-emerald-600 font-bold hover:underline"
                >
                  Browse locations and add stops
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {itinerary.map((item, index) => {
                  const itemId = item.location_id || item.id;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                          <p className="text-xs text-slate-500">
                            {item.distance_from_ampara || item.distance_km} km | Hours: {item.opening_hours || 'Open daily'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === itinerary.length - 1}
                          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => removeFromItinerary(itemId)}
                          className="p-1 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMIN DASHBOARD & CRUD */}
        {activeTab === 'admin' && (
          <div className="max-w-5xl mx-auto">
            {!adminToken ? (
              /* Admin Login Card */
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Lock className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-bold text-slate-800">Admin Authentication</h2>
                </div>
                {loginError && (
                  <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                    {loginError}
                  </div>
                )}
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-emerald-600"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-emerald-600"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition"
                  >
                    Login to Dashboard
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Admin Management Area */
              <div className="space-y-6">
                {/* Admin Top Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Destination Control Center</h2>
                    <p className="text-xs text-slate-500">Manage, edit, or append attraction records</p>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Form: Add / Edit Attraction */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      {editingLocationId ? 'Edit Attraction Record' : 'Add New Regional Attraction'}
                    </h3>
                    {editingLocationId && (
                      <button
                        onClick={resetForm}
                        className="text-xs text-slate-500 hover:underline flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel Edit</span>
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Attraction Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      >
                        {categories.map((c) => {
                          const cId = c.category_id || c.id;
                          const cName = c.category_name || c.name;
                          return (
                            <option key={cId} value={cId}>
                              {cName}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                      <textarea
                        rows="2"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Distance (km from town)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.distance_km}
                        onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Opening Hours</label>
                      <input
                        type="text"
                        value={formData.opening_hours}
                        onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Image 1 URL / Path</label>
                      <input
                        type="text"
                        value={formData.image_url1}
                        onChange={(e) => setFormData({ ...formData, image_url1: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                        placeholder="/places/place1_1.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Image 2 URL / Path</label>
                      <input
                        type="text"
                        value={formData.image_url2}
                        onChange={(e) => setFormData({ ...formData, image_url2: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                        placeholder="/places/place1_2.jpg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Image 3 URL / Path</label>
                      <input
                        type="text"
                        value={formData.image_url3}
                        onChange={(e) => setFormData({ ...formData, image_url3: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                        placeholder="/places/place1_3.jpg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Travel Tips</label>
                      <input
                        type="text"
                        value={formData.travel_tips}
                        onChange={(e) => setFormData({ ...formData, travel_tips: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{editingLocationId ? 'Update Record' : 'Save New Attraction'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Table: Existing Attractions */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                        <th className="p-3">Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Distance</th>
                        <th className="p-3">Coordinates</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {locations.map((loc) => {
                        const locId = loc.location_id || loc.id;
                        return (
                          <tr key={locId} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800">{loc.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                                {loc.category_name || loc.category_label}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">
                              {loc.distance_from_ampara || loc.distance_km} km
                            </td>
                            <td className="p-3 text-slate-400 font-mono text-[11px]">
                              {parseFloat(loc.latitude).toFixed(3)}, {parseFloat(loc.longitude).toFixed(3)}
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleEditClick(loc)}
                                className="p-1 rounded text-slate-600 hover:bg-slate-200"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLocation(locId)}
                                className="p-1 rounded text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Place Details Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            {/* Modal Image Gallery */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1">
              <img 
                src={selectedPlace.image_url1 || selectedPlace.image_url} 
                alt={selectedPlace.name} 
                className="h-32 w-full object-cover rounded" 
                onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=Photo+1'; }}
              />
              <img 
                src={selectedPlace.image_url2 || selectedPlace.image_url1} 
                alt={selectedPlace.name} 
                className="h-32 w-full object-cover rounded" 
                onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=Photo+2'; }}
              />
              <img 
                src={selectedPlace.image_url3 || selectedPlace.image_url1} 
                alt={selectedPlace.name} 
                className="h-32 w-full object-cover rounded" 
                onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=Photo+3'; }}
              />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {selectedPlace.category_name || selectedPlace.category_label}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1">{selectedPlace.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedPlace.description}</p>
              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p><strong>Distance:</strong> {selectedPlace.distance_from_ampara || selectedPlace.distance_km} km from Ampara Town</p>
                <p><strong>Hours:</strong> {selectedPlace.opening_hours || 'Open daily'}</p>
                <p><strong>Tips:</strong> {selectedPlace.travel_tips || 'Wear comfortable footwear.'}</p>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    addToItinerary(selectedPlace);
                    setSelectedPlace(null);
                  }}
                  className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Add to Planner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}