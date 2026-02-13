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


## Browser & Screenshots (Playwright)

Playwright and Chromium are pre-installed. Use them for browsing websites, taking screenshots, scraping content, and testing.

```bash
# Quick screenshot
npx playwright screenshot --full-page https://example.com screenshot.png

# In Node.js
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("https://example.com");
await page.screenshot({ path: "screenshot.png", fullPage: true });
await browser.close();
```

Do NOT install Puppeteer or download Chromium — Playwright is already here and ready to use.


## File & Image Sharing (Upload API)

To share files or images with the user, upload them to the Emika API and include the URL in your response.

```bash
# Upload a file (use your gateway token from openclaw.json)
TOKEN=$(cat /home/node/.openclaw/openclaw.json | grep -o "\"token\":\"[^\"]*" | head -1 | cut -d\" -f4)

curl -s -X POST "http://162.55.102.58:8080/uploads/seat" \
  -H "X-Seat-Token: $TOKEN" \
  -F "file=@/path/to/file.png" | jq -r .full_url
```

The response includes `full_url` — a public URL you can send to the user. Example:
- `https://api.emika.ai/uploads/seats/f231-27bd_abc123def456.png`

### Common workflow: Screenshot → Upload → Share
```bash
# Take screenshot with Playwright
npx playwright screenshot --full-page https://example.com /tmp/screenshot.png

# Upload to API
TOKEN=$(cat /home/node/.openclaw/openclaw.json | grep -o "\"token\":\"[^\"]*" | head -1 | cut -d\" -f4)
URL=$(curl -s -X POST "http://162.55.102.58:8080/uploads/seat" \
  -H "X-Seat-Token: $TOKEN" \
  -F "file=@/tmp/screenshot.png" | jq -r .full_url)

echo "Screenshot: $URL"
# Then include $URL in your response to the user
```

Supported: images (png, jpg, gif, webp), documents (pdf, doc, xlsx), code files, archives. Max 50MB.


## Browser Tool (Built-in)

You have a built-in `browser` tool provided by OpenClaw. Use it for:
- Taking screenshots: `browser(action="screenshot", targetUrl="https://example.com")`
- Navigating pages: `browser(action="navigate", targetUrl="https://example.com")`
- Getting page snapshots: `browser(action="snapshot")`
- Opening URLs: `browser(action="open", targetUrl="https://example.com")`

The browser tool returns images inline — no file upload needed. Use it whenever a user asks for a screenshot or to view a website.

**Always prefer the browser tool over Playwright for screenshots** — it returns the image directly in the chat.
