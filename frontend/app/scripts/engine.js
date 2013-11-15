var engine = angular.module('engine', []);

engine.factory('engine', function() {
  return function() {

    var self = this;
    self.objects = [{
      x: 1,
      y: 1,
      w: 10,
      h: 10,
      onDraw: function(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.w, this.h);
      },
      onTick: function(ctx) {
        this.x += 1;
      }
    }];
    self.el = null; // canvas dom
    self.createCanvas = function(width, height) {
      var canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      return canvas;
    }
    self.init = function(el) {
      self.el = el;
      self.ctx = self.el.getContext('2d');
      self.buffer = self.createCanvas(640, 480);
      self.bufferCtx = self.buffer.getContext('2d');
      window.requestAnimationFrame(self.loop);
    }
    var old = null;
    self.loop = function(timestamp) {
      window.requestAnimationFrame(self.loop);
      if (old === null) {
        old = timestamp;
        return;
      }
      self.objects.forEach(function(obj) {
        obj.onDraw(self.bufferCtx, timestamp - old);
        obj.onTick(self.bufferCtx, timestamp - old);
      });
      old = timestamp;
      self.ctx.drawImage(self.buffer, 0, 0);
    }
  }
});


