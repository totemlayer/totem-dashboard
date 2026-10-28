export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function filterAssistants(assistants, query = '', status = 'all') {
  const normalized = query.trim().toLowerCase();
  return assistants.filter(a => (status === 'all' || a.status === status) &&
    `${a.name} ${a.description} ${a.skills.join(' ')}`.toLowerCase().includes(normalized));
}

function record(state, title, detail) {
  state.activity.unshift({ id: crypto.randomUUID(), title, detail, time: 'This session' });
}

export function addAssistant(state, name, description) {
  name = String(name).trim();
  description = String(description).trim();
  if (!name || name.length > 60 || description.length > 240) throw new Error('Use a name of 1–60 characters and a description up to 240 characters.');
  const assistant = { id: crypto.randomUUID(), name, description: description || 'A new assistant in this demo workspace.', initials: name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase(), skills: ['General'], status: 'Available', host: 'Demo', color: 'sage' };
  state.assistants.push(assistant);
  state.messages.push({ id: crypto.randomUUID(), assistantId: assistant.id, role: 'assistant', text: 'Your demo assistant is ready. Replies are scripted locally; no AI model is connected.' });
  record(state, `${name} added`, 'Local demo assistant');
  return assistant;
}

export function toggleAssistant(state, id) {
  const assistant = state.assistants.find(a => a.id === id);
  if (!assistant) throw new Error('Assistant not found.');
  assistant.status = assistant.status === 'Available' ? 'Paused' : 'Available';
  record(state, `${assistant.name} ${assistant.status.toLowerCase()}`, 'Local demo change');
  return assistant;
}

export function decideApproval(state, id, decision) {
  if (!['Approved', 'Declined'].includes(decision)) throw new Error('Choose Approved or Declined.');
  const approval = state.approvals.find(a => a.id === id);
  if (!approval || approval.status !== 'Pending') throw new Error('This request is no longer pending.');
  approval.status = decision;
  record(state, `${approval.title}: ${decision.toLowerCase()}`, 'Simulated decision; no external action performed');
}

export function createMission(state, title, description, assistantId) {
  title = String(title).trim();
  description = String(description).trim();
  if (!title || title.length > 100 || description.length > 400) throw new Error('Use a title of 1–100 characters and a description up to 400 characters.');
  if (!state.assistants.some(a => a.id === assistantId && a.status === 'Available')) throw new Error('Choose an available demo assistant.');
  const mission = { id: crypto.randomUUID(), title, description: description || 'A simulated task in this workspace.', assistantId, status: 'In progress', step: 0, steps: ['Plan task', 'Simulate work', 'Prepare summary'] };
  state.missions.unshift(mission);
  record(state, `Mission created: ${title}`, 'Local simulation');
  return mission;
}

export function advanceMission(state, id) {
  const mission = state.missions.find(m => m.id === id);
  if (!mission || mission.status === 'Completed') throw new Error('No remaining demo steps.');
  const assistant = state.assistants.find(a => a.id === mission.assistantId);
  if (!assistant || assistant.status !== 'Available') throw new Error('Resume the assigned assistant before advancing this demo.');
  mission.step++;
  if (mission.step >= mission.steps.length) mission.status = 'Completed';
  record(state, `${mission.title}: ${mission.status === 'Completed' ? 'completed' : mission.steps[mission.step - 1]}`, 'Simulated step; no agent work performed');
  return mission;
}

export function sendMessage(state, assistantId, input) {
  const assistant = state.assistants.find(a => a.id === assistantId);
  if (!assistant || assistant.status !== 'Available') throw new Error('Resume this assistant in Assistants before sending a demo message.');
  const text = String(input).trim();
  if (!text || text.length > 2000) throw new Error('Write a message of 1–2,000 characters.');
  state.messages.push({ id: crypto.randomUUID(), assistantId, role: 'user', text });
  const response = /research|brief|summary/i.test(text)
    ? 'Demo reply: I would gather references, organize the findings, and prepare a brief for your review. Create a demo Mission to walk through those steps.'
    : /code|release|review/i.test(text)
      ? 'Demo reply: I would review the proposed changes and flag questions before the next release. Visit Review to try a local approval.'
      : 'Demo reply: Your message is visible in this local conversation. Try asking about research or a release review. These replies are scripted; no AI or network is connected.';
  state.messages.push({ id: crypto.randomUUID(), assistantId, role: 'assistant', text: response });
  record(state, `Demo message to ${assistant.name}`, 'Scripted reply added locally');
}

export function toggleConnection(state, id) {
  const connection = state.connections.find(c => c.id === id);
  if (!connection) throw new Error('Connection not found.');
  connection.enabled = !connection.enabled;
  record(state, `${connection.name} ${connection.enabled ? 'connected' : 'disconnected'}`, 'Fictional connection; no external system contacted');
  return connection;
}
