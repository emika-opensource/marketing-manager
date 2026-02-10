const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Data directory
const PRIMARY_DIR = '/home/node/emika/marketing-hub';
const FALLBACK_DIR = path.join(__dirname, 'data');
let DATA_DIR = process.env.DATA_DIR || PRIMARY_DIR;

try { fs.ensureDirSync(DATA_DIR); } catch {
  DATA_DIR = FALLBACK_DIR;
  fs.ensureDirSync(DATA_DIR);
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: path.join(DATA_DIR, 'uploads') });

// --- Helpers ---
function dataFile(name) { return path.join(DATA_DIR, `${name}.json`); }
function readData(name, fallback = null) {
  try { return fs.readJsonSync(dataFile(name)); } catch { return fallback; }
}
function writeData(name, data) { fs.writeJsonSync(dataFile(name), data, { spaces: 2 }); }
function uuid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function crudRoutes(routePath, dataName, defaults = []) {
  const getData = () => readData(dataName, defaults);
  const setData = (d) => writeData(dataName, d);

  app.get(`/api/${routePath}`, (req, res) => res.json(getData()));

  app.post(`/api/${routePath}`, (req, res) => {
    const items = getData();
    const item = { id: uuid(), ...req.body, createdAt: new Date().toISOString() };
    items.push(item);
    setData(items);
    res.json(item);
  });

  app.put(`/api/${routePath}/:id`, (req, res) => {
    const items = getData();
    const idx = items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    items[idx] = { ...items[idx], ...req.body, id: req.params.id };
    setData(items);
    res.json(items[idx]);
  });

  app.delete(`/api/${routePath}/:id`, (req, res) => {
    let items = getData();
    items = items.filter(i => i.id !== req.params.id);
    setData(items);
    res.json({ ok: true });
  });

  app.get(`/api/${routePath}/:id`, (req, res) => {
    const items = getData();
    const item = items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });
}

// --- Brand ---
app.get('/api/brand', (req, res) => {
  res.json(readData('brand', {
    name: '', description: '', industry: '', values: [], tone: '',
    colors: { primary: '#f43f5e', secondary: '#1e1e2e', accent: '#c0c0c0' },
    targetMarket: '', usp: '', competitors: [], guidelines: ''
  }));
});

app.put('/api/brand', (req, res) => {
  writeData('brand', req.body);
  res.json(req.body);
});

// --- Audiences ---
crudRoutes('audiences', 'audiences', []);

// --- Ad Accounts ---
crudRoutes('ad-accounts', 'ad-accounts', []);

// --- Ad Account Guides ---
app.get('/api/ad-accounts/guides', (req, res) => {
  res.json([
    {
      platform: 'google-ads',
      name: 'Google Ads',
      setupSteps: [
        'Create a Google Ads account at ads.google.com',
        'Set up billing with a valid payment method',
        'Install Google Tag (gtag.js) on your website for conversion tracking',
        'Set up conversion actions: purchases, sign-ups, leads, page views',
        'Link Google Analytics 4 for enhanced audience insights',
        'Create your first campaign based on your marketing objective',
        'Set up audience lists: remarketing, customer match, similar audiences',
        'Configure location, language, and device targeting',
        'Set up ad extensions: sitelinks, callouts, structured snippets, call extensions'
      ],
      campaignTypes: [
        { name: 'Search', description: 'Text ads on Google Search results. Best for high-intent keywords.', bestFor: 'Lead generation, direct sales' },
        { name: 'Display', description: 'Visual banner ads across 2M+ websites in Google Display Network.', bestFor: 'Brand awareness, remarketing' },
        { name: 'YouTube (Video)', description: 'Video ads on YouTube: skippable, non-skippable, bumper, discovery.', bestFor: 'Brand awareness, product demos' },
        { name: 'Performance Max', description: 'AI-driven campaigns across all Google channels. Provide assets, Google optimizes.', bestFor: 'Ecommerce, lead gen with automation' },
        { name: 'Shopping', description: 'Product listing ads with images and prices from Merchant Center.', bestFor: 'Ecommerce product sales' },
        { name: 'App', description: 'Promote app installs and engagement across Search, Play, YouTube, Display.', bestFor: 'Mobile app growth' }
      ],
      bestPractices: [
        'Use exact and phrase match keywords for precision; broad match with Smart Bidding',
        'Write 15 headlines and 4 descriptions per Responsive Search Ad',
        'Maintain Quality Score above 7: relevant ads, good landing pages, expected CTR',
        'Use negative keywords to exclude irrelevant searches',
        'Set up conversion tracking before launching any campaign',
        'Use ad scheduling to show ads during peak hours',
        'Test multiple ad variations and let Google optimize',
        'Use audience layering: combine demographics with in-market segments',
        'Review Search Terms report weekly to find new negatives and opportunities'
      ],
      budgetTips: [
        'Start with $20-50/day for Search campaigns to gather data',
        'Allocate 70% to proven campaigns, 20% to testing, 10% to experimental',
        'Use Target CPA or Target ROAS bidding once you have 30+ conversions/month',
        'Set shared budgets for related campaigns',
        'Monitor impression share — if below 80%, consider increasing budget'
      ],
      targetingOptions: ['Keywords', 'In-market audiences', 'Custom intent', 'Remarketing lists', 'Customer match', 'Demographics', 'Affinity audiences', 'Life events', 'Location', 'Device', 'Time of day']
    },
    {
      platform: 'meta-ads',
      name: 'Meta Ads (Facebook & Instagram)',
      setupSteps: [
        'Create or access Facebook Business Manager at business.facebook.com',
        'Add your Facebook Page and Instagram account to Business Manager',
        'Create an Ad Account within Business Manager',
        'Install Meta Pixel on your website (base code + event codes)',
        'Set up Conversions API (CAPI) for server-side tracking',
        'Verify your domain in Business Manager settings',
        'Configure standard events: Purchase, Lead, AddToCart, ViewContent, CompleteRegistration',
        'Create Custom Audiences from website visitors, customer lists, and engagement',
        'Build Lookalike Audiences from your best customers (1-3% for quality, 5-10% for reach)',
        'Set up your payment method and spending limits'
      ],
      campaignTypes: [
        { name: 'Awareness', description: 'Maximize reach and brand recall.', bestFor: 'New brand/product launches' },
        { name: 'Traffic', description: 'Drive clicks to website, app, or Messenger.', bestFor: 'Content promotion, landing pages' },
        { name: 'Engagement', description: 'Get likes, comments, shares, event responses.', bestFor: 'Community building, social proof' },
        { name: 'Leads', description: 'Collect leads via instant forms without leaving Facebook.', bestFor: 'B2B lead gen, newsletter signups' },
        { name: 'Sales', description: 'Drive purchases with conversion optimization.', bestFor: 'Ecommerce, direct response' },
        { name: 'App Promotion', description: 'Drive installs and in-app events.', bestFor: 'Mobile app growth' }
      ],
      bestPractices: [
        'Use Advantage+ placements (let Meta optimize across Facebook, Instagram, Messenger, Audience Network)',
        'Creative is king: test 3-5 variations per ad set with different hooks',
        'Use video content — 15-30 seconds with strong first 3 seconds',
        'Carousel ads typically outperform single image for ecommerce',
        'Refresh creatives every 2-3 weeks to combat ad fatigue',
        'Use broad targeting with Advantage+ and let the algorithm find your audience',
        'Implement CAPI alongside pixel for 95%+ event match rate',
        'Use UTM parameters for all links to track in Google Analytics',
        'Test UGC-style creatives vs polished brand creative'
      ],
      budgetTips: [
        'Minimum $5/day per ad set, recommended $20+/day for learning phase',
        'Budget at 3-5x your target CPA per ad set for proper optimization',
        'Use Campaign Budget Optimization (CBO) to distribute budget across ad sets',
        'Allow 7 days in learning phase before making changes',
        'Scale winning ad sets by 20% increments, not sudden jumps'
      ],
      targetingOptions: ['Custom Audiences', 'Lookalike Audiences', 'Detailed Targeting (interests, behaviors)', 'Demographics', 'Location', 'Connections', 'Advantage+ Audience', 'Saved Audiences']
    },
    {
      platform: 'linkedin-ads',
      name: 'LinkedIn Ads',
      setupSteps: [
        'Create a LinkedIn Campaign Manager account at linkedin.com/campaignmanager',
        'Associate your LinkedIn Company Page',
        'Install the LinkedIn Insight Tag on your website',
        'Set up conversion tracking for key events',
        'Create Matched Audiences from website visitors and contact lists',
        'Set up your billing and payment method',
        'Define your target audience using LinkedIn\'s professional criteria'
      ],
      campaignTypes: [
        { name: 'Sponsored Content', description: 'Native ads in the LinkedIn feed. Single image, video, carousel, document, event.', bestFor: 'Brand awareness, thought leadership, lead gen' },
        { name: 'Sponsored Messaging (InMail)', description: 'Direct messages to targeted LinkedIn members.', bestFor: 'Event invitations, premium content offers, direct outreach' },
        { name: 'Lead Gen Forms', description: 'Pre-filled forms within LinkedIn — no landing page needed.', bestFor: 'B2B lead capture with high conversion rates' },
        { name: 'Text Ads', description: 'Simple PPC ads in the right sidebar.', bestFor: 'Low-budget B2B testing' },
        { name: 'Dynamic Ads', description: 'Personalized ads using member profile data.', bestFor: 'Follower acquisition, spotlight promotions' }
      ],
      bestPractices: [
        'Keep audience size between 50K-500K for optimal delivery',
        'Use job title targeting for precision, job function for reach',
        'Lead Gen Forms convert 2-5x better than landing pages on LinkedIn',
        'Refresh creatives every 4-6 weeks',
        'Use thought leadership content, not hard sells',
        'Include clear value proposition in first 150 characters',
        'Test single image vs video vs carousel formats',
        'Use company size and industry for B2B targeting'
      ],
      budgetTips: [
        'Minimum $10/day per campaign recommended',
        'CPCs are typically $5-15 for B2B, higher than other platforms',
        'Use manual CPC bidding to control costs initially',
        'Budget $50-100/day minimum for meaningful data',
        'InMail costs $0.50-1.00 per send on average'
      ],
      targetingOptions: ['Job title', 'Job function', 'Company name', 'Company size', 'Industry', 'Seniority', 'Skills', 'Groups', 'Education', 'Location', 'Matched Audiences', 'Lookalike Audiences']
    },
    {
      platform: 'tiktok-ads',
      name: 'TikTok Ads',
      setupSteps: [
        'Create a TikTok Business Center account at ads.tiktok.com',
        'Set up your Advertiser Account within Business Center',
        'Install TikTok Pixel on your website',
        'Configure Events API for server-side tracking',
        'Set up standard events: ViewContent, AddToCart, Purchase, CompleteRegistration',
        'Create Custom Audiences from pixel data, customer files, engagement',
        'Connect your TikTok business account for Spark Ads',
        'Set up your payment method'
      ],
      campaignTypes: [
        { name: 'In-Feed Ads', description: 'Native video ads in the For You Page feed.', bestFor: 'Brand awareness, app installs, conversions' },
        { name: 'TopView', description: 'First ad users see when opening TikTok.', bestFor: 'Maximum visibility, product launches' },
        { name: 'Branded Hashtag Challenge', description: 'Sponsored hashtag challenges for user-generated content.', bestFor: 'Viral engagement, community building' },
        { name: 'Branded Effects', description: 'Custom AR filters and effects.', bestFor: 'Interactive brand engagement' },
        { name: 'Spark Ads', description: 'Boost organic TikTok posts (yours or creators\') as ads.', bestFor: 'Authentic content promotion, influencer amplification' }
      ],
      bestPractices: [
        'Create TikTok-native content — don\'t repurpose polished ads from other platforms',
        'Hook viewers in the first 1-2 seconds',
        'Use trending sounds and music',
        'Vertical video only (9:16 aspect ratio)',
        'Keep videos 15-30 seconds for best performance',
        'Use text overlays and captions (many watch without sound)',
        'Leverage Spark Ads to boost high-performing organic content',
        'Collaborate with TikTok creators for authentic content',
        'Test multiple hooks with the same offer'
      ],
      budgetTips: [
        'Minimum $20/day per ad group for optimization',
        'Start with $50-100/day to exit learning phase faster',
        'CPMs are typically $5-15, lower than Meta for younger demographics',
        'Use Lowest Cost bidding initially, then switch to Cost Cap once you know your CPA',
        'Allocate budget for creator partnerships alongside paid ads'
      ],
      targetingOptions: ['Demographics', 'Interests', 'Behaviors', 'Custom Audiences', 'Lookalike Audiences', 'Device targeting', 'Smart targeting', 'Hashtag interactions', 'Video interactions', 'Creator interactions']
    }
  ]);
});

// --- Campaigns ---
crudRoutes('campaigns', 'campaigns', []);

// --- Influencers ---
crudRoutes('influencers', 'influencers', []);

// Influencer search (stub — returns guidance)
app.post('/api/influencers/search', (req, res) => {
  const { query, platform, category, minFollowers, maxFollowers } = req.body;
  res.json({
    message: 'Use the AI assistant to search for influencers. Provide criteria and the AI will help discover relevant influencers.',
    criteria: { query, platform, category, minFollowers, maxFollowers },
    suggestions: [
      'Try searching social media platforms directly',
      'Use hashtag research to find niche influencers',
      'Check competitor collaborations',
      'Look at industry events and speakers'
    ]
  });
});

// Influencer scoring
app.post('/api/influencers/:id/score', (req, res) => {
  const influencers = readData('influencers', []);
  const idx = influencers.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const inf = influencers[idx];
  const brand = readData('brand', {});

  // Scoring: followers 20%, engagement 30%, relevance 25%, value 15%, audience 10%
  let followerScore = 0;
  const f = inf.followers || 0;
  if (f >= 1000000) followerScore = 90;
  else if (f >= 500000) followerScore = 80;
  else if (f >= 100000) followerScore = 70;
  else if (f >= 50000) followerScore = 60;
  else if (f >= 10000) followerScore = 50;
  else if (f >= 5000) followerScore = 40;
  else if (f >= 1000) followerScore = 30;
  else followerScore = 20;

  const engagementScore = Math.min(100, (inf.engagementRate || 0) * 20);

  // Relevance: check tag overlap with brand values/industry
  let relevanceScore = 50; // default
  if (brand.industry && inf.category) {
    const catLower = (inf.category || '').toLowerCase();
    const indLower = (brand.industry || '').toLowerCase();
    if (catLower.includes(indLower) || indLower.includes(catLower)) relevanceScore = 85;
  }
  if (inf.tags && brand.values) {
    const overlap = (inf.tags || []).filter(t =>
      (brand.values || []).some(v => v.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(v.toLowerCase()))
    );
    if (overlap.length > 0) relevanceScore = Math.min(100, relevanceScore + overlap.length * 10);
  }

  // Value: price per follower ratio
  let valueScore = 50;
  if (inf.priceRange && inf.priceRange.max && f > 0) {
    const costPerFollower = inf.priceRange.max / f;
    if (costPerFollower < 0.01) valueScore = 90;
    else if (costPerFollower < 0.03) valueScore = 75;
    else if (costPerFollower < 0.05) valueScore = 60;
    else if (costPerFollower < 0.1) valueScore = 40;
    else valueScore = 25;
  }

  const audienceScore = 50; // default without API data

  const total = Math.round(
    followerScore * 0.20 +
    engagementScore * 0.30 +
    relevanceScore * 0.25 +
    valueScore * 0.15 +
    audienceScore * 0.10
  );

  influencers[idx].score = total;
  influencers[idx].scoreBreakdown = {
    followers: { weight: '20%', score: followerScore },
    engagement: { weight: '30%', score: engagementScore },
    relevance: { weight: '25%', score: relevanceScore },
    value: { weight: '15%', score: valueScore },
    audienceQuality: { weight: '10%', score: audienceScore }
  };
  writeData('influencers', influencers);
  res.json(influencers[idx]);
});

// --- Influencer Campaigns ---
crudRoutes('influencer-campaigns', 'influencer-campaigns', []);

app.post('/api/influencer-campaigns/:id/approve', (req, res) => {
  const campaigns = readData('influencer-campaigns', []);
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  campaigns[idx].status = 'approved';
  campaigns[idx].approvedAt = new Date().toISOString();
  writeData('influencer-campaigns', campaigns);
  res.json(campaigns[idx]);
});

// --- Creatives ---
crudRoutes('creatives', 'creatives', []);

app.post('/api/creatives/generate', async (req, res) => {
  const { prompt, type, style, dimensions, platform } = req.body;
  const config = readData('config', {});
  const falKey = process.env.FAL_KEY || config.falKey;

  if (!falKey) {
    return res.status(400).json({ error: 'FAL_KEY not configured. Set it in Settings or as environment variable.' });
  }

  const creatives = readData('creatives', []);
  const creative = {
    id: uuid(),
    name: `${style || 'Custom'} ${type} for ${platform || 'general'}`,
    type: type || 'image',
    prompt,
    style: style || 'professional',
    platform: platform || 'general',
    dimensions: dimensions || '1024x1024',
    url: null,
    status: 'generating',
    createdAt: new Date().toISOString()
  };
  creatives.push(creative);
  writeData('creatives', creatives);

  // Start async generation
  (async () => {
    try {
      let apiUrl, body;
      if (type === 'video') {
        apiUrl = 'https://fal.run/fal-ai/fast-svd-lcm';
        body = { prompt, num_frames: 25 };
      } else {
        apiUrl = 'https://fal.run/fal-ai/flux/dev';
        const sizeMap = {
          '1080x1080': { width: 1024, height: 1024 },
          '1080x1920': { width: 768, height: 1344 },
          '1200x628': { width: 1344, height: 768 },
          '1200x1200': { width: 1024, height: 1024 },
          '1080x1350': { width: 768, height: 1024 }
        };
        const size = sizeMap[dimensions] || { width: 1024, height: 1024 };
        body = { prompt: `${style ? style + ' style. ' : ''}${prompt}`, image_size: size, num_images: 1 };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      const items = readData('creatives', []);
      const i = items.findIndex(c => c.id === creative.id);
      if (i !== -1) {
        if (result.images && result.images[0]) {
          items[i].url = result.images[0].url;
          items[i].status = 'ready';
        } else if (result.video) {
          items[i].url = result.video.url;
          items[i].status = 'ready';
        } else {
          items[i].status = 'ready';
          items[i].error = result.detail || 'Unknown response format';
        }
        writeData('creatives', items);
      }
    } catch (err) {
      const items = readData('creatives', []);
      const i = items.findIndex(c => c.id === creative.id);
      if (i !== -1) {
        items[i].status = 'ready';
        items[i].error = err.message;
        writeData('creatives', items);
      }
    }
  })();

  res.json({ id: creative.id, status: 'generating' });
});

app.get('/api/creatives/:id/status', (req, res) => {
  const creatives = readData('creatives', []);
  const c = creatives.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json({ id: c.id, status: c.status, url: c.url, error: c.error });
});

// --- Channels ---
crudRoutes('channels', 'channels', []);

// --- Budget ---
app.get('/api/budget', (req, res) => {
  res.json(readData('budget', { total: 0, allocated: {}, spent: 0, remaining: 0, period: 'monthly' }));
});

app.put('/api/budget', (req, res) => {
  const budget = { ...req.body };
  budget.remaining = (budget.total || 0) - (budget.spent || 0);
  writeData('budget', budget);
  res.json(budget);
});

// --- Config ---
app.get('/api/config', (req, res) => {
  const config = readData('config', { falKey: '', notifications: true });
  // Mask sensitive keys
  const masked = { ...config };
  if (masked.falKey) masked.falKey = masked.falKey.slice(0, 8) + '...' + masked.falKey.slice(-4);
  res.json(masked);
});

app.put('/api/config', (req, res) => {
  const existing = readData('config', {});
  // Don't overwrite falKey with masked version
  const updated = { ...existing, ...req.body };
  if (req.body.falKey && req.body.falKey.includes('...')) {
    updated.falKey = existing.falKey;
  }
  writeData('config', updated);
  res.json({ ok: true });
});

// --- Analytics ---
app.get('/api/analytics', (req, res) => {
  const campaigns = readData('campaigns', []);
  const influencers = readData('influencers', []);
  const creatives = readData('creatives', []);
  const channels = readData('channels', []);
  const budget = readData('budget', { total: 0, spent: 0 });
  const infCampaigns = readData('influencer-campaigns', []);

  const totalSpent = campaigns.reduce((s, c) => s + (c.spent || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.metrics?.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.metrics?.clicks || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.metrics?.conversions || 0), 0);

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const activeInfluencers = influencers.filter(i => i.status === 'active').length;

  const influencerSpend = infCampaigns.reduce((s, c) => s + (c.agreedPrice || 0), 0);

  const channelPerformance = channels.map(ch => ({
    id: ch.id,
    name: ch.name,
    type: ch.type,
    roi: ch.performance?.roi || 0,
    reach: ch.performance?.reach || 0,
    conversions: ch.performance?.conversions || 0,
    budget: ch.budget || 0
  }));

  const overallROI = totalSpent > 0 ? ((totalConversions * 50 - totalSpent) / totalSpent * 100).toFixed(1) : 0;

  res.json({
    totalSpent: totalSpent + influencerSpend,
    budgetTotal: budget.total,
    budgetRemaining: (budget.total || 0) - (budget.spent || 0),
    overallROI,
    activeCampaigns,
    activeInfluencers,
    creativesGenerated: creatives.length,
    totalImpressions,
    totalClicks,
    totalConversions,
    channelPerformance,
    recentCampaigns: campaigns.slice(-5).reverse(),
    influencerPipeline: {
      discovered: influencers.filter(i => i.status === 'discovered').length,
      contacted: influencers.filter(i => i.status === 'contacted').length,
      negotiating: influencers.filter(i => i.status === 'negotiating').length,
      active: activeInfluencers,
      completed: influencers.filter(i => i.status === 'completed').length
    },
    recentCreatives: creatives.filter(c => c.status === 'ready').slice(-6).reverse()
  });
});

// --- SPA fallback ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Marketing Command Center running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
