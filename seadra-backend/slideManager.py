import base64
from collections import OrderedDict
from io import BytesIO
import os
from threading import Lock
import zlib
import numpy as np
import cv2
from types import MethodType
import sys
from PIL import ImageCms
def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

if os.name == 'nt':
    _dll_path = resource_path(r"bin")
    if _dll_path is not None:
        with os.add_dll_directory(_dll_path):
            import openslide
    else:
        import openslide
else:
    import openslide

from openslide import OpenSlide, OpenSlideCache, OpenSlideError, OpenSlideVersionError
from openslide.deepzoom import DeepZoomGenerator

# Optimized sRGB v2 profile, CC0-1.0 license
# https://github.com/saucecontrol/Compact-ICC-Profiles/blob/bdd84663/profiles/sRGB-v2-micro.icc
# ImageCms.createProfile() generates a v4 profile and Firefox has problems
# with those: https://littlecms.com/blog/2020/09/09/browser-check/
SRGB_PROFILE_BYTES = zlib.decompress(
    base64.b64decode(
        'eNpjYGA8kZOcW8wkwMCQm1dSFOTupBARGaXA/oiBmUGEgZOBj0E2Mbm4wDfYLYQBCIoT'
        'y4uTS4pyGFDAt2sMjCD6sm5GYl7K3IkMtg4NG2wdSnQa5y1V6mPADzhTUouTgfQHII5P'
        'LigqYWBg5AGyecpLCkBsCSBbpAjoKCBbB8ROh7AdQOwkCDsErCYkyBnIzgCyE9KR2ElI'
        'bKhdIMBaCvQsskNKUitKQLSzswEDKAwgop9DwH5jFDuJEMtfwMBg8YmBgbkfIZY0jYFh'
        'eycDg8QthJgKUB1/KwPDtiPJpUVlUGu0gLiG4QfjHKZS5maWk2x+HEJcEjxJfF8Ez4t8'
        'k8iS0VNwVlmjmaVXZ/zacrP9NbdwX7OQshjxFNmcttKwut4OnUlmc1Yv79l0e9/MU8ev'
        'pz4p//jz/38AR4Nk5Q=='
    )
)
SRGB_PROFILE = ImageCms.getOpenProfile(BytesIO(SRGB_PROFILE_BYTES))

def ratio(self,level):
    level = self._slide_from_dz_level[level]
    return level,tuple(np.array(self._osr.level_dimensions[level])/np.array(self._osr.dimensions))


def getRegion(self,workingLevel,box):
    workingLevel,r = self.pixelRatio(workingLevel)
    location = (int(box['x']),int(box['y']))
    size = (int(box['w']*r[0]), int(box['h']*r[1]))
    return self._osr.read_region(location, workingLevel, size)

def genMask(self,workingLevel,box,annotations,color='auto'):
    workingLevel,r = self.pixelRatio(workingLevel)
    size = (int(box['h']*r[0]),int(box['w']*r[1]))
    if color == 'auto':
        mask = np.zeros(size)
    elif hasattr(color, '__iter__'):
        mask = np.zeros((size[0],size[1],len(color)))
    else:
        mask = np.zeros(size)
    counterColor = 1
    for a in annotations:
        if a['type'] == 'poly':
            contour = np.array([[p['x'],p['y']] for p in a['points']])
            contour[:,0] = (contour[:,0]-box['x'])*r[0]
            contour[:,1] = (contour[:,1]-box['y'])*r[1]
            cv2.fillPoly(mask, pts=np.array([np.round(contour)],dtype=np.int32), color=color if color!='auto' else counterColor)
        elif a['type'] == 'ellipse':
            cv2.ellipse(mask,(int((a['x']-box['x'])*r[0]),int((a['y']-box['y'])*r[1])),(int(a['rx']*r[0]),int(a['ry']*r[1])),a['a'],0,360,color if color!='auto' else counterColor,-1)
        elif a['type'] == 'rect':
            cv2.rectangle(mask, (int((a['x']-box['x'])*r[0]),int((a['y']-box['y'])*r[1])), (int((a['x']-box['x']+a['w'])*r[0]),int((a['y']-box['y']+a['h'])*r[1])), color if color!='auto' else counterColor, -1)
        else:
            raise(ValueError("invalid annotation type"))
        counterColor +=1
    return mask




def convertB64(path):
    path += '=='
    file = base64.b64decode(path).decode("utf-8")
    return file

class _SlideCache:
    def __init__(self, cache_size, tile_cache_mb, dz_opts, color_mode):
        self.cache_size = cache_size
        self.dz_opts = dz_opts
        self.color_mode = color_mode
        self._lock = Lock()
        self._cache = OrderedDict()
        # Share a single tile cache among all slide handles, if supported
        try:
            self._tile_cache = OpenSlideCache(tile_cache_mb * 1024 * 1024)
        except OpenSlideVersionError:
            self._tile_cache = None

    def get(self, pathB64):
        path = convertB64(pathB64)
        print(path)
        with self._lock:
            if path in self._cache:
                # Move to end of LRU
                slide = self._cache.pop(path)
                self._cache[path] = slide
                return slide

        osr = OpenSlide(path)
        if self._tile_cache is not None:
            osr.set_cache(self._tile_cache)
        slide = DeepZoomGenerator(osr, **self.dz_opts)
        slide.pixelRatio = MethodType(ratio, slide)
        slide.read_region = MethodType(getRegion, slide)
        slide.generate_mask = MethodType(genMask, slide)
        try:
            mpp_x = osr.properties[openslide.PROPERTY_NAME_MPP_X]
            mpp_y = osr.properties[openslide.PROPERTY_NAME_MPP_Y]
            slide.mpp = (float(mpp_x) + float(mpp_y)) / 2
        except (KeyError, ValueError):
            slide.mpp = 0
        slide.transform = self._get_transform(osr)

        with self._lock:
            if path not in self._cache:
                if len(self._cache) == self.cache_size:
                    self._cache.popitem(last=False)
                self._cache[path] = slide
        return slide

    def _get_transform(self, image):
        if image.color_profile is None:
            return lambda img: None
        mode = self.color_mode
        if mode == 'ignore':
            # drop ICC profile from tiles
            return lambda img: img.info.pop('icc_profile')
        elif mode == 'embed':
            # embed ICC profile in tiles
            return lambda img: None
        elif mode == 'default':
            intent = ImageCms.getDefaultIntent(image.color_profile)
        elif mode == 'absolute-colorimetric':
            intent = ImageCms.Intent.ABSOLUTE_COLORIMETRIC
        elif mode == 'relative-colorimetric':
            intent = ImageCms.Intent.RELATIVE_COLORIMETRIC
        elif mode == 'perceptual':
            intent = ImageCms.Intent.PERCEPTUAL
        elif mode == 'saturation':
            intent = ImageCms.Intent.SATURATION
        else:
            raise ValueError(f'Unknown color mode {mode}')
        transform = ImageCms.buildTransform(
            image.color_profile,
            SRGB_PROFILE,
            'RGB',
            'RGB',
            intent,
            0,
        )

        def xfrm(img):
            ImageCms.applyTransform(img, transform, True)
            # Some browsers assume we intend the display's color space if we
            # don't embed the profile.  Pillow's serialization is larger, so
            # use ours.
            img.info['icc_profile'] = SRGB_PROFILE_BYTES

        return xfrm

