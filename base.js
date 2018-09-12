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
  if (between(0, 2500000, price)) return '#bf0c2b';
  if (between(2500000, 5000000, price)) return '#f14c13';
  if (between(5000000, 7500000, price)) return '#f5900e';
  if (between(7500000, 10000000, price)) return '#09a38c';
  if (between(1000000, 12500000, price)) return '#29ADFF';
  if (between(12500000, 20000000, price)) return '#02173e';
}

var myStyle = {
  "color": "#fff",
  "weight":1,
  "fillOpacity": 0.44
};

var priceFormatter =  new Intl.NumberFormat('nb-NO', { style: 'decimal' });
function formatPrice(price) {
  return 'kr ' + priceFormatter.format(price).replace(/\s+/g, '.');
}

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
          if(typeof(price) !== 'undefined') {
            style.fillColor = getColor(price);
          }
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

        if(typeof(price) === 'undefined') {
          price = "Ikke oppgitt";
        }
        else 
        {
          price = '<b>' + formatPrice(price) + '</b>';
        }
        if(!L.Browser.mobile) {
          layer.bindTooltip('<p>' + price + '</p>', {
            direction: 'center',
            // sticky: true
          });
        }
        else {
          var onClick = function(e) {
            onMouseOver(price)(e);
  
            layer.once('click', function(e) {
              onMouseOut(e);
              layer.once('click', onClick);
            })
          }
  
          layer.once('click', onClick);
        }

      }
    }));

    callback(lg);
  });
}
