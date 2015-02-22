require 'reel'
require_relative 'client'
require_relative 'subscriber'

module Chat

  PUBLIC_PATH  = Pathname.new File.expand_path("../../public", __FILE__)

  class Server < Reel::Server::HTTP
    include Celluloid::Logger

    def initialize(host = ENV['HOST'], port = ENV['PORT'])
      info "Chat server starting on #{host}:#{port}"

      super(host, port, &method(:on_connection))

      @subscriber = Subscriber.new
    end

    private

    def on_connection(connection)
      while request = connection.request
        if request.websocket?
          info "Received WebSocket connection"
          connection.detach # Detach connection in order to allow it to be handled by another actor (Client).
          route_websocket request.websocket
          return
        else
          route_request connection, request
        end
      end
    end

    def route_request(connection, request)
      if request.url == "/"
        return render_index(connection)
      else
        return render_asset(connection, request.url)
      end

      info "404 Not Found: #{request.path}"
      connection.respond :not_found, "Not found"
    end

    def route_websocket(socket)
      if socket.url == "/timeinfo"
        @subscriber.clients << Client.new(socket)
      else
        info "Received invalid WebSocket request for: #{socket.url}"
        socket.close
      end
    end

    def render_index(connection)
      render_asset(connection, "index.html")
    end

    def render_asset(connection, path)
      info "200 OK: #{path}"
      connection.respond :ok, File.read(PUBLIC_PATH.join(path.sub(/^\/+/, '')))
    end
  end
end