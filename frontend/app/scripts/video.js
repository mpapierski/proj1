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
        },
        {
          keys: 'w',
          prevent_repeat: true,
          on_keydown: function() {
            player.onMessage({
              type: 'up'
            });
          },
          on_keyup: function(){
            player.onMessage({
              type: 'release_up'
            });
          }
        },
        {
          keys: 's',
          prevent_repeat: true,
          on_keydown: function() {
            player.onMessage({
              type: 'down'
            });
          },
          on_keyup: function(){
            player.onMessage({
              type: 'release_down'
            });
          }
        },
      ];

    
      keypress.register_many(keys);
    }
  };


});

video.directive('screen', function(keyboard, engine, Guy, $document){

  return {
    replace: true,
    template: '<canvas width="640" height="480"></canvas>',
    link: function(scope, element, atrts){
      scope.position = {
        x: 0
      };

      element.bind('mousedown', function(evt){
        scope.player.weapon.x = evt.clientX;
        scope.player.weapon.y = evt.clientY;
        scope.player.onMessage({
          type: 'fire'
        });

        element.bind('mousemove', function(evt){
          scope.player.weapon.x = evt.clientX;
          scope.player.weapon.y = evt.clientY;
        });

        $document.bind('mouseup', function(evt){
          scope.player.onMessage({
            type: 'stopFiring'
          });
          element.unbind('mousemove');
          $document.unbind('mouseup');
        });

      });
      
      var canvas = element[0];
      var e = new engine();
      e.init(canvas);
      scope.player = new Guy(e);
      // scope.player.x = scope.player.y = 0;
      scope.player2 = new Guy();
      scope.player2.x = 400;
      var origin = scope.player.onTick;
      scope.player.onTick = function(ctx, delta) {
        e.background.acc = 2;
        if (scope.player.acc.x == 0)
        {
          e.background.direction = null;
        }
        else if (scope.player.x > 640 - 48)
        {
          e.background.moveRight();
        }
        else if (scope.player.x < 48)
        {
          e.background.moveLeft();
        }
        origin(ctx, delta);
      };
      keyboard.init(scope.player);
      e.objects.push(scope.player);
      e.objects.push(scope.player2);
    }
  };
});