CD seadra-frontend
call npm run tauri:build
CD ..
COPY "seadra-frontend\src-tauri\target\release\seadra-frontend.exe" "seadra-backend\bin\seadra-frontend.exe"
CD seadra-backend
call pyinstaller -w --onefile --add-binary="bin/*;bin" seadra.py