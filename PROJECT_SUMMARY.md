# NeuroFleetX - Project Summary

## Overview

NeuroFleetX is a comprehensive AI-driven urban mobility optimization system with the following modules:

### ✅ Module 1: Authentication \& Role Management

* **Status**: Complete
* **Features**:

  * JWT-based authentication
  * Role-based access control (Admin, Fleet Manager, Driver, Customer)
  * Login and registration screens
  * Role-specific dashboard redirects
  * Secure password hashing with BCrypt

### ✅ Module 2: Fleet Inventory \& Vehicle Telemetry

* **Status**: Complete
* **Features**:

  * Vehicle CRUD operations
  * Real-time status tracking (Available, In Use, Maintenance, Out of Service)
  * GPS coordinate simulation
  * Battery/Fuel level monitoring
  * Telemetry data collection (speed, location, engine temp, tire pressure)
  * Automated telemetry simulation service (runs every 30 seconds)

### ✅ Module 3: AI Route \& Load Optimization Engine

* **Status**: Complete
* **Features**:

  * Python Flask microservice for route optimization
  * Multiple optimization types (Time, Distance, Energy)
  * Route polyline generation
  * Traffic-aware routing simulation
  * Energy consumption calculation
  * Integration with Spring Boot backend

### ✅ Module 4: Predictive Maintenance \& Health Analytics

* **Status**: Complete
* **Features**:

  * Vehicle health monitoring (Engine, Tire, Battery, Brake)
  * Health-based alert system (Healthy, Warning, Critical)
  * Maintenance prediction
  * Health metrics dashboard
  * Alert tables with actionable recommendations

### ✅ Module 5: Customer Booking \& Smart Recommendations

* **Status**: Complete
* **Features**:

  * Vehicle booking form with filters
  * AI-powered vehicle recommendations
  * Booking calendar integration
  * Vehicle filtering (Type, Seats, EV/Non-EV)
  * Recommended vehicles display with AI badges

### ✅ Module 6: Admin Dashboard \& Urban Mobility Insights

* **Status**: Complete
* **Features**:

  * KPI cards (Total Fleet, Trips Today, Active Routes, Total Users)
  * Fleet distribution heatmap using Leaflet.js
  * Hourly rental activity charts (Chart.js)
  * Real-time fleet status overview
  * Vehicle grid with status indicators

## Technology Stack

### Backend

* **Framework**: Spring Boot 3.2.0
* **Security**: Spring Security + JWT
* **Database**: MySQL 8.0
* **ORM**: JPA/Hibernate
* **Build Tool**: Maven

### Frontend

* **Framework**: React 19
* **Build Tool**: Vite
* **Routing**: React Router v6
* **Charts**: Chart.js, Recharts
* **Maps**: Leaflet.js, React-Leaflet
* **HTTP Client**: Axios

### AI Service

* **Framework**: Python Flask
* **Libraries**: NumPy for calculations
* **Algorithms**: Haversine distance, route optimization simulation

## Project Structure

```
neurofleet/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/
│   │   └── com/neurofleetx/
│   │       ├── controller/     # REST controllers
│   │       ├── service/         # Business logic
│   │       ├── repository/      # Data access
│   │       ├── model/           # Entity models
│   │       ├── dto/             # Data transfer objects
│   │       └── security/        # Security configuration
│   └── pom.xml
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/          # Reusable components
│   │   ├── context/             # React context (Auth)
│   │   └── App.jsx
│   └── package.json
├── ai-service/                  # Python Flask microservice
│   ├── app.py
│   └── requirements.txt
├── database/                    # Database scripts
│   ├── schema.sql
│   └── sample-data.sql
└── README.md
```

## Key Features Implemented

1. **Multi-Role Authentication System**

   * Secure JWT token-based authentication
   * Role-based dashboard routing
   * Protected routes with role checking
2. **Real-Time Vehicle Tracking**

   * GPS coordinate simulation
   * Live telemetry updates
   * Status-based filtering
3. **AI-Powered Route Optimization**

   * Multiple optimization strategies
   * Traffic-aware routing
   * Energy consumption prediction
4. **Predictive Maintenance**

   * Health monitoring system
   * Alert generation
   * Maintenance scheduling
5. **Smart Vehicle Recommendations**

   * AI-based vehicle matching
   * Preference-based filtering
   * Booking calendar integration
6. **Comprehensive Dashboards**

   * Role-specific views
   * Real-time metrics
   * Interactive maps and charts

## Default Credentials

### Admin

* Username: `admin`
* Password: `admin123`
* Role: ADMIN

### Test Users

All test users use password: `password123`

* Fleet Manager: `fleetmanager1`
* Driver: `driver1`
* Customer: `customer1`, `customer2`

## API Endpoints

### Authentication

* `POST /api/auth/login` - User login
* `POST /api/auth/register` - User registration

### Vehicles

* `GET /api/vehicles` - List all vehicles
* `GET /api/vehicles/{id}` - Get vehicle details
* `POST /api/vehicles` - Create vehicle
* `PUT /api/vehicles/{id}` - Update vehicle
* `DELETE /api/vehicles/{id}` - Delete vehicle
* `GET /api/vehicles/status/{status}` - Filter by status

### Routes

* `POST /api/routes/optimize` - Optimize route using AI

## Next Steps for Enhancement

1. **Google Maps Integration**

   * Add Google Maps API key
   * Real-time traffic data
   * Enhanced route visualization
2. **WebSocket Implementation**

   * Real-time vehicle location updates
   * Live dashboard updates
   * Push notifications
3. **Email Service**

   * Booking confirmations
   * Maintenance alerts
   * System notifications
4. **Advanced AI Features**

   * Machine learning model training
   * Historical data analysis
   * Predictive analytics
5. **Reporting \& Export**

   * CSV/PDF report generation
   * Analytics export
   * Custom report builder
6. **Mobile App**

   * React Native application
   * Driver mobile interface
   * Customer mobile booking

## Running the Application

See `SETUP.md` for detailed setup instructions.

Quick start:

1. Set up MySQL database
2. Run backend: `cd backend \\\\\\\&\\\\\\\& mvn spring-boot:run`
3. Run AI service: `cd ai-service \\\\\\\&\\\\\\\& python app.py`
4. Run frontend: `cd frontend \\\\\\\&\\\\\\\& npm install \\\\\\\&\\\\\\\& npm run dev`

## Notes

* The password hash in sample-data.sql uses BCrypt. For production, ensure all passwords are properly hashed.
* Telemetry simulation runs automatically every 30 seconds for vehicles in "IN\_USE" status.
* The AI service includes fallback logic if the service is unavailable.
* Maps use OpenStreetMap by default (no API key required).

