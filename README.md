# SSE-Protocol

A **full-stack web application** implementing **Server-Sent Events (SSE)** for a **simple, efficient, and real-time unidirectional notification** system.

## Tech Stack

This application is built on -

- A robust **Spring Boot** server
- Minimal **ReactJS** user (client) dashboard
- Minimal **ReactJS** admin dashboard
- Dockerized **PostgreSQL** database
- **SSE (Server-Sent Events)** for real-time push messaging
- **Docker Compose** for container orchestration

---

## How to Run

Follow these steps to set up and run the application:

### 1. Clone the repository

```bash
git clone https://github.com/IshrakAdit/sse.git
```

Or, you can download the ZIP and extract it.

### 2. Move into project directory

```bash
cd sse
```

### 3. Start the full-stack application

Run the following command:

```bash
docker compose up --build -d
```

This command:

- Builds all services
- Starts them in detached mode

> **Note:** Since this is a tutorial-level repository and users are responsible for their own running instances, all required secrets to run this project are provided in the project files.

---

## How to Use

### Backend Server

Wait 2–3 minutes for the Spring Boot server to initialize.
Then, you can test the connection using:

```bash
docker compose logs -f alert-service
```

Or access the following health-check endpoints:

- `GET http://localhost:8082/user/v1/test`
- `GET http://localhost:8082/notify/v1/test`

---

### User Dashboard

- Open: [http://localhost:5173](http://localhost:5173)
- Register or log in with a **username**
- You’ll be redirected to a **real-time notification dashboard**
- You should be connected to the server via SSE

---

### Admin Dashboard

- Open: [http://localhost:5174](http://localhost:5174)
- No credentials needed
- Enter the target **username** (Only required for Unicast) and type a message
- Click **Broadcast** to notify all users, or **Unicast** to notify only the target user

---

## How It Works

### Components Overview

| Component                    | Role                                                |
| ---------------------------- | --------------------------------------------------- |
| **Spring Boot Backend**      | Manages alerts and broadcasts/unicasts them via SSE |
| **React Frontend (User)**    | Subscribes to SSE endpoints and listens for events  |
| **React Admin Panel**        | Sends broadcast/unicast alerts via REST API         |
| **SSE (Server-Sent Events)** | Streams events from backend to browser              |
| **PostgreSQL Database**      | Stores registered users and alerts history          |

---

### End-to-End Flow

1. **User Dashboard**:

   - Connects to:

     - `GET /notify/v1/subscribe` for broadcast
     - `GET /notify/v1/subscribe/{username}` for unicast

   - Displays messages as they are pushed from the backend

2. **Admin Dashboard**:

   - Sends a POST request with username and message
   - Backend saves and publishes it via SSE

3. **Spring Boot Backend**:

   - Handles both broadcast and unicast connections
   - Maintains emitter maps for all users
   - Streams new messages directly to connected clients

---

## Why SSE?

### SSE vs WebSockets

| Feature            | SSE (Server-Sent Events)             | WebSocket                       |
| ------------------ | ------------------------------------ | ------------------------------- |
| Direction          | One-way (server → client)            | Two-way (client ↔ server)       |
| Setup              | Simple HTTP request                  | Needs protocol upgrade          |
| Browser Support    | Built-in `EventSource` support       | Good, but needs extra setup     |
| Best For           | Notifications, updates, logs         | Chat, games, real-time apps     |
| Overhead           | Low — pure HTTP                      | Higher — handshake, ping/pong   |
| Scalability        | Easy to scale with HTTP servers/CDNs | Harder — keeps open connections |
| Reconnect Handling | Built-in auto-reconnect              | Needs manual reconnect logic    |

---

## Future Improvements

- **Client reconnection** and **heartbeat monitoring**
- **Persistent alert history** with read/unread states
- **Mobile app support** with background push handling

---

### For any queries, feel free to email me at [ishrak.adit07@gmail.com](mailto:ishrak.adit07@gmail.com) or contact me via [ishrakadit.netlify.app](https://ishrakadit.netlify.app).
