```markdown
# MessMate — Smart Bachelor Mess Manager (Backend)

MessMate is a full-stack backend service built for shared bachelor messes in South Asia. It handles user authentication, mess creation via invite codes, daily meal tracking with deadlines, grocery (bazar) expense logging with receipt uploads, automated monthly bill and meal-rate calculations, and payment tracking.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js + Express.js (TypeScript)
* **Database:** PostgreSQL 16
* **ORM:** Prisma 5.x
* **Authentication:** JWT (`jsonwebtoken`) + `bcryptjs`
* **Validation:** Zod
* **File Upload:** Multer + Cloudinary
* **Cron Jobs:** `node-cron`

---

## 📂 Modular Architecture

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── mess/
│   │   ├── meal/
│   │   ├── bazar/
│   │   ├── bill/
│   │   └── notification/
│   ├── shared/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── types/
│   ├── cron/
│   │   └── jobs.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── tsconfig.json
└── package.json

```

---

## ⚙️ Setup & Installation Guide

### 1. Prerequisites

* Node.js (v18+ recommended)
* PostgreSQL installed locally or a cloud database URL (Supabase/Neon/Railway)

### 2. Clone and Install Dependencies

```bash
git clone <repository-url>
cd backend
npm install

```

### 3. Environment Variables Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/messmate?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_me
JWT_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

### 4. Database Setup & Migration

Push the Prisma schema to your PostgreSQL database and generate the client:

```bash
npm run db:push
npm run db:generate

```

*(Optional)* Seed the database with initial testing data:

```bash
npm run db:seed

```

### 5. Run the Application

Start the development server with hot reloading:

```bash
npm run dev

```

The server will run on `http://localhost:5000`.

---

## 🚀 API Routes & Postman Testing Guide

Base URL: `http://localhost:5000/api/v1`

*Note: For all protected routes, include the header: `Authorization: Bearer <your_token>*`

---

### 1. Auth Module (`/api/v1/auth`)

* **Register User**
* **POST** `/auth/register`
* **Body:**
```json
{
  "fullName": "Rakib Hasan",
  "phone": "01711000001",
  "password": "password123"
}

```




* **Login User**
* **POST** `/auth/login`
* **Body:**
```json
{
  "phone": "01711000001",
  "password": "password123"
}

```


*(Copy the returned `token` for authenticated requests)*


* **Get Current Profile**
* **GET** `/auth/me` *(Protected)*



---

### 2. Mess Module (`/api/v1/mess`)

* **Create Mess** (Automatically assigns creator as `MANAGER`)
* **POST** `/mess` *(Protected)*
* **Body:**
```json
{
  "name": "Bogura Elite Mess",
  "address": "Sutrapur, Bogura",
  "monthlyGasBill": 1200,
  "monthlyUtilityBill": 1500
}

```




* **Join Mess via Invite Code**
* **POST** `/mess/join` *(Protected)*
* **Body:**
```json
{
  "inviteCode": "KRJ94G"
}

```




* **Approve Member** *(Manager Only)*
* **PATCH** `/mess/:messId/members/:userId/approve` *(Protected)*


* **Get Mess Details**
* **GET** `/mess/:messId` *(Protected)*



---

### 3. Meal Module (`/api/v1/meals`)

* **Add / Update Meal (Upsert)**
* **POST** `/meals` *(Protected)*
* **Body:**
```json
{
  "messId": "your-mess-uuid",
  "date": "2026-08-27",
  "breakfast": true,
  "lunch": true,
  "dinner": false
}

```




* **Get Today's Meals**
* **GET** `/meals/today?messId=your-mess-uuid` *(Protected)*


* **Get My Meals (Monthly)**
* **GET** `/meals/my-meals?messId=your-mess-uuid&month=8&year=2026` *(Protected)*



---

### 4. Bazar Module (`/api/v1/bazar`)

* **Add Bazar Expense** *(Multipart Form-Data)*
* **POST** `/bazar` *(Protected)*
* **Form-Data Fields:**
* `messId`: `your-mess-uuid`
* `date`: `2026-08-27`
* `totalAmount`: `2500`
* `category`: `GROCERY` *(Options: GROCERY, GAS, UTILITY, OTHER)*
* `description`: `Weekly market`
* `items`: `[{"itemName":"Rice","quantity":10,"unit":"kg","unitPrice":70,"totalPrice":700}]`
* `receipt`: *(Select image file - Optional)*




* **Get Bazar List**
* **GET** `/bazar?messId=your-mess-uuid&page=1&limit=10` *(Protected)*



---

### 5. Bill Module (`/api/v1/bills`)

* **Generate Monthly Bills** *(Manager Only)*
* **POST** `/bills/generate` *(Protected)*
* **Body:**
```json
{
  "messId": "your-mess-uuid",
  "month": 8,
  "year": 2026
}

```




* **Get My Bill**
* **GET** `/bills/my-bill?messId=your-mess-uuid&month=8&year=2026` *(Protected)*


* **Record Payment** *(Manager Only)*
* **POST** `/bills/:billId/pay?messId=your-mess-uuid` *(Protected)*
* **Body:**
```json
{
  "amount": 2500.00,
  "method": "BKASH",
  "note": "August full payment via bKash"
}

```





---

### 6. Notification Module (`/api/v1/notifications`)

* **Get My Notifications**
* **GET** `/notifications?isRead=false&page=1&limit=10` *(Protected)*


* **Mark Notification as Read**
* **PATCH** `/notifications/:id/read` *(Protected)*



---

## ⏰ Cron Jobs

Managed inside `src/cron/jobs.ts`:

1. **Daily Meal Lock:** Runs every day at **10:00 PM** (`0 22 * * *`) to lock meal modifications for the day.
2. **Monthly Bill Generation:** Runs automatically at **12:05 AM on the 1st of every month** (`5 0 1 * *`) to calculate meal rates and generate bills for all active messes.

```

```