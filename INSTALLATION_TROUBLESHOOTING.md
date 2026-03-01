# Backend Installation Troubleshooting Guide

## Issue: npm install fails with Socket Timeout

### Symptoms
```
npm ERR! code ERR_SOCKET_TIMEOUT
npm ERR! network Socket timeout
```

### Solutions (Try in order)

#### Solution 1: Clear npm Cache
```bash
cd backend
npm cache clean --force
npm install
```

#### Solution 2: Use Different npm Registry
```bash
npm install --registry https://registry.npmjs.org/
```

#### Solution 3: Increase Timeout
```bash
npm install --fetch-timeout=120000 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
```

#### Solution 4: Use Yarn (Alternative Package Manager)
```bash
# Install yarn globally if not already installed
npm install -g yarn

# Use yarn to install
cd backend
yarn install
```

#### Solution 5: Use cnpm (Faster npm)
```bash
npm install -g cnpm --registry=https://registry.npmmirror.com
cd backend
cnpm install
```

#### Solution 6: Manual Installation with Minimal Dependencies
If all else fails, create a `node_modules` manually:

```bash
cd backend

# Install core dependencies one by one
npm install express@4.18.2
npm install cors@2.8.5
npm install dotenv@16.0.3
npm install mongoose@7.0.0
npm install express-validator@7.0.0
npm install jsonwebtoken@9.0.0
npm install bcryptjs@2.4.3
npm install uuid@9.0.0

# Install dev dependencies
npm install --save-dev typescript@5.1.0
npm install --save-dev ts-node@10.9.1
npm install --save-dev @types/node@20.0.0
npm install --save-dev @types/express@4.17.17
npm install --save-dev @types/jsonwebtoken@9.0.2
```

---

## Issue: TypeScript Compilation Errors

### Symptoms
```
error TS2307: Cannot find module 'mongoose'
error TS7006: Parameter implicitly has an 'any' type
```

### Solutions

#### If Dependencies Not Installed
```bash
cd backend
npm install
npm run build
```

#### If Still Getting Errors
```bash
# Clear dist folder and rebuild
rm -rf dist
npm run build
```

#### Check if TypeScript is Installed
```bash
npx tsc --version
```

---

## Issue: MongoDB Connection Failed

### Symptoms
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

### Solutions

#### Start MongoDB Service

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo systemctl start mongodb
```

**Windows:**
- Open Services Manager
- Search for MongoDB
- Click Start

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

#### Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yusco_shop
```

---

## Issue: Port 5000 Already in Use

### Symptoms
```
Error: listen EADDRINUSE :::5000
```

### Solutions

#### Option 1: Kill Process on Port 5000
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### Option 2: Use Different Port
Edit `.env`:
```
PORT=5001
```

---

## Complete Fresh Install

If all else fails, do a complete fresh installation:

```bash
cd /home/kija/Desktop/PROJECTS/yusco_shop

# Remove old installation
rm -rf backend/node_modules
rm -rf backend/dist
rm backend/package-lock.json

# Clear npm cache
npm cache clean --force

# Navigate to backend
cd backend

# Install fresh
npm install

# Build
npm run build

# Test
npm run dev
```

---

## Verify Installation Success

After installation, verify everything works:

```bash
# Check files exist
ls src/index.ts
ls src/models/
ls src/controllers/
ls src/routes/

# Test build
npm run build

# Check dist folder created
ls dist/index.js

# Test development server (Ctrl+C to stop)
npm run dev
```

You should see:
```
MongoDB connected: localhost
Server running on port 5000
Environment: development
```

---

## Network Issues

If you're experiencing network timeout issues:

1. **Check Internet Connection**
   ```bash
   ping npm.js.org
   ```

2. **Check npm Registry**
   ```bash
   npm config get registry
   ```

3. **Try Different Registry**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

4. **Check Firewall/Proxy**
   - Ensure port 443 is not blocked
   - Check if behind corporate proxy

5. **Wait and Retry**
   - Sometimes npm registry is temporarily slow
   - Wait 5-10 minutes and try again

---

## Support Files

All these commands are documented in:
- `QUICK_START.md` - Quick setup guide
- `backend/SETUP.md` - Detailed setup
- `backend/README.md` - Backend overview

---

## Checklist for Successful Installation

- [ ] Node.js installed (v16+)
- [ ] npm working properly
- [ ] Internet connection stable
- [ ] MongoDB running or Atlas configured
- [ ] `backend/node_modules/` exists
- [ ] `backend/dist/` builds successfully
- [ ] `npm run dev` starts server
- [ ] Health check returns 200 OK

---

## Quick Commands Reference

```bash
# Navigate to backend
cd backend

# Check Node.js version
node --version

# Check npm version
npm --version

# Clear cache
npm cache clean --force

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

---

**Still having issues? Check the terminal output carefully for specific error messages.**
