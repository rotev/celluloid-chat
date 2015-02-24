require_relative 'lib/reel/server/wsrr'
require_relative 'client'
require_relative 'subscriber'
require_relative 'dispatcher'

module Chat

  PUBLIC_PATH  = Pathname.new File.expand_path("../../public", __FILE__)

  class Server < Reel::Server::WSRR
    include Celluloid::Logger

    def initialize(host = ENV['HOST'], port = ENV['PORT'])
      info "Chat server starting on #{host}:#{port}"
      super(host, port)
      @subscriber = Subscriber.new
      @dispatcher = Dispatcher.new
      @clients = {}
    end

    private

    def handle_http_request(connection, request)
      if request.url == "/"
        return render_index(connection)
      else
        return render_asset(connection, request.url)
      end

      info "404 Not Found: #{request.path}"
      connection.respond :not_found, "Not found"
    end

    # Keep track of connected clients.
    def handle_ws_connection(socket)
      add_client(socket)
      super(socket)
    end

    def handle_ws_disconnection(socket)
      remove_client(socket)
    end

    def handle_ws_request(request, socket)
      client = get_client(socket)

      # dispatch event and write the response back to the client.
      @dispatcher.dispatch(request['data'], client) do |response, status|
        yield(response, status)
      end
    end

    def render_index(connection)
      render_asset(connection, "index.html")
    end

    def render_asset(connection, path)
      full_path = PUBLIC_PATH.join(path.sub(/^\/+/, ''))

      if File.exist?(full_path)
        info "200 OK: #{path}"
        connection.respond :ok, File.read(full_path)
      else
        error "404 NOT FOUND: #{path}"
        connection.respond :not_found, "Not found"
      end
    end

    def add_client(socket)
      client = Client.new(socket)
      client_id = client.id
      @clients[client_id] = client
      @subscriber.add_client(client)
    end

    def remove_client(socket)
      client = get_client(socket)
      client_id = client.id
      @clients.delete(client.id)
      @subscriber.remove_client(client)
    end

    def get_client(socket)
      client_id = Client.get_id_from_socket(socket)
      @clients[client_id]
    end
  end
end