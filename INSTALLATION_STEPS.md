# 🔧 Backend Installation - Step by Step

## ✅ Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js (should be v16+)
node --version

# Check npm (should be v8+)
npm --version

# Check MongoDB is running
# macOS: brew services list | grep mongodb
# Linux: sudo systemctl status mongodb
# Windows: Check Services for MongoDB
```

---

## 🚀 Installation Steps

### Step 1: Navigate to Backend Folder
```bash
cd /home/kija/Desktop/PROJECTS/yusco_shop/backend
```

### Step 2: Clear npm Cache (Recommended)
```bash
npm cache clean --force
```

### Step 3: Install Dependencies

**Option A: Standard Install (Recommended)**
```bash
npm install
```

**Option B: If Option A Times Out**
```bash
npm install --fetch-timeout=120000
```

**Option C: Using Yarn**
```bash
npm install -g yarn
yarn install
```

**Option D: Install Packages Individually**
```bash
npm install express@4.18.2 cors@2.8.5 dotenv@16.0.3
npm install mongoose@7.0.0 express-validator@7.0.0
npm install jsonwebtoken@9.0.0 bcryptjs@2.4.3 uuid@9.0.0
npm install --save-dev typescript ts-node @types/node @types/express
```

### Step 4: Verify Installation

Check if `node_modules` folder was created:
```bash
ls -la node_modules/ | head -20
```

You should see many folders listed.

### Step 5: Setup Environment File

```bash
cp .env.example .env
```

Edit `.env` file with your MongoDB URI:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/yusco_shop
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 6: Build TypeScript

```bash
npm run build
```

You should see a `dist/` folder created with compiled JavaScript files.

### Step 7: Ensure MongoDB is Running

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

**Windows:**
- Open Services (services.msc)
- Find MongoDB
- Click "Start"

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### Step 8: Start Development Server

```bash
npm run dev
```

You should see:
```
MongoDB connected: localhost
Server running on port 5000
Environment: development
```

### Step 9: Test the API

Open a new terminal and run:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"success": true, "message": "Server is running"}
```

---

## ✨ Success Indicators

✅ npm install completed without errors
✅ `node_modules/` folder exists
✅ `npm run build` creates `dist/` folder
✅ `npm run dev` shows MongoDB connected message
✅ Health check returns 200 OK
✅ No errors in console

---

## ❌ Troubleshooting

### Issue 1: npm install times out

```bash
# Try with longer timeout
npm install --fetch-timeout=120000 --fetch-retry-mintimeout=20000

# Or clear cache and retry
npm cache clean --force
npm install
```

### Issue 2: MongoDB connection fails

```bash
# Check if MongoDB is running
# macOS:
brew services list | grep mongodb

# Linux:
sudo systemctl status mongodb

# Start if not running:
brew services start mongodb-community
sudo systemctl start mongodb
```

### Issue 3: Port 5000 already in use

Edit `.env` and change PORT:
```env
PORT=5001
```

### Issue 4: "Cannot find module" errors

```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Or rebuild
npm run build
```

### Issue 5: TypeScript errors

```bash
# Check TypeScript version
npx tsc --version

# Rebuild
npm run build
```

---

## 📋 Complete Fresh Installation

If encountering persistent issues:

```bash
# Navigate to project root
cd /home/kija/Desktop/PROJECTS/yusco_shop

# Remove old files
rm -rf backend/node_modules
rm backend/package-lock.json
rm -rf backend/dist

# Clear cache
npm cache clean --force

# Navigate to backend
cd backend

# Fresh install
npm install

# Build
npm run build

# Start
npm run dev
```

---

## 🎯 Next Steps After Successful Installation

1. ✅ Backend installed and running
2. 📚 Read `backend/API_DOCS.md` to understand endpoints
3. 🔗 Connect your React frontend to `http://localhost:5000/api`
4. 🧪 Test API endpoints with Postman or curl
5. 🚀 Deploy when ready

---

## 📞 Quick Reference

```bash
# Install
npm install

# Build
npm run build

# Start development
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Production start
npm start
```

---

## 📁 After Installation Structure

```
backend/
├── node_modules/           ← Dependencies (created by npm install)
├── dist/                   ← Compiled JavaScript (created by npm run build)
├── src/                    ← TypeScript source
│   ├── controllers/        ← 8 controllers
│   ├── models/             ← 6 database models
│   ├── routes/             ← 8 route files
│   ├── middleware/         ← 3 middleware files
│   ├── utils/              ← Database utilities
│   └── index.ts            ← Main app file
├── package.json            ← Dependencies list
├── tsconfig.json           ← TypeScript config
├── .env                    ← Environment variables (created from .env.example)
└── .gitignore              ← Git ignore rules
```

---

## ✅ Installation Checklist

- [ ] Node.js v16+ installed
- [ ] npm installed
- [ ] MongoDB running or configured
- [ ] `cd backend` successful
- [ ] `npm install` completed
- [ ] `node_modules/` created
- [ ] `.env` file configured
- [ ] `npm run build` successful
- [ ] `dist/` folder created
- [ ] `npm run dev` shows success message
- [ ] Health check returns 200
- [ ] MongoDB connected message shown

---

If all checks pass, your backend is ready! 🎉

**Start with:** `npm run dev`
**Test with:** `curl http://localhost:5000/api/health`
