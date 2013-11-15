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



var points = [
  { // chest
    name: 'chest',
    angle: 0,
    length: 0,
    children: [
      { // head
        name: 'head',
        angle: 0,
        length: 3
      },
      { // left arm
        name: 'left arm',
        angle: Math.PI * 0.5,
        length: 5
      },
      { // right arm
        name: 'right arm',
        angle: -Math.PI * 0.5,
        length: 5
      }
    ]
  }
];

((points, 5, 5))

guyModule.factory('Guy', function($q, states){

  return function Guy(){
    var self = this;

    self.hp = 100;
    self.x = 0;
    self.y = 0;
    self.acc = {
      factor: 0.01,
      x: 0,
      y: 0
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
    };

    self.onDraw = function(ctx, timedelta){
      function doDraw(points, x, y){
        points.forEach(function(point){
          var newX = Math.cos(point.angle) * point.length * 20;
          var newY = Math.sin(point.angle) * point.length * 20;

          ctx.moveTo(x, y);
          ctx.beginPath();
          ctx.lineTo(newX, newY);
          ctx.closePath();
          

          if (point.children){
            doDraw(point.children, newX, newY);
          }
        });
      }
      ctx.stroke();
      doDraw(points, 10, 10);
    };
  };

});