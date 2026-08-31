# WorkComposer

WorkComposer is a unified workforce productivity and work-management platform that brings the **web dashboard, backend API, desktop application, and browser/location utility** together in a single repository.

The project is organized as a monorepo so the major WorkComposer applications can be developed, versioned, and deployed from one place while remaining separated by responsibility.

## Repository Structure

```text
WorkComposer/
├── BrowserUrlReader/          # Browser/URL reading utility
├── Workcomposer Dashboard/    # Next.js web dashboard
├── WorkComposer Backend/      # Node.js backend/API
└── WorkComposer Desktop/      # Electron desktop application
```

### 1. Workcomposer Dashboard

The web application provides the primary WorkComposer user interface, including:

- Authentication and account access
- Organization and profile management
- User and team management
- Dashboard and productivity views
- Time tracking
- Attendance
- Manual time management
- Screenshots and activity views
- Location/live-map tracking
- Task and project management
- Reports
- Notifications and inbox functionality
- Billing and subscription management
- API access
- Integrations
- Security and audit settings
- Timezone-aware application behavior
- Desktop application integration

The dashboard is built with **Next.js, React, TypeScript/JavaScript, and Tailwind CSS**.

### 2. WorkComposer Backend

The backend provides the server-side API and application services used by the dashboard and desktop application.

The backend currently contains functionality for areas such as:

- Authentication and users
- Organizations
- Teams and roles
- Projects and tasks
- Time tracking and timers
- Attendance
- Manual time requests
- Screenshots
- Sessions
- Comments
- Notifications
- Tracking settings
- Reports and reporting services
- Integrations
- Socket-based real-time communication
- Billing-related services
- Scheduled/background processing

The backend is built with **Node.js and Express**, with application models, controllers, routes, services, utilities, schedulers, and configuration separated into dedicated modules.

### 3. WorkComposer Desktop

The desktop application provides the workstation-side experience for employees and users who need continuous work tracking capabilities.

It includes Electron functionality for areas such as:

- Desktop work tracking
- Timer interaction
- Cloud synchronization
- Desktop dashboard UI
- System/browser integration
- Location-related functionality
- Communication with the WorkComposer backend
- Secure renderer/main-process communication through Electron preload APIs

The desktop application is built with **Electron** and integrates with the WorkComposer web application and backend.

### 4. BrowserUrlReader

`BrowserUrlReader` is a supporting utility used to obtain browser-related information for WorkComposer desktop functionality.

It is maintained inside this monorepo so the desktop application's supporting native functionality remains versioned alongside the rest of WorkComposer.

## Architecture

At a high level, WorkComposer follows this architecture:

```text
                         ┌─────────────────────────┐
                         │     WorkComposer Web     │
                         │        Dashboard        │
                         └────────────┬────────────┘
                                      │
                                      │ HTTP / API
                                      │ WebSocket
                                      ▼
                         ┌─────────────────────────┐
                         │   WorkComposer Backend  │
                         │   API + Services + DB   │
                         └────────────┬────────────┘
                                      ▲
                                      │
                           HTTP / WebSocket
                                      │
                                      │
                         ┌────────────┴────────────┐
                         │   WorkComposer Desktop  │
                         │        Electron         │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │    BrowserUrlReader     │
                         │ Supporting native tool  │
                         └─────────────────────────┘
```

The exact deployment topology, database configuration, third-party services, and environment variables are configured separately for each application and should not be committed to source control.

## Technology Overview

| Component | Primary Technology |
|---|---|
| Web Dashboard | Next.js / React / TypeScript / JavaScript |
| Styling | Tailwind CSS |
| Backend | Node.js / Express |
| Real-time Communication | WebSockets / Socket.IO-related infrastructure |
| Desktop | Electron |
| Browser Utility | Native supporting utility |
| API Communication | HTTP/REST |
| Repository | Git / GitHub |

## Key Product Areas

### Time Tracking

WorkComposer provides work-time tracking functionality across the web and desktop experiences, including timers, manual time, attendance, tracking configuration, shifts, breaks, and related reporting.

### Productivity Tracking

The platform supports productivity-oriented tracking features such as activity information, screenshots, application/browser-related data, and configurable tracking behavior.

### Task & Project Management

Users and organizations can manage projects, tasks, assignments, and related work-management workflows from the dashboard.

### Reports

Reporting functionality brings tracked work information together for analysis and organizational reporting. Reports can be viewed and exported through the application where configured.

### Notifications

The notification system provides application-level notifications and real-time updates across relevant dashboard and backend workflows.

### Integrations

The dashboard includes integration areas for external services such as project-management, communication, HR, payroll, and storage platforms. Individual integrations are implemented within the integrations section of the dashboard and corresponding backend services.

### Organization & Security

WorkComposer includes organization configuration, user/profile management, roles and privileges, API access, audit logging, application-update settings, and two-factor/security-related functionality.

## Project Development

Each application remains logically independent inside the monorepo:

```text
Workcomposer Dashboard/
WorkComposer Backend/
WorkComposer Desktop/
BrowserUrlReader/
```

When working on one application, run commands from that application's directory and use its own `package.json` or project configuration.

For example:

```powershell
cd "Workcomposer Dashboard"
```

```powershell
cd "WorkComposer Backend"
```

```powershell
cd "WorkComposer Desktop"
```

## Environment Configuration

Environment-specific configuration should remain outside Git.

Typical sensitive configuration includes:

- Database connection strings
- JWT/authentication secrets
- API keys
- OAuth credentials
- Stripe credentials
- Integration credentials
- Email credentials
- WebSocket/API URLs
- Cloud-storage credentials
- Desktop signing/release credentials

Use each application's existing environment/configuration conventions. **Never commit real secrets or production credentials.**

## Installation

Because this is a monorepo containing multiple applications, dependencies are installed per application.

### Dashboard

```powershell
cd "Workcomposer Dashboard"
npm install
```

### Backend

```powershell
cd "WorkComposer Backend"
npm install
```

### Desktop

```powershell
cd "WorkComposer Desktop"
npm install
```

`BrowserUrlReader` is a native supporting project and should be built according to the project configuration present in its directory.

## Running the Applications

The exact scripts available for each application are defined by its local project configuration.

A typical development workflow is:

1. Start the backend API.
2. Start the Next.js dashboard.
3. Start the Electron desktop application when desktop functionality is required.
4. Build/run `BrowserUrlReader` when the desktop development workflow requires it.

Check the individual application's `package.json`, project files, and configuration before running production commands.

## Repository Safety

This repository intentionally excludes common generated and sensitive files, including:

- `node_modules`
- Next.js build output
- Environment files containing secrets
- Desktop build/release output
- Native build output
- Temporary recovery artifacts
- Old individual Git repository metadata

Generated files should generally be rebuilt locally rather than committed unless they are explicitly required as application runtime assets.

## Git Workflow

This repository is the single Git repository for the combined WorkComposer codebase.

```text
E:\WorkComposer
        │
        ├── BrowserUrlReader
        ├── Workcomposer Dashboard
        ├── WorkComposer Backend
        └── WorkComposer Desktop
```

The repository uses `main` as the primary branch.

A normal workflow is:

```powershell
git status
git add -A
git diff --cached --stat
git commit -m "Describe the change"
git push origin main
```

Always review `git status` and the staged diff before committing, especially when changes span multiple applications.

## Development Principles

When making changes across WorkComposer:

- Keep frontend, backend, desktop, and utility responsibilities separated.
- Reuse existing application services and utilities where appropriate.
- Avoid introducing duplicated timezone/date logic when shared timezone behavior already exists.
- Keep secrets and environment-specific values out of source control.
- Avoid committing generated dependencies or build output.
- Test affected applications after cross-layer changes.
- When changing API contracts, update both consumers and server-side implementations as necessary.
- Be careful with Electron main/preload boundaries and renderer security.
- Preserve existing functionality when making UI or architectural improvements.

## Project Status

This repository represents the combined WorkComposer codebase and is intended to provide a single source of truth for the platform's major applications.

The four projects are maintained together because the dashboard, backend, desktop client, and browser utility form interconnected parts of the same WorkComposer product.

## License

No license is currently specified in this repository. Unless a license is added, the repository should be treated as **all rights reserved** and the code should not be assumed to be freely reusable.

## Repository

GitHub: https://github.com/Rahul-git-web/WorkComposer
