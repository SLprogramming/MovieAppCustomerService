# MovieAppLiveChat

A real-time live chat backend service for the Movie App application. This service handles user-to-admin chat conversations, message management, and real-time messaging via WebSockets.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
  - [Conversations](#conversations)
  - [Messages](#messages)
- [Socket Events](#socket-events)
  - [Client Events](#client-events)
  - [Server Events](#server-events)
- [Models](#models)
  - [User Model](#user-model)
  - [Conversation Model](#conversation-model)
  - [Message Model](#message-model)
- [Middleware](#middleware)
- [Configuration](#configuration)
- [License](#license)

## Overview

MovieAppLiveChat is a backend service that provides real-time chat functionality for the Movie App. It enables users to initiate conversations with customer support or admin staff, and allows admins to manage and respond to user queries in real-time.

## Features

- **Real-time Messaging**: Instant message delivery using Socket.io
- **Conversation Management**: Create, retrieve, and delete chat conversations
- **User-Admin Chat**: Support for user-to-admin communication
- **Message Status**: Track message status (sending, sent, seen, failed)
- **File Attachments**: Support for file uploads via Cloudinary
- **JWT Authentication**: Secure authentication using JSON Web Tokens
- **CORS Support**: Configurable Cross-Origin Resource Sharing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Password Hashing**: bcryptjs

## Project Structure

```
MovieAppLiveChat/
├── config/                 # Configuration files
│   ├── cloudinary.js      # Cloudinary configuration
│   ├── db.js              # Database connection
│   ├── filePath.js        # File path utilities
│   ├── multer.js          # Multer configuration for file uploads
│   └── redis.js           # Redis configuration (if used)
├── controllers/           # Controller functions
│   ├── conversation.controller.js
│   └── message.controller.js
├── middleware/            # Express middleware
│   ├── auth.js            # Authentication middleware
│   ├── catchAsyncError.js # Async error handler
│   └── error.js           # Error handling middleware
├── models/                # Mongoose models
│   ├── conversation.model.js
│   ├── message.model.js
│   └── user.model.js
├── router/                # Express routers
│   ├── conversation.js
│   └── message.js
├── socketFunctions/       # Socket.io handlers
│   └── message.js
├── utils/                 # Utility functions
│   ├── ErrorHandler.js    # Custom error handler
│   ├── jwt.js             # JWT utilities
│   └── socket.js          # Socket.io initialization
├── .env                   # Environment variables
├── app.js                 # Express app configuration
├── package.json           # Project dependencies
└── server.js              # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Installation

1. Clone the repository:
```
bash
git clone <repository-url>
cd MovieAppLiveChat
```

2. Install dependencies:
```
bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
env
PORT=8080
LOCAL_IP_ADDRESS=192.168.110.112
NODE_ENV=development
DB_URL="mongodb+srv://<username>:<password>@cluster0.<cluster>.mongodb.net/MovieApp?retryWrites=true&w=majority&appName=Cluster0"
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
ACCESS_TOKEN=your_access_token
ACCESS_TOKEN_EXPIRE=1
ACTIVATION_SECRET=your_activation_secret
REFRESH_TOKEN=your_refresh_token
REFRESH_TOKEN_EXPIRE=1
```

### Running the Server

**Development mode (with auto-restart):**
```
bash
npm run dev
```

**Production mode:**
```
bash
npm start
```

The server will start on `http://<LOCAL_IP_ADDRESS>:<PORT>` (default: `http://192.168.110.112:8080`)

## API Endpoints

### Conversations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/conversations/get-all` | Get all conversations (filtered by status) | Required |
| GET | `/api/conversations/get-by-user/:userId` | Get conversations for a specific user | Required |
| DELETE | `/api/conversations/delete-conversation/:conversationId` | Delete a conversation and its messages | Required |

**Query Parameters for GET /api/conversations/get-all:**
- `status` (optional): Filter by conversation status (`pending`, `progress`, `finish`). Default: `pending`

### Messages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/messages/get-all-messages/:conversationId` | Get all messages in a conversation | Required |
| GET | `/api/messages/get-all-messages-by-user/:userId` | Get all messages for a user | Required |

## Socket Events

### Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `create_message` | `{ sender_id, message, file, conversation_id, client_id }` | Create a new message |
| `take_conversation` | `{ conversation_id, user_id }` | Admin takes/claims a pending conversation |
| `join` | `{ userId }` | Join a user's room |
| `join_admins` | - | Join admins room |

### Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `pendingConversation:new` | `Conversation` | New pending conversation created |
| `conversation:new` | `Conversation` | New conversation (user or admin) |
| `message:saved` | `Message` | Message saved successfully |
| `message:new` | `Message` | New message received |
| `newConversation:remove` | `conversationId` | Conversation removed from pending queue |

## Models

### User Model

```
javascript
{
  name: String,
  avatar: {
    public_id: String,
    url: String
  },
  role: String,  // e.g., "user", "admin"
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Model

```
javascript
{
  status: {
    type: String,
    enum: ["pending", "progress", "finish"],
    default: "pending"
  },
  request_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  response_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null  // Admin who responds
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Conversation Status Flow:**
1. `pending` - New conversation, waiting for admin to take
2. `progress` - Admin has taken/claimed the conversation
3. `finish` - Conversation completed

### Message Model

```
javascript
{
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  client_id: {
    type: String,
    required: true
  },
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  status: {
    type: String,
    enum: ["sending", "sent", "seen", "failed"],
    default: "sending"
  },
  message: {
    type: String,
    default: ""
  },
  file: {
    publicID: String,
    url: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Middleware

### auth.js
- JWT token verification
- User authentication check

### catchAsyncError.js
- Wrapper for async controller functions
- Automatic error handling

### error.js
- Global error handling middleware
- Express error handler

## Configuration

### CORS Configuration

The server is configured to accept requests from specific origins:

```
javascript
const allowedOrigins = [
  "https://movie-app-website-mu.vercel.app",
  "http://192.168.110.112:5173",
  "http://192.168.110.112:5174"
];
```

### Socket.io Rooms

- `user_{userId}` - Individual user room
- `admins` - Room for all admin users

## License

ISC License
