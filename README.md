# 📦 Order Tracking System - Mobile App

A cross-platform mobile application built with React Native and Firebase, designed to streamline order management for organizations. The app provides role-based access for Admins, Sales, and Shipment staff, offering real-time updates, push notifications, and visual reporting capabilities.

---

## 🔧 Features

### 🔑 Role-Based Functionality

* **Admin**: Manage all orders, approve/reject submissions, oversee user roles, and access detailed reports.
* **Sales**: Create new orders, track revisions, and monitor the status of submitted orders.
* **Shipment**: View assigned orders, update delivery status, and review completed shipments.

### 📅 Order Lifecycle Management

* Create, update, and view order details.
* Attach and preview invoices.
* Monitor revision and approval status.

### 🌐 Notifications

* Push notifications using Expo for real-time updates on order status changes and task assignments.

### 📊 Reporting

* Visual dashboards and charts using `react-native-chart-kit`.
* Filter reports by sales personnel and order status.

---

## 📑 Project Structure

```
.
├── App.tsx                 # Entry point, handles authentication and navigation
├── Main.js                 # Role-based screen routing
├── Screens/               # UI components for each role and task
│   ├── SiparisEkle.js     # Add new orders
│   ├── SiparisListesi.js  # View orders by role
│   ├── SiparisDetay.js    # Detailed order view
│   ├── AdminDurumPaneli.js# Admin dashboard
│   ├── Raporlama.js       # Reporting and analytics
│   ├── KullaniciYonetimi.js # User management
│   ├── OnayBekleyenler.js # Approval queue
│   └── Revizeler.js       # Revisions tracking
```

---

## 📁 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YourUsername/OrderTrackingSystem-MobileApp.git
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the app:

   ```bash
   npm start
   ```

---

## 🚀 Technologies Used

* **React Native** + **Expo**
* **Firebase** (Auth & Realtime Database)
* **React Navigation**
* **Expo Notifications**
* **React Native Chart Kit**

---


## ✨ Contribution

Contributions are welcome! Feel free to fork the repository and submit a pull request.

---

## 👨‍💼 Contributors
Muhammet Enes DEMIRKOL – Project Developer
