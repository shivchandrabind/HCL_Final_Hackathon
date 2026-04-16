# Retail Food Ordering System - Setup Instructions

## Project Structure
```
HCL_FINAL/
├── database/
│   └── schema.sql              # MySQL database schema + seed data
├── backend/
│   └── FoodOrderingAPI/        # .NET 10 Web API
│       ├── Controllers/
│       ├── Services/
│       ├── Repositories/
│       ├── DTOs/
│       ├── Entities/
│       ├── Data/
│       ├── Middleware/
│       ├── Helpers/
│       ├── Program.cs
│       └── appsettings.json
└── frontend/
    └── FoodOrderingApp/        # Angular 19
        ├── src/
        │   ├── app/
        │   │   ├── pages/
        │   │   ├── services/
        │   │   ├── models/
        │   │   ├── guards/
        │   │   ├── interceptors/
        │   │   └── shared/
        │   ├── main.ts
        │   └── index.html
        ├── angular.json
        └── package.json
```

---

## Prerequisites

| Tool             | Version   | Download                                      |
|------------------|-----------|-----------------------------------------------|
| MySQL Server     | 8.0+      | https://dev.mysql.com/downloads/              |
| MySQL Workbench  | 8.0+      | https://dev.mysql.com/downloads/workbench/    |
| .NET SDK         | 10.0      | https://dotnet.microsoft.com/download         |
| Node.js          | 20+       | https://nodejs.org                            |
| Angular CLI      | 19+       | `npm install -g @angular/cli`                 |

---

## Step 1: Database Setup

1. Open **MySQL Workbench** and connect to your MySQL server.
2. Open the file `database/schema.sql`.
3. Execute the entire script — this creates the `FoodOrderingDB` database, all tables, seed data, and indexes.
4. Verify: Run `USE FoodOrderingDB; SHOW TABLES;` — you should see 8 tables.

---

## Step 2: Backend Setup (.NET 10 Web API)

```bash
cd backend/FoodOrderingAPI

# Restore NuGet packages
dotnet restore

# Update appsettings.json with your MySQL credentials
# Edit the ConnectionStrings.DefaultConnection value:
# "Server=localhost;Port=3306;Database=FoodOrderingDB;User=root;Password=YOUR_PASSWORD;"

# Also update the JWT Key to a secure random string (min 32 chars)

# Run the application
dotnet run
```

The API will start at `http://localhost:5000`.

**Swagger UI** is available at: `http://localhost:5000/swagger`

### First-Time Admin Setup
The seed data creates an admin user `admin@foodorder.com` but with an empty password hash. Register a new admin by:
1. Register a normal user via `POST /api/auth/register`
2. In MySQL Workbench, update their role: `UPDATE Customers SET Role='Admin' WHERE Email='your@email.com';`

---

## Step 3: Frontend Setup (Angular 19)

```bash
cd frontend/FoodOrderingApp

# Install dependencies
npm install

# Start development server
ng serve
```

The app will be available at `http://localhost:4200`.

---

## Step 4: Verify End-to-End

1. Open `http://localhost:4200` — you should see the menu listing page.
2. Click **Register** and create a customer account.
3. Browse the menu, add items to cart, and place an order.
4. Promote yourself to admin (see above) and access the Admin Dashboard.

---

## API Endpoints Summary

### Auth (Public)
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/register    | Register user     |
| POST   | /api/auth/login       | Login, get JWT    |

### Menu (Public read, Admin write)
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | /api/menu             | List items (paginated) |
| GET    | /api/menu/{id}        | Get item details       |
| POST   | /api/menu             | Add item (Admin)       |
| PUT    | /api/menu/{id}        | Update item (Admin)    |
| DELETE | /api/menu/{id}        | Delete item (Admin)    |

### Cart (Authenticated)
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/cart             | Get customer cart    |
| POST   | /api/cart/add         | Add item to cart     |
| PUT    | /api/cart/update      | Update item quantity |
| DELETE | /api/cart/remove      | Remove item          |

### Orders (Authenticated)
| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| POST   | /api/orders/place             | Place new order      |
| GET    | /api/orders/customer/{id}     | Get customer orders  |
| GET    | /api/orders/{orderId}         | Get order details    |
| POST   | /api/orders/reorder/{orderId} | Reorder previous     |

### Admin (Admin Role)
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/admin/orders         | View all orders      |
| PUT    | /api/admin/order-status   | Update order status  |

### Categories
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/categories       | List categories          |
| POST   | /api/categories       | Add category (Admin)     |

### Coupons
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/coupons/validate | Validate coupon code     |
| POST   | /api/coupons          | Create coupon (Admin)    |

---

## Key Features Implemented

- **JWT Authentication** with role-based authorization (Admin/Customer)
- **AutoMapper** for entity-DTO mapping
- **Global Exception Middleware** for consistent error responses
- **Repository Pattern** with Service Layer
- **Inventory auto-update** when orders are confirmed
- **Loyalty Points** — 1 point per ₹100 spent
- **Coupon System** with percentage discounts, min order, expiry, usage limits
- **Email Notifications** via MailKit (configure SMTP in appsettings.json)
- **Pagination** on menu listing
- **Quick Reorder** from order history
- **Responsive UI** with Angular Material
- **Route Guards** protecting authenticated and admin routes
- **JWT Interceptor** auto-attaching tokens to API requests

---

## GitHub Repository Setup

```bash
cd HCL_FINAL
git init
git add .
git commit -m "Initial commit: Food Ordering System (Angular + .NET 10 + MySQL)"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/food-ordering-system.git
git push -u origin main
```

Add a `.gitignore`:
```
# .NET
backend/**/bin/
backend/**/obj/

# Angular
frontend/**/node_modules/
frontend/**/dist/
frontend/**/.angular/

# IDE
.vs/
.vscode/
*.user
```
