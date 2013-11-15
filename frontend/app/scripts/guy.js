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



var idlePoints = [
  { // chest
    name: 'chest',
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
            angle: Math.PI * 1.7,
            length: 5,
            children: [
              {
                angle: Math.PI*0.2,
                length: 3
              }
            ]
          },
          {
            name: 'left leg',
            angle: -Math.PI * 1.7,
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

var points2 = [
  { // chest
    name: 'chest',
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
            angle: Math.PI * 1.7,
            length: 5,
            children: [
              {
                angle: Math.PI*0.2,
                length: 3
              }
            ]
          },
          {
            name: 'left leg',
            angle: -Math.PI * 1.7,
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
            angle: Math.PI * 1.7,
            length: 5
          }
        ]
      }
    ]
  }
];

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
    self.targetAnim = points2;
    self.animDone = 0;
    function doAnimate(delta){
      self.animDone += delta / 500;
      function internal(currentAnim, previousAnim, targetAnim){
        _.each(_.zip(currentAnim, previousAnim, targetAnim), function(objs){
          var current = objs[0];
          var previous = objs[1];
          var target = objs[2];
          current.length = previous.length * (1 - self.animDone) + target.length * self.animDone;
          current.angle = previous.angle * (1 - self.animDone) + target.angle * self.animDone;
          if (current.children){
            internal(current.children, previous.children, target.children);
          }
        });
      }

      
      internal(self.currentAnim, self.previousAnim, self.targetAnim);
      if (self.animDone >= 500){
        self.currentAnim = self.targetAnim;
        self.previousAnim = self.targetAnim;
      }
    }

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
          // doAnimate(timedelta);

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
