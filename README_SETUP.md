# RestoCalc Setup Instructions

## How to Run the App

The RestoCalc app is now properly configured and ready to run!

### Option 1: Using the Run Button (Recommended)
1. Click the **"Run"** button at the top of your Replit workspace
2. If you don't have a workflow configured, create one:
   - Open the "Workflows" tool from the left sidebar
   - Click "New Workflow"
   - Name it "Start RestoCalc"
   - Add a "Shell Command" task
   - Command: `npm run dev`
   - Click "Save"

### Option 2: Using the Shell
Run this command in the Replit shell:
```bash
npm run dev
```

### Option 3: Using the Startup Script
Run this command in the Replit shell:
```bash
./start-dev.sh
```

## Accessing the App

Once the server is running, you'll see:
```
VITE v6.4.1  ready in XXX ms

➜  Local:   http://localhost:5000/
➜  Network: http://172.31.105.34:5000/
```

Click on the Web View icon in Replit to open the app in a new tab, or use the provided URL.

## What's Been Fixed

✅ All dependencies installed
✅ Missing `src/lib/utils.ts` file created
✅ Unused imports cleaned up
✅ Vite configuration verified
✅ Server configured to run on port 5000
✅ Ready for mobile deployment with Capacitor

## Troubleshooting

If the app doesn't load:
1. Make sure the Vite server is running (you should see the "VITE ready" message)
2. Check that port 5000 is not being used by another process
3. Try refreshing your browser
4. Check the browser console for any errors

## Features

- EUR/BGN currency calculator
- History tracking with localStorage
- GPS location support (optional)
- Dark/light theme support
- Mobile-optimized responsive design
- Three-tab interface: Calculator, History, Info
