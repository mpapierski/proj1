'use strict';




var iceServers = {
    iceServers: [{
        url: 'stun:stun.l.google.com:19302'
    }]
};

var optionalRtpDataChannels = {
    optional: [{
        RtpDataChannels: true
    }]
};


var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    }
};



function setChannelEvents(channel, channelName) {
    channel.onmessage = function (event) {
        console.debug(channelName, 'received a message:', event.data);
    };

    channel.onopen = function () {
        console.debug('channel', channelName, 'open');
        channel.send('first text message over RTP data ports');
    };
    channel.onclose = function (e) {
        console.error(e);
    };
    channel.onerror = function (e) {
        console.error(e);
    };
}





var app = angular.module('app', [
  'ngResource',
  'ui.router',
  'video',
  'rtc'
]);





var MainCtrl = function($scope, server, client, $http, $state){
  $scope.rtcdata = {
    ice: [],
    sdp: {}
  };
  $scope.client = null;

  var serverChannel = server($scope);


  $scope.$on('ice', function(evt, ice){
    $scope.rtcdata.ice.push(ice);
    sendData();
    
    $scope.$apply();
  });

  function sendData(){
    $http({
      method: 'POST',
      url: '/',
      data: JSON.stringify($scope.rtcdata)
    }).success(function(data, status, headers, config) {
      console.log('wyslalem');
    });
  }
  $scope.$on('sd', function(evt, sdp){
    sendData();
    $scope.rtcdata.sdp = sdp;
    $scope.$apply();
  });

  setChannelEvents(serverChannel, 'server');
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
});


