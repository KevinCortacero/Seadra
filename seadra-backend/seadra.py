from flaskwebgui import FlaskUI,OPERATING_SYSTEM,browser_path_dispacher
from appdirs import user_data_dir
import os
from routeApp import create_app
from routeOpenslide import add_route_openslide

devmode = False
 
app = create_app()
add_route_openslide(app)

app.config["DEBUG"] = devmode

if __name__ == '__main__':
    if devmode:
        app.run(port=4000)
    else:
        #for persitent localStorage
        user_data_directory = user_data_dir("Seadra", "irit-crct")
        if not os.path.exists(user_data_directory):
            os.makedirs(user_data_directory)

        FlaskUI(
            server="flask",
            fullscreen=True,
            server_kwargs={
                "app":app,
                "port":51234,
                "threaded":True
            },
            extra_flags=[f'--user-data-dir={user_data_directory}']
        ).run()
