CD seadra-frontend
call npm run build
CD ..
COPY "seadra-frontend\public\assets\favicon.ico" "seadra-backend\icon.ico"
CD seadra-backend
call pyinstaller -F --icon=icon.ico --hide-console minimize-early --add-data "dist-front;dist-front" --add-binary "bin;bin" seadra.py
REM call pyinstaller -F --icon=icon.ico --hide-console hide-early --add-data "dist-front;dist-front" --add-binary "bin;bin" seadra.py
DEL "icon.ico"