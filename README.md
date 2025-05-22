# Forklift Inspection App

This project provides a tablet-friendly web application to fill out forklift inspection forms and save the result to OneDrive.

## Features
- React + TypeScript frontend using Material UI
- Digital signature capture
- Saves form data as JSON in your OneDrive using Microsoft Graph

## Setup
All `npm` commands must be run from the `inspection-form/` directory. The root
`package.json` has been removed.

1. Run `setup.sh` (or `setup.ps1` on Windows) to install dependencies in `inspection-form/`.
2. Replace `YOUR_CLIENT_ID` in `inspection-form/src/App.tsx` and
   `inspection-form/src/services/OneDriveService.ts` with your Azure app Client
   ID.
3. (Optional) [Download ngrok](https://ngrok.com/download) and place the binary
   in the `ngrok/` folder so that `ngrok/ngrok` exists.
4. Build the frontend and start the local server:
   ```bash
   cd inspection-form
   npm run build
   node server.js
   ```

   The application will be available on `http://localhost:3000`. You can open
   the same URL from another device on your network by replacing `localhost` with
   your computer's IP address.

### Running tests
After installing dependencies with `setup.sh` or `setup.ps1`, you can execute the unit tests:
```bash
cd inspection-form
npm test
```

This runs `react-scripts` in non-interactive mode and reports the results in the console.

When using `start-local.sh` for development the app opens at
`http://localhost:3001`.

### Access from mobile devices

If your PC and phone are on the same Wi‑Fi network you can simply browse to the computer’s local address. Determine the IP with `ipconfig` (Windows) or `hostname -I` (Linux/Mac) and open `http://YOUR_IP:3001` on the phone.

For convenience, a helper script prints the URL and starts the server:

```bash
./start-local.sh
```

Alternatively, you can expose the server on the internet using `ngrok`:

```bash
./start-tunnel.sh
```

The ngrok URL will work from anywhere but changes each time with the free plan. Using the local network avoids this issue and costs nothing. You may assign a static IP to your computer for a truly constant address.

## Usage
Fill in the fields, sign with your finger or a stylus, and click **Enregistrer**. A JSON file is uploaded to the `Inspections` folder in your OneDrive.
