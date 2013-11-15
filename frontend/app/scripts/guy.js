'use strict';


var guyModule = angular.module('guy', []);


guyModule.factory('moveStates', function(){

  return {
    idle: {}
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



guyModule.factory('Guy', function($q, states){

  return function Guy(){
    var self = this;

    self.hp = 100;
    self.x = 0;
    self.y = 0;


    self.states = {
      moving: states.moving.idle,
      hp: states.hp.normal
    };

    self.onMessage = function(msg){
      var command = msg.type;
      self.states.keys().forEach(function(k){
        var state = self.states[k];
        if (state[command]){
          state[command](self, msg);
        }
      });
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
        currentState.onExit(self).then(enterNewState);
      } else {
        enterNewState();
      }
      
    };
    self.onTick = function(ctx, timedelta){};

    self.onDraw = function(ctx, timedelta){
      ctx.fillRect(self.x, self.y, 10, 10);
    };
  };

});