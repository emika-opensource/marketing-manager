/* Marketing Command Center — SPA */
(function(){
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const content = () => $('#content');

// --- API (with error handling) ---
const api = {
  async get(url) { const r = await fetch(url); if(!r.ok) throw new Error(`GET ${url} failed: ${r.status}`); return r.json(); },
  async post(url, data) { const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); if(!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || `POST ${url} failed: ${r.status}`); } return r.json(); },
  async put(url, data) { const r = await fetch(url, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); if(!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || `PUT ${url} failed: ${r.status}`); } return r.json(); },
  async del(url) { const r = await fetch(url, { method:'DELETE' }); if(!r.ok) throw new Error(`DELETE ${url} failed: ${r.status}`); return r.json(); }
};

function showLoading() { content().innerHTML = '<div class="spinner"></div>'; }
function showError(msg) { content().innerHTML = `<div class="empty-state"><p style="color:var(--red)">⚠ ${esc(msg)}</p><button class="btn btn-sm" onclick="navigate()">Retry</button></div>`; }

// --- TOAST ---
function toast(msg, type='success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  $('#toast-container').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// --- MODAL ---
function showModal(title, bodyHtml, footerHtml='', cls='') {
  const ov = $('#modal-overlay');
  ov.innerHTML = `<div class="modal ${cls}"><div class="modal-header"><h2>${title}</h2><button class="modal-close" onclick="document.getElementById('modal-overlay').classList.add('hidden')">&times;</button></div><div class="modal-body">${bodyHtml}</div>${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}</div>`;
  ov.classList.remove('hidden');
}
function closeModal() { $('#modal-overlay').classList.add('hidden'); }
window.closeModal = closeModal;

// --- HELPERS ---
function fmtNum(n) { if(n>=1000000) return (n/1000000).toFixed(1)+'M'; if(n>=1000) return (n/1000).toFixed(1)+'K'; return String(n||0); }
function fmtMoney(n) { return '$' + (n||0).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0}); }
function scoreClass(s) { if(s>70) return 'score-green'; if(s>=40) return 'score-yellow'; return 'score-red'; }
function badgeClass(s) { const map = {active:'active',connected:'connected',paused:'paused',pending:'pending',negotiating:'negotiating',draft:'draft',discovered:'discovered',planned:'planned',completed:'completed',delivered:'delivered',rejected:'rejected',disconnected:'disconnected',contacted:'contacted',primary:'primary',secondary:'secondary',tertiary:'tertiary'}; return 'badge-'+(map[s]||'draft'); }
function platformClass(p) { return 'platform-'+(p||'').replace(/\s+/g,'-').toLowerCase(); }
function safeTags(arr) { return (arr||[]).map(t=>`<span class="form-tag">${esc(t)}</span>`).join(''); }
function esc(s) { const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }

// --- ICONS ---
const icons = {
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
  search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  image: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  video: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  external: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
};

// --- ROUTING ---
const routes = {};
function route(hash, fn) { routes[hash] = fn; }
function navigate() {
  let h = location.hash.slice(1) || 'dashboard';
  let param = null;
  // handle #influencer/:id
  if(h.startsWith('influencer/')) { param = h.split('/')[1]; h = 'influencer-detail'; }
  const fn = routes[h];
  if(fn) fn(param);
  $$('.nav-item').forEach(n => {
    const p = n.getAttribute('data-page');
    n.classList.toggle('active', h===p || (h==='influencer-detail' && p==='influencers'));
  });
}
window.addEventListener('hashchange', navigate);

// ===================== SETUP WIZARD =====================
async function checkFirstRun() {
  try {
    const brand = await api.get('/api/brand');
    return !brand.name;
  } catch { return true; }
}

function showSetupWizard() {
  content().innerHTML = `
    <div class="page-header"><h1>Welcome to Marketing Command Center</h1><p>Let's get you set up in 3 quick steps</p></div>
    <div class="card" style="max-width:640px;margin:0 auto">
      <div class="pipeline" style="margin-bottom:24px">
        <div class="pipeline-stage active" id="wiz-step-1">1. Brand</div>
        <div class="pipeline-stage" id="wiz-step-2">2. Audience</div>
        <div class="pipeline-stage" id="wiz-step-3">3. Budget</div>
      </div>
      <div id="wiz-body">
        <div class="form-group"><label>Brand Name <span style="color:var(--red)">*</span></label><input class="form-input" id="wiz-brand-name" placeholder="Your company or product name"></div>
        <div class="form-group"><label>Industry <span style="color:var(--red)">*</span></label><input class="form-input" id="wiz-brand-industry" placeholder="e.g. SaaS, E-commerce, Healthcare..."></div>
        <div class="form-group"><label>Brief Description</label><textarea class="form-textarea" id="wiz-brand-desc" placeholder="What does your business do?" rows="2"></textarea></div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">
        <button class="btn" id="wiz-back" onclick="wizBack()" style="display:none">Back</button>
        <button class="btn btn-primary" id="wiz-next" onclick="wizNext()">Next →</button>
      </div>
    </div>
  `;
  window._wizStep = 1;
}

window.wizNext = async () => {
  const step = window._wizStep;
  if(step === 1) {
    const name = $('#wiz-brand-name').value.trim();
    const industry = $('#wiz-brand-industry').value.trim();
    if(!name) { toast('Brand name is required', 'error'); return; }
    if(!industry) { toast('Industry is required', 'error'); return; }
    window._wizBrand = { name, industry, description: $('#wiz-brand-desc').value.trim() };
    // Step 2
    window._wizStep = 2;
    $('#wiz-step-1').classList.remove('active'); $('#wiz-step-1').classList.add('done');
    $('#wiz-step-2').classList.add('active');
    $('#wiz-back').style.display = '';
    $('#wiz-body').innerHTML = `
      <div class="form-group"><label>Audience Name <span style="color:var(--red)">*</span></label><input class="form-input" id="wiz-aud-name" placeholder="e.g. Tech-savvy Millennials"></div>
      <div class="form-row">
        <div class="form-group"><label>Age Range</label><input class="form-input" id="wiz-aud-age" placeholder="25-45"></div>
        <div class="form-group"><label>Location</label><input class="form-input" id="wiz-aud-loc" placeholder="US, Europe..."></div>
      </div>
      <div class="form-group"><label>Interests (comma-separated)</label><input class="form-input" id="wiz-aud-interests" placeholder="technology, design, startups..."></div>
    `;
  } else if(step === 2) {
    const audName = $('#wiz-aud-name').value.trim();
    if(!audName) { toast('Audience name is required', 'error'); return; }
    window._wizAud = { name: audName, age: $('#wiz-aud-age').value.trim(), location: $('#wiz-aud-loc').value.trim(), interests: $('#wiz-aud-interests').value };
    // Step 3
    window._wizStep = 3;
    $('#wiz-step-2').classList.remove('active'); $('#wiz-step-2').classList.add('done');
    $('#wiz-step-3').classList.add('active');
    $('#wiz-next').textContent = 'Finish Setup ✓';
    $('#wiz-body').innerHTML = `
      <div class="form-group"><label>Monthly Marketing Budget ($) <span style="color:var(--red)">*</span></label><input class="form-input" id="wiz-budget" type="number" placeholder="5000"></div>
      <div class="form-group"><label>Budget Period</label><select class="form-select" id="wiz-period"><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
    `;
  } else if(step === 3) {
    const budgetVal = Number($('#wiz-budget').value);
    if(!budgetVal || budgetVal <= 0) { toast('Please enter a valid budget', 'error'); return; }
    $('#wiz-next').disabled = true; $('#wiz-next').textContent = 'Setting up...';
    try {
      const b = window._wizBrand;
      await api.put('/api/brand', { name:b.name, industry:b.industry, description:b.description, values:[], tone:'', colors:{primary:'#f43f5e',secondary:'#1e1e2e',accent:'#c0c0c0'}, targetMarket:'', usp:'', competitors:[], guidelines:'' });
      const a = window._wizAud;
      const split = v => v.split(',').map(s=>s.trim()).filter(Boolean);
      await api.post('/api/audiences', { name:a.name, description:'', priority:'primary', demographics:{ageRange:a.age,gender:'',location:a.location,income:'',education:''}, psychographics:{interests:split(a.interests),painPoints:[],goals:[],values:[]}, channels:[], size:'', buyingBehavior:'' });
      await api.put('/api/budget', { total:budgetVal, spent:0, period:$('#wiz-period').value, allocated:{} });
      toast('Setup complete! Welcome aboard 🎉');
      navigate();
    } catch(e) {
      toast('Setup failed: ' + e.message, 'error');
      $('#wiz-next').disabled = false; $('#wiz-next').textContent = 'Finish Setup ✓';
    }
  }
};

window.wizBack = () => {
  if(window._wizStep === 2) { window._wizStep = 1; showSetupWizard(); }
  else if(window._wizStep === 3) {
    window._wizStep = 2;
    $('#wiz-step-3').classList.remove('active');
    $('#wiz-step-2').classList.remove('done'); $('#wiz-step-2').classList.add('active');
    $('#wiz-next').textContent = 'Next →';
    const a = window._wizAud || {};
    $('#wiz-body').innerHTML = `
      <div class="form-group"><label>Audience Name <span style="color:var(--red)">*</span></label><input class="form-input" id="wiz-aud-name" value="${esc(a.name||'')}" placeholder="e.g. Tech-savvy Millennials"></div>
      <div class="form-row">
        <div class="form-group"><label>Age Range</label><input class="form-input" id="wiz-aud-age" value="${esc(a.age||'')}" placeholder="25-45"></div>
        <div class="form-group"><label>Location</label><input class="form-input" id="wiz-aud-loc" value="${esc(a.location||'')}" placeholder="US, Europe..."></div>
      </div>
      <div class="form-group"><label>Interests (comma-separated)</label><input class="form-input" id="wiz-aud-interests" value="${esc(a.interests||'')}" placeholder="technology, design, startups..."></div>
    `;
  }
};

// ===================== DASHBOARD =====================
route('dashboard', async () => {
  showLoading();
  try {
  const isFirstRun = await checkFirstRun();
  if(isFirstRun) { showSetupWizard(); return; }
  const data = await api.get('/api/analytics');
  const ip = data.influencerPipeline || {};
  const brand = await api.get('/api/brand');
  const audiences = await api.get('/api/audiences');
  const channels = await api.get('/api/channels');
  const budget = await api.get('/api/budget');
  const hasBrand = !!brand.name;
  const hasAudience = audiences.length > 0;
  const hasChannel = channels.length > 0;
  const hasBudget = (budget.total || 0) > 0;
  const hasCampaign = data.activeCampaigns > 0 || (data.recentCampaigns||[]).length > 0;
  const setupDone = hasBrand && hasAudience && hasChannel && hasBudget && hasCampaign;
  const checklistHtml = setupDone ? '' : `
    <div class="card" style="margin-bottom:24px;border-color:var(--accent)">
      <div class="card-header"><h3>🚀 Getting Started</h3></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <a href="#brand" style="display:flex;align-items:center;gap:8px;color:${hasBrand?'var(--green)':'var(--text)'}">${hasBrand?'✅':'☐'} Set up your brand profile</a>
        <a href="#brand" style="display:flex;align-items:center;gap:8px;color:${hasAudience?'var(--green)':'var(--text)'}">${hasAudience?'✅':'☐'} Define your target audience</a>
        <a href="#channels" style="display:flex;align-items:center;gap:8px;color:${hasChannel?'var(--green)':'var(--text)'}">${hasChannel?'✅':'☐'} Add a marketing channel</a>
        <a href="#budget" style="display:flex;align-items:center;gap:8px;color:${hasBudget?'var(--green)':'var(--text)'}">${hasBudget?'✅':'☐'} Set your budget</a>
        <a href="#campaigns" style="display:flex;align-items:center;gap:8px;color:${hasCampaign?'var(--green)':'var(--text)'}">${hasCampaign?'✅':'☐'} Create your first campaign</a>
      </div>
    </div>`;
  content().innerHTML = `
    <div class="page-header"><h1>Dashboard</h1><p>Marketing overview at a glance</p></div>
    ${checklistHtml}
    <div class="kpi-row">
      <div class="kpi-card kpi-accent"><div class="kpi-label">Total Spend</div><div class="kpi-value">${fmtMoney(data.totalSpent)}</div><div class="kpi-sub">of ${fmtMoney(data.budgetTotal)} budget</div></div>
      <div class="kpi-card kpi-green"><div class="kpi-label">Overall ROI</div><div class="kpi-value">${data.overallROI}%</div><div class="kpi-sub">across all channels</div></div>
      <div class="kpi-card kpi-blue"><div class="kpi-label">Active Campaigns</div><div class="kpi-value">${data.activeCampaigns}</div></div>
      <div class="kpi-card kpi-purple"><div class="kpi-label">Active Influencers</div><div class="kpi-value">${data.activeInfluencers}</div></div>
      <div class="kpi-card kpi-yellow"><div class="kpi-label">Creatives</div><div class="kpi-value">${data.creativesGenerated}</div><div class="kpi-sub">generated</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Channel Performance</h3></div>
        <div class="bar-chart" id="channel-chart"></div>
        ${data.channelPerformance.length===0 ? '<div class="empty-state"><p>No channels configured yet</p></div>' : ''}
      </div>
      <div class="card">
        <div class="card-header"><h3>Influencer Pipeline</h3></div>
        <div class="pipeline">
          <div class="pipeline-stage ${ip.discovered?'active':''}">Discovered<br><strong>${ip.discovered||0}</strong></div>
          <div class="pipeline-stage ${ip.contacted?'active':''}">Contacted<br><strong>${ip.contacted||0}</strong></div>
          <div class="pipeline-stage ${ip.negotiating?'active':''}">Negotiating<br><strong>${ip.negotiating||0}</strong></div>
          <div class="pipeline-stage ${ip.active?'active':''}">Active<br><strong>${ip.active||0}</strong></div>
          <div class="pipeline-stage ${ip.completed?'done':''}">Completed<br><strong>${ip.completed||0}</strong></div>
        </div>
        <div style="margin-top:20px">
          <div class="card-header"><h3>Recent Campaigns</h3></div>
          ${(data.recentCampaigns||[]).length===0 ? '<div class="empty-state"><p>No campaigns yet</p></div>' :
            '<table><tr><th>Name</th><th>Platform</th><th>Status</th><th>Spent</th></tr>' +
            (data.recentCampaigns||[]).map(c=>`<tr onclick="location.hash='#campaigns'"><td>${esc(c.name)}</td><td><span class="${platformClass(c.platform)}">${esc(c.platform)}</span></td><td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td><td>${fmtMoney(c.spent)}</td></tr>`).join('') +
            '</table>'
          }
        </div>
      </div>
    </div>
    ${(data.recentCreatives||[]).length>0 ? `
    <div class="card" style="margin-top:20px">
      <div class="card-header"><h3>Recent Creatives</h3></div>
      <div class="creative-grid">${(data.recentCreatives||[]).map(c=>`
        <div class="creative-card">
          <div class="creative-preview">${c.url ? `<img src="${esc(c.url)}" alt="">` : icons.image}</div>
          <div class="creative-info"><h4>${esc(c.name)}</h4><span class="badge ${badgeClass(c.status)}">${c.status}</span></div>
        </div>`).join('')}</div>
    </div>` : ''}
  `;
  // Render channel bars
  const chart = document.getElementById('channel-chart');
  if(chart && data.channelPerformance.length) {
    const maxROI = Math.max(...data.channelPerformance.map(c=>c.roi), 1);
    chart.innerHTML = data.channelPerformance.map(c => {
      const pct = Math.max(5, (c.roi/maxROI)*100);
      return `<div class="bar-row"><div class="bar-label">${esc(c.name)}</div><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--accent)">${c.roi}%</div></div><div class="bar-value">${fmtMoney(c.budget)}</div></div>`;
    }).join('');
  }
  } catch(e) { showError('Failed to load dashboard: ' + e.message); }
});

// ===================== BRAND & ICP =====================
route('brand', async () => {
  showLoading();
  try {
  const brand = await api.get('/api/brand');
  const audiences = await api.get('/api/audiences');
  content().innerHTML = `
    <div class="page-header"><h1>Brand & ICP</h1><p>Brand identity and ideal customer profiles</p></div>
    <div class="card" style="margin-bottom:24px">
      <div class="card-header"><h3>Brand Profile</h3><button class="btn btn-sm" onclick="editBrand()">${icons.edit} Edit</button></div>
      <div class="grid-2">
        <div>
          <div class="form-group"><label>Brand Name</label><div style="font-size:18px;font-weight:600">${esc(brand.name)||'<span style="color:var(--text-muted)">Not set</span>'}</div></div>
          <div class="form-group"><label>Industry</label><div>${esc(brand.industry)||'—'}</div></div>
          <div class="form-group"><label>Description</label><div style="color:var(--text-dim)">${esc(brand.description)||'—'}</div></div>
          <div class="form-group"><label>USP</label><div>${esc(brand.usp)||'—'}</div></div>
        </div>
        <div>
          <div class="form-group"><label>Tone</label><div>${esc(brand.tone)||'—'}</div></div>
          <div class="form-group"><label>Values</label><div class="form-tags">${safeTags(brand.values)}</div></div>
          <div class="form-group"><label>Colors</label>
            <div class="color-swatches">
              ${['primary','secondary','accent'].map(k=>`<div><div class="color-swatch" style="background:${brand.colors?.[k]||'#333'}"></div><div class="color-swatch-label">${k}</div></div>`).join('')}
            </div>
          </div>
          <div class="form-group"><label>Competitors</label><div class="form-tags">${safeTags(brand.competitors)}</div></div>
        </div>
      </div>
      ${brand.guidelines ? `<div class="form-group" style="margin-top:12px"><label>Guidelines</label><div style="color:var(--text-dim);white-space:pre-wrap">${esc(brand.guidelines)}</div></div>` : ''}
    </div>
    <div class="card-header" style="margin-bottom:16px"><h3>Audience Segments (ICP)</h3><button class="btn btn-primary btn-sm" onclick="addAudience()">${icons.plus} Add Audience</button></div>
    ${audiences.length===0 ? '<div class="empty-state"><p>No audience segments yet. Add your ideal customer profiles.</p></div>' : ''}
    <div class="grid-2" id="audience-list">
      ${audiences.map(a => audienceCard(a)).join('')}
    </div>
  `;
  window.editBrand = () => editBrandModal(brand);
  window.addAudience = () => audienceModal();
  } catch(e) { showError('Failed to load brand data: ' + e.message); }
});

function audienceCard(a) {
  return `<div class="card">
    <div class="card-header"><h3>${esc(a.name)}</h3><div><span class="badge ${badgeClass(a.priority)}">${a.priority||'primary'}</span> <button class="btn btn-sm btn-ghost" onclick="editAudienceById('${a.id}')">${icons.edit}</button><button class="btn btn-sm btn-ghost btn-danger" onclick="deleteAudience('${a.id}')">${icons.trash}</button></div></div>
    <p style="color:var(--text-dim);margin-bottom:12px">${esc(a.description)}</p>
    <div class="form-row">
      <div><label style="font-size:11px;color:var(--text-muted)">DEMOGRAPHICS</label>
        <div style="font-size:12px;margin-top:4px">${a.demographics ? `${esc(a.demographics.ageRange||'')} / ${esc(a.demographics.gender||'')} / ${esc(a.demographics.location||'')}` : '—'}</div>
      </div>
      <div><label style="font-size:11px;color:var(--text-muted)">SIZE</label>
        <div style="font-size:12px;margin-top:4px">${a.size||'—'}</div>
      </div>
    </div>
    ${a.psychographics?.interests?.length ? `<div style="margin-top:10px"><label style="font-size:11px;color:var(--text-muted)">INTERESTS</label><div class="form-tags" style="margin-top:4px">${safeTags(a.psychographics.interests)}</div></div>` : ''}
    ${a.channels?.length ? `<div style="margin-top:10px"><label style="font-size:11px;color:var(--text-muted)">CHANNELS</label><div class="form-tags" style="margin-top:4px">${safeTags(a.channels)}</div></div>` : ''}
  </div>`;
}

function editBrandModal(brand) {
  showModal('Edit Brand Profile', `
    <div class="form-group"><label>Brand Name</label><input class="form-input" id="b-name" value="${esc(brand.name)}"></div>
    <div class="form-group"><label>Industry</label><input class="form-input" id="b-industry" value="${esc(brand.industry)}"></div>
    <div class="form-group"><label>Description</label><textarea class="form-textarea" id="b-desc">${esc(brand.description)}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Tone</label><input class="form-input" id="b-tone" value="${esc(brand.tone)}"></div>
      <div class="form-group"><label>Target Market</label><input class="form-input" id="b-market" value="${esc(brand.targetMarket)}"></div>
    </div>
    <div class="form-group"><label>USP</label><input class="form-input" id="b-usp" value="${esc(brand.usp)}"></div>
    <div class="form-row">
      <div class="form-group"><label>Primary Color</label><input class="form-input" id="b-c1" type="color" value="${brand.colors?.primary||'#f43f5e'}"></div>
      <div class="form-group"><label>Secondary Color</label><input class="form-input" id="b-c2" type="color" value="${brand.colors?.secondary||'#1e1e2e'}"></div>
    </div>
    <div class="form-group"><label>Accent Color</label><input class="form-input" id="b-c3" type="color" value="${brand.colors?.accent||'#c0c0c0'}" style="width:50%"></div>
    <div class="form-group"><label>Values (comma-separated)</label><input class="form-input" id="b-values" value="${(brand.values||[]).join(', ')}"></div>
    <div class="form-group"><label>Competitors (comma-separated)</label><input class="form-input" id="b-comp" value="${(brand.competitors||[]).join(', ')}"></div>
    <div class="form-group"><label>Guidelines</label><textarea class="form-textarea" id="b-guide">${esc(brand.guidelines)}</textarea></div>
  `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveBrand()">Save</button>`);
  window.saveBrand = async () => {
    if(!$('#b-name').value.trim()) { toast('Brand name is required', 'error'); return; }
    try {
    await api.put('/api/brand', {
      name: $('#b-name').value, industry: $('#b-industry').value, description: $('#b-desc').value,
      tone: $('#b-tone').value, targetMarket: $('#b-market').value, usp: $('#b-usp').value,
      colors: { primary: $('#b-c1').value, secondary: $('#b-c2').value, accent: $('#b-c3').value },
      values: $('#b-values').value.split(',').map(s=>s.trim()).filter(Boolean),
      competitors: $('#b-comp').value.split(',').map(s=>s.trim()).filter(Boolean),
      guidelines: $('#b-guide').value
    });
    closeModal(); toast('Brand updated'); navigate();
    } catch(e) { toast('Failed to save: ' + e.message, 'error'); }
  };
}

function audienceModal(existing=null) {
  const a = existing || { name:'', description:'', demographics:{}, psychographics:{interests:[],painPoints:[],goals:[],values:[]}, channels:[], contentPreferences:[], buyingBehavior:'', size:'', priority:'primary' };
  showModal(existing ? 'Edit Audience' : 'Add Audience', `
    <div class="form-group"><label>Name</label><input class="form-input" id="a-name" value="${esc(a.name)}"></div>
    <div class="form-group"><label>Description</label><textarea class="form-textarea" id="a-desc">${esc(a.description)}</textarea></div>
    <div class="form-group"><label>Priority</label><select class="form-select" id="a-priority"><option value="primary" ${a.priority==='primary'?'selected':''}>Primary</option><option value="secondary" ${a.priority==='secondary'?'selected':''}>Secondary</option><option value="tertiary" ${a.priority==='tertiary'?'selected':''}>Tertiary</option></select></div>
    <div class="form-row">
      <div class="form-group"><label>Age Range</label><input class="form-input" id="a-age" value="${esc(a.demographics?.ageRange)}" placeholder="25-45"></div>
      <div class="form-group"><label>Gender</label><input class="form-input" id="a-gender" value="${esc(a.demographics?.gender)}" placeholder="All / Male / Female"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Location</label><input class="form-input" id="a-loc" value="${esc(a.demographics?.location)}"></div>
      <div class="form-group"><label>Income</label><input class="form-input" id="a-income" value="${esc(a.demographics?.income)}"></div>
    </div>
    <div class="form-group"><label>Education</label><input class="form-input" id="a-edu" value="${esc(a.demographics?.education)}"></div>
    <div class="form-group"><label>Interests (comma-separated)</label><input class="form-input" id="a-interests" value="${(a.psychographics?.interests||[]).join(', ')}"></div>
    <div class="form-group"><label>Pain Points (comma-separated)</label><input class="form-input" id="a-pain" value="${(a.psychographics?.painPoints||[]).join(', ')}"></div>
    <div class="form-group"><label>Goals (comma-separated)</label><input class="form-input" id="a-goals" value="${(a.psychographics?.goals||[]).join(', ')}"></div>
    <div class="form-group"><label>Channels (comma-separated)</label><input class="form-input" id="a-channels" value="${(a.channels||[]).join(', ')}"></div>
    <div class="form-group"><label>Estimated Size</label><input class="form-input" id="a-size" value="${esc(a.size)}"></div>
    <div class="form-group"><label>Buying Behavior</label><input class="form-input" id="a-buying" value="${esc(a.buyingBehavior)}"></div>
  `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAudience('${existing?.id||''}')">${existing?'Update':'Create'}</button>`, 'modal-wide');
  window.saveAudience = async (id) => {
    if(!$('#a-name').value.trim()) { toast('Audience name is required', 'error'); return; }
    try {
    const split = v => v.split(',').map(s=>s.trim()).filter(Boolean);
    const data = {
      name: $('#a-name').value, description: $('#a-desc').value, priority: $('#a-priority').value,
      demographics: { ageRange: $('#a-age').value, gender: $('#a-gender').value, location: $('#a-loc').value, income: $('#a-income').value, education: $('#a-edu').value },
      psychographics: { interests: split($('#a-interests').value), painPoints: split($('#a-pain').value), goals: split($('#a-goals').value), values: [] },
      channels: split($('#a-channels').value), size: $('#a-size').value, buyingBehavior: $('#a-buying').value
    };
    if(id) await api.put('/api/audiences/'+id, data); else await api.post('/api/audiences', data);
    closeModal(); toast(id?'Audience updated':'Audience created'); navigate();
    } catch(e) { toast('Failed to save: ' + e.message, 'error'); }
  };
}

window.editAudienceById = async (id) => { const audiences = await api.get('/api/audiences'); const a = audiences.find(x=>x.id===id); if(a) audienceModal(a); };
window.deleteAudience = async (id) => { if(!confirm('Delete this audience?')) return; await api.del('/api/audiences/'+id); toast('Audience deleted'); navigate(); };

// ===================== AD ACCOUNTS =====================
route('ads', async () => {
  showLoading();
  try {
  const accounts = await api.get('/api/ad-accounts');
  const guides = await api.get('/api/ad-accounts/guides');
  content().innerHTML = `
    <div class="page-header"><h1>Ad Accounts</h1><p>Manage advertising platform connections</p></div>
    <div class="grid-2" style="margin-bottom:24px">
      ${guides.map(g => {
        const acct = accounts.find(a=>a.platform===g.platform);
        const status = acct?.status || 'disconnected';
        return `<div class="card" style="cursor:pointer" onclick="showGuide('${g.platform}')">
          <div class="card-header"><h3><span class="platform-badge ${platformClass(g.platform)}">${esc(g.name)}</span></h3><span class="badge ${badgeClass(status)}">${status}</span></div>
          <p style="color:var(--text-dim);font-size:13px">${g.campaignTypes.length} campaign types available</p>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();showGuide('${g.platform}')">Setup Guide</button>
            <button class="btn btn-sm" onclick="event.stopPropagation();connectAdAccount('${g.platform}','${esc(g.name)}')">${acct ? 'Edit' : 'Track Account'}</button>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="card-header" style="margin-bottom:16px"><h3>Tracked Accounts</h3><span style="font-size:11px;color:var(--text-muted);margin-left:8px">(reference only — no live integration)</span><button class="btn btn-primary btn-sm" onclick="connectAdAccountCustom()" style="margin-left:auto">${icons.plus} Add Account</button></div>
    ${accounts.length===0 ? '<div class="empty-state"><p>No ad accounts connected. Click a platform above to get started.</p></div>' :
      `<table><tr><th>Platform</th><th>Account ID</th><th>Status</th><th>Last Sync</th><th></th></tr>
      ${accounts.map(a=>`<tr><td><span class="platform-badge ${platformClass(a.platform)}">${esc(a.platform)}</span></td><td>${esc(a.accountId)}</td><td><span class="badge ${badgeClass(a.status)}">${a.status}</span></td><td>${a.lastSync||'Never'}</td><td><button class="btn btn-sm btn-ghost btn-danger" onclick="deleteAdAccount('${a.id}')">${icons.trash}</button></td></tr>`).join('')}
      </table>`
    }
  `;

  window.showGuide = async (platform) => {
    const g = guides.find(x=>x.platform===platform);
    if(!g) return;
    showModal(g.name + ' Setup Guide', `
      <h3 style="margin-bottom:12px">Setup Steps</h3>
      <div class="guide-steps">${g.setupSteps.map(s=>`<div class="guide-step"><div>${esc(s)}</div></div>`).join('')}</div>
      <h3 style="margin:20px 0 12px">Campaign Types</h3>
      ${g.campaignTypes.map(ct=>`<div style="padding:10px 0;border-bottom:1px solid var(--border)"><strong>${esc(ct.name)}</strong><p style="color:var(--text-dim);font-size:13px">${esc(ct.description)}</p><span style="font-size:11px;color:var(--accent)">Best for: ${esc(ct.bestFor)}</span></div>`).join('')}
      <h3 style="margin:20px 0 12px">Best Practices</h3>
      <ul style="padding-left:20px;color:var(--text-dim)">${g.bestPractices.map(b=>`<li style="margin-bottom:6px">${esc(b)}</li>`).join('')}</ul>
      <h3 style="margin:20px 0 12px">Budget Tips</h3>
      <ul style="padding-left:20px;color:var(--text-dim)">${g.budgetTips.map(b=>`<li style="margin-bottom:6px">${esc(b)}</li>`).join('')}</ul>
      <h3 style="margin:20px 0 12px">Targeting Options</h3>
      <div class="form-tags">${safeTags(g.targetingOptions)}</div>
    `, `<button class="btn" onclick="closeModal()">Close</button>`, 'modal-wide');
  };

  window.connectAdAccount = (platform, name) => {
    showModal('Connect ' + name, `
      <div class="form-group"><label>Account ID</label><input class="form-input" id="ad-acctid" placeholder="Enter your ${name} account ID"></div>
      <div class="form-group"><label>Status</label><select class="form-select" id="ad-status"><option value="connected">Connected</option><option value="pending">Pending</option></select></div>
    `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAdAccount('${platform}')">Connect</button>`);
  };

  window.connectAdAccountCustom = () => {
    showModal('Add Ad Account', `
      <div class="form-group"><label>Platform</label><select class="form-select" id="ad-platform"><option value="google-ads">Google Ads</option><option value="meta-ads">Meta Ads</option><option value="linkedin-ads">LinkedIn Ads</option><option value="tiktok-ads">TikTok Ads</option></select></div>
      <div class="form-group"><label>Account ID</label><input class="form-input" id="ad-acctid"></div>
      <div class="form-group"><label>Status</label><select class="form-select" id="ad-status"><option value="connected">Connected</option><option value="pending">Pending</option></select></div>
    `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveAdAccount()">Add</button>`);
  };

  window.saveAdAccount = async (platform) => {
    const p = platform || document.getElementById('ad-platform')?.value;
    if(!$('#ad-acctid').value.trim()) { toast('Account ID is required', 'error'); return; }
    try {
      await api.post('/api/ad-accounts', { platform: p, accountId: $('#ad-acctid').value, status: $('#ad-status').value, config: {}, campaigns: [] });
      closeModal(); toast('Ad account added'); navigate();
    } catch(e) { toast('Failed: ' + e.message, 'error'); }
  };

  window.deleteAdAccount = async (id) => { if(!confirm('Remove this ad account?')) return; try { await api.del('/api/ad-accounts/'+id); toast('Removed'); navigate(); } catch(e) { toast('Failed: '+e.message,'error'); } };
  } catch(e) { showError('Failed to load ad accounts: ' + e.message); }
});

// ===================== CAMPAIGNS =====================
route('campaigns', async () => {
  showLoading();
  try {
  const campaigns = await api.get('/api/campaigns');
  const audiences = await api.get('/api/audiences');
  content().innerHTML = `
    <div class="page-header"><h1>Campaigns</h1><p>Track and manage ad campaigns</p></div>
    <div class="filter-bar">
      <select class="form-select" id="f-platform" onchange="filterCampaigns()"><option value="">All Platforms</option><option value="google-ads">Google Ads</option><option value="meta-ads">Meta Ads</option><option value="linkedin-ads">LinkedIn Ads</option><option value="tiktok-ads">TikTok Ads</option></select>
      <select class="form-select" id="f-status" onchange="filterCampaigns()"><option value="">All Statuses</option><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select>
      <button class="btn btn-primary btn-sm" onclick="addCampaign()">${icons.plus} New Campaign</button>
    </div>
    <div class="card">
      ${campaigns.length===0 ? '<div class="empty-state"><p>No campaigns yet. Create your first campaign.</p></div>' :
        `<div class="table-wrap"><table><tr><th>Name</th><th>Platform</th><th>Status</th><th>Budget</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>ROAS</th></tr>
        <tbody id="campaign-tbody">
        ${campaigns.map(c => campaignRow(c)).join('')}
        </tbody></table></div>`
      }
    </div>
  `;

  window.filterCampaigns = () => {
    const fp = $('#f-platform').value, fs = $('#f-status').value;
    const filtered = campaigns.filter(c => (!fp || c.platform===fp) && (!fs || c.status===fs));
    const tb = document.getElementById('campaign-tbody');
    if(tb) tb.innerHTML = filtered.map(c => campaignRow(c)).join('');
  };

  window.addCampaign = () => {
    showModal('New Campaign', `
      <div class="form-group"><label>Name</label><input class="form-input" id="c-name"></div>
      <div class="form-row">
        <div class="form-group"><label>Platform</label><select class="form-select" id="c-platform"><option value="google-ads">Google Ads</option><option value="meta-ads">Meta Ads</option><option value="linkedin-ads">LinkedIn Ads</option><option value="tiktok-ads">TikTok Ads</option></select></div>
        <div class="form-group"><label>Type</label><input class="form-input" id="c-type" placeholder="Search, Display, Video..."></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Budget</label><input class="form-input" id="c-budget" type="number"></div>
        <div class="form-group"><label>Status</label><select class="form-select" id="c-status"><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Start Date</label><input class="form-input" id="c-start" type="date"></div>
        <div class="form-group"><label>End Date</label><input class="form-input" id="c-end" type="date"></div>
      </div>
      <div class="form-group"><label>Audience</label><select class="form-select" id="c-audience"><option value="">None</option>${audiences.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></div>
    `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveCampaign()">Create</button>`);
  };

  window.saveCampaign = async () => {
    if(!$('#c-name').value.trim()) { toast('Campaign name is required', 'error'); return; }
    try {
    await api.post('/api/campaigns', {
      name: $('#c-name').value, platform: $('#c-platform').value, type: $('#c-type').value,
      budget: Number($('#c-budget').value), spent: 0, status: $('#c-status').value,
      startDate: $('#c-start').value, endDate: $('#c-end').value, audienceId: $('#c-audience').value,
      targeting: {}, creatives: [], metrics: { impressions:0, clicks:0, conversions:0, ctr:0, cpc:0, roas:0 }
    });
    closeModal(); toast('Campaign created'); navigate();
    } catch(e) { toast('Failed: ' + e.message, 'error'); }
  };

  window.deleteCampaign = async (id) => { if(!confirm('Delete campaign?')) return; try { await api.del('/api/campaigns/'+id); toast('Deleted'); navigate(); } catch(e) { toast('Failed: '+e.message,'error'); } };
  } catch(e) { showError('Failed to load campaigns: ' + e.message); }
});

function campaignRow(c) {
  const m = c.metrics || {};
  const pct = c.budget ? Math.min(100, (c.spent||0)/(c.budget)*100) : 0;
  const pctCls = pct > 90 ? 'red' : pct > 70 ? 'yellow' : 'accent';
  return `<tr>
    <td><strong>${esc(c.name)}</strong></td>
    <td><span class="platform-badge ${platformClass(c.platform)}">${esc(c.platform)}</span></td>
    <td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td>
    <td><div>${fmtMoney(c.spent)} / ${fmtMoney(c.budget)}</div><div class="progress-bar" style="margin-top:4px"><div class="progress-fill ${pctCls}" style="width:${pct}%"></div></div></td>
    <td>${fmtNum(m.impressions)}</td><td>${fmtNum(m.clicks)}</td>
    <td>${m.ctr ? m.ctr.toFixed(2)+'%' : '—'}</td><td>${m.roas ? m.roas.toFixed(1)+'x' : '—'}</td>
  </tr>`;
}

// ===================== INFLUENCERS =====================
route('influencers', async () => {
  showLoading();
  try {
  const influencers = await api.get('/api/influencers');
  content().innerHTML = `
    <div class="page-header"><h1>Influencers</h1><p>Discover, score, and manage influencer partnerships</p></div>
    <div class="filter-bar">
      <select class="form-select" id="fi-platform" onchange="filterInf()"><option value="">All Platforms</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="linkedin">LinkedIn</option><option value="twitter">Twitter/X</option></select>
      <select class="form-select" id="fi-status" onchange="filterInf()"><option value="">All Statuses</option><option value="discovered">Discovered</option><option value="contacted">Contacted</option><option value="negotiating">Negotiating</option><option value="active">Active</option><option value="completed">Completed</option><option value="rejected">Rejected</option></select>
      <button class="btn btn-primary btn-sm" onclick="addInfluencer()">${icons.plus} Add Influencer</button>
    </div>
    <div class="pipeline" style="margin-bottom:20px">
      ${['discovered','contacted','negotiating','active','completed'].map(s => {
        const cnt = influencers.filter(i=>i.status===s).length;
        return `<div class="pipeline-stage ${cnt?'active':''}">${s}<br><strong>${cnt}</strong></div>`;
      }).join('')}
    </div>
    <div class="card">
      ${influencers.length===0 ? '<div class="empty-state"><p>No influencers yet. Add influencers to start building partnerships.</p></div>' :
        `<div class="table-wrap"><table><tr><th></th><th>Name</th><th>Platform</th><th>Followers</th><th>Engagement</th><th>Score</th><th>Status</th><th>Price Range</th><th></th></tr>
        <tbody id="inf-tbody">${influencers.map(i=>infRow(i)).join('')}</tbody></table></div>`
      }
    </div>
  `;

  window.filterInf = () => {
    const fp = $('#fi-platform').value, fs = $('#fi-status').value;
    const filtered = influencers.filter(i => (!fp || i.platform===fp) && (!fs || i.status===fs));
    const tb = document.getElementById('inf-tbody');
    if(tb) tb.innerHTML = filtered.map(i=>infRow(i)).join('');
  };

  window.addInfluencer = () => influencerModal();
  } catch(e) { showError('Failed to load influencers: ' + e.message); }
});

function infRow(i) {
  const initial = (i.name||'?')[0].toUpperCase();
  return `<tr onclick="location.hash='#influencer/${i.id}'">
    <td><div class="influencer-avatar" style="width:36px;height:36px;font-size:14px">${initial}</div></td>
    <td><strong>${esc(i.name)}</strong><br><span style="font-size:12px;color:var(--text-dim)">@${esc(i.handle)}</span></td>
    <td><span class="platform-badge ${platformClass(i.platform)}">${esc(i.platform)}</span></td>
    <td>${fmtNum(i.followers)}</td>
    <td>${(i.engagementRate||0).toFixed(1)}%</td>
    <td><div class="score-badge ${scoreClass(i.score||0)}">${i.score||'—'}</div></td>
    <td><span class="badge ${badgeClass(i.status)}">${i.status||'discovered'}</span></td>
    <td>${i.priceRange ? fmtMoney(i.priceRange.min)+' - '+fmtMoney(i.priceRange.max) : '—'}</td>
    <td><button class="btn btn-sm btn-ghost btn-danger" onclick="event.stopPropagation();deleteInfluencer('${i.id}')">${icons.trash}</button></td>
  </tr>`;
}

function influencerModal(existing=null) {
  const i = existing || { name:'', platform:'instagram', handle:'', url:'', followers:0, engagementRate:0, category:'', location:'', priceRange:{min:0,max:0}, status:'discovered', tags:[], notes:'', contactEmail:'' };
  showModal(existing ? 'Edit Influencer' : 'Add Influencer', `
    <div class="form-row"><div class="form-group"><label>Name</label><input class="form-input" id="i-name" value="${esc(i.name)}"></div><div class="form-group"><label>Handle</label><input class="form-input" id="i-handle" value="${esc(i.handle)}" placeholder="@username"></div></div>
    <div class="form-row"><div class="form-group"><label>Platform</label><select class="form-select" id="i-platform"><option value="instagram" ${i.platform==='instagram'?'selected':''}>Instagram</option><option value="tiktok" ${i.platform==='tiktok'?'selected':''}>TikTok</option><option value="youtube" ${i.platform==='youtube'?'selected':''}>YouTube</option><option value="linkedin" ${i.platform==='linkedin'?'selected':''}>LinkedIn</option><option value="twitter" ${i.platform==='twitter'?'selected':''}>Twitter/X</option></select></div>
    <div class="form-group"><label>Status</label><select class="form-select" id="i-status"><option value="discovered" ${i.status==='discovered'?'selected':''}>Discovered</option><option value="contacted" ${i.status==='contacted'?'selected':''}>Contacted</option><option value="negotiating" ${i.status==='negotiating'?'selected':''}>Negotiating</option><option value="active" ${i.status==='active'?'selected':''}>Active</option><option value="completed" ${i.status==='completed'?'selected':''}>Completed</option><option value="rejected" ${i.status==='rejected'?'selected':''}>Rejected</option></select></div></div>
    <div class="form-row"><div class="form-group"><label>Followers</label><input class="form-input" id="i-followers" type="number" value="${i.followers}"></div><div class="form-group"><label>Engagement Rate (%)</label><input class="form-input" id="i-engagement" type="number" step="0.1" value="${i.engagementRate}"></div></div>
    <div class="form-row"><div class="form-group"><label>Category</label><input class="form-input" id="i-category" value="${esc(i.category)}" placeholder="Tech, Fashion, Fitness..."></div><div class="form-group"><label>Location</label><input class="form-input" id="i-location" value="${esc(i.location)}"></div></div>
    <div class="form-row"><div class="form-group"><label>Min Price ($)</label><input class="form-input" id="i-pmin" type="number" value="${i.priceRange?.min||0}"></div><div class="form-group"><label>Max Price ($)</label><input class="form-input" id="i-pmax" type="number" value="${i.priceRange?.max||0}"></div></div>
    <div class="form-group"><label>Profile URL</label><input class="form-input" id="i-url" value="${esc(i.url)}"></div>
    <div class="form-group"><label>Contact Email</label><input class="form-input" id="i-email" value="${esc(i.contactEmail)}"></div>
    <div class="form-group"><label>Tags (comma-separated)</label><input class="form-input" id="i-tags" value="${(i.tags||[]).join(', ')}"></div>
    <div class="form-group"><label>Notes</label><textarea class="form-textarea" id="i-notes">${esc(i.notes)}</textarea></div>
  `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveInfluencer('${existing?.id||''}')">${existing?'Update':'Add'}</button>`, 'modal-wide');

  window.saveInfluencer = async (id) => {
    if(!$('#i-name').value.trim()) { toast('Name is required', 'error'); return; }
    try {
    const data = {
      name: $('#i-name').value, handle: $('#i-handle').value.replace('@',''), platform: $('#i-platform').value,
      status: $('#i-status').value, followers: Number($('#i-followers').value), engagementRate: Number($('#i-engagement').value),
      category: $('#i-category').value, location: $('#i-location').value,
      priceRange: { min: Number($('#i-pmin').value), max: Number($('#i-pmax').value) },
      url: $('#i-url').value, contactEmail: $('#i-email').value,
      tags: $('#i-tags').value.split(',').map(s=>s.trim()).filter(Boolean), notes: $('#i-notes').value
    };
    if(id) await api.put('/api/influencers/'+id, data); else await api.post('/api/influencers', data);
    closeModal(); toast(id?'Updated':'Influencer added'); navigate();
    } catch(e) { toast('Failed: ' + e.message, 'error'); }
  };
}

window.deleteInfluencer = async (id) => { if(!confirm('Delete influencer?')) return; await api.del('/api/influencers/'+id); toast('Deleted'); navigate(); };

// ===================== INFLUENCER DETAIL =====================
route('influencer-detail', async (id) => {
  showLoading();
  try {
  const inf = await api.get('/api/influencers/'+id);
  if(inf.error) { content().innerHTML = '<div class="empty-state"><p>Influencer not found</p></div>'; return; }
  const infCampaigns = (await api.get('/api/influencer-campaigns')).filter(c=>c.influencerId===id);
  const initial = (inf.name||'?')[0].toUpperCase();
  const sb = inf.scoreBreakdown;

  content().innerHTML = `
    <div style="margin-bottom:16px"><a href="#influencers" style="color:var(--text-dim)">&larr; Back to Influencers</a></div>
    <div class="influencer-header">
      <div class="influencer-avatar">${initial}</div>
      <div class="influencer-info">
        <h2>${esc(inf.name)}</h2>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="platform-badge ${platformClass(inf.platform)}">${esc(inf.platform)}</span>
          <span style="color:var(--text-dim)">@${esc(inf.handle)}</span>
          <span class="badge ${badgeClass(inf.status)}">${inf.status}</span>
          ${inf.url ? `<a href="${esc(inf.url)}" target="_blank" style="color:var(--text-dim)">${icons.external}</a>` : ''}
        </div>
        <div class="influencer-meta">
          ${inf.category ? `<span>${esc(inf.category)}</span>` : ''}
          ${inf.location ? `<span>${esc(inf.location)}</span>` : ''}
          ${inf.contactEmail ? `<span>${esc(inf.contactEmail)}</span>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm" onclick="editInfluencerDetail('${id}')">${icons.edit} Edit</button>
        <button class="btn btn-sm btn-primary" onclick="scoreInfluencer('${id}')">Calculate Score</button>
      </div>
    </div>

    <div class="influencer-stats">
      <div class="stat-card"><div class="stat-value">${fmtNum(inf.followers)}</div><div class="stat-label">Followers</div></div>
      <div class="stat-card"><div class="stat-value">${(inf.engagementRate||0).toFixed(1)}%</div><div class="stat-label">Engagement</div></div>
      <div class="stat-card"><div class="stat-value"><div class="score-badge ${scoreClass(inf.score||0)}" style="display:inline-flex">${inf.score||'—'}</div></div><div class="stat-label">Score</div></div>
      <div class="stat-card"><div class="stat-value">${inf.priceRange ? fmtMoney(inf.priceRange.min)+'-'+fmtMoney(inf.priceRange.max) : '—'}</div><div class="stat-label">Price Range</div></div>
    </div>

    ${sb ? `<div class="card" style="margin-bottom:20px"><div class="card-header"><h3>Score Breakdown</h3></div>
      <div class="bar-chart">
        ${Object.entries(sb).map(([k,v])=>`<div class="bar-row"><div class="bar-label">${k} (${v.weight})</div><div class="bar-track"><div class="bar-fill" style="width:${v.score}%;background:var(--accent)">${v.score}</div></div></div>`).join('')}
      </div></div>` : ''}

    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><h3>Outreach Messages</h3></div>
        <div class="message-thread" id="msg-thread">
          ${infCampaigns.length ? infCampaigns.flatMap(c=>(c.messages||[]).map(m=>`
            <div class="message ${m.from==='us'?'message-outgoing':'message-incoming'}">
              <div class="message-from">${esc(m.from)}</div>
              <div class="message-content">${esc(m.content)}</div>
              <div class="message-time">${m.timestamp?new Date(m.timestamp).toLocaleString():''}</div>
            </div>`)).join('') : '<div style="color:var(--text-muted);text-align:center;padding:20px">No messages yet</div>'}
        </div>
        <div style="display:flex;gap:8px"><input class="form-input" id="msg-input" placeholder="Type outreach message..."><button class="btn btn-primary btn-sm" onclick="sendMessage('${id}')">Send</button></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Deal Tracker</h3><button class="btn btn-sm btn-primary" onclick="createDeal('${id}')">${icons.plus} New Deal</button></div>
        ${infCampaigns.length===0 ? '<div class="empty-state"><p>No deals yet</p></div>' :
          infCampaigns.map(c=>`
            <div style="padding:12px 0;border-bottom:1px solid var(--border)">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <strong>${esc(c.name)}</strong><span class="badge ${badgeClass(c.status)}">${c.status}</span>
              </div>
              <div class="deal-info" style="margin-top:8px">
                <div class="deal-item"><div class="deal-label">Type</div><div class="deal-value">${esc(c.type)}</div></div>
                <div class="deal-item"><div class="deal-label">Price</div><div class="deal-value">${fmtMoney(c.agreedPrice)}</div></div>
              </div>
              ${c.status==='negotiating'||c.status==='proposed' ? `<button class="btn btn-sm btn-success" style="margin-top:8px" onclick="approveDeal('${c.id}')">Approve Deal</button>` : ''}
            </div>`).join('')
        }
      </div>
    </div>

    ${inf.tags?.length ? `<div style="margin-bottom:12px"><label style="font-size:11px;color:var(--text-muted)">TAGS</label><div class="form-tags" style="margin-top:4px">${safeTags(inf.tags)}</div></div>` : ''}
    ${inf.notes ? `<div class="card"><div class="card-header"><h3>Notes</h3></div><p style="color:var(--text-dim);white-space:pre-wrap">${esc(inf.notes)}</p></div>` : ''}
  `;

  window.editInfluencerDetail = async (id) => { const data = await api.get('/api/influencers/'+id); influencerModal(data); };
  window.scoreInfluencer = async (id) => { await api.post('/api/influencers/'+id+'/score', {}); toast('Score calculated'); navigate(); };
  window.sendMessage = async (infId) => {
    const msg = $('#msg-input').value; if(!msg) return;
    const camps = (await api.get('/api/influencer-campaigns')).filter(c=>c.influencerId===infId);
    if(camps.length===0) {
      toast('Create a deal first to track messages', 'error'); return;
    }
    const camp = camps[camps.length-1];
    const messages = camp.messages || [];
    messages.push({ from:'us', content:msg, timestamp:new Date().toISOString() });
    await api.put('/api/influencer-campaigns/'+camp.id, { messages });
    toast('Message added'); navigate();
  };

  window.createDeal = (infId) => {
    showModal('New Deal', `
      <div class="form-group"><label>Campaign Name</label><input class="form-input" id="d-name"></div>
      <div class="form-row">
        <div class="form-group"><label>Type</label><select class="form-select" id="d-type"><option value="post">Post</option><option value="story">Story</option><option value="reel">Reel</option><option value="video">Video</option><option value="review">Review</option><option value="unboxing">Unboxing</option></select></div>
        <div class="form-group"><label>Agreed Price ($)</label><input class="form-input" id="d-price" type="number"></div>
      </div>
      <div class="form-group"><label>Deliverables (comma-separated)</label><input class="form-input" id="d-deliverables"></div>
      <div class="form-group"><label>Brief</label><textarea class="form-textarea" id="d-brief"></textarea></div>
    `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveDeal('${infId}')">Create</button>`);
  };

  window.saveDeal = async (infId) => {
    await api.post('/api/influencer-campaigns', {
      influencerId: infId, name: $('#d-name').value, type: $('#d-type').value,
      status: 'proposed', agreedPrice: Number($('#d-price').value),
      deliverables: $('#d-deliverables').value.split(',').map(s=>s.trim()).filter(Boolean),
      brief: $('#d-brief').value, messages: [], timeline: {}, performanceMetrics: {}, notes: []
    });
    closeModal(); toast('Deal created'); navigate();
  };

  window.approveDeal = async (dealId) => {
    if(!confirm('Approve this deal? This confirms you will proceed with payment.')) return;
    try { await api.post('/api/influencer-campaigns/'+dealId+'/approve', {}); toast('Deal approved'); navigate(); } catch(e) { toast('Failed: '+e.message,'error'); }
  };
  } catch(e) { showError('Failed to load influencer: ' + e.message); }
});

// ===================== CREATIVE STUDIO =====================
route('creative', async () => {
  showLoading();
  try {
  const creatives = await api.get('/api/creatives');
  const config = await api.get('/api/config');
  const hasFalKey = !!(config.falKey && !config.falKey.startsWith('...'));
  const falBanner = hasFalKey ? '' : `<div class="card" style="margin-bottom:16px;border-color:var(--yellow)"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">⚠️</span><div><strong>fal.ai API key not configured</strong><br><span style="color:var(--text-dim);font-size:13px">Set up your API key in <a href="#settings">Settings</a> to generate creatives.</span></div></div></div>`;
  content().innerHTML = `
    <div class="page-header"><h1>Creative Studio</h1><p>Generate and manage marketing visuals</p></div>
    ${falBanner}
    <div class="filter-bar">
      <select class="form-select" id="fc-type" onchange="filterCreatives()"><option value="">All Types</option><option value="image">Image</option><option value="video">Video</option></select>
      <select class="form-select" id="fc-platform" onchange="filterCreatives()"><option value="">All Platforms</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="linkedin">LinkedIn</option><option value="google-ads">Google Ads</option><option value="tiktok">TikTok</option><option value="blog">Blog</option></select>
      <select class="form-select" id="fc-status" onchange="filterCreatives()"><option value="">All Statuses</option><option value="generating">Generating</option><option value="ready">Ready</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
      <button class="btn btn-primary btn-sm" onclick="generateCreative()">${icons.plus} Generate New</button>
    </div>
    <div class="creative-grid" id="creative-grid">
      ${creatives.length===0 ? '<div class="empty-state" style="grid-column:1/-1"><p>No creatives yet. Generate your first marketing visual.</p></div>' :
        creatives.map(c => creativeCard(c)).join('')}
    </div>
  `;

  window.filterCreatives = () => {
    const ft = $('#fc-type').value, fp = $('#fc-platform').value, fs = $('#fc-status').value;
    const filtered = creatives.filter(c => (!ft||c.type===ft) && (!fp||c.platform===fp) && (!fs||c.status===fs));
    document.getElementById('creative-grid').innerHTML = filtered.length===0 ? '<div class="empty-state" style="grid-column:1/-1"><p>No matching creatives</p></div>' : filtered.map(c=>creativeCard(c)).join('');
  };

  window.generateCreative = () => {
    const platforms = [
      {v:'instagram',l:'Instagram Post',d:'1080x1080'},{v:'instagram-story',l:'Instagram Story',d:'1080x1920'},
      {v:'facebook',l:'Facebook Ad',d:'1200x628'},{v:'linkedin',l:'LinkedIn',d:'1200x1200'},
      {v:'google-ads',l:'Google Display',d:'1200x628'},{v:'tiktok',l:'TikTok',d:'1080x1920'},{v:'blog',l:'Blog Header',d:'1200x628'}
    ];
    showModal('Generate Creative', `
      <div class="form-row">
        <div class="form-group"><label>Type</label><select class="form-select" id="g-type"><option value="image">Image</option><option value="video">Video</option></select></div>
        <div class="form-group"><label>Platform</label><select class="form-select" id="g-platform">${platforms.map(p=>`<option value="${p.v}" data-dim="${p.d}">${p.l} (${p.d})</option>`).join('')}</select></div>
      </div>
      <div class="form-group"><label>Prompt</label><textarea class="form-textarea" id="g-prompt" rows="4" placeholder="Describe the marketing visual you want to create..."></textarea></div>
      <div class="form-group"><label>Style</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px" id="g-styles">
          ${['Professional','Playful','Minimalist','Bold','Elegant','Tech'].map((s,i)=>`<button class="btn btn-sm ${i===0?'btn-primary':''}" onclick="pickStyle(this,'${s}')">${s}</button>`).join('')}
        </div>
        <input type="hidden" id="g-style" value="Professional">
      </div>
    `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="doGenerate()">Generate</button>`);

    window.pickStyle = (el, style) => {
      $$('#g-styles .btn').forEach(b=>b.classList.remove('btn-primary'));
      el.classList.add('btn-primary');
      $('#g-style').value = style;
    };
  };

  window.doGenerate = async () => {
    const plat = $('#g-platform');
    const dim = plat.selectedOptions[0]?.dataset.dim || '1080x1080';
    const result = await api.post('/api/creatives/generate', {
      prompt: $('#g-prompt').value, type: $('#g-type').value,
      style: $('#g-style').value, dimensions: dim, platform: plat.value
    });
    closeModal();
    if(result.error) { toast(result.error, 'error'); return; }
    toast('Generating creative...'); navigate();
    // Poll for result
    const poll = setInterval(async () => {
      const st = await api.get('/api/creatives/'+result.id+'/status');
      if(st.status !== 'generating') { clearInterval(poll); navigate(); }
    }, 3000);
  };

  window.approveCreative = async (id) => { await api.put('/api/creatives/'+id, {status:'approved'}); toast('Approved'); navigate(); };
  window.rejectCreative = async (id) => { await api.put('/api/creatives/'+id, {status:'rejected'}); toast('Rejected'); navigate(); };
  window.deleteCreative = async (id) => { if(!confirm('Delete?')) return; try { await api.del('/api/creatives/'+id); toast('Deleted'); navigate(); } catch(e) { toast('Failed: '+e.message,'error'); } };
  } catch(e) { showError('Failed to load creatives: ' + e.message); }
});

function creativeCard(c) {
  const isGen = c.status==='generating';
  return `<div class="creative-card">
    <div class="creative-preview">
      ${isGen ? '<div class="spinner"></div>' : c.url ? `<img src="${esc(c.url)}" alt="${esc(c.name)}">` : (c.type==='video'?icons.video:icons.image)}
    </div>
    <div class="creative-info">
      <h4>${esc(c.name)}</h4>
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
        <span class="badge ${badgeClass(c.status)}">${c.status}</span>
        <span style="font-size:11px;color:var(--text-muted)">${c.dimensions||''}</span>
      </div>
      ${c.error ? `<div style="font-size:11px;color:var(--red)">${esc(c.error)}</div>` : ''}
      <div class="creative-actions">
        ${c.status==='ready' ? `<button class="btn btn-sm btn-success" onclick="approveCreative('${c.id}')">Approve</button><button class="btn btn-sm btn-danger" onclick="rejectCreative('${c.id}')">Reject</button>` : ''}
        ${c.url ? `<a href="${esc(c.url)}" target="_blank" class="btn btn-sm">Download</a>` : ''}
        <button class="btn btn-sm btn-ghost btn-danger" onclick="deleteCreative('${c.id}')">${icons.trash}</button>
      </div>
    </div>
  </div>`;
}

// ===================== CHANNELS =====================
route('channels', async () => {
  showLoading();
  try {
  const channels = await api.get('/api/channels');
  content().innerHTML = `
    <div class="page-header"><h1>Channels</h1><p>Manage marketing channels and track performance</p></div>
    <div style="margin-bottom:16px"><button class="btn btn-primary btn-sm" onclick="addChannel()">${icons.plus} Add Channel</button></div>
    ${channels.length===0 ? '<div class="empty-state"><p>No channels configured. Add your marketing channels.</p></div>' : ''}
    <div class="grid-3" id="channel-list">
      ${channels.map(ch => channelCard(ch)).join('')}
    </div>
  `;

  window.addChannel = () => channelModal();
  window.editChannelById = async (id) => { const chs = await api.get('/api/channels'); const ch = chs.find(x=>x.id===id); if(ch) channelModal(ch); };
  window.deleteChannel = async (id) => { if(!confirm('Delete channel?')) return; try { await api.del('/api/channels/'+id); toast('Deleted'); navigate(); } catch(e) { toast('Failed: '+e.message,'error'); } };
  window.toggleChannel = async (id, status) => { try { await api.put('/api/channels/'+id, { status: status==='active'?'paused':'active' }); toast('Updated'); navigate(); } catch(e) { toast('Failed: '+e.message,'error'); } };
  } catch(e) { showError('Failed to load channels: ' + e.message); }
});

function channelCard(ch) {
  const p = ch.performance || {};
  return `<div class="card">
    <div class="card-header">
      <h3>${esc(ch.name)}</h3>
      <span class="badge ${badgeClass(ch.status)}">${ch.status}</span>
    </div>
    <div style="margin-bottom:8px"><span class="form-tag">${ch.type||'—'}</span> ${ch.platform?`<span class="platform-badge ${platformClass(ch.platform)}">${esc(ch.platform)}</span>`:''}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div><div style="font-size:11px;color:var(--text-muted)">REACH</div><div style="font-weight:600">${fmtNum(p.reach)}</div></div>
      <div><div style="font-size:11px;color:var(--text-muted)">ROI</div><div style="font-weight:600;color:${(p.roi||0)>0?'var(--green)':'var(--text)'}">${(p.roi||0)}%</div></div>
      <div><div style="font-size:11px;color:var(--text-muted)">CONVERSIONS</div><div style="font-weight:600">${fmtNum(p.conversions)}</div></div>
      <div><div style="font-size:11px;color:var(--text-muted)">BUDGET</div><div style="font-weight:600">${fmtMoney(ch.budget)}</div></div>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn btn-sm" onclick="editChannelById('${ch.id}')">${icons.edit}</button>
      <button class="btn btn-sm" onclick="toggleChannel('${ch.id}','${ch.status}')">${ch.status==='active'?'Pause':'Activate'}</button>
      <button class="btn btn-sm btn-ghost btn-danger" onclick="deleteChannel('${ch.id}')">${icons.trash}</button>
    </div>
  </div>`;
}

function channelModal(existing=null) {
  const ch = existing || { name:'', type:'paid', platform:'', status:'planned', budget:0, performance:{reach:0,engagement:0,conversions:0,roi:0}, notes:'' };
  showModal(existing ? 'Edit Channel' : 'Add Channel', `
    <div class="form-group"><label>Name</label><input class="form-input" id="ch-name" value="${esc(ch.name)}"></div>
    <div class="form-row">
      <div class="form-group"><label>Type</label><select class="form-select" id="ch-type"><option value="paid" ${ch.type==='paid'?'selected':''}>Paid</option><option value="organic" ${ch.type==='organic'?'selected':''}>Organic</option><option value="email" ${ch.type==='email'?'selected':''}>Email</option><option value="social" ${ch.type==='social'?'selected':''}>Social</option><option value="content" ${ch.type==='content'?'selected':''}>Content</option><option value="influencer" ${ch.type==='influencer'?'selected':''}>Influencer</option><option value="referral" ${ch.type==='referral'?'selected':''}>Referral</option></select></div>
      <div class="form-group"><label>Platform</label><input class="form-input" id="ch-platform" value="${esc(ch.platform)}" placeholder="Google, Facebook, Email..."></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Status</label><select class="form-select" id="ch-status"><option value="planned" ${ch.status==='planned'?'selected':''}>Planned</option><option value="active" ${ch.status==='active'?'selected':''}>Active</option><option value="paused" ${ch.status==='paused'?'selected':''}>Paused</option></select></div>
      <div class="form-group"><label>Budget ($)</label><input class="form-input" id="ch-budget" type="number" value="${ch.budget}"></div>
    </div>
    <div class="form-group"><label>Notes</label><textarea class="form-textarea" id="ch-notes">${esc(ch.notes)}</textarea></div>
  `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveChannel('${existing?.id||''}')">${existing?'Update':'Create'}</button>`);

  window.saveChannel = async (id) => {
    if(!$('#ch-name').value.trim()) { toast('Channel name is required', 'error'); return; }
    try {
    const data = { name:$('#ch-name').value, type:$('#ch-type').value, platform:$('#ch-platform').value, status:$('#ch-status').value, budget:Number($('#ch-budget').value), notes:$('#ch-notes').value, performance:existing?.performance||{reach:0,engagement:0,conversions:0,roi:0} };
    if(id) await api.put('/api/channels/'+id, data); else await api.post('/api/channels', data);
    closeModal(); toast(id?'Updated':'Channel created'); navigate();
    } catch(e) { toast('Failed: ' + e.message, 'error'); }
  };
}

// ===================== BUDGET =====================
route('budget', async () => {
  showLoading();
  try {
  const budget = await api.get('/api/budget');
  const channels = await api.get('/api/channels');
  const remaining = (budget.total||0) - (budget.spent||0);
  const pct = budget.total ? ((budget.spent||0)/budget.total*100) : 0;
  const colors = ['#f43f5e','#3b82f6','#22c55e','#eab308','#a855f7','#06b6d4','#f97316'];

  content().innerHTML = `
    <div class="page-header"><h1>Budget</h1><p>Track marketing spend and allocation</p></div>
    <div class="kpi-row">
      <div class="kpi-card kpi-accent"><div class="kpi-label">Total Budget</div><div class="kpi-value">${fmtMoney(budget.total)}</div><div class="kpi-sub">${budget.period||'monthly'}</div></div>
      <div class="kpi-card kpi-yellow"><div class="kpi-label">Spent</div><div class="kpi-value">${fmtMoney(budget.spent)}</div><div class="kpi-sub">${pct.toFixed(0)}% used</div></div>
      <div class="kpi-card kpi-green"><div class="kpi-label">Remaining</div><div class="kpi-value">${fmtMoney(remaining)}</div></div>
    </div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><h3>Budget Settings</h3><button class="btn btn-sm" onclick="editBudget()">${icons.edit} Edit</button></div>
      <div class="progress-bar" style="height:12px;margin-bottom:12px"><div class="progress-fill ${pct>90?'red':pct>70?'yellow':'accent'}" style="width:${Math.min(100,pct)}%"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-dim)"><span>${fmtMoney(budget.spent)} spent</span><span>${fmtMoney(remaining)} remaining</span></div>
    </div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><h3>Allocation by Channel</h3></div>
      ${channels.length===0 ? '<div class="empty-state"><p>Add channels to see budget allocation</p></div>' : `
        <div class="budget-bar">${channels.filter(ch=>ch.budget>0).map((ch,i)=>{
          const w = budget.total ? (ch.budget/budget.total*100) : 0;
          return `<div class="budget-segment" style="width:${Math.max(w,3)}%;background:${colors[i%colors.length]}" title="${esc(ch.name)}: ${fmtMoney(ch.budget)}">${w>8?esc(ch.name):''}</div>`;
        }).join('')}</div>
        <div class="bar-chart" style="margin-top:16px">${channels.map((ch,i)=>{
          const w = budget.total ? (ch.budget/budget.total*100) : 0;
          return `<div class="bar-row"><div class="bar-label">${esc(ch.name)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(w,3)}%;background:${colors[i%colors.length]}">${w.toFixed(0)}%</div></div><div class="bar-value">${fmtMoney(ch.budget)}</div></div>`;
        }).join('')}</div>
      `}
    </div>
  `;

  window.editBudget = () => {
    showModal('Edit Budget', `
      <div class="form-group"><label>Total Budget ($)</label><input class="form-input" id="bud-total" type="number" value="${budget.total||0}"></div>
      <div class="form-group"><label>Spent ($)</label><input class="form-input" id="bud-spent" type="number" value="${budget.spent||0}"></div>
      <div class="form-group"><label>Period</label><select class="form-select" id="bud-period"><option value="monthly" ${budget.period==='monthly'?'selected':''}>Monthly</option><option value="quarterly" ${budget.period==='quarterly'?'selected':''}>Quarterly</option><option value="yearly" ${budget.period==='yearly'?'selected':''}>Yearly</option></select></div>
    `, `<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveBudget()">Save</button>`);
  };

  window.saveBudget = async () => {
    try {
    await api.put('/api/budget', { total: Number($('#bud-total').value), spent: Number($('#bud-spent').value), period: $('#bud-period').value, allocated: budget.allocated||{} });
    closeModal(); toast('Budget updated'); navigate();
    } catch(e) { toast('Failed: ' + e.message, 'error'); }
  };
  } catch(e) { showError('Failed to load budget: ' + e.message); }
});

// ===================== SETTINGS =====================
route('settings', async () => {
  showLoading();
  try {
  const config = await api.get('/api/config');
  content().innerHTML = `
    <div class="page-header"><h1>Settings</h1><p>Configure integrations and preferences</p></div>
    <div class="card" style="max-width:600px">
      <div class="card-header"><h3>API Configuration</h3></div>
      <div class="form-group"><label>fal.ai API Key</label><input class="form-input" id="cfg-fal" type="password" value="${esc(config.falKey||'')}" placeholder="Enter your fal.ai API key"></div>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:20px">Used for AI-powered creative generation. Get a key at <a href="https://fal.ai" target="_blank">fal.ai</a></p>
      <div class="form-group"><label>Notifications</label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;text-transform:none;letter-spacing:0"><input type="checkbox" id="cfg-notif" ${config.notifications!==false?'checked':''}> Enable notifications</label>
      </div>
      <button class="btn btn-primary" onclick="saveConfig()">Save Settings</button>
    </div>
  `;

  window.saveConfig = async () => {
    try {
    await api.put('/api/config', { falKey: $('#cfg-fal').value, notifications: $('#cfg-notif').checked });
    toast('Settings saved');
    } catch(e) { toast('Failed: ' + e.message, 'error'); }
  };
  } catch(e) { showError('Failed to load settings: ' + e.message); }
});

// --- INIT ---
navigate();
})();
