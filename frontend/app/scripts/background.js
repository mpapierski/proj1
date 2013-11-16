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
  5: tileFactory(function(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(48 / 2, 48 / 2);
    ctx.moveTo(48 / 2, 48 / 2);
    ctx.lineTo(48, 48);
    ctx.stroke();
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
      console.log('move right');
      self.direction = 'left';
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
      self.canvas.width = self.canvas.width;
      for (var i = self.offx - 1; i < self.offx + 21; i++)
      {
        for (var j = self.offy; j < self.offy + 10; j++)
        {
          var tileNumbers = self.mapdata.tiles[j];
          if (tileNumbers)
          {
            var tileNumber = tileNumbers[i];
            if (tileNumber)
            {
              // self.ctx.drawImage(tilesDb[tileNumber], (i - self.offx) * 48, (j - self.offy) * 48);
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
          self.direction = '';
          self.offx += 1;
          self.draw();
        }
      }
    }
  }
})
