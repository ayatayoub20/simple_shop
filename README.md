# 🛍️ NestJS Shop API  
A fully modular and production-ready backend built with **NestJS**, **Prisma ORM**, **ImageKit**, and **Multer**, providing a clean and scalable architecture for e-commerce applications.  
This project includes user management, authentication, product handling with image upload, order processing, and transaction logging.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT authentication  
- Login / Register endpoints  
- Secure password hashing  
- Role-based access support 

### 👥 Users Module
- Create / update / delete users  
- Get user profile & user list  
- Prisma-powered database access  

### 🛒 Products Module
- Create / edit / delete products  
- Upload product images using Multer  
- Automatic upload to **ImageKit** CDN  
- Cleanup interceptor to remove unused files  
- Stores URLs & metadata in database

### 📦 Orders Module
- Create user orders  
- View order history  
- Order status & processing logic

### 💳 Transactions Module
- Logs all financial/order-related operations  
- Tracks purchase activity  
- Useful for analytics & admin dashboards

### 🗂 File Upload & Handling
- **Multer** for file parsing  
- **ImageKit** for cloud upload  
- Custom `CleanupFileInterceptor` to delete temporary local files  
- File module fully abstracted with service + provider pattern  

### 🧰 Shared Infrastructure
- Unified API response interceptor  
- Global exception filters:
  - Prisma errors  
  - Zod validation errors  
  - HTTP exceptions  
  - Fallback uncaught exception handler  
- Database module using PrismaClient  
- Clean modular architecture  
- DTO + Validation with Zod Pipes  

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS** | Main application framework |
| **Prisma ORM** | Database access layer |
| **MySQL** | Database (via Prisma) |
| **Multer** | File upload middleware |
| **ImageKit** | Media storage & CDN |
| **Zod** | Schema validation |
| **TypeScript** | Type safety |
| **RxJS / Interceptors** | Response manipulation |


## 📦 Installation & Setup

### Clone the project
```bash
git clone https://github.com/ayatayoub20/simple_shop.git
cd simple_shop
```

### Install dependencies
```bash
npm install
```

### Set up your `.env` file
```
DATABASE_URL="your_database_url"
IMAGEKIT_PUBLIC_KEY="your_key"
IMAGEKIT_PRIVATE_KEY="your_key"
IMAGEKIT_URL_ENDPOINT="your_endpoint"
JWT_SECRET="your_secret"
```

### Run database migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### Start the server
```bash
npm run start:dev
```

The API will run at:  
👉 `http://localhost:3000/api`

---

## 🧪 API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user |
| POST | `/auth/login` | Login & get JWT token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user` | Get list of users |
| GET | `/user/:id` | Get single user |
| PATCH | `/user/:id` | Update user |
| DELETE | `/user/:id` | Soft delete |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/product` | Create product (with image upload) |
| GET | `/product` | List products |
| GET | `/product/:id` | Product details |
| PATCH | `/product/:id` | Update product |
| DELETE | `/product/:id` | Soft delete / remove |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/order` | Create order |
| GET | `/order` | Get user orders |
| GET | `/order/:id` | Order details |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transaction` | List all transactions |
| GET | `/transaction/:id` | Transaction details |

---

## 🖼️ Image Upload Flow (Multer + ImageKit)

1. User uploads an image via Multer  
2. File is sent to ImageKit via `imagekit.provider`  
3. After successful upload:
   - Local file is deleted using `CleanupFileInterceptor`  
4. URL from ImageKit is stored in DB via Prisma  
5. Frontend uses fast CDN-optimized image

---

## ❗ Error Handling

Unified error responses with filters for:

- PrismaClientKnownRequestError  
- Prisma validation  
- Zod validation  
- HTTP exceptions  
- Internal server errors  

Example:
```json
{
  "success": false,
  "message": "Validation failed",
  "fields": [
    { "field": "price", "message": "Expected number" }
  ]
}
```

---

## ⭐ Future Improvements
- Add admin roles  
- Add categories for products  
- Add cart module  
- Payment integration  
- Email notifications  
- Swagger API documentation  

---

## 👩‍💻 Author
**Ayat Ayoub**  
GitHub: https://github.com/ayatayoub20  
---

## 🌟 Final Notes
This project showcases strong backend architecture principles using **NestJS**, including modular design, separation of concerns, validation, exception handling, file-upload pipelines, and database abstraction with Prisma.

It serves as an excellent portfolio project demonstrating real-world backend development skills.
