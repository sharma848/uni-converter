# Quick Setup Guide

## One-Command Setup

Run this from the root directory to install all dependencies:

```bash
npm run install:all
```

Or manually:

```bash
# Backend
cd backend && npm install && cd ..

# Frontend  
cd frontend && npm install && cd ..
```

## Start Development Servers

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Or use the root scripts:
```bash
npm run dev:backend  # in one terminal
npm run dev:frontend # in another terminal
```

## First Run

1. Backend will start on `http://localhost:3001`
2. Frontend will start on `http://localhost:3000`
3. Open `http://localhost:3000` in your browser
4. The backend will automatically create `uploads/` and `outputs/` directories

## Verify Installation

- Backend health check: `http://localhost:3001/api/health`
- Frontend should load the landing page with conversion categories

## Troubleshooting

### SSL Certificate Error (Sharp Installation)
If you encounter `unable to get local issuer certificate` when installing sharp:
```bash
cd backend
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install
cd ../frontend
npm install
```

Or use the root script which handles this automatically:
```bash
npm run install:all
```

### Port Already in Use
- Backend: Change `PORT` in `backend/src/server.ts` or set `PORT` environment variable
- Frontend: Change port in `frontend/vite.config.ts`

### TypeScript Errors
- These are normal if dependencies aren't installed yet
- Run `npm install` in both `backend/` and `frontend/` directories

### File Upload Issues
- Ensure `backend/uploads/` and `backend/outputs/` directories exist
- Check file size limits (default: 100MB)

