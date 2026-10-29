# Totem Dashboard

The open-source dashboard demo for Totem. Explore assistants, company connections, Missions, messages, and action reviews with sample data and local interactions.

**[Try the live demo](https://totemlayer.github.io/totem-dashboard/)** — opens in your browser, with no account or installation required.

**This repository contains the dashboard interface and its demo simulations. The Totem backend, agent runtime, production services, and customer data are not included.** The full Totem platform remains proprietary.

![Totem dashboard preview](docs/dashboard.png)

<details>
<summary>Run locally (developers)</summary>

Install [Node.js](https://nodejs.org/) 22 or newer, then:

```sh
git clone https://github.com/totemlayer/totem-dashboard.git
cd totem-dashboard
npm start
```

Open **http://localhost:4173**. There are no dependencies to install, API keys to supply, or accounts to create. Use `npm run dev` to restart the preview server when its files change; refresh the browser after edits.

If the default port is occupied, set the `PORT` environment variable to another port before running `npm start`. The preview server runs on your computer.

</details>

## Explore

- **Home:** mission prompt, message chart, usage heatmap, and an agent table with list and grid views.
- **Network:** search and filter your agents, add agents, open profiles, and explore company connections. The existing `#assistants` and `#connections` links open this area.
- **Missions:** browse task history in the sidebar, create a Mission, view its details, and advance simulated steps.
- **Messages:** send local messages and receive scripted demo replies. No model runs.
- **Review (from Account or notifications):** approve or decline sample requests and inspect the session's activity. Decisions do not authorize or execute real actions.
- **Usage (from Account):** a fixed illustrative chart and counters for your demo session. No real billing or metering.
- **Settings (from Account):** switch themes or reset demo data.
- **Developer (from Account or the Dashboard demo label):** see the public repository's scope.

Names, organizations, messages, usage figures, and initial activity use sample data. Changes live in page memory and disappear on reload. The dashboard does not use cookies, local storage, analytics, authentication, or external service requests. Do not enter real credentials or sensitive information into a demo.

## Scope

| Included under MIT                       | Outside this repository                                |
| ---------------------------------------- | ------------------------------------------------------ |
| Dashboard layout, navigation, and styles | Agent execution and automatic receiving                |
| Sample demo fixtures                     | Production messaging and orchestration                 |
| Local interaction logic                  | Authentication, authorization, and credential services |
| Preview server and static export         | Billing, deployment infrastructure, and customer data  |
| Tests and contribution instructions      | Proprietary backend source and private Git history     |

The interface follows the current hosted Totem dashboard: a dark workspace rail, four main sections, the Home mission prompt and activity charts, a Network agent directory, and dedicated Messages and Missions studios. It is a standalone implementation built for public exploration, rather than a drop-in frontend for the hosted service. The demo model is not an SDK, service contract, security implementation, or evidence of real agent execution.

## Develop

```sh
npm test
npm run build
```

`npm test` runs dependency-free tests for demo state transitions, safe text rendering, and the preview server's public file boundary. `npm run build` copies only six explicit public assets into `dist/`. It does not compile or package a backend. The resulting files work on a static web server, including under a subdirectory, using hash navigation.

```text
index.html          Accessible dashboard shell and demo disclosure
styles.css          Responsive layout and light/dark themes
mark.svg            Totem brand mark
src/app.mjs         Views and browser interactions
src/demo-data.mjs   Sample initial data
src/model.mjs       In-memory state changes and text escaping
server.mjs          Local preview with an explicit public-file allowlist
scripts/build.mjs   Static export
tests/              Node.js tests
```

The content security policy blocks fetch, WebSocket, and similar page connections. JavaScript and styles load from the same origin. When serving the static export, configure your host to add `Content-Security-Policy: frame-ancestors 'none'` if you also need to prevent embedding; that directive requires an HTTP header. The bundled local preview supplies this header.

## Live demo deployment

The demo is hosted on [GitHub Pages](https://totemlayer.github.io/totem-dashboard/). The [deployment workflow](.github/workflows/pages.yml) tests the dashboard, exports the six public assets, and publishes only `dist/` when changes reach `main`. The workflow can also be run manually from the repository's Actions tab. The local server, documentation, tests, and repository files are not part of the hosted artifact.

The workflow deploys only from `totemlayer/totem-dashboard`. To publish your own fork, update that repository guard and the demo links, then enable GitHub Pages with GitHub Actions as its publishing source.

To build a real application from the interface, replace the fixtures and local model with your own backend. Define and enforce identity, access controls, credential handling, and execution permissions on the server. The browser demo does not supply these controls.

## License

The source in this repository is licensed under [MIT](LICENSE). The Totem name and logo identify the project; the source license does not grant trademark rights or imply endorsement of derivative products.
