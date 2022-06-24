CD seadra-frontend
call npm run tauri:build
CD ..
COPY "seadra-frontend\src-tauri\target\release\seadra-frontend.exe" "seadra-backend\bin\seadra-frontend.exe"
COPY "seadra-frontend\src-tauri\icons\icon.ico" "seadra-backend\icon.ico"
CD seadra-backend
call pyinstaller -w --onefile --icon=icon.ico --add-binary="bin/*;bin" seadra.py
DEL "icon.ico"