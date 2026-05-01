# Sneaker Drop - Frontend

Real-time sneaker drop marketplace client.

**Repo**: [https://github.com/RownokNishat/sneak-drop-frontend](https://github.com/RownokNishat/sneak-drop-frontend)

## How to Run

1. `npm install`
2. Create a `.env` file:
   ```env
   VITE_API_URL="http://localhost:3001"
   VITE_WS_URL="http://localhost:3001"
   ```
3. `npm run dev`

## Architecture & Design

### 60-Second Expiration Logic

The frontend manages a local countdown timer for user feedback, but the source of truth is the backend's **Stock Recovery Service**. When a reservation is created, the backend starts a 60-second window. If the purchase isn't completed, a background worker restore the stock and pushes a `stockUpdate` event via WebSockets, which the frontend reflects instantly.

### Concurrency Handling

Overselling is prevented at the database level using atomic conditional updates. On the frontend, we handle concurrency by:

1. Providing immediate visual feedback (loading states).
2. Listening for real-time stock updates to disable "Reserve" buttons as soon as stock hits zero.
3. Catching and displaying "OUT_OF_STOCK" errors via toast notifications if a user tries to reserve an item that was claimed by another user in the same millisecond.
