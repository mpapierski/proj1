'use strict';



var app = angular.module('app', [
  'ngResource',
  'ui.router',
  'video',
  'rtc'
]);


function setupComm($scope, Guy){
  var channel;
  $scope.$watch('channel', function(newChannel){
    console.log('chan', newChannel);
    if (channel || !newChannel){
      return;
    }
    channel = newChannel;
    channel.send(JSON.stringify({data: 'connected'}));
    channel.onmessage = function(msg){
      msg = JSON.parse(msg.data);
      if (msg.data === 'connected'){
        $scope.enemy = new Guy($scope.e);
        $scope.enemy.x = 400;
        $scope.engine.objects.push($scope.enemy);
      }
      if (msg.data == 'keyboard'){
        $scope.enemy.onMessage({
          type: msg.type
        });
      }
    }
  });
  $scope.$on('keyboard', function(evt, data){
    $scope.channel.send(JSON.stringify({
      data: 'keyboard',
      type: 'right'
    }));
  })


}
var ClientCtrl = function($scope, server, client, $http, $state, Guy){
  server($scope);
  var channel;
  $scope.$broadcast('connect');

  setupComm($scope, Guy);
};

var MainCtrl = function($scope, client, $http, Guy){
  client($scope);
  var channel;
  setupComm($scope, Guy);


};

app.config(function($stateProvider){
  $stateProvider.state('index',{
    url: '/',
    controller: MainCtrl,
    template: '<div><canvas screen></canvas></div>'
  });

  $stateProvider.state('client',{
    url: '/client',
    controller: ClientCtrl,
    template: '<div><canvas screen></canvas></div>'
  });
    $stateProvider.state('game',{
    url: '/game',
    controller: 'GameCtrl',
    template: '<canvas screen></canvas>'
  });
});


