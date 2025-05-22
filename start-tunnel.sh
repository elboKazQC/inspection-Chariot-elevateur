#!/bin/bash
# Simple script to start the React app and expose it with ngrok.
# Useful for accessing the form from mobile devices like iPhone.

# Load PORT from .env if available
PORT=${PORT:-$(grep -m1 '^PORT=' inspection-form/.env 2>/dev/null | cut -d'=' -f2)}
[ -z "$PORT" ] && PORT=3000

# Path to the ngrok binary
NGROK_BIN="ngrok/ngrok"

if [ ! -x "$NGROK_BIN" ]; then
  echo "Error: ngrok binary not found at $NGROK_BIN" >&2
  echo "Download ngrok from https://ngrok.com/download and place the binary at $NGROK_BIN" >&2
  exit 1
fi

# Start the React app in the background
cd inspection-form || exit 1
PORT=$PORT HOST=0.0.0.0 npm start &
APP_PID=$!

# Wait a moment for the app to start
sleep 10

# Launch ngrok tunnel
cd ..
$NGROK_BIN http $PORT

# Stop the React app when ngrok exits
kill $APP_PID
