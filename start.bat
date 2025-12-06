@echo off
title Claude Music AI Studio
echo Starting Claude Music AI Studio...
echo ================================

echo.
echo Starting backend server on port 5050...
cd backend
start "Backend API" cmd /k "venv\Scripts\activate.bat && python app.py"
cd ..

echo.
echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Starting frontend development server on port 3000...
cd frontend
start "Frontend Dev" cmd /k "npm run dev"
cd ..

echo.
echo Both services are starting...
echo Backend: http://localhost:5050
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul