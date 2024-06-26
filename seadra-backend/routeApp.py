import sys
import os
import json
from flask import Flask, abort, make_response, render_template, request
from flask_cors import CORS
from os.path import expanduser

base_dir='.'
if hasattr(sys,'_MEIPASS'):
    base_dir=os.path.join(sys._MEIPASS)
def create_app():
    print(base_dir)
    app = Flask(__name__,
                static_folder = os.path.join(base_dir,"dist-front","assets"),
                template_folder = os.path.join(base_dir,"dist-front"))
    CORS(app)

    @app.route("/")
    def appPage():  
        return render_template('index.html')

    @app.route('/api/list_files', methods=['POST'])
    def list_files():
        request_json = request.get_json()
        print(request_json)
        current_path = request_json.get('directory')
        if(current_path==''): current_path = expanduser("~")
        current_path = os.path.abspath(current_path)
        ext = tuple(request_json.get('ext'))
        listFiles = os.listdir(current_path)
        onlyFiles = [f for f in listFiles if os.path.isfile(os.path.join(current_path, f)) & f.lower().endswith(ext)]
        onlyDirs = [f for f in listFiles if os.path.isdir(os.path.join(current_path, f)) & (not (f+'.mrxs') in onlyFiles)]
        return {'files': onlyFiles, 'folders': onlyDirs, 'currentPath': current_path}


    @app.route('/api/newproject', methods=[ 'POST'])
    def newProject():
        json = request.get_json()
        path = json.get('path')
        print(path)
        if os.path.exists(path):
            abort(404)
        os.mkdir(path)
        configFile = os.path.join(path,'config.seadra')
        with open(configFile, 'w') as outfile:
            outfile.write('{}')
        return {'configFile':configFile}

    @app.route('/api/write_json', methods=['POST'])
    def write_json():
        json_data = request.get_json()
        filepath = json_data["filepath"]
        f = open(filepath, "w")
        jsonStr = json.dumps(json_data['data'])
        f.write(jsonStr)
        f.close()
        return make_response("ok", 200)

    @app.route('/api/read_json', methods=['POST'])
    def read_json():
        json_data = request.get_json()
        filepath = json_data["filepath"]
        if os.path.isfile(filepath):
            f = open(filepath, "r")
            j = json.load(f)
            f.close()
            return j
        else: abort(404)

    return app
