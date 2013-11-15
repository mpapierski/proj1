var engine = angular.module('engine', []);

engine.factory('engine', function() {
  return function() {

    var self = this;
    self.objects = [];
    self.el = null; // canvas dom

    self.init = function(e) {
      self.el = e;

      self.ctx = e.getContext('2d');
      window.requestAnimationFrame(self.loop);
      console.log('jestem')
    }
    
    var old = null;
    self.loop = function(timestamp) {
      window.requestAnimationFrame(self.loop);
      if (old === null) {
        old = timestamp;
        return;
      }
      self.objects.forEach(function(obj){
        obj.onDraw(self.ctx, timestamp - old);
        obj.onTick(self.ctx, timestamp - old);
      });
      old = timestamp;

    }
  }
});


