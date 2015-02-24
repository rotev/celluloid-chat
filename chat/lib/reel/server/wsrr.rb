require 'reel'

module Reel
  class Server

    # WebSockets with Request-Response protocol
    # 
    # An HTTP based web server with support for a simple WebSockets Request/Response
    # protocol. It also abstracts away the need to distinguish between normal HTTP requests,
    # WebSocket connection initiations, WebSocket requests and plain WebSocket messages.
    #
    # Sample request:
    # {
    #   protocol: "request-response",
    #   responseId: "6c2cbb5c-bba8-11e4-8dfc-aa07a5b093db",
    #   data: {...}
    # }
    # 
    # Sample response:
    # {
    #   protocol: "request-response",
    #   responseId: "6c2cbb5c-bba8-11e4-8dfc-aa07a5b093db",
    #   responseStatus: "ok",
    #   data: {...}
    # }
    # 
    class WSRR < Reel::Server::HTTP

      def initialize(host, port)
        super(host, port, &method(:on_connection))
      end

      private

      def on_connection(connection)
        while request = connection.request
          if request.websocket?

            # Detach connection in order to allow it to be handled by another actor (Client).
            connection.detach 

            # WS connections are handled asynchronically using Celluloid::IO reactor pattern 
            # implementation. This ensures the server doesn't block while waiting for a read.
            async.handle_ws_connection(request.websocket)
            return
          else
            handle_http_request(connection, request)
          end
        end
      end

      # Override this method if you want to handle HTTP requests yourself.
      def handle_http_request(connection, request)
        connection.respond :ok, "Good!"
      end

      def handle_ws_connection(socket)
        # Continously read from the socket.
        while message = JSON.parse(socket.read)

          # when a message is received, determine if it's a request-response
          # or a regular message.
          # 
          # request-response
          if message['protocol'] && message['protocol'] == 'request-response'

            # let handle_ws_request determine the response and then send it.
            handle_ws_request(message, socket) do |response, status|

              # wrap response with headers and send it.
              socket << JSON.generate({
                  protocol: 'request-response',
                  responseId: message['requestId'],
                  status: status,
                  data: response
                })
            end

          # regular message
          else
            handle_ws_message(message, socket)
          end
        end
      rescue IOError
        handle_ws_disconnection(socket)
      end

      def handle_ws_disconnection(socket); end;
      def handle_ws_request(request, socket); end;
      def handle_ws_message(socket); end;

    end
  end
end