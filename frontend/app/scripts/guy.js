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


guyModule.factory('moveStates', function(){

  return {
    idle: {
      right: function(sender){
        sender.transitionTo('moving', 'right');
      }
    },
    right: {
      onEnter: function(sender){
        sender.acc.x += sender.acc.factor * 1;
        var counter = 0;
        function x(){
          var target = counter % 2 ? runRight1 : runRight2;
          counter +=1;
          sender.animate(target).then(x);
        }
        x();
      },

      onExit: function(sender){
        sender.acc.x -= sender.acc.factor * 1;
      },

      release_right: function(sender){
        sender.transitionTo('moving', 'idle');
      }
    },

    left: {
      onEnter: function(sender){
        sender.acc.x -= sender.acc.factor * 1;
      },
      onExit: function(sender){
        sender.acc.x += sender.acc.factor * 1;
      },
      release_left: function(sender){
        sender.transitionTo('moving', 'idle');
      }
    }


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

guyModule.factory('states', function(moveStates, hpStates){

  return {
    moving: moveStates,
    hp: hpStates
  };

});



guyModule.factory('Guy', function($q, states, $timeout){

  return function Guy(){
    var self = this;

    self.hp = 100;
    self.x = 200;
    self.y = 200;
    self.acc = {
      factor: 0.01,
      x: 0,
      y: 0
    };

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
        current.length = previous.length * (1 - self.animDone) + target.length * self.animDone;
        current.angle = previous.angle * (1 - self.animDone) + target.angle * self.animDone;

        if (current.children){
          animInternal(current.children, previous.children, target.children, animDone);
        }

      });
    }

    function doAnimate(delta){
      
      self.animDone += delta / 500;

      animInternal(self.currentAnim, self.previousAnim, self.targetAnim, self.animDone);
      
      if (self.animDone >= 1){
        self.currentAnim = self.targetAnim;
        self.previousAnim = self.targetAnim;
        self.animDone = 0;
        if (self.animDfd){
          self.animDfd.resolve();
        }
      }

    }

    self.animate = function(targetAnim){
      self.animDfd = $q.defer();
      self.targetAnim = targetAnim;
      return self.animDfd.promise;
    };

    self.states = {
      moving: states.moving.idle,
      hp: states.hp.normal
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
    self.onTick = function(ctx, timedelta){
      self.x += timedelta * self.acc.x;
      doAnimate(timedelta);

    };

    self.onDraw = function(ctx, timedelta){
      function doDraw(points, x, y, angle){
        points.forEach(function(point){
          var drawAngle = angle + point.angle;
          var newX = x + Math.cos(drawAngle) * point.length * 20;
          var newY = y + Math.sin(drawAngle) * point.length * 20;

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
    };
  };

});
