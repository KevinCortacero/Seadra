# Seadra


# Windows compilation as .exe
Go into the seadra-frontend folder
Run "npm run tauri:build"
Get the created seadra-frontend.exe and put it in seadra-backend/bin
Go into the seadra-backend folder
Run "pyinstaller --add-binary bin/*;bin -w seadra.py"
Take a coffee and smile