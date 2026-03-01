# Yusco Shop - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/yusco_shop
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Ensure MongoDB is Running
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows - Open Services and start MongoDB
```

### Step 4: Start Backend
```bash
npm run dev
```

You should see:
```
MongoDB connected: localhost
Server running on port 5000
Environment: development
```

### Step 5: Start Frontend (in another terminal)
```bash
# From project root
npm run dev
```

### Step 6: Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 📋 Default Test Users

After first run, you can register users or use test credentials:

**Admin User:**
- Email: `admin@yusco.com`
- Password: `password123`

**Seller User:**
- Email: `seller@yusco.com`
- Password: `password123`

---

## 🔑 Key Endpoints to Test

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "seller"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get Shops (requires token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/shops
```

### 4. Health Check (no auth needed)
```bash
curl http://localhost:5000/api/health
```

---

## 📁 Important Backend Files

### Configuration
- `backend/.env` - Environment variables (create from .env.example)
- `backend/tsconfig.json` - TypeScript configuration
- `backend/package.json` - Dependencies

### Main Application
- `backend/src/index.ts` - Express app setup and routes
- `backend/src/utils/db.ts` - MongoDB connection

### Authentication & Security
- `backend/src/middleware/auth.ts` - JWT and role validation
- `backend/src/controllers/authController.ts` - Login/Register

### Core Features
- `backend/src/models/` - Database schemas (6 files)
- `backend/src/controllers/` - Business logic (8 files)
- `backend/src/routes/` - API endpoints (8 files)

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service
```bash
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in `.env` to 5001 or kill existing process

### Module Not Found Errors
```bash
# Rebuild the project
npm run build

# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### JWT Token Issues
- Tokens expire after 7 days by default
- Re-login to get a new token
- Check token includes "Bearer " prefix

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `backend/README.md` | Full backend documentation |
| `backend/SETUP.md` | Detailed setup guide |
| `backend/API_DOCS.md` | All 39 API endpoints documented |
| `PROJECT_SUMMARY.md` | Complete project overview |

---

## 🎯 Next Steps

1. **Explore the API**: Check `backend/API_DOCS.md`
2. **Test Endpoints**: Use Postman or Insomnia
3. **Setup Database**: Configure MongoDB Atlas or local instance
4. **Customize**: Modify `.env` for your setup
5. **Deploy**: Follow production checklist in PROJECT_SUMMARY.md

---

## 🔐 Security Notes

- Change `JWT_SECRET` in production
- Use strong passwords
- Enable HTTPS in production
- Whitelist MongoDB IP addresses (Atlas)
- Never commit `.env` file to git

---

## 📦 Project Structure

```
yusco_shop/
├── src/                  # Frontend (React)
├── backend/              # Backend (Express)
│   ├── src/
│   │   ├── controllers/  # 8 route handlers
│   │   ├── models/       # 6 database schemas
│   │   ├── routes/       # 8 route files (39 endpoints)
│   │   ├── middleware/   # Auth, validation
│   │   └── index.ts      # Main app file
│   ├── package.json
│   └── .env
├── package.json
└── README.md
```

---

## 💡 Tips

- Use Postman/Insomnia for API testing
- Check browser console for frontend errors
- Check terminal for backend logs
- Use `npm run build` to check TypeScript errors
- Enable MongoDB Compass for database visualization

---

## 🆘 Still Need Help?

1. Check `backend/API_DOCS.md` for endpoint documentation
2. Review `backend/SETUP.md` for detailed setup
3. Check error messages in terminal
4. Verify MongoDB is running
5. Ensure `.env` file is configured correctly

---

**Happy coding! 🎉**
