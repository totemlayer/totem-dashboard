import { createDemoState } from './demo-data.mjs';
import { escapeHtml as h, filterAssistants, addAssistant, toggleAssistant, decideApproval, createMission, advanceMission, sendMessage, toggleConnection } from './model.mjs';

let state = createDemoState();
let query = '';
let filter = 'all';
let theme = 'light';
let toastTimer;
const main = document.querySelector('main');
const dialog = document.querySelector('dialog');
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  assistants: '<rect x="4" y="6" width="16" height="14" rx="4"/><path d="M12 6V3m-4 8v2m8-2v2m-7 4h6M1 11v4m22-4v4"/>',
  network: '<circle cx="12" cy="5" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="m10.5 7.5-4 8m7-8 4 8M8 18h8"/>',
  chat: '<path d="M21 11a8 8 0 0 1-8 8H8l-5 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h10m-10 4h6"/>',
  review: '<path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  usage: '<path d="M4 20h16M6 16v-5m6 5V4m6 12V8"/>',
  settings: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  developer: '<path d="m8 5-7 7 7 7m8-14 7 7-7 7m-3-17-2 20"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  moon: '<path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
function icon(name) { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`; }
const routes = {
  home: { label: 'Home', icon: 'home' },
  assistants: { label: 'Assistants', icon: 'assistants' },
  connections: { label: 'Totem Network', icon: 'network' },
  messages: { label: 'Assistant chat', icon: 'chat' },
  review: { label: 'Review', icon: 'review', utility: true },
  usage: { label: 'Usage', icon: 'usage', utility: true },
  settings: { label: 'Settings', icon: 'settings', utility: true },
  developer: { label: 'Developer', icon: 'developer', utility: true },
};
const networkRoutes = ['connections', 'missions', 'messages'];
function route() { const key = location.hash.slice(1) || 'home'; return key in routes || key === 'missions' ? key : 'home'; }
function avatar(a) { return `<span class="avatar ${h(a.color || 'sage')}">${h(a.initials)}</span>`; }
function badge(status) { const color = ['Available', 'Completed', 'Approved', 'Connected'].includes(status) ? 'positive' : status === 'Pending' || status === 'In progress' ? 'pending' : 'neutral'; return `<span class="badge ${color}">${h(status)}</span>`; }
function empty(title, detail) { return `<div class="empty">${icon('search')}<h3>${h(title)}</h3><p>${h(detail)}</p></div>`; }
function heading(title, description, action = '') { return `<header class="page-heading"><div><h1>${h(title)}</h1><p>${h(description)}</p></div>${action}</header>`; }
function button(label, action, id = '', variant = '') { return `<button class="button ${variant}" data-action="${action}"${id ? ` data-id="${h(id)}"` : ''}>${h(label)}</button>`; }
function countPending() { return state.approvals.filter(a => a.status === 'Pending').length; }
function timeLabel(a) { return `<span class="subtle">${h(a.time)}</span>`; }
function activityList(limit = 8) { return `<ul class="activity-list">${state.activity.slice(0, limit).map(a => `<li><span class="event-dot"></span><div><strong>${h(a.title)}</strong><p>${h(a.detail)}</p></div>${timeLabel(a)}</li>`).join('')}</ul>`; }

function renderNavigation() {
  const current = route();
  document.querySelector('#navigation').innerHTML = [false, true].map(utility => `<div class="nav-group ${utility ? 'utilities' : ''}">${Object.entries(routes).filter(([, r]) => Boolean(r.utility) === utility).map(([key, r]) => {
    const active = key === current || key === 'connections' && current === 'missions';
    return `<a href="#${key}" ${active ? 'aria-current="page"' : ''}>${icon(r.icon)}<span>${r.label}</span>${key === 'review' && countPending() ? `<span class="nav-count">${countPending()}</span>` : ''}</a>`;
  }).join('')}</div>`).join('');
  const label = current === 'missions' ? 'Missions' : routes[current].label;
  document.querySelector('#breadcrumb').textContent = `Example Studio / ${label}`;
  document.title = `${label} · Totem Dashboard Demo`;
}

function homePage() {
  const available = state.assistants.filter(a => a.status === 'Available').length;
  const active = state.missions.filter(m => m.status !== 'Completed').length;
  return heading('Your workspace', 'A place for your assistants and the work you share.', `<a class="button primary" href="#assistants">Manage assistants ${icon('arrow')}</a>`) +
    `<section class="stats" aria-label="Demo workspace summary">${[
      [available, 'Available assistants', 'assistants'],
      [state.connections.filter(c => c.enabled).length, 'Company connections', 'connections'],
      [active, 'Missions in progress', 'missions'],
      [countPending(), 'Awaiting your review', 'review'],
    ].map(([n, label, target]) => `<a href="#${target}"><span>${label}</span><strong>${n}</strong><small>Demo workspace ${icon('arrow')}</small></a>`).join('')}</section>` +
    `<div class="home-grid"><section class="panel"><div class="section-heading"><h2>Needs your attention</h2><a href="#review">View review</a></div>${countPending() ? state.approvals.filter(a => a.status === 'Pending').map(a => `<div class="attention"><span class="review-symbol">${icon('review')}</span><div><h3>${h(a.title)}</h3><p>${h(a.assistant)}</p></div><a class="button" href="#review">Review</a></div>`).join('') : empty('You’re all caught up', 'New simulated requests will appear after resetting the demo.')}</section><section class="panel"><div class="section-heading"><h2>Workspace assistants</h2><a href="#assistants">View all</a></div>${state.assistants.slice(0, 4).map(a => `<div class="compact-assistant">${avatar(a)}<div><strong>${h(a.name)}</strong><p>${h(a.skills.join(', '))}</p></div>${badge(a.status)}</div>`).join('')}</section></div>` +
    `<section class="panel"><div class="section-heading"><h2>Recent activity</h2><a href="#review">Open activity</a></div>${activityList(4)}</section>` +
    `<div class="quiet-note">${icon('developer')}<p>Explore the interface, then make it your own. This repository includes the dashboard and local simulations. <a href="#developer">See what’s included</a></p></div>`;
}

function assistantsPage() {
  const assistants = filterAssistants(state.assistants, query, filter);
  return heading('Assistants', 'Your registered demo assistants and the work they can help with.', `<button class="button primary" data-action="add-assistant">${icon('plus')} Add assistant</button>`) +
    `<div class="team-bar">${icon('assistants')}<strong>Example Studio</strong><span>Demo workspace</span><a href="#settings">Workspace settings ↗</a></div>` +
    `<div class="toolbar"><span class="selected-tab">Workspace assistants <span class="subtle">${state.assistants.length}</span></span><label class="search">${icon('search')}<input type="search" id="assistant-search" aria-label="Search assistants" placeholder="Search by name or skill" value="${h(query)}"></label><select id="assistant-filter" aria-label="Assistant status"><option value="all">All statuses</option>${['Available', 'Paused'].map(s => `<option${s === filter ? ' selected' : ''}>${s}</option>`).join('')}</select></div>` +
    `<section aria-label="Assistant directory" class="assistant-list">${assistants.length ? assistants.map(a => `<article class="assistant-row">${avatar(a)}<div class="assistant-identity"><h2><button class="text-button" data-action="profile" data-id="${h(a.id)}">${h(a.name)}</button></h2><p>${h(a.description)}</p><div class="skills">${a.skills.map(s => `<span>${h(s)}</span>`).join('')}<span>${h(a.host)}</span></div></div><div class="assistant-status">${badge(a.status)}<span class="subtle">Demo assistant</span></div><div class="row-actions">${button('Chat', 'chat', a.id)}${button(a.status === 'Available' ? 'Pause' : 'Resume', 'toggle-assistant', a.id, 'quiet')}</div></article>`).join('') : empty('No assistants found', 'Try another name, skill, or status.')}</section>`;
}

function networkTabs(current) { return `<nav class="tabs" aria-label="Network pages">${[['connections', 'Connections'], ['missions', 'Missions'], ['messages', 'Messages']].map(([r, label]) => `<a href="#${r}"${current === r ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`; }
function connectionsPage() {
  return heading('Totem Network', 'Explore how connected teams appear in the dashboard.') + networkTabs('connections') +
    `<p class="section-note">These companies are fictional. Connecting or disconnecting changes only this demo.</p><section class="connection-list" aria-label="Demo connections">${state.connections.map(c => `<article class="connection-row">${avatar(c)}<div><h2>${h(c.name)}</h2><p>${h(c.description)}</p></div>${badge(c.enabled ? 'Connected' : 'Disconnected')}${button(c.enabled ? 'Disconnect' : 'Connect', 'toggle-connection', c.id)}</article>`).join('')}</section>`;
}

function missionsPage() {
  return heading('Missions', 'Walk through a shared task with simulated planning and handoffs.', `<button class="button primary" data-action="new-mission">${icon('plus')} New Mission</button>`) + networkTabs('missions') +
    `<div class="section-note">Advance each step yourself. No AI agent executes work in this demo.</div><section class="mission-list" aria-label="Demo Missions">${state.missions.map(m => {
      const assistant = state.assistants.find(a => a.id === m.assistantId);
      return `<article class="panel mission"><div class="section-heading"><h2>${h(m.title)}</h2>${badge(m.status)}</div><p>${h(m.description)}</p><ol class="steps">${m.steps.map((s, i) => `<li class="${i < m.step ? 'done' : i === m.step ? 'current' : ''}"><span>${i < m.step ? icon('check') : i + 1}</span>${h(s)}</li>`).join('')}</ol><div class="mission-footer"><span>Assigned to <strong>${h(assistant?.name || 'Demo assistant')}</strong></span>${m.status === 'Completed' ? '<span class="subtle">Simulation completed</span>' : button('Simulate next step', 'advance-mission', m.id)}</div></article>`;
    }).join('')}</section>`;
}

function messagesPage() {
  const selected = state.assistants.find(a => a.id === state.selectedAssistantId) || state.assistants[0];
  const messages = state.messages.filter(m => m.assistantId === selected.id);
  return heading('Messages', 'Try a conversation with scripted, local replies.') + networkTabs('messages') +
    `<section class="chat-layout" aria-label="Demo conversations"><div class="conversation-list">${state.assistants.map(a => `<button data-action="select-chat" data-id="${h(a.id)}" aria-pressed="${selected.id === a.id}">${avatar(a)}<span><strong>${h(a.name)}</strong><small>${h(a.status)}</small></span></button>`).join('')}</div><div class="conversation"><div class="chat-heading">${avatar(selected)}<div><h2>${h(selected.name)}</h2><p>Scripted demo · No AI model connected</p></div>${badge(selected.status)}</div><div class="chat-messages" role="log" aria-label="Conversation messages">${messages.map(m => `<div class="message ${m.role}"><span>${m.role === 'user' ? 'You' : h(selected.name)}</span><p>${h(m.text)}</p></div>`).join('')}</div><form id="message-form" class="composer"><label class="sr-only" for="message">Demo message</label><textarea id="message" name="message" rows="2" placeholder="Ask about research or a release review…" maxlength="2000" required ${selected.status === 'Paused' ? 'disabled' : ''}></textarea><button class="button primary" ${selected.status === 'Paused' ? 'disabled' : ''}>Send demo message</button><p>${selected.status === 'Paused' ? 'Resume this assistant from Assistants to send a message.' : 'Stays in this page. Reloading clears your messages.'}</p></form></div></section>`;
}

function reviewPage() {
  return heading('Review', 'Keep track of requests and decisions in your demo workspace.') +
    `<div class="section-heading"><h2>Action checks</h2><span class="subtle">${countPending()} pending</span></div><section class="approval-list" aria-label="Demo action checks">${state.approvals.map(a => `<article class="panel approval"><div class="section-heading"><h2>${h(a.title)}</h2>${badge(a.status)}</div><p>${h(a.detail)}</p><div class="approval-meta"><span>${h(a.assistant)}</span><span>${h(a.scope)}</span></div>${a.status === 'Pending' ? `<div class="approval-actions">${button('Decline', 'decline', a.id)}${button('Approve demo request', 'approve', a.id, 'primary')}</div>` : '<p class="section-note">Decision saved in this session. No external action was performed.</p>'}</article>`).join('')}</section>` +
    `<section class="panel activity-panel"><div class="section-heading"><h2>Activity</h2><span class="subtle">Fictional events and this session’s changes</span></div>${activityList(20)}</section>`;
}

function usagePage() {
  const sent = state.messages.filter(m => m.role === 'user').length;
  return heading('Usage', 'Illustrative usage, separate from any real Totem account or billing.') +
    `<div class="usage-grid"><section class="panel"><div class="section-heading"><h2>Sample weekly activity</h2><span class="badge neutral">Fictional chart</span></div><p>Messages in an example workspace. These are fixed sample values.</p><div class="chart" role="img" aria-label="Fictional messages: Monday 12, Tuesday 18, Wednesday 9, Thursday 24, Friday 16, Saturday 5, Sunday 8.">${[['Mon', 12], ['Tue', 18], ['Wed', 9], ['Thu', 24], ['Fri', 16], ['Sat', 5], ['Sun', 8]].map(([day, n]) => `<div><span>${n}</span><div class="bar height-${n}"></div><small>${day}</small></div>`).join('')}</div></section><section class="panel session"><h2>This demo session</h2><dl><div><dt>Messages you sent</dt><dd>${sent}</dd></div><div><dt>Missions completed</dt><dd>${state.missions.filter(m => m.status === 'Completed').length}</dd></div><div><dt>Requests reviewed</dt><dd>${state.approvals.filter(a => a.status !== 'Pending').length}</dd></div><div><dt>Connected services</dt><dd>0</dd></div></dl><p>No billing, metering, or payments are connected.</p></section></div>`;
}

function settingsPage() {
  return heading('Settings', 'Preferences for this local demo workspace.') +
    `<section class="panel settings-panel"><div class="setting-row"><div><h2>Workspace</h2><p>Example Studio · Fictional workspace</p></div><span class="badge neutral">Demo</span></div><div class="setting-row"><div><h2>Appearance</h2><p>Switch between light and dark themes.</p></div>${button(theme === 'light' ? 'Use dark theme' : 'Use light theme', 'theme')}</div><div class="setting-row"><div><h2>Demo data</h2><p>Restore the sample assistants, requests, Missions, and conversations.</p></div>${button('Reset demo', 'reset')}</div><div class="setting-row"><div><h2>Privacy</h2><p>Data lives in page memory. Reloading clears your changes. No accounts, analytics, or external requests are used.</p></div></div></section>`;
}

function developerPage() {
  return heading('Developer', 'An open-source dashboard you can run, change, and learn from.') +
    `<section class="panel scope"><h2>What’s in this repository</h2><p>The Totem dashboard interface, fictional fixtures, and local simulations are released under the MIT license.</p><div class="scope-grid"><div><h3>Included</h3><ul><li>Workspace navigation and responsive layouts</li><li>Assistant directory, profiles, and local chat</li><li>Simulated Missions, connections, and reviews</li><li>Light and dark themes</li><li>Local preview server and static export</li></ul></div><div><h3>Private platform</h3><ul><li>Agent runtime and automatic receiving</li><li>Production messaging and orchestration</li><li>Authentication and authorization services</li><li>Credentials, security controls, and billing</li><li>Customer data and infrastructure</li></ul></div></div><p>This is the dashboard demo, rather than the full Totem platform. No hosted service access is required or included.</p><a class="button primary" href="https://github.com/totemlayer/totem-dashboard" target="_blank" rel="noopener noreferrer">Open repository ↗</a></section>`;
}

function render() {
  renderNavigation();
  const pages = { home: homePage, assistants: assistantsPage, connections: connectionsPage, missions: missionsPage, messages: messagesPage, review: reviewPage, usage: usagePage, settings: settingsPage, developer: developerPage };
  main.innerHTML = pages[route()]();
}

function notify(text) {
  const toast = document.querySelector('#toast');
  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4500);
}

function setTheme() {
  theme = theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  renderTheme();
  if (route() === 'settings') render();
}
function renderTheme() {
  const toggle = document.querySelector('#theme');
  toggle.innerHTML = icon(theme === 'light' ? 'moon' : 'sun');
  toggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
}
let dialogReturnFocus;
function openDialog(title, content) {
  dialogReturnFocus = document.activeElement;
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${h(title)}</h2><button class="icon-button" data-action="close" aria-label="Close dialog">${icon('close')}</button></div>${content}`;
  dialog.showModal();
}
dialog.addEventListener('close', () => {
  if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus();
  else main.focus({ preventScroll: true });
});
function addAssistantDialog() {
  openDialog('Add assistant', `<p>Create a fictional assistant for this demo. No installation or service connection is required.</p><form id="assistant-form"><label for="assistant-name">Name</label><input id="assistant-name" name="name" maxlength="60" placeholder="e.g. Design assistant" required><label for="assistant-description">Description</label><textarea id="assistant-description" name="description" rows="3" maxlength="240" placeholder="What would this assistant help with?"></textarea><div class="form-error" role="alert"></div><div class="dialog-actions">${button('Cancel', 'close')}<button class="button primary">Add demo assistant</button></div></form>`);
}
function missionDialog() {
  const available = state.assistants.filter(a => a.status === 'Available');
  if (!available.length) return notify('Resume an assistant before creating a demo Mission.');
  openDialog('New Mission', `<p>Plan a task and advance its simulated steps yourself.</p><form id="mission-form"><label for="mission-title">Title</label><input id="mission-title" name="title" maxlength="100" placeholder="e.g. Prepare a project brief" required><label for="mission-description">Description</label><textarea id="mission-description" name="description" rows="3" maxlength="400"></textarea><label for="mission-assistant">Assign assistant</label><select id="mission-assistant" name="assistant">${available.map(a => `<option value="${h(a.id)}">${h(a.name)}</option>`).join('')}</select><div class="form-error" role="alert"></div><div class="dialog-actions">${button('Cancel', 'close')}<button class="button primary">Create demo Mission</button></div></form>`);
}
function profileDialog(id) {
  const a = state.assistants.find(a => a.id === id);
  if (!a) return;
  openDialog(a.name, `<div class="profile-identity">${avatar(a)}${badge(a.status)}</div><p>${h(a.description)}</p><h3>Skills</h3><div class="skills">${a.skills.map(s => `<span>${h(s)}</span>`).join('')}</div><p class="section-note">This fictional profile has no connected agent runtime, model, or account.</p><div class="dialog-actions">${button('Close', 'close')}${button('Open demo chat', 'chat', a.id, 'primary')}</div>`);
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, id } = target.dataset;
  // Buttons used for dismissal inside a form should never submit it.
  event.preventDefault();
  try {
    if (action === 'close') return dialog.close();
    if (action === 'theme') return setTheme();
    if (action === 'add-assistant') return addAssistantDialog();
    if (action === 'new-mission') return missionDialog();
    if (action === 'profile') return profileDialog(id);
    if (action === 'reset') {
      openDialog('Reset demo?', `<p>This clears your local messages and changes, and restores the fictional sample data.</p><div class="dialog-actions">${button('Cancel', 'close')}${button('Reset demo data', 'confirm-reset', '', 'primary')}</div>`);
      return;
    }
    if (action === 'confirm-reset') { state = createDemoState(); query = ''; filter = 'all'; dialog.close(); notify('Demo data reset.'); }
    if (action === 'toggle-assistant') { const a = toggleAssistant(state, id); notify(`${a.name} ${a.status.toLowerCase()} in this demo.`); }
    if (action === 'toggle-connection') { const c = toggleConnection(state, id); notify(`${c.name} ${c.enabled ? 'connected' : 'disconnected'} in this demo.`); }
    if (action === 'approve' || action === 'decline') { decideApproval(state, id, action === 'approve' ? 'Approved' : 'Declined'); notify('Demo decision saved. No external action performed.'); }
    if (action === 'advance-mission') { const m = advanceMission(state, id); notify(m.status === 'Completed' ? 'Demo Mission completed.' : 'Demo Mission advanced one step.'); }
    if (action === 'chat' || action === 'select-chat') {
      state.selectedAssistantId = id;
      if (dialog.open) dialog.close();
      if (route() !== 'messages') { location.hash = 'messages'; return; }
      render();
      document.querySelector('#message')?.focus();
      return;
    }
    render();
    if (id) {
      const nextFocus = main.querySelector(`[data-action="${action}"][data-id="${CSS.escape(id)}"]`);
      (nextFocus || main).focus({ preventScroll: true });
    }
  } catch (error) { notify(error.message); }
});

document.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  try {
    if (form.id === 'assistant-form') { addAssistant(state, data.get('name'), data.get('description')); dialog.close(); notify('Demo assistant added.'); }
    if (form.id === 'mission-form') { createMission(state, data.get('title'), data.get('description'), data.get('assistant')); dialog.close(); notify('Demo Mission created.'); }
    if (form.id === 'message-form') { sendMessage(state, state.selectedAssistantId, data.get('message')); }
    render();
    if (form.id === 'message-form') { document.querySelector('#message').focus(); const log = document.querySelector('.chat-messages'); log.scrollTop = log.scrollHeight; }
    else main.focus({ preventScroll: true });
  } catch (error) {
    const region = form.querySelector('.form-error');
    if (region) region.textContent = error.message;
    else notify(error.message);
  }
});

document.addEventListener('input', event => {
  if (event.target.id !== 'assistant-search') return;
  query = event.target.value;
  const start = event.target.selectionStart, end = event.target.selectionEnd;
  render();
  const search = document.querySelector('#assistant-search');
  search.focus();
  search.setSelectionRange(start, end);
});
document.addEventListener('change', event => {
  if (event.target.id !== 'assistant-filter') return;
  filter = event.target.value;
  render();
  document.querySelector('#assistant-filter').focus();
});
document.querySelector('#theme').addEventListener('click', setTheme);
window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); });
renderTheme();
render();
