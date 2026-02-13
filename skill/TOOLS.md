# Marketing Manager — API Reference

Base URL: `http://localhost:3000`

## Brand
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/brand | Get brand profile |
| PUT | /api/brand | Update brand profile |

## Audiences (ICP)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/audiences | List all audiences |
| POST | /api/audiences | Create audience |
| PUT | /api/audiences/:id | Update audience |
| DELETE | /api/audiences/:id | Delete audience |

## Ad Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ad-accounts | List accounts |
| POST | /api/ad-accounts | Add account |
| PUT | /api/ad-accounts/:id | Update account |
| DELETE | /api/ad-accounts/:id | Remove account |
| GET | /api/ad-accounts/guides | Platform setup guides |

## Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/campaigns | List campaigns |
| POST | /api/campaigns | Create campaign |
| PUT | /api/campaigns/:id | Update campaign |
| DELETE | /api/campaigns/:id | Delete campaign |

## Influencers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/influencers | List influencers |
| POST | /api/influencers | Add influencer |
| PUT | /api/influencers/:id | Update influencer |
| DELETE | /api/influencers/:id | Delete influencer |
| POST | /api/influencers/search | Search guidance |
| POST | /api/influencers/:id/score | Calculate score |

## Influencer Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/influencer-campaigns | List deals |
| POST | /api/influencer-campaigns | Create deal |
| PUT | /api/influencer-campaigns/:id | Update deal |
| DELETE | /api/influencer-campaigns/:id | Delete deal |
| POST | /api/influencer-campaigns/:id/approve | Approve deal |

## Creatives
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/creatives | List creatives |
| POST | /api/creatives | Add creative |
| DELETE | /api/creatives/:id | Delete creative |
| POST | /api/creatives/generate | Generate via fal.ai |
| GET | /api/creatives/:id/status | Check generation status |

## Channels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/channels | List channels |
| POST | /api/channels | Create channel |
| PUT | /api/channels/:id | Update channel |
| DELETE | /api/channels/:id | Delete channel |

## Budget
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/budget | Get budget |
| PUT | /api/budget | Update budget |

## Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/config | Get settings |
| PUT | /api/config | Update settings |

## Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics | Full marketing overview |

## Screenshots & File Sharing

### Taking Screenshots
Use Playwright (pre-installed) to capture any website:
```bash
npx playwright screenshot --browser chromium https://example.com /tmp/screenshot.png
```

If Chromium is not installed yet, install it first:
```bash
npx playwright install chromium
```

### Sharing Files & Images with the User
Upload to the Emika API to get a shareable URL:
```bash
# Get your seat token
TOKEN=$(python3 -c "import json; print(json.load(open('/home/node/.openclaw/openclaw.json'))['gateway']['auth']['token'])")

# Upload any file
URL=$(curl -s -X POST "http://162.55.102.58:8080/uploads/seat" \
  -H "X-Seat-Token: $TOKEN" \
  -F "file=@/tmp/screenshot.png" | python3 -c "import sys,json; print(json.load(sys.stdin)['full_url'])")

# Include the URL in your response as markdown image
echo "![Screenshot]($URL)"
```

**IMPORTANT:**
- Do NOT use the `read` tool on image files — it sends the image to the AI model but does NOT display it to the user
- Always upload files and share the URL instead
- The URL format is `https://api.emika.ai/uploads/seats/<filename>`
- Supports: images, PDFs, documents, code files, archives (max 50MB)
