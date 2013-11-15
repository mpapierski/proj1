/* global keypress */
var video = angular.module('video', []);

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


video.directive('screen', function(keyboard){

  return {
    replace: true,
    template: '<canvas></canvas>',
    link: function(scope, element, atrts){
      scope.position = {
        x: 0
      };
      var canvas = element[0];
      var ctx = canvas.getContext('2d');
      
      keyboard.init(scope);
      scope.$watch('position.x', function(){
        console.log('asd');
        canvas.width = canvas.width;
        ctx.fillRect(scope.position.x, 20, 100, 100);
    
      });
    }
  };
});