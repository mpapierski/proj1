var background = angular.module('background', []);

var tileFactory = function(drawCallback) {
  var self = this;
  self.canvas = document.createElement('canvas')
  self.canvas.width = 48;
  self.canvas.height = 48;
  var ctx = self.canvas.getContext('2d');

  drawCallback(ctx);
  
  return self.canvas;
}

var tilesDb = {
  0: tileFactory(function(ctx) {
    ctx.beginPath()
    ctx.moveTo(0, 48);
    ctx.lineTo(48 / 2, 48 / 3);
    ctx.stroke()
  }),
}

tilesDb[1] = tilesDb[0];
tilesDb[2] = tilesDb[0];

background.factory('background', function($http, $q) {
  return function() {
    var self = this;
    self.offx = 0;
    self.drawOffX = 0; // draw background at x + drawOffX for scrolling
    self.offy = 0;
    self.direction = null;
    self.init = function() {
      var dfd = $q.defer();
      $http.get('/api/maps/random/').success(function(data, status, headers, config) {
        self.mapdata = data;
        self.createMapBuffer();
        self.draw();
        dfd.resolve(self);
      }).error(function(data) {
        dfd.reject(data);
      });
      return dfd.promise;
    }
    self.moveRight = function() {
      self.offx += 1;
    }
    self.setPosition = function(x, y) {
      self.offx = x;
      self.offy = y;
    }
    self.createMapBuffer = function() {
      self.canvas = document.createElement('canvas')
      self.canvas.width = 640 + ( 2 * 48 ); // left, right margin
      self.canvas.height = 480;
      self.ctx = self.canvas.getContext('2d');
    }
    self.draw = function() {
      for (var i = self.offx - 1; i < 21; i++)
      {
        for (var j = self.offy -1; j < 10; j++)
        {
          var tileNumbers = self.mapdata.tiles[j];
          if (tileNumbers)
          {
            var tileNumber = tileNumbers[i];
            if (tileNumber)
            {
              self.ctx.fillStyle = "blue";
              self.ctx.font = "bold 12px Arial";
              self.ctx.fillText((i * 48) + ' ' + (j * 48), i * 48, j * 48);
              self.ctx.drawImage(tilesDb[tileNumber], i * 48, j * 48);

            }
          }
        }
      }
    }
    self.onTick = function() {
      if (self.direction == 'left') {
        self.drawOffX -= 1;
        if (self.drawOffX < -48)
        {
          self.drawOffX = 0;
        }
      }
    }
  }
})
