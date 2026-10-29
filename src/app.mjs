import { createDemoState } from "./demo-data.mjs";
import {
  escapeHtml as h,
  filterAssistants,
  addAssistant,
  toggleAssistant,
  decideApproval,
  createMission,
  advanceMission,
  sendMessage,
  listDemoConversations,
  addMissionNote,
  toggleConnection,
} from "./model.mjs";

let state = createDemoState();
let query = "";
let filter = "all";
let theme = "dark";
let sidebarCollapsed = false;
let agentView = "list";
let directoryScope = "agents";
let environment = "all";
let selectedMissionId = state.missions[0].id;
let missionQuery = "";
let conversationQuery = "";
let chartPeriod = "30";
let promptDraft = "";
let promptAssistantId = "";
let draftingMission = false;
let activeConversationId = "";
let selectedRecipientId = "";
let messageDraft = "";
let messageAttachments = [];
let conversationFilter = "all";
let missionNoteDraft = "";
let toastTimer;
const main = document.querySelector("main");
const dialog = document.querySelector("dialog");
const paths = {
  "message-square":
    '<path d="M21 15a3 3 0 0 1-3 3H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  team: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',
  "mission-step":
    '<path d="M9 5h12M9 12h12M9 19h12M2 5l1 1 2-3M2 12l1 1 2-3M2 19l1 1 2-3"/>',
  attach:
    '<path d="m21 11-8.5 8.5a6 6 0 0 1-8.5-8.5L13 2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8L15 6"/>',
  appearance: '<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  assistants:
    '<rect x="4" y="6" width="16" height="14" rx="4"/><path d="M12 6V3m-4 8v2m8-2v2m-7 4h6M1 11v4m22-4v4"/>',
  network:
    '<circle cx="12" cy="5" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="m10.5 7.5-4 8m7-8 4 8M8 18h8"/>',
  chat: '<path d="M21 11a8 8 0 0 1-8 8H8l-5 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h10m-10 4h6"/>',
  review:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  usage: '<path d="M4 20h16M6 16v-5m6 5V4m6 12V8"/>',
  settings:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  developer: '<path d="m8 5-7 7 7 7m8-14 7 7-7 7m-3-17-2 20"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  moon: '<path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  sidebar:
    '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M9 5v14"/>',
  account:
    '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  notifications:
    '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  send: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  back: '<path d="m14 6-6 6 6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
function icon(name) {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
}
const navigationArtwork = {
  home: '<span class="feature-icon" data-icon="home" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" fill="currentColor" opacity=".16"/><path d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9" stroke="currentColor" stroke-width="1.7" fill="none"/></svg></span>',
  network:
    '<span class="feature-icon" data-icon="network" aria-hidden="true"><svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.65"><path d="M8.9 6.5c1.8 1.9 3.2 3.7 4.3 5.3M8.4 17.2c.8-2.1 1.9-4.4 3-6M11.9 13.3c2.4 0 4.9-.3 6.8-.9M5.3 12.3l3 .5M14 8.5l1.2-2M14.8 15.1l.9 2"/><circle cx="7.85" cy="5.2" r="1.45"/><circle cx="16.15" cy="5.2" r="1.45"/><circle cx="20.3" cy="12" r="1.45"/><circle cx="16.15" cy="18.8" r="1.45"/><circle cx="7.85" cy="18.8" r="1.45"/><circle cx="3.7" cy="12" r="1.45"/></g></svg></span>',
  messages:
    '<span class="feature-icon" data-icon="messages" aria-hidden="true"><svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10.5A8.75 8.75 0 1 1 19 17.3l.3 3.5-4.1-2a8.8 8.8 0 0 1-2.4.2"/><path d="M13.5 15.5a5.75 5.75 0 1 0-9.3 4.5v2l3-1h.55a5.75 5.75 0 0 0 5.75-5.5Z"/></g></svg></span>',
  missions:
    '<span class="feature-icon" data-icon="missions" aria-hidden="true"><svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16.5l2.5-3.8a5.8 5.8 0 0 1 5.6-2.5l3 .3c1.5-.1 2.7-.6 3.1.5.5 1.3-1.7 2.5-4.5 2.7-1.5.1-1.9 1.1-.4 1.4 2.4.5 4.5-.7 6.4-1.8l2.6-1.5c1.4-.8 2.3.6 1.1 1.6l-5.7 4.7c-.7.6-1.5.9-2.4 1L7 20l-1.6 1.5Z"/><path d="m12.7 10.4 2.8-3.2c1-1.1 2.4-.6 1.7.7l-1.5 2.5M16.2 11.7l3.1-3c1.2-1.1 2.4-.2 1.3 1.1l-3.2 3.4"/></g></svg></span>',
};
const routes = {
  home: { label: "Home", icon: "home" },
  assistants: { label: "Network", icon: "network" },
  connections: { label: "Network", icon: "network" },
  messages: { label: "Messages", icon: "chat" },
  missions: { label: "Missions", icon: "missions" },
  review: { label: "Review", icon: "review", utility: true },
  usage: { label: "Usage", icon: "usage", utility: true },
  settings: { label: "Settings", icon: "settings", utility: true },
  developer: { label: "Developer", icon: "developer", utility: true },
};
const networkRoutes = ["connections", "missions", "messages"];
function route() {
  const key = location.hash.slice(1) || "home";
  return key in routes || key === "missions" ? key : "home";
}
function avatar(a) {
  return `<span class="avatar"><img src="./mark.svg" width="28" height="32" alt=""></span>`;
}
function initialsAvatar(a) {
  return `<span class="avatar ${h(a.color || "sage")}">${h(a.initials)}</span>`;
}
function badge(status) {
  const color = ["Available", "Completed", "Approved", "Connected"].includes(
    status,
  )
    ? "positive"
    : status === "Pending" || status === "In progress"
      ? "pending"
      : "neutral";
  return `<span class="badge ${color}">${h(status)}</span>`;
}
function empty(title, detail) {
  return `<div class="empty">${icon("search")}<h3>${h(title)}</h3><p>${h(detail)}</p></div>`;
}
function heading(title, description, action = "") {
  return `<header class="page-heading"><div><h1>${h(title)}</h1><p>${h(description)}</p></div>${action}</header>`;
}
function button(label, action, id = "", variant = "") {
  return `<button class="button ${variant}" data-action="${action}"${id ? ` data-id="${h(id)}"` : ""}>${h(label)}</button>`;
}
function countPending() {
  return state.approvals.filter((a) => a.status === "Pending").length;
}
function timeLabel(a) {
  return `<span class="subtle">${h(a.time)}</span>`;
}
function activityList(limit = 8) {
  return `<ul class="activity-list">${state.activity
    .slice(0, limit)
    .map(
      (a) =>
        `<li><span class="event-dot"></span><div><strong>${h(a.title)}</strong><p>${h(a.detail)}</p></div>${timeLabel(a)}</li>`,
    )
    .join("")}</ul>`;
}

function navLinks() {
  const current = route();
  return [
    ["home", "Home"],
    ["assistants", "Network"],
    ["messages", "Messages"],
    ["missions", "Missions"],
  ]
    .map(([key, label]) => {
      const active =
        key === current || (key === "assistants" && current === "connections");
      const artwork = navigationArtwork[key === "assistants" ? "network" : key];
      return `<a href="#${key}" aria-label="${label}" title="${label}" ${active ? 'aria-current="page"' : ""}>${artwork}<span>${label}</span></a>`;
    })
    .join("");
}
function renderNavigation() {
  const current = route(),
    studio = ["messages", "missions"].includes(current);
  document.body.dataset.section = current;
  document.body.classList.toggle("studio-mode", studio);
  document.body.classList.toggle(
    "sidebar-collapsed",
    sidebarCollapsed && !studio,
  );
  document.querySelector("#navigation").innerHTML = navLinks();
  document.querySelector("#studio-navigation").innerHTML = studio
    ? studioNavigation(current)
    : "";
  document.querySelector("#sidebar-toggle").innerHTML = icon("sidebar");
  document
    .querySelector("#sidebar-toggle")
    .setAttribute("aria-expanded", String(!sidebarCollapsed));
  document
    .querySelector("#sidebar-toggle")
    .setAttribute(
      "aria-label",
      studio
        ? "Workspace navigation"
        : sidebarCollapsed
          ? "Maximize sidebar"
          : "Minimize sidebar",
    );
  document.querySelector("#notifications").innerHTML = icon("notifications");
  document.querySelector("#account").innerHTML = icon("account");
  document.title = `${routes[current]?.label || "Network"} · Totem Dashboard Demo`;
}
function studioNavigation(current) {
  if (current === "missions")
    return `<div class="studio-sidebar-heading"><strong>Missions</strong><button class="icon-button" data-action="new-mission" aria-label="New mission">${icon("plus")}</button></div><label class="sr-only" for="mission-search">Search missions</label><input id="mission-search" type="search" placeholder="Search missions" value="${h(missionQuery)}"><div class="mission-links">${state.missions
      .filter((m) => m.title.toLowerCase().includes(missionQuery.toLowerCase()))
      .map(
        (m) =>
          `<button data-action="select-mission" data-id="${h(m.id)}" aria-pressed="${!draftingMission && m.id === selectedMissionId}">${icon("mission-step")}<span><strong>${h(m.title)}</strong><small>${h(m.status)}</small></span></button>`,
      )
      .join(
        "",
      )}</div><div class="studio-sidebar-links"><button class="button" data-action="automations">Automations</button><a href="#review">All missions & access requests</a><button class="text-button" data-action="automations">Recurring workflows</button></div>`;
  const conversations = listDemoConversations(
    state,
    state.selectedAssistantId,
  ).filter(
    (c) =>
      `${c.name} ${c.preview}`
        .toLowerCase()
        .includes(conversationQuery.toLowerCase()) &&
      (conversationFilter === "all" ||
        state.connections.find((x) => x.id === c.recipientId)?.enabled),
  );
  return `<div class="studio-sidebar-heading"><strong>Messages</strong><button class="icon-button" data-action="new-message" aria-label="New message">${icon("plus")}</button></div><label class="sr-only" for="chat-assistant">Send as</label><select id="chat-assistant">${state.assistants.map((a) => `<option value="${h(a.id)}" ${a.id === state.selectedAssistantId ? "selected" : ""}>${h(a.name)}</option>`).join("")}</select><small class="subtle">▸ Demo environment</small><div class="conversation-search-row"><label class="search conversation-search">${icon("search")}<input id="conversation-search" aria-label="Search conversations" placeholder="Search conversation" value="${h(conversationQuery)}"></label><button class="text-button conversation-filter" data-action="filter-conversations" aria-pressed="${conversationFilter === "connected"}">${icon("appearance")} Filter</button></div><div class="conversation-list">${conversations.length ? conversations.map((c) => `<button data-action="open-conversation" data-id="${h(c.id)}" aria-pressed="${activeConversationId === c.id}">${icon("message-square")}<span><strong>${h(c.name)}</strong><small>${h(c.preview.slice(0, 45))}</small></span></button>`).join("") : '<p class="no-conversations">No conversations yet.</p>'}</div><a class="button primary find-agents" href="#assistants">Find agents</a>`;
}

function homeAgentTable() {
  const agents = filterAssistants(state.assistants, query, filter);
  return `<div class="home-agent-toolbar"><h2>Your agents</h2><label class="search">${icon("search")}<input id="assistant-search" type="search" aria-label="Search registered agents" placeholder="Search agents" value="${h(query)}"></label><select id="assistant-filter" aria-label="Filter agents by status"><option value="all">All statuses</option>${["Available", "Paused"].map((v) => `<option ${filter === v ? "selected" : ""}>${v}</option>`).join("")}</select><div class="view-buttons"><button class="icon-button" data-action="list-view" aria-label="List view" aria-pressed="${agentView === "list"}">${icon("list")}</button><button class="icon-button" data-action="grid-view" aria-label="Grid view" aria-pressed="${agentView === "grid"}">${icon("grid")}</button></div></div>${agents.length ? `<div class="home-agent-table ${agentView === "grid" ? "grid-view" : ""}"><table><thead><tr><th>Agent</th><th>Status</th><th>Workspace</th><th>Active permissions</th><th>Permission expires</th><th>Action</th></tr></thead><tbody>${agents.map((a) => `<tr><td><button class="text-button" data-action="profile" data-id="${h(a.id)}">${h(a.name)}</button></td><td><span class="status-dot ${a.status === "Available" ? "enabled" : "paused"}" role="img" aria-label="${h(a.status)}"></span></td><td>Example Studio</td><td>0</td><td>None</td><td><button class="text-button" data-action="profile" data-id="${h(a.id)}" aria-label="View ${h(a.name)}">↗</button></td></tr>`).join("")}</tbody></table></div>` : empty("No agents found", "Try another name or status.")}<div class="table-footer"><button class="text-button" data-action="add-assistant">Connect agent</button><a href="#assistants">View agents ↗</a></div>`;
}
function missionAgentPicker() {
  return `<details class="prompt-agent-picker"><summary>+ ${promptAssistantId ? "1 agent" : "0 agents"}</summary><div class="prompt-agent-menu">${state.assistants
    .filter((a) => a.status === "Available")
    .map(
      (a) =>
        `<label>${avatar(a)}<span>${h(a.name)}</span><input type="radio" name="assistant" value="${h(a.id)}" ${a.id === promptAssistantId ? "checked" : ""} aria-label="Assign ${h(a.name)}"></label>`,
    )
    .join("")}</div></details>`;
}
function missionPrompt() {
  return `<div class="home-workspace-switch"><button aria-pressed="true">Individual</button><button class="icon-button" data-action="account" aria-label="Workspace options">${icon("plus")}</button></div><button class="icon-button appearance-trigger" data-action="appearance" aria-label="Customize appearance">${icon("appearance")}</button><section class="home-prompt-area" aria-labelledby="mission-prompt-heading"><h1 id="mission-prompt-heading">What's the next mission?</h1><form id="quick-mission-form" class="mission-prompt"><label for="quick-mission">New mission</label><textarea id="quick-mission" name="mission" aria-label="Describe your mission" maxlength="400" placeholder="Describe a task, an idea, or something to work on…" required>${h(promptDraft)}</textarea><div class="prompt-tools">${missionAgentPicker()}<button class="icon-button send-button" aria-label="Review new mission" ${!promptDraft.trim() || !promptAssistantId ? "disabled" : ""}>${icon("send")}</button></div></form></section>`;
}

function heatmap() {
  return `<div class="heatmap-scroll"><div class="heatmap" role="img" aria-label="Sample usage activity over the last twelve months">${Array.from({ length: 364 }, (_, i) => `<span class="heat-${i > 300 && (i * 13 + Math.floor(i / 7)) % 11 > 7 ? (i % 3) + 1 : 0}"></span>`).join("")}</div><div class="heatmap-months">${["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m) => `<span>${m}</span>`).join("")}</div></div><div class="chart-footer"><span>Sample messages sent</span><span class="heatmap-legend">Less ${[0, 1, 2, 3].map((n) => `<i class="heat-${n}"></i>`).join("")} More</span></div>`;
}

function smoothChartPath(points) {
  const p = points.split(" ").map((pair) => pair.split(",").map(Number));
  let path = `M${p[0].join(",")}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)],
      b = p[i],
      c = p[i + 1],
      d = p[Math.min(p.length - 1, i + 2)];
    path += `C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (d[0] - b[0]) / 6).toFixed(1)},${(c[1] - (d[1] - b[1]) / 6).toFixed(1)} ${c.join(",")}`;
  }
  return path;
}
function homePage() {
  const total = 92 + state.messages.filter((m) => m.role === "user").length;
  const points =
    chartPeriod === "7"
      ? "0,112 25,110 45,92 68,100 90,42 115,90 140,98 160,67 180,100 200,99 225,85 245,101 270,65 300,96 340,105 370,70 400,108 450,100 500,109 560,104"
      : "0,112 75,112 90,98 110,104 133,63 153,77 173,109 192,8 210,106 230,111 270,105 310,109 350,105 390,98 425,35 450,107 475,104 500,66 525,109 560,113";
  return (
    missionPrompt() +
    `<div class="dashboard-graphs"><section class="message-activity" aria-label="Workspace activity"><div class="chart-heading"><span><strong>${total}</strong> Messages</span><select id="chart-period" aria-label="Message activity period"><option value="7" ${chartPeriod === "7" ? "selected" : ""}>Last 7 days</option><option value="30" ${chartPeriod === "30" ? "selected" : ""}>Last 30 days</option><option value="90" ${chartPeriod === "90" ? "selected" : ""}>Last 90 days</option></select></div><div class="line-chart-wrap"><div class="chart-y-axis" aria-hidden="true"><span>24</span><span>12</span><span>0</span></div><svg class="line-chart" viewBox="0 0 560 135" role="img" aria-label="Sample daily message activity"><path class="chart-guide" d="M0 8H560M0 60H560M0 112H560"/><path d="${smoothChartPath(points)}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></div><div class="chart-footer"><span>Sample activity period</span><span>Daily messages · UTC</span></div></section><section class="usage-activity"><div class="chart-heading"><h2>Usage activity</h2><span class="small-control">Messages sent</span><span class="small-control">Daily</span></div>${heatmap()}</section></div><div class="home-agent-section"><section>${homeAgentTable()}</section><aside class="agent-summary"><h2><strong>${state.assistants.length}</strong> Agents</h2><p><span class="status-dot enabled"></span> Enabled <span>${state.assistants.filter((a) => a.status === "Available").length}</span></p><p><span class="status-dot paused"></span> Paused <span>${state.assistants.filter((a) => a.status === "Paused").length}</span></p><p><span class="status-dot"></span> Revoked <span>0</span></p></aside></div>`
  );
}

function assistantsPage() {
  return networkPage();
}
function networkPage() {
  const selected = route() === "connections" ? "connections" : directoryScope;
  const agents = filterAssistants(state.assistants, query, filter).filter(
    (a) =>
      environment === "all" ||
      (environment === "paused"
        ? a.status === "Paused"
        : a.status === "Available"),
  );
  const cards =
    selected === "connections"
      ? state.connections
          .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
          .map(
            (c) =>
              `<article class="network-card"><header>${avatar(c)}<div><h2>${h(c.name)}</h2><small>Company connection</small></div></header><p>${h(c.description)}</p><p class="network-card-note">${c.enabled ? "Connected to your network" : "Not connected"}</p><div class="network-card-actions">${button(c.enabled ? "Disconnect" : "Connect", "toggle-connection", c.id, "text-action")}</div></article>`,
          )
          .join("")
      : agents
          .map(
            (a) =>
              `<article class="network-card"><header>${avatar(a)}<div><h2>${h(a.name)}</h2><small>Your account</small></div></header><p>${h(a.description)}</p><p class="network-card-note">${a.status === "Available" ? "Your workspace agent · no individual connections" : "Paused in this workspace"}</p><div class="network-card-actions">${button("Manage agent ↗", "profile", a.id, "text-action")}${button("Chat", "chat", a.id, "text-action")}${button("Identity & memory ↗", "profile", a.id, "text-action")}</div></article>`,
          )
          .join("");
  return `<header class="network-heading"><button class="icon-button back-button" data-action="back-home" aria-label="Back">${icon("back")}</button><h1><span>Network</span> with Agents.</h1><div class="network-heading-actions"><button class="button primary" data-action="add-assistant">Connect agent</button><button class="icon-button" data-action="network-tools" aria-label="Network tools">···</button></div></header><div class="network-layout"><aside class="network-filters"><h2>Filters</h2><label for="network-directory">Directory</label><select id="network-directory" aria-label="Agent directory scope"><option value="agents" ${selected === "agents" ? "selected" : ""}>Your agents</option><option value="connections" ${selected === "connections" ? "selected" : ""}>Your network</option><option value="public" ${selected === "public" ? "selected" : ""}>Public directory</option></select><label class="search">${icon("search")}<input type="search" id="assistant-search" aria-label="Search agents" placeholder="Search agents" value="${h(query)}"></label><label for="network-environment">Environment</label><select id="network-environment" aria-label="Agent environment"><option value="all" ${environment === "all" ? "selected" : ""}>Live</option><option value="available" ${environment === "available" ? "selected" : ""}>Available</option><option value="paused" ${environment === "paused" ? "selected" : ""}>Paused</option></select></aside><section class="network-grid" aria-label="Agents and connections">${cards || empty("No agents found", "Try another search or filter.")}</section></div>`;
}

function connectionsPage() {
  return networkPage();
}

function missionsPage() {
  if (draftingMission)
    return `<div class="mission-studio drafting"><button class="studio-history mission-history-trigger" data-action="history">${icon("mission-step")} Mission history</button><button class="icon-button studio-back" data-action="workspace-nav" aria-label="Workspace navigation">${icon("back")}</button><section class="mission-start"><h1>Start a mission</h1><p>Choose your agents and describe the work. Your team’s recorded messages will appear here.</p></section><form id="quick-mission-form" class="mission-draft-composer"><textarea id="quick-mission" name="mission" aria-label="Describe your mission" maxlength="400" placeholder="Ask Totem…" required>${h(promptDraft)}</textarea><div class="prompt-tools">${missionAgentPicker()}<button class="icon-button send-button" aria-label="Review new mission" ${!promptDraft.trim() || !promptAssistantId ? "disabled" : ""}>${icon("send")}</button></div></form></div>`;
  const mission =
      state.missions.find((m) => m.id === selectedMissionId) ||
      state.missions[0],
    assistant = state.assistants.find((a) => a.id === mission.assistantId);
  return `<div class="mission-studio"><button class="studio-history mission-history-trigger" data-action="history">${icon("mission-step")} Mission history</button><header class="mission-studio-heading"><button class="icon-button studio-back" data-action="workspace-nav" aria-label="Workspace navigation">${icon("back")}</button><span class="mission-orb">${icon("team")}</span><h1>${h(mission.title)}</h1><p>1 active agent · ${h(mission.status)}</p><button class="button mission-details" data-action="mission-details" data-id="${h(mission.id)}">ⓘ Details</button></header><section class="mission-thread" aria-label="Mission activity"><article class="mission-thread-message"><span>You <small>Goal</small></span><p>${h(mission.description)}</p></article>${mission.steps
    .slice(0, mission.step)
    .map(
      (step) =>
        `<article class="mission-thread-message"><span>${h(assistant?.name || "Assistant")} <small>Completion</small></span><p>${h(step)}</p><small>Recorded in this dashboard simulation.</small></article>`,
    )
    .join(
      "",
    )}${(mission.notes || []).map((n) => `<article class="mission-thread-message"><span>${n.role === "user" ? "You" : h(assistant?.name || "Assistant")} <small>Message</small></span><p>${h(n.text)}</p></article>`).join("")}</section>${mission.status === "Completed" ? '<div class="mission-completed-note">Mission completed. Its receipts and conversation remain available.</div>' : `<form id="mission-note-form" class="mission-draft-composer mission-followup"><textarea id="mission-note" name="note" aria-label="Message Mission" maxlength="2000" placeholder="Ask Totem…" required>${h(missionNoteDraft)}</textarea><div class="prompt-tools"><span class="subtle">${icon("team")} 1 agent</span><button class="icon-button send-button" aria-label="Send Mission note">${icon("send")}</button></div></form>`}</div>`;
}

function messagesPage() {
  const selected =
    state.assistants.find((a) => a.id === state.selectedAssistantId) ||
    state.assistants[0];
  const messages = state.messages.filter(
    (m) =>
      m.assistantId === selected.id && m.recipientId === selectedRecipientId,
  );
  const recipient = state.connections.find((c) => c.id === selectedRecipientId);
  const hasSent =
    activeConversationId === `${selected.id}:${selectedRecipientId}` &&
    messages.some((m) => m.role === "user");
  return `<section class="messages-studio"><button class="studio-history" data-action="history">${icon("sidebar")} Message history</button><header class="messages-heading"><button class="icon-button studio-back" data-action="workspace-nav" aria-label="Workspace navigation">${icon("back")}</button><h1>${hasSent ? h(recipient?.name || "Messages") : "New message"}</h1><p>Send as ${h(selected.name)}</p></header><div class="chat-messages" role="log" aria-label="Conversation messages">${hasSent ? messages.map((m) => `<article class="message ${m.role}"><span>${m.role === "user" ? "You" : h(selected.name)}</span><p>${h(m.text)}</p></article>`).join("") : `<div class="message-empty"><span>${icon("message-square")}</span><h2>Message another agent</h2><p>Send on behalf of ${h(selected.name)}. Choose a connected agent below. Add and approve connections on the Network page.</p></div>`}</div><form id="message-form" class="composer"><label for="message-recipient">Connected agent</label><select id="message-recipient" name="recipient" aria-label="Connected agent" required><option value="" disabled ${!selectedRecipientId ? "selected" : ""}>Choose a connected agent</option>${state.connections
    .filter((c) => c.enabled)
    .map(
      (c) =>
        `<option value="${h(c.id)}" ${c.id === selectedRecipientId ? "selected" : ""}>${h(c.name)}</option>`,
    )
    .join(
      "",
    )}</select><label class="sr-only" for="message">Demo message</label><textarea id="message" name="message" rows="3" placeholder="Write a message…" maxlength="2000" required ${selected.status === "Paused" ? "disabled" : ""}>${h(messageDraft)}</textarea>${messageAttachments.length ? `<div class="attachment-chips">${messageAttachments.map((file, i) => `<span>${h(file.name)} <button type="button" class="text-button" data-action="remove-attachment" data-id="${i}" aria-label="Remove ${h(file.name)}">×</button></span>`).join("")}</div>` : ""}<div class="composer-tools"><span class="subtle">${selected.status === "Paused" ? "Resume this agent to send a message." : ""}</span><div class="composer-actions"><input id="message-attachments" type="file" multiple class="sr-only" aria-label="Attach files"><label for="message-attachments" class="attach-files">${icon("attach")} Attach files</label><button class="icon-button send-button" aria-label="Send demo message" ${selected.status === "Paused" ? "disabled" : ""}>${icon("send")}</button></div></div></form></section>`;
}

function reviewPage() {
  return (
    heading(
      "Review",
      "Keep track of requests and decisions in your demo workspace.",
    ) +
    `<div class="section-heading"><h2>Action checks</h2><span class="subtle">${countPending()} pending</span></div><section class="approval-list" aria-label="Demo action checks">${state.approvals.map((a) => `<article class="panel approval"><div class="section-heading"><h2>${h(a.title)}</h2>${badge(a.status)}</div><p>${h(a.detail)}</p><div class="approval-meta"><span>${h(a.assistant)}</span><span>${h(a.scope)}</span></div>${a.status === "Pending" ? `<div class="approval-actions">${button("Decline", "decline", a.id)}${button("Approve demo request", "approve", a.id, "primary")}</div>` : '<p class="section-note">Decision saved in this session. No external action was performed.</p>'}</article>`).join("")}</section>` +
    `<section class="panel activity-panel"><div class="section-heading"><h2>Activity</h2><span class="subtle">Sample events and this session’s changes</span></div>${activityList(20)}</section>`
  );
}

function usagePage() {
  const sent = state.messages.filter((m) => m.role === "user").length;
  return (
    heading(
      "Usage",
      "Illustrative usage, separate from any real Totem account or billing.",
    ) +
    `<div class="usage-grid"><section class="panel"><div class="section-heading"><h2>Sample weekly activity</h2><span class="badge neutral">Sample chart</span></div><p>Messages in an example workspace. These are fixed sample values.</p><div class="chart" role="img" aria-label="Sample messages: Monday 12, Tuesday 18, Wednesday 9, Thursday 24, Friday 16, Saturday 5, Sunday 8.">${[
      ["Mon", 12],
      ["Tue", 18],
      ["Wed", 9],
      ["Thu", 24],
      ["Fri", 16],
      ["Sat", 5],
      ["Sun", 8],
    ]
      .map(
        ([day, n]) =>
          `<div><span>${n}</span><div class="bar height-${n}"></div><small>${day}</small></div>`,
      )
      .join(
        "",
      )}</div></section><section class="panel session"><h2>This demo session</h2><dl><div><dt>Messages you sent</dt><dd>${sent}</dd></div><div><dt>Missions completed</dt><dd>${state.missions.filter((m) => m.status === "Completed").length}</dd></div><div><dt>Requests reviewed</dt><dd>${state.approvals.filter((a) => a.status !== "Pending").length}</dd></div><div><dt>Connected services</dt><dd>0</dd></div></dl><p>No billing, metering, or payments are connected.</p></section></div>`
  );
}

function settingsPage() {
  return (
    heading("Settings", "Preferences for this local demo workspace.") +
    `<section class="panel settings-panel"><div class="setting-row"><div><h2>Workspace</h2><p>Example Studio · Demo workspace</p></div><span class="badge neutral">Demo</span></div><div class="setting-row"><div><h2>Appearance</h2><p>Switch between light and dark themes.</p></div>${button(theme === "light" ? "Use dark theme" : "Use light theme", "theme")}</div><div class="setting-row"><div><h2>Demo data</h2><p>Restore the sample assistants, requests, Missions, and conversations.</p></div>${button("Reset demo", "reset")}</div><div class="setting-row"><div><h2>Privacy</h2><p>Data lives in page memory. Reloading clears your changes. No accounts, analytics, or external requests are used.</p></div></div></section>`
  );
}

function developerPage() {
  return (
    heading(
      "Developer",
      "An open-source dashboard you can run, change, and learn from.",
    ) +
    `<section class="panel scope"><h2>What’s in this repository</h2><p>The Totem dashboard interface, sample fixtures, and local simulations are released under the MIT license.</p><div class="scope-grid"><div><h3>Included</h3><ul><li>Workspace navigation and responsive layouts</li><li>Assistant directory, profiles, and local chat</li><li>Simulated Missions, connections, and reviews</li><li>Light and dark themes</li><li>Local preview server and static export</li></ul></div><div><h3>Private platform</h3><ul><li>Agent runtime and automatic receiving</li><li>Production messaging and orchestration</li><li>Authentication and authorization services</li><li>Credentials, security controls, and billing</li><li>Customer data and infrastructure</li></ul></div></div><p>This is the dashboard demo, rather than the full Totem platform. No hosted service access is required or included.</p><a class="button primary" href="https://github.com/totemlayer/totem-dashboard" target="_blank" rel="noopener noreferrer">Open repository ↗</a></section>`
  );
}

function render() {
  renderNavigation();
  const pages = {
    home: homePage,
    assistants: assistantsPage,
    connections: connectionsPage,
    missions: missionsPage,
    messages: messagesPage,
    review: reviewPage,
    usage: usagePage,
    settings: settingsPage,
    developer: developerPage,
  };
  main.innerHTML = pages[route()]();
  const heatmap = document.querySelector(".heatmap-scroll");
  if (heatmap) heatmap.scrollLeft = heatmap.scrollWidth;
}

function notify(text) {
  const toast = document.querySelector("#toast");
  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.classList.add("visible");
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 4500);
}

function setTheme() {
  theme = theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  renderTheme();
  render();
  if (dialog.open) dialog.close();
}
function renderTheme() {
  const toggle = document.querySelector("#theme");
  if (!toggle) return;
  toggle.innerHTML = icon(theme === "light" ? "moon" : "sun");
  toggle.setAttribute(
    "aria-label",
    `Switch to ${theme === "light" ? "dark" : "light"} theme`,
  );
}
let dialogReturnFocus;
function openDialog(title, content) {
  dialogReturnFocus = document.activeElement;
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${h(title)}</h2><button class="icon-button" data-action="close" aria-label="Close dialog">${icon("close")}</button></div>${content}`;
  dialog.showModal();
}
dialog.addEventListener("close", () => {
  if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus();
  else main.focus({ preventScroll: true });
});
function workspaceNavigationDialog() {
  const studio =
    route() === "missions"
      ? `<h3>Missions</h3><div class="account-links"><button class="button" data-action="new-mission">New Mission</button>${state.missions.map((m) => `<button class="text-button" data-action="select-mission" data-id="${h(m.id)}">${h(m.title)}</button>`).join("")}</div>`
      : route() === "messages"
        ? `<h3>Conversations</h3><div class="account-links">${state.assistants.map((a) => `<button class="text-button" data-action="select-chat" data-id="${h(a.id)}">${h(a.name)}</button>`).join("")}</div>`
        : "";
  openDialog(
    "Workspace",
    `<nav class="navigation-dialog">${navLinks()}</nav>${studio}<div class="account-links"><button class="text-button" data-action="account">Account options</button></div>`,
  );
}
function addAssistantDialog() {
  openDialog(
    "Add agent",
    `<p>Add your own agent, connect an existing agent, or review a company’s visible agents.</p><nav class="connect-tabs" aria-label="Agent connection options"><button type="button" aria-pressed="true" data-action="add-assistant">Add your own agent</button><button type="button" data-action="connect-address">Connect by address</button><a href="#connections">Connect company agents</a></nav><p class="section-note">Choose a name for your agent. Changes stay in this dashboard demo.</p><div class="connect-logo"><h3>Agent logo</h3><span class="selected-logo"><img src="./mark.svg" width="27" height="32" alt=""><small>Totem</small></span></div><form id="assistant-form"><label for="assistant-name">Name</label><input id="assistant-name" name="name" maxlength="60" placeholder="e.g. Design assistant" required><label for="assistant-description">What does it do?</label><textarea id="assistant-description" name="description" rows="3" maxlength="240" placeholder="What would this assistant help with?"></textarea><div class="form-error" role="alert"></div><div class="dialog-actions">${button("Cancel", "close")}<button class="button primary">Add agent</button></div></form>`,
  );
}
function missionDialog() {
  const available = state.assistants.filter((a) => a.status === "Available");
  if (!available.length)
    return notify("Resume an assistant before creating a demo Mission.");
  openDialog(
    "New Mission",
    `<p>Plan a task and advance its simulated steps yourself.</p><form id="mission-form"><label for="mission-title">Title</label><input id="mission-title" name="title" maxlength="100" placeholder="e.g. Prepare a project brief" value="${h(promptDraft.slice(0, 100))}" required><label for="mission-description">Description</label><textarea id="mission-description" name="description" rows="3" maxlength="400">${h(promptDraft)}</textarea><label for="mission-assistant">Assign assistant</label><select id="mission-assistant" name="assistant">${available.map((a) => `<option value="${h(a.id)}" ${a.id === promptAssistantId ? "selected" : ""}>${h(a.name)}</option>`).join("")}</select><div class="form-error" role="alert"></div><div class="dialog-actions">${button("Cancel", "close")}<button class="button primary">Create demo Mission</button></div></form>`,
  );
}
function profileDialog(id) {
  const a = state.assistants.find((a) => a.id === id);
  if (!a) return;
  openDialog(
    a.name,
    `<div class="profile-identity">${avatar(a)}${badge(a.status)}</div><p>${h(a.description)}</p><h3>Skills</h3><div class="skills">${a.skills.map((s) => `<span>${h(s)}</span>`).join("")}</div><p class="section-note">This demo profile has no connected agent runtime, model, or account.</p><div class="dialog-actions">${button(a.status === "Available" ? "Pause" : "Resume", "toggle-assistant", a.id)}${button("Open demo chat", "chat", a.id, "primary")}</div>`,
  );
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action, id } = target.dataset;
  // Buttons used for dismissal inside a form should never submit it.
  event.preventDefault();
  try {
    if (action === "close") return dialog.close();
    if (action === "theme") return setTheme();
    if (action === "add-assistant") return addAssistantDialog();
    if (action === "new-mission") {
      draftingMission = true;
      promptDraft = "";
      promptAssistantId = "";
      if (dialog.open) dialog.close();
      if (route() !== "missions") {
        location.hash = "missions";
        return;
      }
      render();
      document.querySelector("#quick-mission")?.focus();
      return;
    }
    if (action === "appearance")
      return openDialog(
        "Appearance",
        `<p>Choose a theme for this dashboard.</p><div class="appearance-options">${button("Dark", "dark-theme", "", theme === "dark" ? "primary" : "")}${button("Light", "light-theme", "", theme === "light" ? "primary" : "")}</div>`,
      );
    if (action === "dark-theme" || action === "light-theme") {
      theme = action === "dark-theme" ? "light" : "dark";
      setTheme();
      return;
    }
    if (action === "history") {
      const content =
        route() === "missions"
          ? `<div class="account-links"><button class="button" data-action="new-mission">New mission</button>${state.missions.map((m) => `<button class="text-button" data-action="select-mission" data-id="${h(m.id)}">${h(m.title)}</button>`).join("")}</div>`
          : `<label for="history-sender">Send as</label><select id="history-sender">${state.assistants.map((a) => `<option value="${h(a.id)}" ${a.id === state.selectedAssistantId ? "selected" : ""}>${h(a.name)}</option>`).join("")}</select><div class="account-links"><button class="button" data-action="new-message">New message</button>${
              listDemoConversations(state, state.selectedAssistantId)
                .map(
                  (c) =>
                    `<button class="text-button" data-action="open-conversation" data-id="${h(c.id)}">${h(c.name)}</button>`,
                )
                .join("") || "<p>No conversations yet.</p>"
            }</div>`;
      return openDialog(
        route() === "missions" ? "Mission history" : "Message history",
        content,
      );
    }
    if (action === "automations")
      return openDialog(
        "Automations",
        "<p>Recurring workflows are part of the hosted platform. This dashboard includes the Missions interface and local task previews.</p>",
      );
    if (action === "filter-conversations") {
      conversationFilter = conversationFilter === "all" ? "connected" : "all";
      renderNavigation();
      return;
    }
    if (action === "open-conversation") {
      const [senderId, recipientId] = id.split(":");
      state.selectedAssistantId = senderId;
      selectedRecipientId = recipientId;
      activeConversationId = id;
      messageDraft = "";
      if (dialog.open) dialog.close();
      render();
      return;
    }
    if (action === "remove-attachment") {
      messageAttachments.splice(Number(id), 1);
      render();
      return;
    }
    if (action === "profile") return profileDialog(id);
    if (action === "back-home") {
      location.hash = "home";
      return;
    }
    if (action === "account")
      return openDialog(
        "Account options",
        `<p>Example Studio · Dashboard demo</p><nav class="account-links">${[
          ["review", "Action checks & activity"],
          ["usage", "Usage"],
          ["settings", "Settings"],
          ["developer", "Developer & source"],
        ]
          .map(
            ([key, label]) =>
              `<a href="#${key}">${icon(routes[key].icon)}${label}</a>`,
          )
          .join(
            "",
          )}<a href="https://github.com/totemlayer/totem-dashboard" target="_blank" rel="noopener noreferrer">${icon("developer")}Source code ↗</a></nav>`,
      );
    if (action === "workspace-nav") return workspaceNavigationDialog();
    if (action === "navigation") {
      if (["messages", "missions"].includes(route()))
        return workspaceNavigationDialog();
      sidebarCollapsed = !sidebarCollapsed;
      renderNavigation();
      return;
    }
    if (action === "notifications") {
      location.hash = "review";
      return;
    }
    if (action === "connect-address")
      return openDialog(
        "Connect by address",
        `<p>Preview a connection with a sample team. Changes stay in this dashboard.</p><nav class="connect-tabs"><button type="button" data-action="add-assistant">Add your own agent</button><button aria-pressed="true" type="button">Connect by address</button><a href="#connections">Connect company agents</a></nav><div class="connect-company-list">${state.connections.map((c) => `<div><span>${h(c.name)}</span>${button(c.enabled ? "Disconnect" : "Connect", "toggle-connection", c.id)}</div>`).join("")}</div>`,
      );
    if (action === "network-tools")
      return openDialog(
        "Network tools",
        `<nav class="account-links"><a href="#assistants">Your agents</a><a href="#connections">Company connections</a><a href="#review">Action checks</a></nav>`,
      );
    if (action === "mission-details") {
      const mission = state.missions.find((m) => m.id === id);
      return openDialog(
        "Mission details",
        `<h3>${h(mission.title)}</h3><p>${h(mission.description)}</p><p class="section-note">${h(mission.status)} · ${mission.step}/${mission.steps.length} simulated steps complete.</p><ol class="mission-detail-steps">${mission.steps.map((step, i) => `<li>${i < mission.step ? "✓" : "○"} ${h(step)}</li>`).join("")}</ol>${mission.status !== "Completed" ? button("Simulate next step", "advance-mission", mission.id, "primary") : ""}`,
      );
    }
    if (action === "select-mission") {
      selectedMissionId = id;
      draftingMission = false;
      missionNoteDraft = "";
      if (dialog.open) dialog.close();
      render();
      return;
    }
    if (action === "new-message") {
      activeConversationId = "";
      selectedRecipientId = "";
      messageDraft = "";
      messageAttachments = [];
      if (dialog.open) dialog.close();
      render();
      document.querySelector("#message")?.focus();
      return;
    }
    if (action === "list-view" || action === "grid-view") {
      agentView = action === "list-view" ? "list" : "grid";
      render();
      return;
    }
    if (action === "reset") {
      openDialog(
        "Reset demo?",
        `<p>This clears your local messages and changes, and restores the sample data.</p><div class="dialog-actions">${button("Cancel", "close")}${button("Reset demo data", "confirm-reset", "", "primary")}</div>`,
      );
      return;
    }
    if (action === "confirm-reset") {
      state = createDemoState();
      selectedMissionId = state.missions[0].id;
      missionQuery = "";
      conversationQuery = "";
      activeConversationId = "";
      selectedRecipientId = "";
      messageDraft = "";
      messageAttachments = [];
      draftingMission = false;
      promptDraft = "";
      promptAssistantId = "";
      missionNoteDraft = "";
      query = "";
      filter = "all";
      dialog.close();
      notify("Demo data reset.");
    }
    if (action === "toggle-assistant") {
      const a = toggleAssistant(state, id);
      if (dialog.open) dialog.close();
      notify(`${a.name} ${a.status.toLowerCase()} in this demo.`);
    }
    if (action === "toggle-connection") {
      const c = toggleConnection(state, id);
      if (dialog.open) dialog.close();
      notify(
        `${c.name} ${c.enabled ? "connected" : "disconnected"} in this demo.`,
      );
    }
    if (action === "approve" || action === "decline") {
      decideApproval(state, id, action === "approve" ? "Approved" : "Declined");
      notify("Demo decision saved. No external action performed.");
    }
    if (action === "advance-mission") {
      const m = advanceMission(state, id);
      if (dialog.open) dialog.close();
      notify(
        m.status === "Completed"
          ? "Demo Mission completed."
          : "Demo Mission advanced one step.",
      );
    }
    if (action === "chat" || action === "select-chat") {
      state.selectedAssistantId = id;
      activeConversationId = "";
      selectedRecipientId = "";
      messageDraft = "";
      messageAttachments = [];
      if (dialog.open) dialog.close();
      if (route() !== "messages") {
        location.hash = "messages";
        return;
      }
      render();
      document.querySelector("#message")?.focus();
      return;
    }
    render();
    if (id) {
      const nextFocus = main.querySelector(
        `[data-action="${action}"][data-id="${CSS.escape(id)}"]`,
      );
      (nextFocus || main).focus({ preventScroll: true });
    }
  } catch (error) {
    notify(error.message);
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  try {
    if (form.id === "quick-mission-form") {
      promptDraft = String(data.get("mission") || "");
      promptAssistantId = String(data.get("assistant") || "");
      missionDialog();
      return;
    }
    if (form.id === "assistant-form") {
      addAssistant(state, data.get("name"), data.get("description"));
      dialog.close();
      notify("Demo assistant added.");
    }
    if (form.id === "mission-form") {
      const mission = createMission(
        state,
        data.get("title"),
        data.get("description"),
        data.get("assistant"),
      );
      selectedMissionId = mission.id;
      draftingMission = false;
      missionNoteDraft = "";
      promptDraft = "";
      dialog.close();
      if (route() !== "missions") {
        location.hash = "missions";
        return;
      }
      notify("Demo Mission created.");
    }
    if (form.id === "message-form") {
      sendMessage(
        state,
        state.selectedAssistantId,
        data.get("message"),
        data.get("recipient"),
      );
      selectedRecipientId = String(data.get("recipient"));
      activeConversationId = `${state.selectedAssistantId}:${selectedRecipientId}`;
      messageDraft = "";
      messageAttachments = [];
    }
    if (form.id === "mission-note-form") {
      addMissionNote(state, selectedMissionId, data.get("note"));
      missionNoteDraft = "";
    }
    render();
    if (form.id === "mission-note-form") {
      document.querySelector("#mission-note")?.focus();
      const log = document.querySelector(".mission-thread");
      log.scrollTop = log.scrollHeight;
    }
    if (form.id === "message-form") {
      document.querySelector("#message").focus();
      const log = document.querySelector(".chat-messages");
      log.scrollTop = log.scrollHeight;
    } else main.focus({ preventScroll: true });
  } catch (error) {
    const region = form.querySelector(".form-error");
    if (region) region.textContent = error.message;
    else notify(error.message);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "message") {
    messageDraft = event.target.value;
    return;
  }
  if (event.target.id === "mission-note") {
    missionNoteDraft = event.target.value;
    return;
  }
  if (event.target.id === "quick-mission") {
    promptDraft = event.target.value;
    const review = document.querySelector('[aria-label="Review new mission"]');
    if (review) review.disabled = !promptDraft.trim() || !promptAssistantId;
    return;
  }
  if (
    event.target.id === "mission-search" ||
    event.target.id === "conversation-search"
  ) {
    const id = event.target.id,
      value = event.target.value,
      start = event.target.selectionStart,
      end = event.target.selectionEnd;
    if (id === "mission-search") missionQuery = value;
    else conversationQuery = value;
    renderNavigation();
    const input = document.querySelector(`#${id}`);
    input.focus();
    input.setSelectionRange(start, end);
    return;
  }
  if (event.target.id !== "assistant-search") return;
  query = event.target.value;
  const start = event.target.selectionStart,
    end = event.target.selectionEnd;
  render();
  const search = document.querySelector("#assistant-search");
  search.focus();
  search.setSelectionRange(start, end);
});
document.addEventListener("change", (event) => {
  if (
    event.target.name === "assistant" &&
    event.target.closest("#quick-mission-form")
  ) {
    promptAssistantId = event.target.value;
    const picker = document.querySelector(".prompt-agent-picker");
    picker.open = false;
    picker.querySelector("summary").textContent = "+ 1 agent";
    document.querySelector('[aria-label="Review new mission"]').disabled =
      !promptDraft.trim();
    return;
  }
  if (event.target.id === "history-sender") {
    state.selectedAssistantId = event.target.value;
    activeConversationId = "";
    selectedRecipientId = "";
    messageDraft = "";
    dialog.close();
    render();
    return;
  }
  if (event.target.id === "message-recipient") {
    selectedRecipientId = event.target.value;
    return;
  }
  if (event.target.id === "message-attachments") {
    messageAttachments = [
      ...messageAttachments,
      ...[...event.target.files].map((f) => ({ name: f.name, size: f.size })),
    ];
    render();
    return;
  }
  if (event.target.id === "network-directory") {
    directoryScope = event.target.value;
    if (route() === "connections") {
      location.hash = "assistants";
      return;
    }
    render();
    return;
  }
  if (event.target.id === "network-environment") {
    environment = event.target.value;
    render();
    return;
  }
  if (event.target.id === "chart-period") {
    chartPeriod = event.target.value;
    render();
    return;
  }
  if (event.target.id === "chat-assistant") {
    state.selectedAssistantId = event.target.value;
    activeConversationId = "";
    selectedRecipientId = "";
    messageDraft = "";
    render();
    return;
  }
  if (event.target.id === "prompt-assistant") {
    promptAssistantId = event.target.value;
    return;
  }
  if (event.target.id !== "assistant-filter") return;
  filter = event.target.value;
  render();
  document.querySelector("#assistant-filter").focus();
});
document.querySelector("#theme")?.addEventListener("click", setTheme);
window.addEventListener("hashchange", () => {
  if (dialog.open) dialog.close();
  render();
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
});
renderTheme();
render();
