CREATE DATABASE IF NOT EXISTS visit_digamadulla_db;
USE visit_digamadulla_db;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_label VARCHAR(50) NOT NULL,
    distance_from_ampara DECIMAL(5, 2) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    image_url1 VARCHAR(255) NOT NULL,
    image_url2 VARCHAR(255) NOT NULL,
    image_url3 VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 3. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Seeds
INSERT INTO categories (id, name) VALUES
(1, 'Religious'),
(2, 'Nature & Wildlife'),
(3, 'Heritage & Historical'),
(4, 'Landmark & Recreation')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Table 2 හි නියම ස්ථාන 10 (Exact Details + Local Images 3 බැගින්)
INSERT INTO locations (id, category_id, name, category_label, distance_from_ampara, description, latitude, longitude, image_url1, image_url2, image_url3) VALUES
(1, 1, 'Manddala Maha Viharaya', 'Religious', 1.50, 'A venerated religious site located close to the town center, ideal for quick spiritual visits.', 7.29540000, 81.67820000, '/places/place1_1.jpg', '/places/place1_2.jpg', '/places/place1_3.jpg'),

(2, 4, 'Ampara Peace Pagoda & Tank', 'Religious / Landmark', 3.50, 'A Japanese Peace Pagoda situated near the Ampara tank; a serene location perfect for evening relaxation.', 7.28850000, 81.66600000, '/places/place2_1.jpg', '/places/place2_2.jpg', '/places/place2_3.jpg'),

(3, 4, 'Kondawattawan Tank', 'Nature / Recreation', 4.90, 'A large, scenic reservoir surrounded by nature, offering beautiful sunset views for families.', 7.27210000, 81.64950000, '/places/place3_1.jpg', '/places/place3_2.jpg', '/places/place3_3.jpg'),

(4, 1, 'Samanabedda Aranya Senasanaya', 'Religious / Nature', 7.00, 'A tranquil forest hermitage offering a peaceful environment for meditation and spiritual reflection.', 7.26120000, 81.71450000, '/places/place4_1.jpg', '/places/place4_2.jpg', '/places/place4_3.jpg'),

(5, 1, 'Buddhangala Monastery', 'Religious / Nature', 7.40, 'An ancient, serene forest monastery built on massive rock formations, frequently visited by wild elephants.', 7.33280000, 81.71320000, '/places/place5_1.jpg', '/places/place5_2.jpg', '/places/place5_3.jpg'),

(6, 2, 'Hingurana Tank', 'Nature', 11.00, 'A quiet and beautiful water body situated near the old sugar factory zone, surrounded by natural flora.', 7.23400000, 81.72890000, '/places/place6_1.jpg', '/places/place6_2.jpg', '/places/place6_3.jpg'),

(7, 3, 'Owagiriya Natabun Viharaya', 'Heritage', 17.00, 'An important archaeological site featuring ancient ruins that reflect the historical significance of the region.', 7.17250000, 81.60330000, '/places/place7_1.jpg', '/places/place7_2.jpg', '/places/place7_3.jpg'),

(8, 3, 'Deeghawapiya Stupa', 'Religious / Heritage', 18.00, 'One of the sixteen sacred places in Sri Lanka, holding immense historical and religious value.', 7.21850000, 81.79250000, '/places/place8_1.jpg', '/places/place8_2.jpg', '/places/place8_3.jpg'),

(9, 4, 'Inginiyagala Dam & Reservoir', 'Landmark / Nature', 22.00, 'Part of the massive Senanayake Samudraya bordering the Gal Oya National Park, offering breathtaking views.', 7.20010000, 81.52780000, '/places/place9_1.jpg', '/places/place9_2.jpg', '/places/place9_3.jpg'),

(10, 3, 'Rajagala Archaeology Site', 'Heritage / Nature', 25.00, 'A vast, mountainous archaeological reserve featuring ancient caves and ruins.', 7.42000000, 81.61500000, '/places/place10_1.jpg', '/places/place10_2.jpg', '/places/place10_3.jpg')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Default Admin User (Password: admin123)
INSERT INTO admins (id, username, password_hash) VALUES
(1, 'admin', '$2a$10$w8T0Mh8e6r6T8tM7qZlWMeWp0XoG4HnE5tK.J3rRkC5vL1o7hQyq6')
ON DUPLICATE KEY UPDATE username=VALUES(username);