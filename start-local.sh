#!/bin/bash
# Start the React app and display the local network URL.

# Load PORT from .env if available
PORT=${PORT:-$(grep -m1 '^PORT=' inspection-form/.env 2>/dev/null | cut -d '=' -f2)}
[ -z "$PORT" ] && PORT=3000

# Determine local IP address (first non-loopback IPv4)
IP=$(hostname -I | awk '{print $1}')

if [ -z "$IP" ]; then
  echo "Unable to determine local IP address" >&2
else
  echo "\nOpen http://$IP:$PORT on your phone to access the app"
fi

# Start the React application
cd inspection-form || exit 1
PORT=$PORT HOST=0.0.0.0 npm start
