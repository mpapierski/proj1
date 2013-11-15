'use strict';





var guyModule = angular.module('guy', []);

guyModule.factory('guy', function($q){

  var runningState = {
    onEnter: function(sender){

    },
    onExit: function(sender){

    }
  };

  var normalHpState = {
    onEnter: function(sender){

    },
    onExit: function(sender){

    },

    hit: function(guy, message){
      var dmg = message.power;
      guy.hp -= dmg;
    }
  };

  return function Guy(){
    var self = this;

    self.hp = 100;

    self.states = {
      moving: runningState,
      hp: normalHpState
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

    self.transitionTo = function(kind, state){
      var currentState = self.states[kind];
      currentState.onExit(self).then(function(){
        self.states[kind] = state;
        state.onEnter(self);
      });
    };
  };

});