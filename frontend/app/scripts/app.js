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
  'video'
]);


app.factory('client', function(){


  return function createAnswer(sdpString) {

      var sdp = new RTCSessionDescription({
          type: 'offer',
          sdp: sdpString
      });

      answerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels);
      answererDataChannel = answerer.createDataChannel('RTCDataChannel', {
          reliable: false
      });

      setChannelEvents(answererDataChannel, 'answerer');

      answerer.onicecandidate = function (event) {
          if (!event || !event.candidate) return;
              serverAddIceCandidate({
                  sdpMLineIndex:  event.candidate.sdpMLineIndex,
                  sdpMid: event.candidate.sdpMid,
                  candidate: event.candidate.candidate
              });
      };

      answerer.setRemoteDescription(sdp);
      answerer.createAnswer(function (sessionDescription) {
          answerer.setLocalDescription(sessionDescription);
          serverSetRemoteSd(sessionDescription);
      }, null, mediaConstraints);
  }


});




app.factory('server', function(){



  return function createServer(scope){
    var serverScope = scope.$new();
    var server = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels);

    var serverDataChannel = server.createDataChannel('RTCDataChannel', {
      reliable: false
    });
    

    server.onicecandidate = function (event) {
      if (!event || !event.candidate){
        return;
      }
      console.log('onicecandidate', event.candidate);
      
      serverScope.$emit('ice', {
        sdpMLineIndex:  event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    };

    server.createOffer(function (sessionDescription) {
      server.setLocalDescription(sessionDescription);
      serverScope.$emit('sd',  {
        type: sessionDescription.type,
        sdp: sessionDescription.sdp
      });
    }, null, mediaConstraints);

    return serverDataChannel;
  };

});




var MainCtrl = function($scope, server, client){
  $scope.rtcdata = {
    ice: [],
    sdp: {}
  };
  $scope.client = null;


  var serverChannel = server($scope);


  $scope.$on('ice', function(evt, ice){
    $scope.rtcdata.ice.push(ice);
    $scope.$apply();
  });

  
  $scope.$on('sd', function(evt, sdp){

    $scope.rtcdata.sdp = sdp;
    $scope.$apply();
  });

  setChannelEvents(serverChannel, 'server');
};




app.config(function($stateProvider){
  $stateProvider.state('index',{
    url: '',
    controller: 'GameCtrl',
    templateUrl: '/fragments/screen.html'
  });
});


