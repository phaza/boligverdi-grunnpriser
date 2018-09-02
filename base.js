if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

function getUrl(url, callback) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url);
    
    oReq.addEventListener('load', function() {
        callback(this);
    });
    oReq.send();
}

function loadData(url, callback, colorCallback) {
  getUrl(url, function(data) {
    var json = JSON.parse(data.responseText);
    var geo = json.features;
    var lg = L.layerGroup();
    
    lg.addLayer(L.geoJSON(geo, {
      style: colorCallback,
      coordsToLatLng: function(coords) {
          return L.Projection.UTM33.unproject({x: coords[0], y: coords[1]});
      },
      onEachFeature: function(feature, layer) {
        var name = feature.properties.grunnkretsnavn;
        var coords = feature.geometry.coordinates.map(function(v, i) {
          return L.Projection.UTM33.unproject({x: v[i][0], y: v[i][1]});
        });
      }
    }));

    callback(lg);
  });
}
