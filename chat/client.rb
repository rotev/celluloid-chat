require 'pry'
require 'json'
require_relative 'publisher'

module Chat
  class Client
    include Celluloid::IO
    include Celluloid::Logger

    attr_reader :socket
    attr_reader :nickname

    def initialize(socket)
      @socket = socket
      @publisher = Publisher.new

      async.run
    end

    def run
      while message = JSON.parse(@socket.read)
        dispatch message
      end
    rescue IOError
      event 'left'
      terminate
    end

    def dispatch(message)
      debug "Dispatching #{message.inspect}"

      case message['action']
      when 'join'
        @nickname = message['user']
        event 'joined'
      when 'message'
        publish message.merge('user' => nickname)
      else
        info "Unknown action received: '#{action}'"
      end
    end

    def write(message)
      @socket << message
    end

    def event(action)
      message = "#{nickname} #{action}"
      info message
      publish({action: action, user: nickname, message: message})
    end

    def publish(message)
      json = JSON.generate(message)
      @publisher.async.publish(json)
    end
  end
end