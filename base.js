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


function between(one, two, check) {
  return check >= one && check < two;
}

function getColor(price) {
  if (between(1000000, 2000000, price)) return '#64E500';
  if (between(2000000, 3000000, price)) return '#94E200';
  if (between(3000000, 4000000, price)) return '#C2DF00';
  if (between(4000000, 5000000, price)) return '#DCCA00';
  if (between(5000000, 6000000, price)) return '#DA9800';
  if (between(6000000, 7000000, price)) return '#D76800';
  if (between(7000000, 8000000, price)) return '#D43900';
  if (between(8000000, 9000000, price)) return '#D20B00';
  if (between(9000000, 10000000, price)) return '#CF0020';
  if (between(10000000, 11000000, price)) return '#CC004C';
  if (between(11000000, 12000000, price)) return '#C90076';
  if (between(12000000, 13000000, price)) return '#C7009F';
  if (between(13000000, 14000000, price)) return '#C100C4';
  if (between(14000000, 15000000, price)) return '#9500C1';
  if (between(15000000, 16000000, price)) return '#6900BF';
}

var myStyle = {
  "color": "#f00",
  "weight": 1,
  "fillOpacity": 0.34
};

function loadData(url, callback, prices, onMouseOver, onMouseOut) {
  getUrl(url, function(data) {
    var json = JSON.parse(data.responseText);
    var geo = json.features;
    var lg = L.layerGroup();
    
    lg.addLayer(L.geoJSON(geo, {
      style: function(feature) {
          var gno = feature.properties.grunnkretsnummer;
          var price = parseInt(prices[gno], 10);
          var style = Object.assign({}, myStyle);
          style.fillColor = getColor(price);
          return style;
      },
      coordsToLatLng: function(coords) {
          return L.Projection.UTM33.unproject({x: coords[0], y: coords[1]});
      },
      onEachFeature: function(feature, layer) {
        var name = feature.properties.grunnkretsnavn;
        var no = feature.properties.grunnkretsnummer;
        var price = prices[no];
        var coords = feature.geometry.coordinates.map(function(v, i) {
          return L.Projection.UTM33.unproject({x: v[i][0], y: v[i][1]});
        });

        layer.on({
          mouseover: onMouseOver,
          mouseout: onMouseOut
        });


        if(typeof(price) !== 'undefined') {
          layer.bindTooltip(price); 
        } 

      }
    }));

    callback(lg);
  });
}
