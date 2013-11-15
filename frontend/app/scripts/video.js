/* global keypress */
'use strict';


var video = angular.module('video', ['engine', 'guy']);

video.controller('GameCtrl', function(){
  console.log('game');
});

// jshint camelcase: false
// keypress.js api
video.factory('keyboard', function(){


  return {
    init: function(player){

      var keys = [
        {
          keys: 'd',
          prevent_repeat: true,
          on_keydown: function() {
            player.onMessage({
              type: 'right'
            });
          },
          on_keyup: function(){
            player.onMessage({
              type: 'release_right'
            });
          }
        },
        {
          keys: 'a',
          prevent_repeat: true,
          on_keydown: function() {
            player.onMessage({
              type: 'left'
            });
          },
          on_keyup: function(){
            player.onMessage({
              type: 'release_left'
            });
          }
        }
      ];

    
      keypress.register_many(keys);
    }
  };


});

video.directive('screen', function(keyboard, engine, Guy){

  return {
    replace: true,
    template: '<canvas></canvas>',
    link: function(scope, element, atrts){
      scope.position = {
        x: 0
      };
      var canvas = element[0];
      var e = new engine();
      e.init(canvas);
      scope.player = new Guy();
      keyboard.init(scope.player);
      e.objects.push(scope.player);
    }
  };
});