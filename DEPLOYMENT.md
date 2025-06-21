# Vercel Deployment Guide

This guide will help you deploy the IT Helpdesk System to Vercel while keeping the AI model (Ollama) running locally.

## 📋 Prerequisites

- Vercel account
- Local Ollama installation
- MongoDB Atlas account (for production database)
- Your local machine accessible from the internet (for AI model access)

## 🚀 Step-by-Step Deployment

### 1. Prepare Your Project

Make sure all files are ready:

- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Root package with build scripts
- ✅ `client/package.json` - Client package with vercel-build script
- ✅ Environment variables configured

### 2. Set Up MongoDB Atlas (Production Database)

1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Get your connection string (replace password and database name)
4. Whitelist your IP address and `0.0.0.0/0` for Vercel

### 3. Configure Environment Variables

Create these environment variables in your Vercel project:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/it-support-system?retryWrites=true&w=majority
NODE_ENV=production
OLLAMA_URL=http://YOUR_LOCAL_IP:11434
```

**Getting Your Local IP:**

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

### 4. Configure Local Ollama for Remote Access

Since your deployed app will access your local Ollama, you need to configure it:

1. **Allow external connections:**

```bash
# Set environment variable
export OLLAMA_HOST=0.0.0.0:11434

# Or start Ollama with host binding
ollama serve --host 0.0.0.0:11434
```

2. **Configure firewall (if needed):**

```bash
# macOS - Allow incoming connections on port 11434
sudo pfctl -f /etc/pf.conf

# Linux - Open port 11434
sudo ufw allow 11434
```

### 5. Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy:

```bash
vercel --prod
```

#### Option B: Using Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure environment variables in Vercel dashboard
4. Deploy

### 6. Configure Vercel Environment Variables

In your Vercel project dashboard, add these environment variables:

| Variable      | Value                        | Description                     |
| ------------- | ---------------------------- | ------------------------------- |
| `MONGODB_URI` | `mongodb+srv://...`          | MongoDB Atlas connection string |
| `NODE_ENV`    | `production`                 | Environment mode                |
| `OLLAMA_URL`  | `http://YOUR_LOCAL_IP:11434` | Your local Ollama URL           |

### 7. Update CORS Configuration

Update the `corsOptions` in `server.js` with your actual Vercel domain:

```javascript
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://your-actual-vercel-domain.vercel.app",
          "http://localhost:5173",
        ]
      : ["http://localhost:5173", "http://localhost:3000"],
  // ... rest of config
};
```

## 🔧 Project Structure for Vercel

```
IT_Helpdesk_System/
├── client/                 # Frontend (React)
│   ├── dist/              # Build output
│   ├── src/
│   └── package.json       # With vercel-build script
├── routes/                # API routes
├── models/                # Database models
├── utils/                 # Utilities
├── server.js             # Main server file
├── vercel.json           # Vercel configuration
└── package.json          # Root package with dependencies
```

## 🌐 Access Your Deployed App

After deployment:

- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api/health`
- **Local Ollama**: `http://your-local-ip:11434` (accessible from deployed app)

## 🐛 Troubleshooting

### Common Issues

1. **AI Model Not Accessible**

   - Check if Ollama is running: `ollama list`
   - Verify your local IP is correct
   - Ensure firewall allows port 11434
   - Test connection: `curl http://your-local-ip:11434/api/health`

2. **MongoDB Connection Issues**

   - Check connection string format
   - Verify database user permissions
   - Ensure IP whitelist includes `0.0.0.0/0`

3. **Build Failures**

   - Check TypeScript errors: `cd client && npm run type-check`
   - Verify all dependencies are installed
   - Check build logs in Vercel dashboard

4. **CORS Errors**
   - Update corsOptions with correct domain
   - Check if credentials are properly configured

### Testing Local AI Connection

```bash
# Test Ollama accessibility
curl -X POST http://your-local-ip:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3",
    "prompt": "Test request",
    "stream": false
  }'
```

## 🔄 Redeployment

To redeploy after changes:

```bash
# Using Vercel CLI
vercel --prod

# Or push to your connected Git repository
git add .
git commit -m "Update deployment"
git push origin main
```

## 📈 Monitoring

Monitor your deployment:

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Function Logs**: Check serverless function logs
- **Analytics**: Monitor performance and usage

## 🔒 Security Considerations

1. **Secure your local Ollama**:

   - Use strong network security
   - Consider VPN for remote access
   - Monitor access logs

2. **Environment Variables**:

   - Never commit sensitive data
   - Use Vercel's encrypted environment variables

3. **Database Security**:
   - Use MongoDB Atlas with proper authentication
   - Regularly rotate credentials
   - Monitor database access

## 💡 Alternative: Using ngrok for Local AI

If you have connection issues, use ngrok to expose your local Ollama:

```bash
# Install ngrok
brew install ngrok

# Expose Ollama port
ngrok http 11434

# Use the ngrok URL in OLLAMA_URL environment variable
OLLAMA_URL=https://your-random-id.ngrok.io
```

## 📞 Support

If you encounter issues:

1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints individually
4. Check local Ollama accessibility

---

**Note**: This setup allows you to have a production-ready deployed application while keeping AI processing local for privacy and control.
