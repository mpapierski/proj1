var engine = angular.module('engine', []);

var engine = function() {
  var self = this;
  self.objects = [{
    tmp: function(ctx) {
      ctx.fill
    }
  }]
  self.el = null; // canvas dom

  self.init = function(e) {
    self.el = e;

    self.ctx = e.getContext('2d');
    window.requestAnimationFrame(self.loop);
  }
  
  self.loop = function(timestamp) {
    var old = null;
    if (old === null) {
      old = timestamp;
      continue;
    }
    for (var obj in self.objects) {
      obj.onDraw(ctx, timestamp - old);
      obj.onTick(ctx, timestamp - old);
    }
    old = timestamp;
  }
}