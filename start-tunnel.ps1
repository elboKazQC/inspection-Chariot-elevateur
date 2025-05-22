# Start ngrok tunnel for React app
# For first time use, you need to sign up at https://ngrok.com/ and get your authtoken
# Then uncomment and run this command with your token:
# .\ngrok\ngrok.exe authtoken YOUR_AUTH_TOKEN

# Start your React app if it's not already running
$reactAppProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command `"cd 'inspection-form'; npm start`"" -PassThru -WindowStyle Normal

# Give the React app time to start
Start-Sleep -Seconds 10

# Start the ngrok tunnel to the React app
cd ngrok
.\ngrok.exe http 3001 --log=stdout
