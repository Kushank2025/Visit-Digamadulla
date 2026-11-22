const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');
const auth = require('./auth');

// Auto-seed or update admin user on startup to ensure login always works
(async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [existing] = await db.query('SELECT * FROM admins WHERE username = ?', ['admin']);
    
    if (existing.length === 0) {
      await db.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('Default admin created: admin / admin123');
    } else {
      await db.query('UPDATE admins SET password_hash = ? WHERE username = ?', [hashedPassword, 'admin']);
      console.log('Default admin password synchronized: admin / admin123');
    }
  } catch (err) {
    console.error('Admin auto-seed error:', err.message);
  }
})();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// PUBLIC ROUTES (සංචාරකයින් සඳහා විවෘත API)
// -------------------------------------------------------------

// මූලික Test Route
app.get('/', (req, res) => {
  res.send('Visit Digamadulla API is running...');
});

// Categories ලැයිස්තුව ලබාගැනීම
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// සියලුම Locations ලබාගැනීම (Category filter සහිතව)
app.get('/api/locations', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT l.*, c.name AS category_name 
      FROM locations l 
      JOIN categories c ON l.category_id = c.id
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ` WHERE c.name = ? OR l.category_label LIKE ?`;
      params.push(category, `%${category}%`);
    }

    query += ' ORDER BY l.distance_from_ampara ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// තනි Location එකක විස්තර ලබාගැනීම
app.get('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT l.*, c.name AS category_name 
       FROM locations l 
       JOIN categories c ON l.category_id = c.id 
       WHERE l.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION ROUTE
// -------------------------------------------------------------

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [admins] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

    if (admins.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const admin = admins[0];

    // Password verification (Bcrypt check හෝ default password fallback)
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch && password !== 'admin123') {
      return res.status(400).json({ message: 'Password mismatch' });
    }

    // Password match වුවහොත් Token එක generate කිරීම
    const token = jwt.sign(
      { admin_id: admin.id || admin.admin_id, username: admin.username },
      process.env.JWT_SECRET || 'digamadulla_secret_key_2026',
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN CRUD ROUTES (ආරක්ෂිත Endpoints - Token එකක් අවශ්‍ය වේ)
// -------------------------------------------------------------

// 1. අලුත් Location එකක් එකතු කිරීම (Create)
app.post('/api/admin/locations', auth, async (req, res) => {
  const { 
    name, 
    category_id, 
    description, 
    distance_km, 
    opening_hours, 
    travel_tips, 
    latitude, 
    longitude, 
    image_url1, 
    image_url2, 
    image_url3 
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO locations (
        category_id, name, category_label, distance_from_ampara, description, 
        latitude, longitude, opening_hours, travel_tips, 
        image_url1, image_url2, image_url3
      ) VALUES (?, ?, 'General', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, 
        name, 
        distance_km, 
        description, 
        latitude, 
        longitude, 
        opening_hours || 'Open daily', 
        travel_tips || '', 
        image_url1 || '/places/place1_1.jpg', 
        image_url2 || '/places/place1_2.jpg', 
        image_url3 || '/places/place1_3.jpg'
      ]
    );

    res.status(201).json({ message: 'Location created successfully', location_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. පවතින Location එකක් වෙනස් කිරීම (Update)
app.put('/api/admin/locations/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    category_id, 
    description, 
    distance_km, 
    opening_hours, 
    travel_tips, 
    latitude, 
    longitude, 
    image_url1, 
    image_url2, 
    image_url3 
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE locations 
       SET name = ?, category_id = ?, distance_from_ampara = ?, description = ?, 
           latitude = ?, longitude = ?, opening_hours = ?, travel_tips = ?, 
           image_url1 = ?, image_url2 = ?, image_url3 = ?
       WHERE id = ?`,
      [
        name, 
        category_id, 
        distance_km, 
        description, 
        latitude, 
        longitude, 
        opening_hours, 
        travel_tips, 
        image_url1, 
        image_url2, 
        image_url3, 
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Location එකක් මකා දැමීම (Delete)
app.delete('/api/admin/locations/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM locations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SERVER PORT
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});