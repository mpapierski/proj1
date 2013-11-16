'use strict';

var engine = angular.module('engine', ['background']);

function Bullet(){
  var self = this;
  this.life = 0;
  self.sx = self.sy = self.dx = self.dy = 0;

  this.setTarget = function(source, dest){
    self.life = 500;    
    self.sx = source.x;
    self.sy = source.y;
    self.dx = dest.x;
    self.dy = dest.y;
  }

  this.onDraw = function(ctx, timedelta){
    if (self.life <= 0){
      return;
    }
    ctx.beginPath();
    ctx.moveTo(self.sx, self.sy);

    ctx.lineTo(self.dx, self.dy);
    ctx.closePath();
    ctx.stroke();
  };

  this.onTick = function(ctx, timedelta){
    if (self.life <= 0){
      return;
    }
    self.life -= timedelta;

  };

}
function spawnBullets(count){
  var rv = [];
  var i;
  for (i = 0; i <= count; i++){
    rv.push(new Bullet());
  }
  return rv;

}
engine.factory('engine', function(background) {
  return function() {
    var self = this;
    self.backgrounds = [];
    self.objects = [];
    self.bullets = spawnBullets(100);
    self.el = null; // canvas dom
    self.createCanvas = function(width, height) {
      var canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      return canvas;
    };

    self.init = function(el, scope) {
      self.el = el;
      self.scope = scope;
      self.buffer = self.createCanvas(640, 480);
      self.backgroundCanvas = self.createCanvas(640, 480);

      self.backgroundCtx = self.backgroundCanvas.getContext('2d');
      self.ctx = self.el.getContext('2d');
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
      self.backgroundCanvas.width = self.backgroundCanvas.width;

      window.requestAnimationFrame(self.loop);
      if (old === null) {
        old = timestamp;
        return;
      }

      // draw bkgrnd
      self.bufferCtx.drawImage(self.background.canvas, self.background.drawOffX, 0);

      self.backgrounds.forEach(function(obj) {
        obj.onDraw(self.backgroundCtx, timestamp - old);
      });

      self.objects.forEach(function(obj) {
        obj.onDraw(self.bufferCtx, timestamp - old);
        obj.onTick(self.bufferCtx, timestamp - old);
      });

      self.bullets.forEach(function(obj) {
        obj.onDraw(self.bufferCtx, timestamp - old);
        obj.onTick(self.bufferCtx, timestamp - old);
      });

      self.background.onTick();
      old = timestamp;
      self.ctx.drawImage(self.backgroundCanvas, 0, 0);
      self.ctx.drawImage(self.buffer, 0, 0);

      old = timestamp;
    };



    function chooseBullet(){
      var chosenBullet;
      var i;
      for (i = 0; i <= self.bullets.length; i++){
        if (self.bullets[i].life <= 0) {
          chosenBullet = self.bullets[i];
          break;
        }
      }
      if (!chosenBullet){

        chosenBullet = new Bullet();
        self.bullets.append(chosenBullet);
      }
      return chosenBullet;
    }

    function chooseTarget(tan, source){
      var chosenTarget;
      var i, obj, targetTan;
      for (i = 0; i <= self.objects.length; i++){
        obj = self.objects[i];
        if (source === obj || !obj){
          continue
        }
        targetTan = Math.atan2(obj.y - source.y, obj.x - source.x);
        if (Math.abs(targetTan - tan) < 0.07){
          chosenTarget = obj;
          break;
        }
      }
      var dist = 10000;
      if (chosenTarget){
        dist = Math.sqrt(Math.pow(Math.abs(chosenTarget.x - source.x), 2) + Math.pow(Math.abs(chosenTarget.y - source.y), 2));
      }
      return  {
         x: source.x + Math.cos(tan) * dist,
         y: source.y + Math.sin(tan) * dist
       } 
    }

    self.fireBullet = function(source, aim){

      var bullet = chooseBullet();
      var tan = Math.atan2(aim.y - source.y, aim.x - source.x);
      var target = chooseTarget(tan, source);


      bullet.setTarget(source, target);

    };

  };
});
