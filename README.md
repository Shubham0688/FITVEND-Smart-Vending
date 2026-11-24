# FITVEND — Smart Personalized Protein Vending Machine

A full-stack MERN-style student project based on the FitVend presentation. It includes a React/Vite frontend, Express REST API, and MongoDB persistence with an automatic in-memory demo fallback.

## Features mapped to the slides
- Member login/profile form representing QR/RFID entry.
- Height, weight, age, fitness goal and workout input.
- BMI display for adults only; no BMI category or protein-dose prescription is made.
- Preference-based catalogue filters (vegetarian, vegan, lactose-free).
- Product wall for shakes, bars and drinks, stock counts and demo purchase flow.
- UPI checkout is simulated; no real payment is collected.
- Order history, rewards-ready order data, admin overview and stock API.
- Responsive layout for desktop and mobile.

## Requirements
- Node.js 18+ and npm
- MongoDB optional (the API runs in demo-memory mode if MongoDB is not available)

## Run locally
Open two terminals.

### 1. Start backend
```bash
cd server
npm install
# Optional: copy .env.example to .env and set MONGODB_URI
npm run dev
```
API: http://localhost:5000/api/health

### 2. Start frontend
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally http://localhost:5173).

If your API runs somewhere else, create `client/.env` with:
```env
VITE_API_URL=http://localhost:5000/api
```

## Demo workflow
1. Open Machine and enter a member profile.
2. Select goal/workout and click **Get product suggestions**.
3. Filter products and click **Add +**. The demo checkout confirms the order and reduces stock.
4. Open **My orders** to see order history.
5. Open **Admin** to see stock and demo revenue.

## API endpoints
- `GET /api/health`
- `GET /api/products`
- `POST /api/recommend` — profile-based preference suggestions; not medical advice.
- `POST /api/orders` — simulated checkout and stock deduction.
- `GET /api/orders`
- `GET /api/admin/summary`
- `PATCH /api/admin/products/:id/stock` with `{ "stock": 20 }`

## Important prototype limitations
QR/RFID hardware, motors, sensors, fresh-mix dispensing, live UPI payment gateway, SMS/WhatsApp alerts and real gym membership verification are not connected. The UI demonstrates those workflows only. Add certified hardware, payment provider integration, security review and qualified nutritionist review before any real deployment. Do not use BMI or this demo to decide supplement doses. For anyone under 18, nutrition decisions should be discussed with a parent/guardian and qualified healthcare professional.
