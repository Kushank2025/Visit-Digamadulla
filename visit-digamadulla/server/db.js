const mysql = require('mysql2');
require('dotenv').config();

// MySQL connection pool එකක් සෑදීම
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database සම්බන්ධතාවය නිවැරදිදැයි පරීක්ෂා කිරීම
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database Connected Successfully to visit_digamadulla_db');
    connection.release();
  }
});

module.exports = pool.promise();