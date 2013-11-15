var engine = angular.module('engine', []);

engine.factory('engine', function() {
  return function() {

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
      console.log('jestem')
    }
    
    self.loop = function(timestamp) {
      window.requestAnimationFrame(self.loop);
      var old = null;
      if (old === null) {
        old = timestamp;
        return;
      }
      for (var obj in self.objects) {
        obj.onDraw(ctx, timestamp - old);
        obj.onTick(ctx, timestamp - old);
      }
      old = timestamp;

    }
  }
});


