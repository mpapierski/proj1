var video = angular.module('video', []);

video.controller('GameCtrl', function(){
    console.log('game');
});


video.directive('screen', function(){

  return {
    replace: true,
    template: '<canvas></canvas>',
    link: function(scope, element, atrts){
      var ctx = element[0].getContext('2d');
      ctx.fillRect(20, 20, 100, 100);
    }
  };
});