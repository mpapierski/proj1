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
    channel.send(JSON.stringify({
      data: 'connected', 
      x: $scope.player.x,
      y: $scope.player.y,
    }));
    channel.onmessage = function(msg){
      msg = JSON.parse(msg.data);
      if (msg.data === 'connected'){
        $scope.enemy = new Guy($scope.engine);
        $scope.enemy.x = msg.x;
        $scope.enemy.y = msg.y;
        $scope.engine.objects.push($scope.enemy);
      }
      if (msg.data == 'event'){
        $scope.enemy.onMessage(msg.msg);
      }
      if (msg.data == 'move' && $scope.enemy){
        $scope.enemy.weapon.x = msg.msg.x;
        $scope.enemy.weapon.y = msg.msg.y;
      }
    }
  });
  $scope.$on('event', function(evt, data){
    $scope.channel.send(JSON.stringify({
      data: 'event',
      msg: data
    }));
  });
  $scope.$on('move', function(evt, data){
    $scope.channel.send(JSON.stringify({
      data: 'move',
      msg: data
    }));
  });

}
var ClientCtrl = function($scope, server, client, $http, $state, Guy){
  server($scope);
  var channel;
  $scope.$broadcast('connect');

  setupComm($scope, Guy);
};
var MainCtrl = function(){};

var ServerCtrl = function($scope, client, $http, Guy, $state, $interval){
  client($scope);
  var channel;
  setupComm($scope, Guy);

  var stop = $interval(function() {
    console.log('timeout')
    $http.post('/api/lobby/').success(function(data) {
      console.log('sent', data);
      $scope.online = data.online;
    });
  }, 1000);


  $scope.$watch('player.hp', function(hp){
    if (hp <= 0 && !$scope.dead){
      alert('you are dead');
      $scope.dead = true;
      $state.go('lobby');
    }
  })
};

app.config(function($stateProvider){
  $stateProvider.state('lobby',{
    url: '/',
    controller: MainCtrl,
    template: '<div></div>'
  });

  $stateProvider.state('game',{
    url: '/game',
    controller: ServerCtrl,
    template: '<div>HP: {{ player.hp }} Online: {{ online || 0 }}<canvas screen></canvas></div>'
  });

  $stateProvider.state('client',{
    url: '/client',
    controller: ClientCtrl,
    template: '<div><canvas screen></canvas></div>'
  });

});
