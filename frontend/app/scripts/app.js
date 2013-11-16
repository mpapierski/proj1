'use strict';



var app = angular.module('app', [
  'ngResource',
  'ui.router',
  'video',
  'rtc'
]);


var ClientCtrl = function($scope, server, client, $http, $state){
  server($scope);
  var channel;
  $scope.$broadcast('connect');
  $scope.$watch('channel', function(newChannel){
    console.log('chan', newChannel);
    if (channel || !newChannel){
      return;
    }
    channel = newChannel;
    channel.send('connected');
    channel.onmessage = function(msg){
      console.log('msg', msg);
    }
  });

};

var MainCtrl = function($scope, client, $http){
  client($scope);
  var channel;

  $scope.$watch('channel', function(newChannel){
    console.log('chan', newChannel);
    if (channel || !newChannel){
      return;
    }
    channel = newChannel;
    channel.onmessage = function(msg){
      console.log('msg', msg);
    }
  });
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


