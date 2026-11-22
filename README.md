# Visit Digamadulla

A full-stack day-tour planning web application for exploring regional attractions within a 25 km radius of the Ampara Clock Tower, Sri Lanka.

## Key Features

* **Destination Discovery & Filtering:** Browse 10 curated attractions across 4 categories (*Religious*, *Nature*, *Heritage*, and *Recreation*) with instant category filtering.
* **3-Image Local Galleries:** Each destination displays 3 high-resolution local photographs stored as static assets.
* **Interactive Spatial Map:** Built with Leaflet API, centered on Ampara (`[7.2912, 81.6724]`), featuring custom markers and location popups.
* **Dynamic Trip Planner:** Multi-spot itinerary builder that calculates cumulative trip distances in real time using the Haversine formula.
* **High GPS Precision:** Coordinates are stored as `DECIMAL(10,8)` in MySQL to prevent floating-point rounding errors on map markers.
* **Admin Control Panel:** JWT-protected dashboard supporting full CRUD operations (`POST`, `PUT`, `DELETE`) for managing destination records.

## Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Leaflet API
* **Backend:** Node.js, Express.js REST API, JSON Web Tokens (JWT), Bcrypt
* **Database:** MySQL 8.0 (InnoDB Engine)
* **Containerization:** Docker, Docker Compose

## Project Structure

```text
visit-digamadulla/
├── client/                 # React + Vite frontend
├── server/                 # Node.js + Express backend
├── docker-compose.yml      # Multi-container orchestration
├── init.sql                # Database schema and initial data
└── README.md               # Project documentation

```

## Setup & Installation

### Option 1: Run with Docker (Recommended)

Ensure **Docker Desktop** is running on your machine.

1. Clone the repository:
```bash
git clone [https://github.com/NethmiNisansalaWickramarathna/visit-digamadulla.git](https://github.com/NethmiNisansalaWickramarathna/visit-digamadulla.git)
cd visit-digamadulla

```


2. Build and start the containers:
```bash
docker compose up --build

```


3. Access the services:
* **Frontend:** `http://localhost:5173`


* **Backend API:** `http://localhost:5000`


* **MySQL Database:** Host port `3308` (mapped to container port `3306`)





### Option 2: Run Locally (Without Docker)

1. **Database:** Create a MySQL database named `visit_digamadulla_db` and import `init.sql`.
2. **Backend:**
```bash
cd server
npm install
npm run dev

```


3. **Frontend:**
```bash
cd client
npm install
npm run dev

```



## Security

* **Password Hashing:** Administrator passwords are encrypted using salted Bcrypt hashes (10 rounds).


* **Route Protection:** All data-modifying administrative endpoints are guarded by `authenticateToken` JWT middleware.


* **SQL Injection Protection:** Parameterized queries are used for all MySQL database operations.



## Academic Context

Developed for **ITE2953 – Programming Group Project - N.G.K.Kalhara**.


```

```
