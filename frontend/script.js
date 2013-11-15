/* global console */
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





function createServer(){

    var offerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels),
        answerer, answererDataChannel;

    var offererDataChannel = offerer.createDataChannel('RTCDataChannel', {
        reliable: false
    });
    setChannelEvents(offererDataChannel, 'offerer');

    offerer.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        console.log('onicecandidate', event.candidate);
        // clientAddIceCandidate({
        //     sdpMLineIndex:  event.candidate.sdpMLineIndex,
        //     sdpMid: event.candidate.sdpMid,
        //     candidate: event.candidate.candidate
        // });
    };

    offerer.createOffer(function (sessionDescription) {
        offerer.setLocalDescription(sessionDescription);

        // createAnswer(sessionDescription.sdp);
    }, null, mediaConstraints);

}
