@echo off
echo Claude Music AI Studio - Automated Setup
echo =========================================

echo.
echo [1/4] Setting up backend environment...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo.
echo [2/4] Setting up frontend environment...
cd frontend
call npm install
cd ..

echo.
echo [3/4] Building frontend...
cd frontend
call npm run build
cd ..

echo.
echo [4/4] Setup complete!
echo.
echo Next steps:
echo 1. Add your Claude API key to frontend\.env.local
echo 2. Run start.bat to launch the application
echo.
pause