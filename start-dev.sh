#!/bin/bash
cd /home/runner/workspace
exec npx vite --host 0.0.0.0 --port 5000 --strictPort
