import os

# windows
# os.environ['PATH'] = r".\bin" + ";" + os.environ['PATH']

from flask import Flask, abort, make_response, url_for, request, send_from_directory
from flask_cors import CORS
from io import BytesIO

import openslide
from openslide import open_slide
from openslide.deepzoom import DeepZoomGenerator
import re
from unicodedata import normalize
from label_tool import LabelTool
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


fileExtensionAvailable = ('.png', '.jpg', '.jpeg', '.mrxs', '.tif', ".svs")

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


@app.route('/list_files', methods=['POST'])
def list_files():
    request_json = request.get_json()
    current_path = os.path.abspath(request_json.get('directory'))
    listFiles = os.listdir(current_path)
    onlyfiles = [f for f in listFiles if os.path.isfile(os.path.join(current_path, f)) & f.lower().endswith(fileExtensionAvailable)]
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
    path += '=='
    file = base64.b64decode(path).decode("utf-8")
    mpp = load_slide(file)
    infos = {
        'slide': url_for('dzi', slug=SLIDE_NAME),
        'mpp': str(mpp)
    }
    return infos


@app.route('/get_dir_config', methods=['get'])
def getDirConfig():
    return label_tool.get_dir_config()


@app.route('/set_dir_config', methods=['post'])
def setDirConfig():
    label_tool.set_dir_config(request.form)
    return "Saved successfully"


@app.route('/get_label_classes', methods=['get'])
def getLabelClasses():
    return json.dumps(label_tool.get_label_classes())


@app.route('/set_label_classes', methods=['post'])
def setLabelClasses():
    data = request.get_data()
    label_tool.set_label_classes(json.loads(data.decode("utf-8")))
    return "Saved successfully"


@app.route('/get_label_boxes/<_id>', methods=['get'])
def get_label_boxes(_id):
    return label_tool.get_label_boxes(_id, app.slides['left'], app.slides['top'])


@app.route('/save_label_boxes', methods=['post'])
def saveLabelBoxes():
    data = request.get_data()
    label_tool.save_label_boxes(json.loads(data.decode("utf-8")), app.slides['left'], app.slides['top'])
    return "Saved successfully"


@app.route('/<slug>.dzi')
def dzi(slug):
    format = app.config['DEEPZOOM_FORMAT']
    try:
        resp = make_response(app.slides[slug].get_dzi(format))
        resp.mimetype = 'application/xml'
        return resp
    except KeyError:
        # Unknown slug
        abort(404)


@app.route('/<slug>_files/<int:level>/<int:col>_<int:row>.<_format>')
def tile(slug, level, col, row, _format):
    _format = _format.lower()
    if _format != 'jpeg' and _format != 'png':
        # Not supported by Deep Zoom
        abort(404)
    try:
        image_tile = app.slides[slug].get_tile(level, (col, row))
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



@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')


def slugify(text):
    text = normalize('NFKD', text.lower()).encode('ascii', 'ignore').decode()
    return re.sub('[^a-z0-9]+', '-', text)


if __name__ == '__main__':
    # Load config file
    app.config.from_pyfile('./app_config.py')
    # Load slide config file
    try:
        slide_config = app.config['SLIDE_CONFIG']
        label_tool = LabelTool(slide_config)
    except IndexError:
        if app.config['SLIDE_CONFIG'] is None:
            parser.error('No slide config file specified')

    app.run(host=app.config['HOST'], port=app.config['PORT'], threaded=True)
