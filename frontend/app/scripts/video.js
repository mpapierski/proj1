/* global keypress */
var video = angular.module('video', ['engine', 'guy']);

video.controller('GameCtrl', function(){
    console.log('game');
});


video.factory('keyboard', function(){




  return {
    init: function(scope){
      keypress.combo('d', function() {
        scope.position.x += 1;
        scope.$apply();
      });



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
      e.objects.push(scope.player);
    }
  };
});