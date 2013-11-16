var engine = angular.module('engine', ['background']);

engine.factory('engine', function(background) {
  return function() {
    var self = this;
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
      self.ctx = self.el.getContext('2d');
      self.buffer = self.createCanvas(640, 480);
      self.bufferCtx = self.buffer.getContext('2d');
      self.background = new background();
      self.background.init()
        .then(function() {
          console.log('background done')
          window.requestAnimationFrame(self.loop);  
        });
    };

    var old = null;
    self.loop = function(timestamp) {
      self.buffer.width = self.buffer.width;
      self.el.width = self.el.width;
      window.requestAnimationFrame(self.loop);
      if (old === null) {
        old = timestamp;
        return;
      }

      // draw bkgrnd
      self.bufferCtx.drawImage(self.background.canvas, 0, 0);

      self.objects.forEach(function(obj) {
        obj.onDraw(self.bufferCtx, timestamp - old);
        obj.onTick(self.bufferCtx, timestamp - old);
      });
      self.background.onTick();
      old = timestamp;
      self.ctx.drawImage(self.buffer, 0, 0);
    };
  }
});


