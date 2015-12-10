(function (document) {

  var files = {},
    bounds = {},
    lastOp;

  function traverseFileTree (item) {
    var dirReader, i,
      name = item.fullPath.split('/')[1];

    if (item.isFile) {
      // Get file
      item.file(function (file) {
        files[name].push({
          path: file.name,
          blob: file
        });
      });
    } else if (item.isDirectory) {
      files[item.name] = [];
      // Get folder contents
      dirReader = item.createReader();
      dirReader.readEntries(function (entries) {
        for (i = 0; i < entries.length; i++) {
          traverseFileTree(entries[i]);
        }
      });
    }

    lastOp = new Date();
  }

  function fileOpEnded (callback) {
    var threshold = new Date();

    threshold = new Date(threshold.getTime() - 500);

    if(lastOp && lastOp < threshold) {
      lastOp = null;
      return callback();
    }

    window.setTimeout(function () {
      fileOpEnded(callback);
    }, 500);
  }

  function detectBounds () {
    var name, n, frame;

    for(name in files) {
      for(n in files[name]) {
        frame = files[name][n].path.match(/(\d{4})\.png/);
        if(frame) {
          frame = parseInt(frame[1]);
        }
        if(frame && (bounds[frame] === undefined || bounds[frame][name] === undefined)) {
          new BOUNDS_DETECTOR(name, frame, files[name][n].blob, function (n, f, b) {
            if(bounds[f] === undefined) {
              bounds[f] = {};
            }
            bounds[f][n] = b;

            lastOp = new Date();
            detectBounds();
          });
          return;
        }
      }
    }
  }

  document.body.ondragover = function (e) {
    e.preventDefault();
  };

  document.body.ondrop = function (e) {
    var directory;

    e.preventDefault();

    [].forEach.call(e.dataTransfer.items, function (item) {
      var directory = item.webkitGetAsEntry();

      if(!directory.isDirectory) {
        return;
      }

      traverseFileTree(directory);
    });

    fileOpEnded(detectBounds);
    fileOpEnded(function () {
      document.querySelector('#results').innerHTML = JSON.stringify(bounds, null, 4);
    });
  };

  document.querySelector('button').onclick = function () {
    location.href = 'data:application/octet-stream,'+JSON.stringify(bounds);
  }

}(document));
;