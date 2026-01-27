# ⚡ Quick Start Reference

## 🚀 5-Minute Setup

### 1. Environment Setup
```bash
# Copy example configuration
cp .env.example .env

# Edit with your Snowflake credentials
# Required:
# - SNOWFLAKE_ACCOUNT
# - SNOWFLAKE_USER
# - SNOWFLAKE_PASSWORD
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Snowflake Database

In Snowflake SQL Editor, run these SQL scripts **in order**:
```
1. sql/production/00_MASTER_SETUP.sql
2. sql/production/01_Environment_Setup.sql
3. sql/production/02_Data_Loading.sql
4. ... continue through 11_Observability_AI_Insights.sql
```

### 4. Start Application
```bash
npm run dev

# Open: http://localhost:3000
```

### 5. Connect to Snowflake
Click "Connect to Snowflake" in the sidebar and enter your credentials.

---

## 📋 Essential Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm start            # Start production server

# Validation
npm run lint         # Check code quality

# Database
# Run SQL scripts in Snowflake UI (see SETUP_COMPLETE.md)
```

---

## 🔧 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Not connected to Snowflake" | Create `.env` file with credentials |
| "Invalid account identifier" | Use format: `abc123def.us-east-1` |
| "Table does not exist" | Run SQL setup scripts 00-11 in order |
| "Ollama not responding" | Start Ollama: `ollama serve` |
| "Gemini API key invalid" | Get new key from https://ai.google.dev/ |
| "Port already in use" | Change: `PORT=3001` in .env |

---

## 📚 Documentation Structure

```
docs/
├── SETUP_COMPLETE.md         # Full 12-step setup guide
├── ENVIRONMENT_SETUP.md      # Environment variables guide
└── troubleshooting/
    └── COMMON_ERRORS.md      # Error solutions & debugging
```

---

## 🎯 Next Steps After Setup

- [ ] Dashboard shows quality metrics
- [ ] Run a sample scan
- [ ] Create a schedule
- [ ] Configure AI insights (optional)
- [ ] Invite team members

---

**See [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) for detailed instructions**
