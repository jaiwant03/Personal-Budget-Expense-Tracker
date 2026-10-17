# BudgetFlow - Personal Budget & Expense Tracker (MERN Stack)

A modern, high-performance personal finance and budget tracker converted to **React**, powered by **Node.js/Express**, and storing all records in a **MongoDB** database while preserving 100% of the original exact UI and design system.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Chart.js, Vanilla CSS (Exact Pixel-Perfect Design)
- **Backend**: Node.js, Express 5, CORS, Dotenv
- **Database**: MongoDB with Mongoose ODM
- **Tooling**: Concurrently (simultaneous fullstack development)

---

## 📁 Project Architecture

```
Personal Budget & Expense Tracker/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation header with actions
│   │   │   ├── SummaryCards.jsx        # Balance, Income, Expenses, Savings
│   │   │   ├── BudgetSection.jsx       # Monthly budget progress & status
│   │   │   ├── TransactionsSection.jsx # Table with search, filter & actions
│   │   │   ├── TransactionModal.jsx    # Add / Edit transaction dialog
│   │   │   ├── BudgetModal.jsx         # Set monthly budget dialog
│   │   │   └── VisualChartsModal.jsx   # Doughnut, Bar & Line charts
│   │   ├── services/
│   │   │   └── api.js                  # Frontend API service
│   │   ├── utils/
│   │   │   └── formatters.js           # Currency & date formatters
│   │   ├── App.jsx                     # Main application state & controller
│   │   ├── index.css                   # Exact pixel-perfect stylesheet
│   │   └── main.jsx                    # React DOM entry point
│   ├── index.html                      # HTML entry
│   ├── vite.config.js                  # Vite server & /api proxy to backend
│   └── package.json                    # Client dependencies
├── models/
│   ├── Transaction.js                  # Mongoose Transaction Schema
│   └── Budget.js                       # Mongoose Monthly Budget Schema
├── data/
│   └── budget-data.json                # Seed / backup data (auto-migrated)
├── server.js                           # Express API server with MongoDB
├── .env                                # Environment configuration
├── .env.example                        # Template for environment variables
├── package.json                        # Root dependencies and scripts
└── README.md
```

---

## ⚡ Quick Start

### 1. Ensure MongoDB is Running
MongoDB should be active on your machine or you can specify an external connection URI in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/budgetflow
```

### 2. Start Fullstack Development
Run both the Express/MongoDB server and the React Vite dev server together with a single command:
```bash
npm run dev
```
- **React App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **MongoDB Database**: `mongodb://127.0.0.1:27017/budgetflow`

---

## 🛠 Available NPM Scripts

From the root directory:

| Command | Action |
|---|---|
| `npm run dev` | Runs both Backend server and React Client concurrently |
| `npm run server` | Starts only the Express/MongoDB backend server |
| `npm run client` | Starts only the Vite React frontend development server |
| `npm run build` | Builds the React frontend for production (`client/dist`) |
| `npm start` | Starts the Express server in production mode (serves built React bundle) |

---

## 📊 Features & UI Highlights

- **100% Exact UI Preservation**: Identical typography, mint & slate color scheme, hover animations, and SVG iconography.
- **Persistent MongoDB Storage**: All transactions (Add, Edit, Delete, Clear All) and monthly budget configurations are saved to MongoDB collections.
- **Automatic Migration**: On initial startup, existing records from `data/budget-data.json` are automatically imported into MongoDB.
- **Interactive Visual Charts**:
  - **Expense Breakdown**: Donut chart with category percentages and totals.
  - **Income vs Expense**: Comparative bar chart with net balance status.
  - **Monthly Spending Trend**: Historical line chart across all months.
- **Search & Filters**: Real-time text search, type filtering (Income / Expense), and monthly timeframes.
