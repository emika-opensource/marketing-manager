---
name: marketing-manager
description: Comprehensive marketing ops — brand strategy, audiences, ad accounts, campaigns, influencers, creatives (AI generation), channels, budget, and analytics
---

## ⛔ NEVER write data as files. ALWAYS use the API.

## CRITICAL: Port 3000 Only
You MUST deploy ONLY on port 3000. Nginx ONLY proxies port 3000 — any other port will NOT be accessible.
If port 3000 is busy: `pm2 delete all` then `pm2 start your-app.js --name app` on port 3000.

## 🚨 Your App is ALREADY RUNNING
Your **Marketing Command Center** web application is ALREADY RUNNING on port 3000.
- **DO NOT** kill anything on port 3000
- **DO NOT** try to start a new server
- All API endpoints below are served by this app at `http://localhost:3000`

## 📁 File Uploads
For uploading creative assets, use the seat proxy:
```bash
curl -X POST http://162.55.102.58:8080/uploads/seat \
  -H "X-Seat-Token: $SEAT_TOKEN" \
  -F "file=@creative.png"
```

## API Endpoints Summary

| Category | Endpoints |
|----------|-----------|
| Brand | `GET/PUT /api/brand` |
| Audiences | `GET/POST /api/audiences`, `GET/PUT/DELETE /api/audiences/:id` |
| Ad Account Guides | `GET /api/ad-accounts/guides` |
| Ad Accounts | `GET/POST /api/ad-accounts`, `GET/PUT/DELETE /api/ad-accounts/:id` |
| Campaigns | `GET/POST /api/campaigns`, `GET/PUT/DELETE /api/campaigns/:id` |
| Influencers | `GET/POST /api/influencers`, `GET/PUT/DELETE /api/influencers/:id`, `POST /api/influencers/search`, `POST /api/influencers/:id/score` |
| Influencer Campaigns | `GET/POST /api/influencer-campaigns`, `GET/PUT/DELETE /api/influencer-campaigns/:id`, `POST /api/influencer-campaigns/:id/approve` |
| Creatives | `GET/POST /api/creatives`, `GET/PUT/DELETE /api/creatives/:id`, `POST /api/creatives/generate`, `GET /api/creatives/:id/status` |
| Channels | `GET/POST /api/channels`, `GET/PUT/DELETE /api/channels/:id` |
| Budget | `GET/PUT /api/budget` |
| Config | `GET/PUT /api/config` |
| Analytics | `GET /api/analytics` |

## Detailed API Reference

### Brand

**Get brand profile**:
```bash
curl http://localhost:3000/api/brand
```
Response:
```json
{
  "name": "", "description": "", "industry": "", "values": [],
  "tone": "", "colors": { "primary": "#f43f5e", "secondary": "#1e1e2e", "accent": "#c0c0c0" },
  "targetMarket": "", "usp": "", "competitors": [], "guidelines": ""
}
```

**Update brand profile**:
```bash
curl -X PUT http://localhost:3000/api/brand \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "industry": "SaaS",
    "values": ["innovation", "simplicity"],
    "tone": "Professional but friendly",
    "targetMarket": "B2B SaaS founders",
    "usp": "AI-powered automation"
  }'
```

### Audiences (CRUD)

**List audiences**:
```bash
curl http://localhost:3000/api/audiences
```

**Create an audience**:
```bash
curl -X POST http://localhost:3000/api/audiences \
  -H "Content-Type: application/json" \
  -d '{ "name": "Enterprise Decision Makers", "description": "C-suite at 500+ companies", "demographics": { "age": "35-55", "location": "US" } }'
```

**Get/Update/Delete an audience**:
```bash
curl http://localhost:3000/api/audiences/AUD_ID
curl -X PUT http://localhost:3000/api/audiences/AUD_ID -H "Content-Type: application/json" -d '{ "name": "Updated" }'
curl -X DELETE http://localhost:3000/api/audiences/AUD_ID
```

### Ad Account Guides

**Get platform setup guides** (Google Ads, Meta, LinkedIn, TikTok):
```bash
curl http://localhost:3000/api/ad-accounts/guides
```
Returns detailed setup steps, campaign types, best practices, budget tips, and targeting options for each platform.

### Ad Accounts (CRUD)

```bash
curl http://localhost:3000/api/ad-accounts
curl -X POST http://localhost:3000/api/ad-accounts -H "Content-Type: application/json" \
  -d '{ "platform": "google-ads", "name": "Main Google Account", "accountId": "123-456-7890", "status": "active" }'
curl http://localhost:3000/api/ad-accounts/ACC_ID
curl -X PUT http://localhost:3000/api/ad-accounts/ACC_ID -H "Content-Type: application/json" -d '{ "status": "paused" }'
curl -X DELETE http://localhost:3000/api/ad-accounts/ACC_ID
```

### Campaigns (CRUD)

```bash
curl http://localhost:3000/api/campaigns
curl -X POST http://localhost:3000/api/campaigns -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Brand Awareness",
    "platform": "meta-ads",
    "status": "active",
    "budget": 5000,
    "spent": 1200,
    "metrics": { "impressions": 50000, "clicks": 1500, "conversions": 75 }
  }'
curl http://localhost:3000/api/campaigns/CAMP_ID
curl -X PUT http://localhost:3000/api/campaigns/CAMP_ID -H "Content-Type: application/json" -d '{ "spent": 2500 }'
curl -X DELETE http://localhost:3000/api/campaigns/CAMP_ID
```

### Influencers (CRUD + Search + Scoring)

**List/Create/Update/Delete influencers**:
```bash
curl http://localhost:3000/api/influencers
curl -X POST http://localhost:3000/api/influencers -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Creator",
    "platform": "instagram",
    "handle": "@janecreator",
    "followers": 50000,
    "engagementRate": 3.5,
    "category": "Technology",
    "status": "discovered",
    "priceRange": { "min": 500, "max": 2000 },
    "tags": ["tech", "saas"]
  }'
curl http://localhost:3000/api/influencers/INF_ID
curl -X PUT http://localhost:3000/api/influencers/INF_ID -H "Content-Type: application/json" -d '{ "status": "contacted" }'
curl -X DELETE http://localhost:3000/api/influencers/INF_ID
```

**Search for influencers** (returns guidance):
```bash
curl -X POST http://localhost:3000/api/influencers/search \
  -H "Content-Type: application/json" \
  -d '{ "query": "SaaS marketing", "platform": "instagram", "minFollowers": 10000 }'
```

**Score an influencer** (auto-calculates fit):
```bash
curl -X POST http://localhost:3000/api/influencers/INF_ID/score
```
Scores based on: followers (20%), engagement (30%), relevance (25%), value (15%), audience quality (10%).

### Influencer Campaigns (CRUD + Approve)

```bash
curl http://localhost:3000/api/influencer-campaigns
curl -X POST http://localhost:3000/api/influencer-campaigns -H "Content-Type: application/json" \
  -d '{ "name": "Product Launch Collab", "influencerId": "INF_ID", "agreedPrice": 1500, "deliverables": ["3 posts", "2 stories"], "status": "proposed" }'
curl -X PUT http://localhost:3000/api/influencer-campaigns/IC_ID -H "Content-Type: application/json" -d '{ "status": "active" }'
curl -X DELETE http://localhost:3000/api/influencer-campaigns/IC_ID
```

**Approve an influencer campaign**:
```bash
curl -X POST http://localhost:3000/api/influencer-campaigns/IC_ID/approve
```

### Creatives (CRUD + AI Generation)

**List/Create/Update/Delete creatives**:
```bash
curl http://localhost:3000/api/creatives
curl -X POST http://localhost:3000/api/creatives -H "Content-Type: application/json" \
  -d '{ "name": "Hero Banner", "type": "image", "url": "https://...", "platform": "instagram" }'
curl http://localhost:3000/api/creatives/CR_ID
curl -X PUT http://localhost:3000/api/creatives/CR_ID -H "Content-Type: application/json" -d '{ "name": "Updated" }'
curl -X DELETE http://localhost:3000/api/creatives/CR_ID
```

**Generate a creative with AI** (requires FAL_KEY in config):
```bash
curl -X POST http://localhost:3000/api/creatives/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Modern SaaS dashboard hero image with blue gradient",
    "type": "image",
    "style": "professional",
    "dimensions": "1200x628",
    "platform": "linkedin"
  }'
```
- `type`: `image` | `video`
- `dimensions`: `1080x1080`, `1080x1920`, `1200x628`, `1200x1200`, `1080x1350`
- Returns `{ "id": "...", "status": "generating" }` — generation is async

**Check generation status**:
```bash
curl http://localhost:3000/api/creatives/CR_ID/status
```
Response: `{ "id": "...", "status": "ready", "url": "https://...", "error": null }`

### Channels (CRUD)

```bash
curl http://localhost:3000/api/channels
curl -X POST http://localhost:3000/api/channels -H "Content-Type: application/json" \
  -d '{ "name": "LinkedIn Organic", "type": "organic", "budget": 0, "performance": { "reach": 5000, "conversions": 50, "roi": 150 } }'
curl http://localhost:3000/api/channels/CH_ID
curl -X PUT http://localhost:3000/api/channels/CH_ID -H "Content-Type: application/json" -d '{ "budget": 1000 }'
curl -X DELETE http://localhost:3000/api/channels/CH_ID
```

### Budget

**Get budget**:
```bash
curl http://localhost:3000/api/budget
```
Response: `{ "total": 0, "allocated": {}, "spent": 0, "remaining": 0, "period": "monthly" }`

**Update budget**:
```bash
curl -X PUT http://localhost:3000/api/budget \
  -H "Content-Type: application/json" \
  -d '{ "total": 10000, "spent": 3500, "allocated": { "google-ads": 4000, "meta-ads": 3000, "influencer": 3000 }, "period": "monthly" }'
```
`remaining` is auto-calculated as `total - spent`.

### Config

**Get config** (FAL key masked):
```bash
curl http://localhost:3000/api/config
```

**Update config**:
```bash
curl -X PUT http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{ "falKey": "your-fal-api-key", "notifications": true }'
```

### Analytics

**Get marketing analytics dashboard**:
```bash
curl http://localhost:3000/api/analytics
```
Response:
```json
{
  "totalSpent": 5000,
  "budgetTotal": 10000,
  "budgetRemaining": 5000,
  "overallROI": "125.0",
  "activeCampaigns": 3,
  "activeInfluencers": 2,
  "creativesGenerated": 15,
  "totalImpressions": 100000,
  "totalClicks": 3000,
  "totalConversions": 150,
  "channelPerformance": [...],
  "recentCampaigns": [...],
  "influencerPipeline": { "discovered": 5, "contacted": 3, "negotiating": 1, "active": 2, "completed": 1 },
  "recentCreatives": [...]
}
```
