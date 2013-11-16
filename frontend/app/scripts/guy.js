'use strict';
var idlePoints = [
  { // chest
    name: 'idle',
    angle: 0,
    length: 0,
    children: [
      {
        name: 'neck',
        angle: Math.PI,
        length: 1.5,
        children: [
        ]
      },
      { // head
        name: 'body',
        angle: 0,
        length: 6,
        children: [
          {
            name: 'right leg',
            angle: Math.PI * 0.2,
            length: 5,
            children: [
              {
                angle: -Math.PI*0.2,
                length: 3
              }
            ]
          },
          {
            name: 'left leg',
            angle: -Math.PI * 0.2,
            length: 5,
            children: [
              {
                angle: Math.PI*0.2,
                length: 3
              }
            ]
          }
        ]
      },
      { // left arm
        name: 'left arm',
        angle: Math.PI * 0.5,
        length: 5,
        children: [
          {
            name: 'right hand',
            angle: -Math.PI * 0.7,
            length: 5
          }
        ]
      },
      { // right arm
        name: 'right arm',
        angle: -Math.PI * 0.5,
        length: 5,
        children: [
          {
            name: 'right hand',
            angle: Math.PI * 0.7,
            length: 5
          }
        ]
      }
    ]
  }
];


var runRight1 = [
  { // chest
    name: 'runright1',
    angle: 0,
    length: 0,
    children: [
      {
        name: 'neck',
        angle: Math.PI,
        length: 1.5,
        children: [
          { // head
            name: 'head',
            angle: Math.PI * 0.1,
            length: 2
          },
        ]
      },
      { // head
        name: 'body',
        angle: 0,
        length: 6,
        children: [
          {
            name: 'right leg',
            angle: -Math.PI * 0.2,
            length: 5,
            children: [
              {
                angle: -Math.PI*0.2,
                length: 3
              }
            ]
          },
          {
            name: 'left leg',
            angle: Math.PI * 0.2,
            length: 5,
            children: [
              {
                angle: Math.PI*0.2,
                length: 3
              }
            ]
          }
        ]
      },
      { // left arm
        name: 'left arm',
        angle: Math.PI * 0.5,
        length: 5,
        children: [
          {
            name: 'right hand',
            angle: -Math.PI * 0.7,
            length: 5
          }
        ]
      },
      { // right arm
        name: 'right arm',
        angle: -Math.PI * 0.5,
        length: 5,
        children: [
          {
            name: 'right hand',
            angle: Math.PI * 0.7,
            length: 5
          }
        ]
      }
    ]
  }
];
var runRight2 = [
  { // chest
    name: 'runright2',
    angle: 0,
    length: 0,
    children: [
      {
        name: 'neck',
        angle: Math.PI,
        length: 1.5,
        children: [
          { // head
            name: 'head',
            angle: -Math.PI * 0.1,
            length: 2
          },
        ]
      },
      { // head
        name: 'body',
        angle: 0,
        length: 6,
        children: [
          {
            name: 'right leg',
            angle: Math.PI * 0.2,
            length: 5,
            children: [
              {
                angle: -Math.PI*0.2,
                length: 3
              }
            ]
          },
          {
            name: 'left leg',
            angle: -Math.PI * 0.2,
            length: 5,
            children: [
              {
                angle: Math.PI*0.2,
                length: 3
              }
            ]
          }
        ]
      },
      { // left arm
        name: 'left arm',
        angle: Math.PI * 0.5,
        length: 5,
        children: [
          {
            name: 'right hand',
            angle: -Math.PI * 0.7,
            length: 5
          }
        ]
      },
      { // right arm
        name: 'right arm',
        angle: -Math.PI * 0.5,
        length: 5,
        children: [
          {
            name: 'right hand',
            angle: Math.PI * 0.7,
            length: 5
          }
        ]
      }
    ]
  }
];


// jshint camelcase: false
'use strict';


var guyModule = angular.module('guy', []);


function alternatingAnimation(sender, a1, a2, delay){
  var doRepeat = true;
  var counter = 0;
  function scheduleAnimation(){
    if (!doRepeat){
      return;
    }
    var target = counter % 2 ? a2 : a1;
    counter +=1;
    sender.animate(target, delay).then(scheduleAnimation);
  }
  scheduleAnimation();
  return function cancelAlternatingAnimation(){
    doRepeat = false;
    sender.stopAnimation();
  };
}

function updateMovingAnimation(guy){
  if (guy._cancelMoving){
    guy._cancelMoving();
  }
  var a1, a2;
  if (guy.acc.x === 0 && guy.acc.y === 0){
    return;
  }

  if (Math.abs(guy.acc.x) > Math.abs(guy.acc.y)){
    if (guy.acc.x > 0){
      a1 = runRight1;
      a2 = runRight2;
    } else {
      a1 = runRight1;
      a2 = runRight2;
    }
  } else {
    if (guy.acc.y > 0){
      a1 = runRight1;
      a2 = runRight2;
    } else {
      a1 = runRight1;
      a2 = runRight2;
    }
  }
  guy._cancelMoving = alternatingAnimation(guy, a1, a2, 500);
}


guyModule.factory('moveStates', function(){
  var MoveStateBase = function(){
    this.right = function(sender){
      sender.transitionTo('moving', 'right');
      updateMovingAnimation(sender);
    };
    this.left = function(sender){
      sender.transitionTo('moving', 'left');
      updateMovingAnimation(sender);
    };
    this.up = function(sender){
      sender.transitionTo('moving', 'up');
      updateMovingAnimation(sender);
    };
    this.down = function(sender){
      sender.transitionTo('moving', 'down');
      updateMovingAnimation(sender);
    };
    this.release_up = function(sender){
      sender.acc.y += sender.acc.factor * 1;
      updateMovingAnimation(sender);
    };
    this.release_down = function(sender){
      sender.acc.y -= sender.acc.factor * 1;
      updateMovingAnimation(sender);
    };
    this.release_left = function(sender){
      sender.acc.x += sender.acc.factor * 1;
      updateMovingAnimation(sender);
    };
    this.release_right = function(sender){
      sender.acc.x -= sender.acc.factor * 1;
      updateMovingAnimation(sender);
    };
  };

  var idle = new MoveStateBase();
  var right = angular.extend({
      onEnter: function(sender){
        sender.acc.x += sender.acc.factor * 1;
        updateMovingAnimation(sender);
      },

      onExit: function(sender){
      }

    }, new MoveStateBase());

  var left = angular.extend({
      onEnter: function(sender){
        sender.acc.x -= sender.acc.factor * 1;
        updateMovingAnimation(sender);
      },

      onExit: function(sender){
      }
    }, new MoveStateBase());

  var up = angular.extend({
      onEnter: function(sender){
        sender.acc.y -= sender.acc.factor * 1;
        updateMovingAnimation(sender);
      },
      onExit: function(sender){
      }
    }, new MoveStateBase());

  var down = angular.extend({
      onEnter: function(sender){
        sender.acc.y += sender.acc.factor * 1;
        updateMovingAnimation(sender);
      },
      onExit: function(sender){
      }
    }, new MoveStateBase());

  return {
      idle: idle,
      right: right,
      left: left,
      up: up,
      down: down
    };


});

guyModule.factory('hpStates', function(){

  return {
    normal: {
      hit: function(guy, message){
        var dmg = message.power;
        guy.hp -= dmg;
      }
    }
  };

});

guyModule.factory('weaponStates', function($timeout){

  return {
    idle: {
      fire: function(sender){
        sender.transitionTo('weapon', 'firing');
      }
    },
    firing: {
      onEnter: function(sender){
        sender._firing = true;
        function setFiringTimeout(){
          if(sender._firing){
            sender.doFire();
            $timeout(setFiringTimeout, sender.weapon.delay);
          }
        }
        setFiringTimeout();
      },
      stopFiring: function(sender){
        sender.transitionTo('weapon', 'idle');
        delete sender._firing;
      }
    }
  };

});


guyModule.factory('states', function(moveStates, hpStates, weaponStates){

  return {
    moving: moveStates,
    hp: hpStates,
    weapon: weaponStates
  };

});



guyModule.factory('Guy', function($q, states, $timeout){

  return function Guy(game){
    var self = this;
    self.hp = 100;
    self.states = {
      moving: states.moving.idle,
      hp: states.hp.normal,
      weapon: states.weapon.idle
    };
    self.x = 200;
    self.size = 3;
    self.y = 200;
    self.mouthSize = 10;

    self.acc = {
      factor: 0.1,
      x: 0,
      y: 0
    };

    self.weapon = {
      delay: 100,
      x: 100,
      y: 100
    };

    self.animLength = 500;
    self.currentAnim = angular.copy(idlePoints);
    self.previousAnim = idlePoints;
    self.targetAnim = idlePoints;
    self.animDone = 0;
    self.animDfd = null;

    function animInternal(currentAnim, previousAnim, targetAnim, animDone){
      _.each(_.zip(currentAnim, previousAnim, targetAnim), function(objs){
        var current = objs[0];
        var previous = objs[1];
        var target = objs[2];
        if (!previous || !target) {
          return;
        }
        current.length = previous.length * (1 - self.animDone) + target.length * self.animDone;
        current.angle = previous.angle * (1 - self.animDone) + target.angle * self.animDone;

        if (current.children){
          animInternal(current.children, previous.children, target.children, animDone);
        }

      });
    }

    function doAnimate(delta){
      
      self.animDone += delta / self.animLength;

      animInternal(self.currentAnim, self.previousAnim, self.targetAnim, self.animDone);
      
      if (self.animDone >= 1){
        self.animDone = 0;
        if (self.animDfd){
          self.animDfd.resolve();
        }
      }

    }

    self.animate = function(targetAnim, animLength){
      self.previousAnim = self.currentAnim;
      self.animLength = animLength || 500;
      self.animDfd = $q.defer();
      self.targetAnim = targetAnim;
      return self.animDfd.promise;
    };

    self.stopAnimation = function(){
      self.targetAnim = self.currentAnim;
      self.animDone = 0;
      self.animDfd.resolve();
    };


    self.onMessage = function(msg){
      var k;
      var command = msg.type;
      for (k in self.states){
        var state = self.states[k];
        if (state[command]){
          state[command](self, msg);
        }
      }
    };

    self.transitionTo = function(kind, stateName){
      function enterNewState (){
        var newState = states[kind][stateName];
        self.states[kind] = newState;
        if (newState.onEnter){
          newState.onEnter(self);
        }
      }

      var currentState = self.states[kind];
      if (currentState.onExit){
        $q.when(currentState.onExit(self)).then(enterNewState);
      } else {
        enterNewState();
      }
      
    };

    self.doFire = function(){
      game.fireBullet(self, self.weapon);
    };

    self.onTick = function(ctx, timedelta){
      self.x += timedelta * self.acc.x;
      if (self.x > 640 - 48) self.x = 640 - 48;
      self.y += timedelta * self.acc.y
      if (self.y > 480 - 48) self.y = 480 - 48;
      doAnimate(timedelta);
    };

    self.onDraw = function(ctx, timedelta){
      function doDraw(points, x, y, angle){
        points.forEach(function(point){
          var drawAngle = angle + point.angle;
          var newX = x + Math.cos(drawAngle) * point.length * self.size;
          var newY = y + Math.sin(drawAngle) * point.length * self.size;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(newX, newY);
          ctx.stroke();

          if (point.children){
            doDraw(point.children, newX, newY, drawAngle);
          }
        });
        
      }
      doDraw(self.currentAnim, self.x, self.y, Math.PI*0.5);
      
      // hardcoded head 
      ctx.beginPath();
      ctx.arc(self.x, self.y - 15, 10, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.beginPath();
      
      ctx.arc(self.x - 4, self.y - 16, 2, 0, 2 * Math.PI, false); // left eye
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(self.x + 4, self.y - 16, 2, 0, 2 * Math.PI, false); // right eye
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(self.x, self.y - 12, 3, 0, 1 * Math.PI, false); // smile
      ctx.stroke();
    };
  };

});
