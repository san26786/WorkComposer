# WorkComposer Frontend

The web dashboard for **WorkComposer**, a workforce productivity and time-tracking platform. It provides the user-facing interface for organizations, managers, and employees to manage workspaces, track time, view reports, configure tracking, manage users and teams, and connect third-party services.

## Tech Stack

- **Next.js 16** — App Router
- **React**
- **TypeScript / JavaScript**
- **Tailwind CSS**
- **Axios** — API communication
- **Lucide React / React Icons** — UI icons
- **Vercel** — frontend deployment

The frontend works together with the WorkComposer Backend API and the WorkComposer Desktop tracking application.

## Main Features

### Dashboard

- Organization dashboard
- Time-tracking overview
- Attendance
- Activity analytics
- Productivity reports
- Application usage
- User-level analytics
- Work sessions and daily summaries

### Time Tracking

- Start/stop tracking from the desktop client
- Work and break session visualization
- Attendance history
- Activity timelines
- Application usage analytics
- Productivity classification
- Tracking status for organization users
- User analytics with role-based visibility
- Tracking bar integration with the desktop application

### User & Organization Management

- User management
- Teams and team members
- Managers and managed users
- Roles and custom permissions
- Organization settings
- User invitations
- User profile management
- Avatar/profile image management

### Reports

- Attendance reports
- Productivity reports
- Time-tracking reports
- Application usage reports
- User and team filtering
- Date-range filtering
- Role-based report visibility

### Settings

- Profile settings
- Organization settings
- Time-tracking settings
- App tracking configuration
- Security settings
- API access
- Integration settings
- Timezone configuration

### Integrations

The dashboard provides interfaces for connecting and managing supported third-party services, including project-management and communication integrations.

## Role-Based Access

WorkComposer uses organization-level roles and permissions throughout the dashboard.

Report visibility can be scoped to:

- `none` — no report access
- `own` — user's own data
- `managed` — the manager's own data plus users they manage
- `all` — organization-wide data

The frontend respects backend authorization and hides or disables UI features when the current user does not have the required access.

> The backend remains the source of truth for authorization. Frontend visibility must not be treated as a security boundary.

## Timezone Handling

Timezone consistency is a core part of the WorkComposer dashboard.

User/report timezone settings are used when displaying and requesting date-sensitive tracking information. Date ranges should follow the user's configured timezone rather than relying on the browser's timezone or ad-hoc UTC conversions.

## Desktop Tracking Integration

The dashboard integrates with the WorkComposer Desktop application through the Electron preload API.

The desktop application provides workstation-level tracking such as:

- Session tracking
- Application usage
- Activity tracking
- Screenshots
- Location updates
- Idle detection
- Internet/connectivity monitoring
- Tracking bar controls

The tracking bar is rendered through the frontend and communicates with the Electron desktop process through IPC.

The tracking-bar controls include:

- Stop tracking
- View the active timer
- Open/focus the main WorkComposer Desktop window

Browser-level time tracking is implemented in the desktop automation layer using **C#/.NET and Windows UI Automation**, with current support focused on **Chromium-based browsers**.

## Project Structure

```text
WorkComposer-Frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── authenticate/    # Authentication pages
│   │   ├── dashboard/       # Main application dashboard
│   │   └── tracking-bar/    # Electron tracking bar UI
│   ├── components/          # Shared UI components
│   ├── context/             # React contexts and application state
│   ├── hooks/               # Reusable React hooks
│   ├── api/                 # API client/configuration
│   ├── types/               # TypeScript declarations and shared types
│   └── ...
├── public/                  # Static assets
├── package.json
└── README.md
```

## Requirements

- Node.js 18+ recommended
- npm
- WorkComposer Backend running locally or an accessible deployed API
- For desktop tracking-bar integration: WorkComposer Desktop with its Electron preload API

## Installation

Clone the repository:

```bash
git clone https://github.com/Rahul-git-web/WorkComposer-Frontend.git
cd WorkComposer-Frontend
npm install
```

Configure the frontend API environment according to the project's current API configuration.

Do not commit secrets, production credentials, access tokens, or private environment files.

## Running Locally

Start the Next.js development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The frontend expects the WorkComposer Backend API to be available for authentication, tracking, reporting, and other server-backed features.

## Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The application can be deployed to Vercel or another platform capable of running a Next.js application.

## Authentication

The dashboard communicates with the WorkComposer authentication API for:

- Registration
- Login
- Email verification
- Refresh-token handling
- Logout
- Current-user/session information

Protected API requests use authenticated access tokens. Client-side code must guard browser-only APIs such as `localStorage` because Next.js also renders code on the server.

## Desktop / Electron API

The tracking-bar page uses the Electron preload bridge exposed as:

```text
window.electronAPI
```

The Electron bridge is used for desktop-specific actions such as receiving tracking updates, stopping tracking, and opening the main desktop window.

Type declarations for the bridge are maintained in the frontend TypeScript definitions so that the tracking-bar UI remains type-safe.

## Deployment

The frontend is designed to work with the deployed WorkComposer Backend and Desktop applications.

Typical production architecture:

```text
                         ┌─────────────────────┐
                         │ WorkComposer         │
                         │ Frontend             │
                         │ Next.js / Vercel     │
                         └──────────┬──────────┘
                                    │
                              REST / API
                                    │
                         ┌──────────▼──────────┐
                         │ WorkComposer         │
                         │ Backend              │
                         │ Node.js / Express    │
                         └──────────┬──────────┘
                                    │
                              MongoDB / Services

      ┌─────────────────────────────┐
      │ WorkComposer Desktop         │
      │ Electron + C#/.NET tracking  │
      └──────────────┬──────────────┘
                     │
                     └──────► WorkComposer Backend
```

## Development Notes

- Keep authorization enforced by the backend even when UI elements are hidden on the frontend.
- Use the centralized timezone utilities/behavior for date-sensitive features.
- Avoid introducing browser-local timezone assumptions into reports or attendance views.
- Keep Electron-only functionality behind the `window.electronAPI` bridge.
- Avoid direct Electron imports inside Next.js renderer components.
- When changing the Electron main process or preload bridge, update the corresponding frontend TypeScript declarations.

## Related Projects

- **WorkComposer Backend** — API, authentication, database, permissions, tracking, reporting, integrations, and business logic
- **WorkComposer Desktop** — Electron desktop client, workstation tracking, browser automation, screenshots, activity, app usage, and tracking bar

## License

ISC
