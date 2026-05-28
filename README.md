# Intelligent Sales System

Backend system for sales management in SMEs (PYMES), designed with a modular architecture and extended with data analysis and basic predictive capabilities.

## 🚀 Overview

This project implements a REST API for managing products, clients, and sales, combined with a data analysis layer that transforms operational data into actionable insights.

The system is designed to be domain-independent and applicable to different business sectors (retail, textile, distribution, etc.).

## 🧠 Key Features

* CRUD management for:

  * Products
  * Clients
  * Sales
* JWT-based authentication
* Modular backend architecture
* Data persistence with SQLite
* Data analysis using Python (Pandas, Matplotlib)
* Business insights:

  * Sales per month
  * Top-selling products
  * Most active clients
* Basic sales prediction model

## 🏗️ Architecture

Backend:

* Node.js + Express
* SQLite (relational database)
* REST API

Data Layer:

* Python
* Pandas
* Matplotlib
* Scikit-learn

```text
Node.js API → SQLite → Python Analysis → Insights / Prediction
```

## 📊 Example Outputs

* `ventas_mes.png` → monthly sales trend
* `top_productos.png` → most sold products
* `prediccion_ventas.png` → future sales estimation

## ⚙️ Installation

```bash
git clone https://github.com/Carlsalf/intelligent-sales-system.git
cd intelligent-sales-system
npm install
```

Run backend:

```bash
npm run dev
```

Run analysis:

```bash
cd data-analysis
source venv/bin/activate
python analysis.py
```

## 💼 Technical Stack

* Backend: Node.js, Express
* Database: SQLite
* Data Analysis: Python, Pandas, Matplotlib, Scikit-learn
* Auth: JWT

## 🎯 Purpose

This project was developed as part of a Master’s thesis, with the goal of evolving traditional sales systems into data-driven platforms that support decision-making.

## 👨‍💻 Author

Carlos Alfredo Callagua
Master’s Degree in Software Engineering – University of Alicante
Based in Alicante, Spain

LinkedIn: https://linkedin.com/in/carlscallagua
