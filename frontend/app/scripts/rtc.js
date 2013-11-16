'use strict';
var rtc = angular.module('rtc', []);




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



rtc.factory('client', function(){
  return function createClient(scope) {
      var answerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels);
      var answererDataChannel = answerer.createDataChannel('RTCDataChannel', {
          reliable: false
      });
      window.channel = answererDataChannel;
      var ws = new WebSocket('ws://127.0.0.1:5001');


      ws.onmessage = function(msg){
        var data = JSON.parse(msg.data);
        
        if (data.type === 'sd'){
          var sdp = new RTCSessionDescription(data.data);

          answerer.setRemoteDescription(sdp);
          answerer.createAnswer(function (sessionDescription) {
              answerer.setLocalDescription(sessionDescription);
              ws.send(JSON.stringify({
                type: 'sd',
                data: {
                  type: sessionDescription.type,
                  sdp: sessionDescription.sdp
                }
              }));
          }, null, mediaConstraints); 
        }
        if (data.type === 'ice'){
          answerer.addIceCandidate(new RTCIceCandidate(data.data));
        }
      };

      
      answererDataChannel.onopen = function(){
        console.log('open');
        scope.channel = answererDataChannel;
        scope.$apply();
      }
      
      answerer.onicecandidate = function (event) {
          if (!event || !event.candidate) return;
          ws.send(JSON.stringify({
            type: 'ice',
            data: {
              sdpMLineIndex:  event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid,
              candidate: event.candidate.candidate
            }
          }));
      };

  }


});




rtc.factory('server', function(){



  return function createServer(scope){
    var ws = new WebSocket('ws://127.0.0.1:5001');
    var serverScope = scope.$new();
    var server = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels);

    var serverDataChannel = server.createDataChannel('RTCDataChannel', {
      reliable: false
    });
    
    ws.onmessage = function(msg){
        var data = JSON.parse(msg.data);
        if (data.type === 'sd'){
          var sdp = new RTCSessionDescription(data.data);
          server.setRemoteDescription(sdp);
        }
        if (data.type === 'ice'){
          server.addIceCandidate(new RTCIceCandidate(data.data));
        }
    };

    serverDataChannel.onopen = function(){
      scope.channel = serverDataChannel;
      scope.$apply();
    }


    server.onicecandidate = function (event) {
      if (!event || !event.candidate){
        return;
      }
      ws.send(JSON.stringify({
        type: 'ice',
        data: {
          sdpMLineIndex:  event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        }
      }));
    };


    scope.$on('connect', function(){

      server.createOffer(function (sessionDescription) {
        server.setLocalDescription(sessionDescription);
        ws.send(JSON.stringify({
          type: 'sd',
          data: {
            type: sessionDescription.type,
            sdp: sessionDescription.sdp
          }
        }));
      }, null, mediaConstraints);

    });

  };

});
