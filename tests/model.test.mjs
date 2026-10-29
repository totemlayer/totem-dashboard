import test from "node:test";
import assert from "node:assert/strict";
import { createDemoState } from "../src/demo-data.mjs";
import {
  escapeHtml,
  filterAssistants,
  addAssistant,
  toggleAssistant,
  decideApproval,
  createMission,
  advanceMission,
  sendMessage,
  toggleConnection,
  listDemoConversations,
  addMissionNote,
} from "../src/model.mjs";

test("a fresh demo restores fixtures without sharing mutable state", () => {
  const a = createDemoState(),
    b = createDemoState();
  addAssistant(a, "Design helper", "Sample design assistant");
  a.assistants[0].skills.push("Changed");
  assert.equal(b.assistants.length, 3);
  assert.equal(b.assistants[0].skills.includes("Changed"), false);
});

test("search combines skill, name, description, and status", () => {
  const { assistants } = createDemoState();
  assert.deepEqual(
    filterAssistants(assistants, " CODE REVIEW ", "Available").map((a) => a.id),
    ["demo-engineering"],
  );
  assert.equal(filterAssistants(assistants, "research", "Paused").length, 0);
  assert.equal(filterAssistants(assistants, "", "Paused").length, 1);
});

test("user text is escaped before insertion into HTML", () => {
  const input = '<img src=x onerror="alert(1)">\'&';
  const output = escapeHtml(input);
  assert.equal(
    output,
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&#39;&amp;",
  );
  assert.equal(escapeHtml("Example Studio"), "Example Studio");
});

test("adding an assistant validates input and makes its local conversation usable", () => {
  const state = createDemoState();
  assert.throws(() => addAssistant(state, " ", ""), /name/);
  assert.throws(() => addAssistant(state, "x".repeat(61), ""), /name/);
  const assistant = addAssistant(
    state,
    "  Design helper  ",
    "Reviews sample designs",
  );
  assert.equal(assistant.name, "Design helper");
  sendMessage(state, assistant.id, "Review this brief");
  assert.equal(
    state.messages.filter((m) => m.assistantId === assistant.id).length,
    3,
  );
  assert.match(state.messages.at(-1).text, /^Demo reply:/);
});

test("paused assistants cannot send messages or advance demo Missions", () => {
  const state = createDemoState();
  const mission = state.missions[0];
  toggleAssistant(state, mission.assistantId);
  assert.throws(
    () => sendMessage(state, mission.assistantId, "Hello"),
    /Resume/,
  );
  assert.throws(() => advanceMission(state, mission.id), /Resume/);
  assert.equal(mission.step, 1);
  toggleAssistant(state, mission.assistantId);
  advanceMission(state, mission.id);
  assert.equal(mission.step, 2);
});

test("Mission steps terminate once and record only simulated activity", () => {
  const state = createDemoState();
  assert.throws(
    () => createMission(state, "A task", "", "missing"),
    /available/,
  );
  const mission = createMission(state, "A task", "", "demo-research");
  for (let i = 0; i < 3; i++) advanceMission(state, mission.id);
  assert.equal(mission.status, "Completed");
  assert.equal(mission.step, 3);
  assert.throws(() => advanceMission(state, mission.id), /remaining/);
  assert.match(state.activity[0].detail, /no agent work/);
});

test("approvals require a pending request and a valid decision", () => {
  const state = createDemoState(),
    id = state.approvals[0].id;
  assert.throws(() => decideApproval(state, id, "Execute"), /Choose/);
  decideApproval(state, id, "Approved");
  assert.equal(state.approvals[0].status, "Approved");
  assert.throws(() => decideApproval(state, id, "Declined"), /pending/);
  assert.match(state.activity[0].detail, /no external action/);
});

test("message limits reject empty and oversized text without mutating state", () => {
  const state = createDemoState(),
    before = state.messages.length;
  for (const text of ["", "   ", "a".repeat(2001)])
    assert.throws(() => sendMessage(state, "demo-research", text), /message/);
  assert.equal(state.messages.length, before);
});

test("connection toggling changes only the selected sample connection", () => {
  const state = createDemoState();
  toggleConnection(state, "demo-field");
  assert.equal(state.connections[2].enabled, true);
  assert.equal(state.connections[0].enabled, true);
  assert.match(state.activity[0].detail, /no external system/);
});

test("conversation history appears after sending and separates senders and recipients", () => {
  const state = createDemoState();
  assert.deepEqual(listDemoConversations(state, "demo-research"), []);
  sendMessage(state, "demo-research", "First brief", "demo-northstar");
  sendMessage(state, "demo-research", "Review design", "demo-orbit");
  sendMessage(state, "demo-engineering", "Release review", "demo-northstar");
  sendMessage(state, "demo-research", "Updated brief", "demo-northstar");
  const research = listDemoConversations(state, "demo-research");
  assert.equal(research.length, 2);
  assert.equal(research[0].recipientId, "demo-northstar");
  assert.equal(
    research.find((c) => c.recipientId === "demo-northstar").preview,
    "Updated brief",
  );
  assert.equal(
    research.some((c) => c.preview === "Release review"),
    false,
  );
  assert.equal(listDemoConversations(state, "demo-engineering").length, 1);
  assert.equal(
    state.messages.filter((m) => m.recipientId === "demo-orbit").length,
    2,
  );
});

test("missing and disconnected recipients are rejected without recording a message", () => {
  const state = createDemoState(),
    before = state.messages.length;
  for (const id of ["", "missing", "demo-field"])
    assert.throws(
      () => sendMessage(state, "demo-research", "A brief", id),
      /connected agent/,
    );
  assert.equal(state.messages.length, before);
});

test("Mission notes remain local and completed Mission conversations are read-only", () => {
  const state = createDemoState(),
    mission = state.missions[0];
  addMissionNote(state, mission.id, "Review the design");
  assert.equal(mission.notes[0].text, "Review the design");
  assert.match(mission.notes[1].text, /^Demo reply:/);
  assert.throws(() => addMissionNote(state, mission.id, "  "), /note/);
  while (mission.status !== "Completed") advanceMission(state, mission.id);
  assert.throws(
    () => addMissionNote(state, mission.id, "Follow-up"),
    /read-only/,
  );
  assert.equal(mission.notes.length, 2);
});
