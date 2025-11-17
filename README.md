# 🧑‍💼 User Management System

A full-stack **User & Role Based Admin Panel** built with **Next.js, Prisma, JWT Authentication, Role & Permission System, Reports Logging, Blog Management, Category & Product Management**, and optimized **Pagination + Search + Date Filters**.

This system is built for enterprise-level role management, activity tracking, multi-auth workflows, and modular admin operations.

---

## 🚀 Features

### 🔒 Authentication & Authorization
- Email/Password login  
- JWT access token  
- Email verification  
- Protected API routes  
- Role-based UI rendering  
- Dynamic sidebar based on user role  

---

## 🧑‍🏫 User Management
- Create users  
- Edit users  
- Delete users  
- Send login credentials via email (NodeMailer)  
- Server-side pagination  
- Search across users  

---

## 🔐 Roles & Permissions
- Create roles (Admin, User, Custom)  
- Attach permissions (READ / CREATE / UPDATE / DELETE)  
- Dynamic permission-based UI  
- Backend permission middleware  
- Fully reusable permission checking system  
- Prisma-based **RolePermission** model  

---

## 📝 Reports Module
Every action performed by any user is logged:

- CREATE / UPDATE / DELETE / LOGIN actions  
- Stored in the database  
- Visible only to Admin or users with permission  
- Delete report (Admin only)  
- Search by description & entity  
- **Date filters:**
  - Today  
  - Last 7 days  
  - This month  

---

## ✍️ Blog Management
- Users can create/update/delete **only their blogs**  
- Pagination  
- Search  
- User-specific views  

---

## ⚙️ Technology Stack

### **Frontend**
- Next.js  
- React  
- Tailwind CSS  

### **Backend**
- Next.js API Routes  
- Prisma ORM  

### **Database**
- MySQL  

### **Auth**
- JWT  
- Bcrypt  
- Custom Middleware  

### **Email**
- NodeMailer  

### **UI Libraries**
- Lucide Icons  
