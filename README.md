# Forklift Inspection App

This project provides a tablet-friendly web application to fill out forklift inspection forms and save the result to OneDrive.

## Features
- React + TypeScript frontend using Material UI
- Digital signature capture
- Saves form data as JSON in your OneDrive using Microsoft Graph

## Setup
1. Run `setup.sh` to install dependencies.
2. Replace `YOUR_CLIENT_ID` in `inspection-form/src/App.tsx` and `inspection-form/src/services/OneDriveService.ts` with your Azure app Client ID.
3. Start the app:
   ```bash
   cd inspection-form
   npm start
   ```

The application will open in your browser at `http://localhost:3000`.

## Usage
Fill in the fields, sign with your finger or a stylus, and click **Enregistrer**. A JSON file is uploaded to your OneDrive under the root folder.
