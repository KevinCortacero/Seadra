
from flask import abort, make_response, request, url_for, send_file
from slideManager import _SlideCache
from io import BytesIO
from PIL import Image
import base64

class PILBytesIO(BytesIO):
    def fileno(self):
        '''Classic PIL doesn't understand io.UnsupportedOperation.'''
        raise AttributeError('Not supported')
    
def convertB64(path):
    path += '=='
    file = base64.b64decode(path).decode("utf-8")
    return file

def add_route_openslide(app,config=None):
    # Create and configure app
    app.config.from_mapping(
        SLIDE_CACHE_SIZE=10,
        SLIDE_TILE_CACHE_MB=128,
        DEEPZOOM_FORMAT='png',
        DEEPZOOM_TILE_SIZE=256,
        DEEPZOOM_OVERLAP=0,
        DEEPZOOM_LIMIT_BOUNDS=True,
        DEEPZOOM_TILE_QUALITY=75,
        DEEPZOOM_COLOR_MODE='default',
    )
    if config is not None:
        app.config.from_mapping(config)

    # Set up cache
    config_map = {
        'DEEPZOOM_TILE_SIZE': 'tile_size',
        'DEEPZOOM_OVERLAP': 'overlap',
        'DEEPZOOM_LIMIT_BOUNDS': 'limit_bounds',
    }
    opts = {v: app.config[k] for k, v in config_map.items()}
    app.cache = _SlideCache(
        app.config['SLIDE_CACHE_SIZE'],
        app.config['SLIDE_TILE_CACHE_MB'],
        opts,
        app.config['DEEPZOOM_COLOR_MODE'],
    )

    # Helper functions
    def get_slide(path):
        try:
            slide = app.cache.get(path)
            return slide
        except Exception:
            abort(404)

    @app.route('/api/get_slide_infos/<pathB64>')
    def get_slide_infos(pathB64):
        slide = get_slide(pathB64)
        infos = {
            'slide': url_for('dzi', path=pathB64),
            'mpp': str(slide.mpp)
        }
        return infos
    
    @app.route('/api/<path:path>.dzi')
    def dzi(path):
        slide = get_slide(path)
        format = app.config['DEEPZOOM_FORMAT']
        resp = make_response(slide.get_dzi(format))
        resp.mimetype = 'application/xml'
        return resp

    @app.route('/api/<path:path>_files/<int:level>/<int:col>_<int:row>.<format>')
    def tile(path, level, col, row, format):
        maskLevel = request.args.get('maskLevel',-1,int)
        slide = get_slide(path)
        format = format.lower()
        if format != 'jpeg' and format != 'png':
            # Not supported by Deep Zoom
            abort(404)
        try:
            if maskLevel == -1:
                tile = slide.get_tile(level, (col, row))
            elif maskLevel == level:
                tile = app.mask_function(slide.get_tile(level, (col, row)),**request.args)
            else: abort(404)
        except ValueError:
            # Invalid level or coordinates
            abort(404)
        slide.transform(tile)
        buf = BytesIO()
        tile.save(
            buf,
            format,
            quality=app.config['DEEPZOOM_TILE_QUALITY'],
            icc_profile=tile.info.get('icc_profile'),
        )
        resp = make_response(buf.getvalue())
        resp.mimetype = 'image/%s' % format
        return resp


    @app.route('/api/getimg/<filenameB64>.png')
    def native(filenameB64):
        maskLevel = request.args.get('maskLevel',-1,int)
        print(maskLevel)
        filepath = convertB64(filenameB64)
        print(filepath)
        try:
            return send_file(filepath, mimetype='image/'+filepath.split('.')[-1])
            # with Image.open(filepath) as im:
            #     buf = PILBytesIO()
            #     im.save(buf, format="png")
            # resp = make_response(buf.getvalue())
            # resp.mimetype = 'image/png'
            # return resp
        except KeyError:
            # Unknown slug
            abort(404)
    return app