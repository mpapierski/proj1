'use strict';


function Block(){
  var self = this;
  self.x = Math.random() * 600;
  self.y = Math.random() * 400;
  self.w = 30;
  self.h = 40;
  this.onDraw = function(ctx, timedelta){
    if (self.life <= 0){
      return;
    }

    ctx.fillRect(self.x, self.y, self.w, self.h);
    ctx.stroke();
  };

  this.onTick = function(ctx, timedelta){
    if (self.life <= 0){
      return;
    }
    self.life -= timedelta;

  };
  this.onMessage = function(){};

}

function spawnBullets(count){
  var rv = [];
  var i;
  for (i = 0; i <= count; i++){
    rv.push(new Bullet());
  }
  return rv;

}



function spawnStatics(count){
  var rv = [];
  var i;
  for (i = 0; i <= count; i++){
    rv.push(new Block());
  }
  return rv;
}


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
    var statics = [];
    $scope.engine.statics.forEach(function(s){
      statics.push({
        x: s.x,
        w: s.w,
        h: s.h,
        y: s.y
      });
    });
    channel.send(JSON.stringify({
      data: 'connected', 
      x: $scope.player.x,
      y: $scope.player.y,
      statics: statics
    }));
    channel.onmessage = function(msg){
      msg = JSON.parse(msg.data);
      if (msg.data === 'connected'){
        $scope.enemy = new Guy($scope.engine);
        $scope.enemy.x = msg.x;
        $scope.enemy.y = msg.y;
        $scope.engine.objects.push($scope.enemy);
        msg.statics.forEach(function(s){
          var b = new Block();
          b.x = s.x;
          b.y = s.y;
          b.h= s.h;
          b.w = s.w;
          $scope.engine.statics.push(b);
        });
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
    if (!$scope.channel){
      return;
    }
    $scope.channel.send(JSON.stringify({
      data: 'event',
      msg: data
    }));
  });

  $scope.$on('move', function(evt, data){
    if (!$scope.channel){
      return;
    }
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

  $scope.$watch('engine', function(e){
    e.statics = spawnStatics(10);
  });

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
    template: '<div>HP: {{ player.hp }} <canvas screen></canvas></div>'
  });

});
