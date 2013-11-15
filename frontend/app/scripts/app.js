'use strict';



var app = angular.module('app', [
  'ngResource',
  'ui.router',
  'video',
  'rtc'
]);


var MainCtrl = function($scope, server, client, $http, $state){
  server($scope);

  $scope.connect = function(){
    $scope.$broadcast('connect');
  };

};

var ClientCtrl = function($scope, client, $http){
  client($scope);
};

app.config(function($stateProvider){
  $stateProvider.state('index',{
    url: '',
    controller: MainCtrl,
    template: '<div>main     <a ng-click="connect()">połącz</a>   </div>'
  });

  $stateProvider.state('client',{
    url: '/client',
    controller: ClientCtrl,
    template: '<div>client</div>'
  });
    $stateProvider.state('game',{
    url: '/game',
    controller: 'GameCtrl',
    template: '<canvas screen></canvas>'
  });
});


