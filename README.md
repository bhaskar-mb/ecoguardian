<div align="center">
  <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200&h=400" width="100%" style="border-radius: 24px;" />
  
  # 🛰️ EcoGuardian Sentinel
  ### Environmental Governance Grid & Real-time Incident Response
  
  [![GitHub license](https://img.shields.io/github/license/bhaskar-mb/ecoguard?style=flat-square&color=emerald)](https://github.com/bhaskar-mb/ecoguard/blob/main/LICENSE)
  [![Vite](https://img.shields.io/badge/Vite-6.x-blue?style=flat-square&logo=vite)](https://vitejs.dev/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-4.x-indigo?style=flat-square&logo=socket.io)](https://socket.io/)
</div>

---

## ⚡ Overview

**EcoGuardian** is a state-of-the-art environmental monitoring platform designed to bridge the gap between concerned citizens, administrative oversight, and field authorities. Leveraging **Real-time Synchronization** and **AI-powered Insights**, EcoGuardian ensures that every environmental threat is tracked, triaged, and resolved with total transparency.

## 🛡️ Key Features

*   **🛰️ Real-time Ops Center**: Live incident tracking with instant push notifications via Socket.io.
*   **🌓 Tri-Role Architecture**: Specialized dashboards for Citizens (User), Command (Admin), and field Response (Authority).
*   **💬 Eco-Cloud Intercom**: Real-time peer-to-peer communication channel for on-ground coordination.
*   **📸 Evidence Protocol**: Authority-side "Photo-of-Resolution" system to provide visual proof to reporters.
*   **🧠 Sentinel Insights**: Gemini AI-powered analysis of incoming reports for severity and anomaly detection.
*   **☁️ Resilient Offline Mode**: Graceful fallback to in-memory storage if the primary database is unreachable.

## 🛠️ Technology Stack

- **Frontend**: React 19, Motion (Framer), Tailwind CSS 4, Lucide Icons.
- **Backend**: Node.js (Express), Socket.io, Mongoose (MongoDB).
- **AI**: Google Generative AI (Gemini).
- **Communication**: Twilio (SMS Notifications).

## 🚀 Quick Start (Localhost)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhaskar-mb/ecoguard.git
   cd ecoguard
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file (see `.env.example`) to enable SMS and AI features.
   *Note: The app will run in "Developer Demo Mode" even without a database!*

4. **Launch the Sentinel Hub:**
   ```bash
   # Terminal 1: Start Backend (Port 5000)
   npm run start-backend

   # Terminal 2: Start Frontend (Port 3000)
   npm run dev
   ```

## 📈 Roadmap

- [ ] Predictive Anomaly Heatmaps.
- [ ] Direct NGO Integration for Wildlife Rescue.
- [ ] Exportable Environmental Governance PDF Reports.

---

<div align="center">
  <p>Built with ❤️ for a Greener Future.</p>
</div>
