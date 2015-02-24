require 'pry'
require 'json'

module Chat
  class Client
    include Celluloid::IO
    include Celluloid::Logger

    attr_reader :socket
    attr_accessor :nickname

    def initialize(socket)
      @socket = socket
    end

    # unique identifier
    def id
      Client.get_id_from_socket(@socket)
    end

    def self.get_id_from_socket(socket)
      socket.object_id
    end

    def write(message)
      @socket << message
    end
  end
end