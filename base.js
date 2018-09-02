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
