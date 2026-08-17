# Intelligent Sales System

Intelligent Sales System is a modular, multiplatform sales management system for SMEs, developed as part of the Master's Thesis (TFM) at the University of Alicante.

The solution integrates a shared backend, a web-based administration platform, a mobile eCommerce application, and a mobile analytics application oriented toward decision support.

## System Overview

The project follows a modular architecture in which the different client applications consume a common REST API and share the same business data.

```text
                         ┌──────────────────────────────┐
                         │    Intelligent Sales API     │
                         │ Node.js · Express · SQLite   │
                         │ JWT · Business Rules · REST  │
                         └──────────────┬───────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
        ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │ Web Backoffice    │ │ Mobile eCommerce  │ │ Mobile Analytics  │
        │ React + Vite      │ │ React Native      │ │ React Native      │
        │ Management        │ │ Expo              │ │ Expo              │
        └───────────────────┘ └───────────────────┘ └───────────────────┘
```



## Main Components

### Backend API

The backend provides the common application and business layer for the complete system.

Main responsibilities:

- Authentication using JWT.
- User and role management.
- Product and category management.
- Customer management.
- Sales and order processing.
- Shopping cart and checkout operations.
- Stock reservation and commitment rules.
- Delivery estimation.
- Commercial analytics and decision-support endpoints.
- SQLite relational persistence.

Technology:

- Node.js
- Express
- SQLite
- JWT

### Web Administration Platform

Located in:

```text
intelligent-sales-frontend/
```

Web backoffice developed with React and Vite for operational and administrative management.

Main modules include:

- Dashboard
- Products
- Customers
- Sales
- Users
- Commercial analytics

Technology:

- React
- Vite
- React Router
- Axios

### Mobile eCommerce Application

Located in:

```text
intelligent-sales-store-mobile/
```

Customer-oriented mobile application implementing the eCommerce purchasing workflow.

Main functionality:

- Customer authentication and registration.
- Product catalogue.
- Product detail.
- Persistent shopping cart.
- Checkout process.
- Delivery selection.
- Order confirmation.
- Purchase/order tracking.

Technology:

- React Native
- Expo
- Expo Router
- TypeScript
- Secure Store

### Mobile Analytics Application

Located in:

```text
intelligent-sales-analytics-mobile/
```

Mobile application designed as an executive analytics and decision-support interface.

Main functionality:

- Secure authentication.
- Executive sales summary.
- Commercial KPIs.
- Monthly sales evolution.
- Product performance.
- Customer performance.
- Sales projection.
- Business recommendations.

Technology:

- React Native
- Expo
- Expo Router
- TypeScript
- Secure Store
## Data Analysis

The project also contains an exploratory data-analysis layer:

```text
data-analysis/
```

It supports the analysis of historical sales information and experimentation with indicators and basic prediction mechanisms.

Technologies include:

- Python
- Pandas
- Matplotlib
- Scikit-learn

## Project Structure

```text
tfm-pyme-ventas-api/
│
├── src/                                # Backend API
├── tests/                              # Backend smoke tests
├── data-analysis/                      # Data analysis
├── docs/                               # Project documentation
│
├── intelligent-sales-frontend/         # Web administration platform
├── intelligent-sales-store-mobile/     # Mobile eCommerce application
├── intelligent-sales-analytics-mobile/ # Mobile analytics application
│
├── package.json
└── README.md
```

## Running the Project

### Backend

From the project root:

```bash
npm install
npm run dev
```

The backend must be running before the web or mobile clients attempt to access the API.

### Web Application

```bash
cd intelligent-sales-frontend
npm install
npm run dev
```

### Mobile eCommerce

```bash
cd intelligent-sales-store-mobile
npm install
npx expo start
```

### Mobile Analytics

```bash
cd intelligent-sales-analytics-mobile
npm install
npx expo start
```

The mobile applications use `EXPO_PUBLIC_API_URL` to configure access to the backend API.

Example for local-network testing:

```text
EXPO_PUBLIC_API_URL=http://<LOCAL_IP>:3001/api
```

## iOS Build

Both mobile applications are configured for Expo Application Services (EAS) Build.

The project includes build profiles for development, preview, production, and iOS Simulator.

Example:

```bash
npx eas-cli@latest build --platform ios --profile ios-simulator
```

Successful standalone iOS Simulator builds have been generated, installed, and executed for both mobile applications.

Production distribution through App Store Connect/TestFlight requires the corresponding Apple Developer Team signing and distribution credentials.

## Validation

The project includes several validation levels.

Backend smoke tests:

```bash
npm test
```

Mobile TypeScript and Expo compatibility checks:

```bash
npx tsc --noEmit
npx expo install --check
```

The mobile applications have additionally been validated through EAS-generated iOS Simulator builds.

## Technical Stack

| Layer | Technologies |
| --- | --- |
| Backend | Node.js, Express |
| Database | SQLite |
| Authentication | JWT |
| Web | React, Vite, React Router, Axios |
| Mobile | React Native, Expo, Expo Router, TypeScript |
| Secure mobile storage | Expo Secure Store |
| Data analysis | Python, Pandas, Matplotlib, Scikit-learn |
| iOS build | Expo Application Services (EAS) |

## Academic Purpose

This project was developed as part of the Master's Thesis:

**“Diseño e implementación de una arquitectura modular para sistemas móviles de gestión comercial en PYMES orientada a la toma de decisiones basada en datos.”**

The project demonstrates how a modular architecture can support multiple interfaces and business processes over a shared information and service layer.

The resulting system integrates web-based operational management, mobile commerce, and mobile data-driven decision support within the same architecture.

## Author

**Carlos Alfredo Callagua Llaque**

Master's Degree in Software Development for Mobile Devices  
University of Alicante
