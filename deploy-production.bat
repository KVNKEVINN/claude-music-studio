@echo off
echo Claude Music AI Studio - Production Deployment
echo ===============================================

echo.
echo [1/3] Building production frontend...
cd frontend
call npm run build
cd ..

echo.
echo [2/3] Preparing deployment files...
if not exist deploy mkdir deploy
xcopy /E /I frontend\dist deploy\frontend
xcopy /E /I backend deploy\backend
copy docker-compose.yml deploy\
copy .env.example deploy\
copy README.md deploy\

echo.
echo [3/3] Production build complete!
echo.
echo Deployment files are ready in the 'deploy' folder.
echo Upload this folder to your production server.
echo.
pause