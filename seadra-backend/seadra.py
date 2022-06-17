import os
import sys
import subprocess
import threading
import subprocess
from flask import request

if "win" in sys.platform:
    # windows
    os.environ['PATH'] = r".\bin" + ";" + os.environ['PATH']

def popen_and_call(on_exit, popen_args):
    """
    Runs the given args in a subprocess.Popen, and then calls the function
    on_exit when the subprocess completes.
    on_exit is a callable object, and popen_args is a list/tuple of args that 
    would give to subprocess.Popen.
    """
    def run_in_thread(on_exit, popen_args):
        proc = subprocess.Popen(*popen_args)
        proc.wait()
        on_exit()
        return
    thread = threading.Thread(target=run_in_thread, args=(on_exit, popen_args))
    thread.start()
    # returns immediately after the thread starts
    return thread

def close():
    os._exit(0)

popen_and_call(close, [r".\bin\seadra-frontend.exe"])

from flask import Flask, abort, make_response, url_for, request, send_from_directory
from flask_cors import CORS
from io import BytesIO
from PIL import Image

import openslide
from openslide import open_slide
from openslide.deepzoom import DeepZoomGenerator
import re
from unicodedata import normalize
import json
import base64
from io import BytesIO


DEEPZOOM_SLIDE = None
DEEPZOOM_FORMAT = 'jpeg'
DEEPZOOM_TILE_SIZE = 254
DEEPZOOM_OVERLAP = 1
DEEPZOOM_LIMIT_BOUNDS = True
DEEPZOOM_TILE_QUALITY = 75
SLIDE_NAME = 'slide'


fileExtensionAvailable = ('.png', '.jpg', '.jpeg', '.mrxs', '.tif', '.iff', ".svs")

app = Flask(__name__)
CORS(app)
app.config.from_object(__name__)
app.config.from_envvar('DEEPZOOM_TILER_SETTINGS', silent=True)


class PILBytesIO(BytesIO):
    def fileno(self):
        '''Classic PIL doesn't understand io.UnsupportedOperation.'''
        raise AttributeError('Not supported')
def export_img_cv2(img):
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue())
  
    return img_str


def load_slide(file):
    slidefile = file
    if slidefile is None:
        raise ValueError('No slide file specified')
    config_map = {
        'DEEPZOOM_TILE_SIZE': 'tile_size',
        'DEEPZOOM_OVERLAP': 'overlap',
        'DEEPZOOM_LIMIT_BOUNDS': 'limit_bounds',
    }
    opts = dict((v, app.config[k]) for k, v in config_map.items())
    slide = open_slide(slidefile)
    try:
        left = slide.properties[openslide.PROPERTY_NAME_BOUNDS_X]
    except KeyError:
        left = 0


    try:
        top = slide.properties[openslide.PROPERTY_NAME_BOUNDS_Y]
    except KeyError:
        top = 0
    
    app.slides = {
        SLIDE_NAME: DeepZoomGenerator(slide, **opts),
        'left': left,
        'top': top
    }
    try:
        mpp_x = slide.properties[openslide.PROPERTY_NAME_MPP_X]
        mpp_y = slide.properties[openslide.PROPERTY_NAME_MPP_Y]
        app.slide_mpp = (float(mpp_x) + float(mpp_y)) / 2
        return app.slide_mpp
    except (KeyError, ValueError):
        app.slide_mpp = 0
        return 0

def convertB64(path):
    path += '=='
    file = base64.b64decode(path).decode("utf-8")
    return file

@app.route('/list_files', methods=['POST'])
def list_files():
    request_json = request.get_json()
    print(request_json)
    current_path = os.path.abspath(request_json.get('directory'))
    ext = tuple(request_json.get('ext'))
    listFiles = os.listdir(current_path)
    onlyfiles = [f for f in listFiles if os.path.isfile(os.path.join(current_path, f)) & f.lower().endswith(ext)]
    onlyDirs = [f for f in listFiles if os.path.isdir(os.path.join(current_path, f)) & (not (f+'.mrxs') in onlyfiles)]
    return {'files': onlyfiles, 'folders': onlyDirs, 'currentPath': current_path}

@app.route('/thumbnail', methods=['POST'])
def thumbnail():
    request_json = request.get_json()
    current_path = request_json.get('directory')
    img = open_slide(current_path).get_thumbnail((200, 200))

    img = export_img_cv2( img)
    return img

@app.route('/get_slide_infos/<path>')
def get_slide_infos(path):
    file = convertB64(path)
    #if(file.split('.')[-1] in [])
    mpp = load_slide(file)
    infos = {
        'slide': url_for('dzi', slug=path),
        'mpp': str(mpp)
    }
    return infos


@app.route('/newproject', methods=[ 'POST'])
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

@app.route('/get_dir_config', methods=['get'])
def getDirConfig():
    return label_tool.get_dir_config()


@app.route('/set_dir_config', methods=['post'])
def setDirConfig():
    label_tool.set_dir_config(request.form)
    return "Saved successfully"


@app.route('/getimg/<filenameB64>.png')
def native(filenameB64):
    filepath = convertB64(filenameB64)
    print(filepath)
    try:
        with Image.open(filepath) as im:
            buf = PILBytesIO()
            im.save(buf, format="PNG")
        resp = make_response(buf.getvalue())
        resp.mimetype = 'image/PNG'
        return resp
    except KeyError:
        # Unknown slug
        abort(404)

@app.route('/<slug>.dzi')
def dzi(slug):
    format = app.config['DEEPZOOM_FORMAT']
    try:
        resp = make_response(app.slides[SLIDE_NAME].get_dzi(format))
        resp.mimetype = 'application/xml'
        return resp
    except KeyError:
        # Unknown slug
        abort(404)


@app.route('/<slug>/<int:level>/<int:col>_<int:row>.<_format>')
def tile(slug, level, col, row, _format):
    _format = _format.lower()
    if _format != 'jpeg' and _format != 'png':
        # Not supported by Deep Zoom
        abort(404)
    try:
        image_tile = app.slides[SLIDE_NAME].get_tile(level, (col, row))
        print(image_tile)
        buf = PILBytesIO()
        image_tile.save(buf, _format, quality=app.config['DEEPZOOM_TILE_QUALITY'])
        resp = make_response(buf.getvalue())
        resp.mimetype = f"image/{_format}"
        return resp
    except SyntaxError:
        print("ERROR - broken PNG file (chunk {repr(cid)})", slug, level, col, row)
        abort(404)
    except KeyError:
        print("Key Error:", slug, level, col, row)
        abort(404)
    except ValueError:
        print("Value Error:", slug, level, col, row)
        abort(404)
    except OSError:
        print("OSError Error:", slug, level, col, row)
        abort(404)


@app.route('/write_json', methods=['POST'])
def write_json():
    json_data = request.get_json()
    filepath = json_data["filepath"]
    f = open(filepath, "w")
    jsonStr = json.dumps(json_data['data'])
    f.write(jsonStr)
    f.close()
    return make_response("ok", 200)

@app.route('/read_json', methods=['POST'])
def read_json():
    json_data = request.get_json()
    filepath = json_data["filepath"]
    f = open(filepath, "r")
    j = json.load(f)
    f.close()
    return j

def slugify(text):
    text = normalize('NFKD', text.lower()).encode('ascii', 'ignore').decode()
    return re.sub('[^a-z0-9]+', '-', text)


if __name__ == '__main__':
    # Load config file
    # app.config.from_pyfile('./app_config.py')
    app.config["DEBUG"] = False
    app.config["HOST"] = "127.0.0.1"
    app.config["PORT"] = 4000

    app.run(host=app.config['HOST'], port=app.config['PORT'], threaded=True)