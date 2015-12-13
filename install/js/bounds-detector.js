var BOUNDS_DETECTOR = function (a, b, blob, callback) {
  'use strict';

  var fileReader = new FileReader(),
    canvas = document.querySelector('canvas'),
    img = new Image,
    ctx = canvas.getContext('2d');

  function getBounds () {
    var w = this.width,
      h = this.height;

    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(this, 0, 0, w, h);

    var idata = ctx.getImageData(0, 0, w, h),
      buffer = idata.data,
      buffer32 = new Uint32Array(buffer.buffer),
      x, y,
      x1 = w, y1 = h, x2 = 0, y2 = 0;

    // get left edge
    for(y = 0; y < h; y++) {
      for(x = 0; x < w; x++) {
        if (buffer32[x + y * w] > 0) {
          if (x < x1) x1 = x;
        }
      }
    }

    // get right edge
    for(y = 0; y < h; y++) {
      for(x = w; x >= 0; x--) {
        if (buffer32[x + y * w] > 0) {
          if (x > x2) x2 = x;
        }
      }
    }
    
    // get top edge
    for(x = 0; x < w; x++) {
      for(y = 0; y < h; y++) {
        if (buffer32[x + y * w] > 0) {
          if (y < y1) y1 = y;
        }
      }
    }

    // get bottom edge
    for(x = 0; x < w; x++) {
      for(y = h; y >= 0; y--) {
        if (buffer32[x + y * w] > 0) {
          if (y > y2) y2 = y;
        }
      }
    }

    ctx.strokeStyle = '#f00';
    ctx.strokeRect(x1+0.5, y1+0.5, x2-x1, y2-y1);

    fileReader = null;
    img = null;

    callback(a, b, (x1 === w && y1 === h && x2 === 0 && y2 === 0 ? null : { 'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2 }));
  }

  img.onload = getBounds;

  fileReader.onloadend = function () {
    img.src = this.result;
  };

  fileReader.readAsDataURL(blob);

};
