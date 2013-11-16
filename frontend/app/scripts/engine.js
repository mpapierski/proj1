'use strict';

var engine = angular.module('engine', ['background']);

function Bullet(){
  var self = this;
  this.life = 0;
  self.sx = self.sy = self.dx = self.dy = 0;
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

    self.init = function(el) {
      self.el = el;
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


    self.fireBullet = function(source, aim){
      var bullet = chooseBullet();
      bullet.life = 1000;
      bullet.sx = source.x;
      bullet.sy = source.y;
      bullet.dx = aim.x;
      bullet.dy = aim.y;
    };

  }
});
