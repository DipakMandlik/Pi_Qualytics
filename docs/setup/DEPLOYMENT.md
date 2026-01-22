# Antigravity Deployment - Quick Reference

## 🚀 Quick Start Deployment Options

### Option 1: Local Development (Fastest)
```bash
# 1. Install Ollama
.\antigravity\setup_ollama.ps1

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with Snowflake credentials

# 3. Start services
ollama serve  # Terminal 1
npm run dev   # Terminal 2

# 4. Verify
curl http://localhost:3000/api/antigravity/health
```

---

### Option 2: Docker Deployment (Recommended)
```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with Snowflake credentials

# 2. Build and start
docker-compose up -d

# 3. Pull Ollama model (one-time, ~10-20 min)
docker exec antigravity-ollama ollama pull mixtral:8x7b

# 4. Verify
curl http://localhost:3000/api/antigravity/health
docker-compose logs -f
```

**Stop services**:
```bash
docker-compose down
```

**Update and restart**:
```bash
git pull
docker-compose up -d --build
```

---

### Option 3: Cloud Deployment (AWS EC2)
```bash
# 1. Launch EC2 instance
# - Type: c5.4xlarge (16 vCPU, 32GB RAM)
# - Storage: 100GB SSD
# - OS: Ubuntu 22.04 LTS
# - Security Group: 22 (SSH), 3000 (App), 443 (HTTPS)

# 2. SSH and install Docker
ssh -i your-key.pem ubuntu@your-instance-ip
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# 3. Clone and deploy
git clone <your-repo-url>
cd Pi-Qualytics-main
nano .env  # Add credentials
docker-compose up -d

# 4. Pull model
docker exec antigravity-ollama ollama pull mixtral:8x7b

# 5. Configure HTTPS (optional but recommended)
# Use nginx or Caddy as reverse proxy with SSL
```

---

## 📋 Pre-Deployment Checklist

- [ ] Snowflake account active with payment method
- [ ] Environment variables configured in `.env` or `.env.local`
- [ ] SQL setup script executed in Snowflake
- [ ] Ollama model downloaded (26GB for Mixtral, 4.7GB for Llama3)
- [ ] Port 3000 accessible (and 11434 for Ollama if external)
- [ ] Health endpoint returns "healthy"

---

## 🔧 Configuration

### Required Environment Variables
```env
# Snowflake (REQUIRED)
SNOWFLAKE_ACCOUNT=your_account.region
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH

# Ollama (OPTIONAL - uses defaults)
OLLAMA_ENDPOINT=http://localhost:11434  # or http://ollama:11434 in Docker
OLLAMA_MODEL=mixtral:8x7b  # or llama3:8b for faster responses
```

### Model Selection
**Mixtral 8x7b** (default):
- Size: ~26GB
- Speed: 20-40s per request
- Quality: High accuracy

**Llama3 8b** (faster):
- Size: ~4.7GB  
- Speed: 6-15s per request
- Quality: Good for standard questions

Change model:
```bash
# In .env
OLLAMA_MODEL=llama3:8b

# Pull new model
docker exec antigravity-ollama ollama pull llama3:8b
# OR locally:
ollama pull llama3:8b
```

---

## 🏥 Health Checks

### Application Health
```bash
curl http://localhost:3000/api/antigravity/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "ollama",
  "model": "mixtral:8x7b",
  "message": "Ollama is running and ready"
}
```

### Ollama Health
```bash
curl http://localhost:11434/api/tags
```

### Database Health
```sql
-- In Snowflake
SELECT COUNT(*) FROM DATA_QUALITY_DB.DB_METRICS.DQ_LLM_EXECUTION_LOG;
```

---

## 📊 Monitoring

### View Recent Executions
```sql
SELECT
    EXECUTION_ID,
    USER_QUESTION,
    EXECUTION_STATUS,
    TOTAL_EXECUTION_TIME_MS,
    CREATED_AT
FROM DATA_QUALITY_DB.DB_METRICS.DQ_LLM_EXECUTION_LOG
ORDER BY CREATED_AT DESC
LIMIT 10;
```

### Check Success Rate
```sql
SELECT
    EXECUTION_STATUS,
    COUNT(*) as count,
    AVG(TOTAL_EXECUTION_TIME_MS) as avg_time_ms
FROM DATA_QUALITY_DB.DB_METRICS.DQ_LLM_EXECUTION_LOG
WHERE CREATED_AT >= DATEADD('DAY', -1, CURRENT_TIMESTAMP())
GROUP BY EXECUTION_STATUS;
```

### Docker Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nextjs
docker-compose logs -f ollama

# Resource usage
docker stats
```

---

## 🐛 Troubleshooting

### Issue: Ollama not responding
```bash
# Check if running
docker ps | grep ollama
# OR locally:
curl http://localhost:11434/api/tags

# Restart
docker-compose restart ollama
# OR locally:
ollama serve
```

### Issue: Model not loaded
```bash
# Check available models
docker exec antigravity-ollama ollama list

# Pull model if missing
docker exec antigravity-ollama ollama pull mixtral:8x7b
```

### Issue: Slow responses
```bash
# Switch to faster model
# Edit .env: OLLAMA_MODEL=llama3:8b
docker exec antigravity-ollama ollama pull llama3:8b
docker-compose restart nextjs
```

### Issue: Snowflake connection failed
```bash
# Verify credentials
docker-compose exec nextjs env | grep SNOWFLAKE

# Test connection in Snowflake
SELECT CURRENT_ACCOUNT();
```

---

## 🔄 Updates & Maintenance

### Update Application
```bash
git pull
docker-compose up -d --build
```

### Update Ollama Model
```bash
docker exec antigravity-ollama ollama pull mixtral:8x7b
docker-compose restart nextjs
```

### Backup Ollama Models
```bash
docker run --rm \
  -v antigravity_ollama-models:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/ollama-backup.tar.gz /data
```

### Restore Ollama Models
```bash
docker run --rm \
  -v antigravity_ollama-models:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/ollama-backup.tar.gz -C /
```

---

## 💰 Cost Estimation

**AWS EC2 Deployment** (Monthly):
- c5.4xlarge instance: ~$500
- 100GB SSD storage: ~$10
- Data transfer: ~$20
- Snowflake (light usage): ~$200
- **Total**: ~$730/month

**Optimization Tips**:
- Use Llama3 instead of Mixtral (smaller instance possible)
- Stop instance during off-hours (50% savings)
- Use Reserved Instances (40% savings)

---

## 📚 Additional Documentation

- **PREFLIGHT_CHECKLIST.md** - Complete setup verification
- **deployment_strategy.md** - Detailed deployment guide
- **QUICKSTART.md** - 5-step quick start
- **walkthrough.md** - Implementation details

---

## 🆘 Support

**Common Issues**:
1. Ollama not available → Check service is running
2. Schema validation errors → Run schema registry notebook
3. Slow performance → Switch to Llama3 model
4. Snowflake errors → Verify credentials and account status

**Logs Location**:
- Docker: `docker-compose logs`
- Local: Check terminal output
- Snowflake: `DQ_LLM_EXECUTION_LOG` table

---

**Status**: Ready for deployment  
**Recommended**: Start with Docker deployment  
**Support**: See detailed docs for troubleshooting
