var engine = angular.module('engine', []);

engine.factory('engine', function() {
  return function() {

    var self = this;
    self.backgrounds = [];
    self.objects = [];
    self.el = null; // canvas dom
    self.createCanvas = function(width, height) {
      var canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      return canvas;
    };

    self.init = function(el) {
      self.el = el;
      self.buffer = self.createCanvas(640, 480);
      self.backgroundCanvas = self.createCanvas(640, 480);

      self.backgroundCtx = self.backgroundCanvas.getContext('2d');
      self.ctx = self.el.getContext('2d');
      self.bufferCtx = self.buffer.getContext('2d');

      window.requestAnimationFrame(self.loop);
    };

    var old = null;
    self.loop = function(timestamp) {
      self.buffer.width = self.buffer.width;
      self.el.width = self.el.width;
      self.backgroundCanvas.width = self.backgroundCanvas.width;

      window.requestAnimationFrame(self.loop);
      if (old === null) {
        old = timestamp;
        return;
      }

      self.backgrounds.forEach(function(obj) {
        obj.onDraw(self.backgroundCtx, timestamp - old);
      });

      self.objects.forEach(function(obj) {
        obj.onDraw(self.bufferCtx, timestamp - old);
        obj.onTick(self.bufferCtx, timestamp - old);
      });

      self.ctx.drawImage(self.backgroundCanvas, 0, 0);
      self.ctx.drawImage(self.buffer, 0, 0);

      old = timestamp;
    };
  }
});


