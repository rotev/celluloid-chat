define(function(require, exports, module) {
  
  return function() {
    var SocketKlass = "MozWebSocket" in window ? MozWebSocket : WebSocket,
        ws = new SocketKlass('ws://' + window.location.host + '/timeinfo'),
        chatElem = $('#chat'),
        msgCounter = 0,
        user = 'user' + Math.ceil(Math.random() * 10);

    ws.onmessage = function(msg){
      var data = JSON.parse(msg.data),
          html = null;
      
      switch(data.action) {
        case 'message':
          html = '<div class="action-message"><strong>' + data.user + '</strong> ' + data.message + '</div>';
          break;

        case 'left':
          html = '<div class="action-left"><strong>' + data.user + '</strong> has left.</div>';
          break;

        case 'joined':
          html = '<div class="action-join"><strong>' + data.user + '</strong> joined.</div>';
          break;
      }

      if (html) {
        chatElem
          .append(html + '<br>\n')
          .scrollTop(document.getElementById('chat').scrollHeight);
      }
    }

    $('h1').html('Chat ' + user);

    ws.onopen = function(event) {
      var payload = {
        action: 'join',
        user: user
      };
      ws.send(JSON.stringify(payload));

      setInterval(function() {
        var payload = {
          action: 'message',
          user: user,
          message: (msgCounter++).toString()
        };
        ws.send(JSON.stringify(payload));
      }, 5000);
    }

  }

});