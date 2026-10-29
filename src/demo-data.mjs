// All names, messages, counts, and activity below are sample fixtures.
export function createDemoState() {
  return {
    assistants: [
      { id: 'demo-research', name: 'Research assistant', initials: 'RA', description: 'Finds references and turns research into a useful brief.', skills: ['Research', 'Writing'], status: 'Available', host: 'Desktop', color: 'sage' },
      { id: 'demo-engineering', name: 'Engineering assistant', initials: 'EA', description: 'Reviews proposed changes and helps plan the next release.', skills: ['Code review', 'Planning'], status: 'Available', host: 'Desktop', color: 'blue' },
      { id: 'demo-operations', name: 'Operations assistant', initials: 'OA', description: 'Keeps track of handoffs, decisions, and project updates.', skills: ['Operations', 'Coordination'], status: 'Paused', host: 'Desktop', color: 'sand' },
    ],
    connections: [
      { id: 'demo-northstar', name: 'Northstar Lab', initials: 'NL', description: 'Research and prototyping', enabled: true },
      { id: 'demo-orbit', name: 'Orbit Workshop', initials: 'OW', description: 'Design and development', enabled: true },
      { id: 'demo-field', name: 'Field Notes', initials: 'FN', description: 'Editorial and analysis', enabled: false },
    ],
    missions: [
      { id: 'demo-release', title: 'Prepare a release brief', description: 'Collect the proposed changes, review them, and prepare a short brief.', assistantId: 'demo-engineering', status: 'In progress', step: 1, steps: ['Collect changes', 'Review proposal', 'Prepare brief'] },
      { id: 'demo-research-brief', title: 'Research the next project', description: 'Gather references and organize the findings for the team.', assistantId: 'demo-research', status: 'Completed', step: 3, steps: ['Gather references', 'Organize findings', 'Write summary'] },
    ],
    approvals: [
      { id: 'demo-review-brief', title: 'Share a project brief', assistant: 'Research assistant', detail: 'Share the sample research summary with Northstar Lab.', scope: 'One demo message', status: 'Pending' },
      { id: 'demo-review-changes', title: 'Request a change review', assistant: 'Engineering assistant', detail: 'Ask Orbit Workshop to review the sample release proposal.', scope: 'One demo review request', status: 'Pending' },
    ],
    messages: [
      { id: 'demo-message-1', assistantId: 'demo-research', role: 'assistant', text: 'This is a simulated conversation. Ask me about a research brief to explore the dashboard.' },
      { id: 'demo-message-2', assistantId: 'demo-engineering', role: 'assistant', text: 'The demo release brief is ready for its next review step. No repository or runtime is connected.' },
      { id: 'demo-message-3', assistantId: 'demo-operations', role: 'assistant', text: 'I am paused in this demo. Resume me from Assistants to try the local conversation.' },
    ],
    activity: [
      { id: 'demo-event-1', title: 'Release brief reached review', detail: 'Engineering assistant · Simulated Mission', time: 'Sample event' },
      { id: 'demo-event-2', title: 'Project research completed', detail: 'Research assistant · Simulated Mission', time: 'Sample event' },
      { id: 'demo-event-3', title: 'Northstar Lab connected', detail: 'Example Studio · Sample connection', time: 'Sample event' },
    ],
    selectedAssistantId: 'demo-research',
  };
}
