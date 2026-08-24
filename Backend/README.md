# Community Connect API

Node.js, Express, MongoDB, and Mongoose backend for the Community Connect frontend.

## Start locally

1. Copy `.env.example` to `.env` and replace `JWT_SECRET` with a long random value.
2. Start MongoDB locally, or set `MONGODB_URI` to an accessible MongoDB deployment.
3. Run `npm install` and then `npm run dev` from this directory.
4. Confirm the service at `GET http://localhost:5000/api/health`.

## Demo content and administrator

Run `npm run seed` to create the initial administrator and sample posts, events, announcements, and discussion comments. The command is safe to run more than once: it does not duplicate the sample content.

The local-development defaults are `admin@communityconnect.local` and `CommunityConnect!2026`. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before running the command to use different credentials. Change the password before deploying the application.

## Authentication

Register and login responses contain a JWT. Send it on protected endpoints as:

```http
Authorization: Bearer <token>
```

`POST /api/auth/logout` is a stateless logout: the frontend removes the token. An administrator role is never accepted from request data; assign `role: "admin"` directly through a trusted database administration process.

## Endpoints

| Area | Endpoint | Access |
| --- | --- | --- |
| Health | `GET /api/health` | Public |
| Auth | `POST /api/auth/register`, `POST /api/auth/login` | Public |
| Auth | `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/profile` | Authenticated |
| Users | `GET /api/users/:userId`; `GET /api/users`; `DELETE /api/users/:userId` | Public profile; listing and account removal are admin-only |
| Posts | `GET, POST /api/posts`; `GET, PATCH, DELETE /api/posts/:postId`; `POST /api/posts/:postId/like` | Read public; writes authenticated and owner/admin protected |
| Comments | `GET, POST /api/comments` (`GET` requires `?post=<id>`); `GET /api/comments/admin`; `PATCH, DELETE /api/comments/:commentId`; `PATCH /api/comments/:commentId/visibility` | Read public; creation authenticated; full listing/editing admin-only; post owners/admins can hide or delete comments |
| Reports | `GET, POST /api/reports`; `GET /api/reports/:reportId`; `PATCH /api/reports/:reportId/status` | Authenticated; status change is admin-only |
| Events | `GET, POST /api/events`; `GET, PATCH, DELETE /api/events/:eventId`; `POST /api/events/:eventId/join` | Read public; event management admin-only; join authenticated |
| Announcements | `GET, POST /api/announcements`; `GET, PATCH, DELETE /api/announcements/:announcementId` | Read public; management admin-only |
| Notifications | `GET /api/notifications`; `PATCH /api/notifications/read-all`; `PATCH /api/notifications/:notificationId/read` | Recipient only |

Create and update requests for posts, events, announcements, and profiles can use `multipart/form-data` with an `image` field (or `profileImage` for a profile). Files are restricted to JPEG, PNG, WebP, or GIF and 5 MB.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development` or `production` |
| `PORT` | HTTP server port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing authentication tokens |
| `JWT_EXPIRES_IN` | JWT lifespan, such as `7d` |
| `CLIENT_ORIGIN` | Comma-separated permitted frontend origins |
