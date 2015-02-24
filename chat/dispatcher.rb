require 'securerandom'
require_relative 'publisher'

module Chat
  class Dispatcher    
    include Celluloid::Logger

    def initialize
      @publisher = Publisher.new
    end

    def dispatch(message, client)
      debug "Dispatching #{message.inspect}"

      type = message['data']['type']
      
      case type

      when 'join'
        client.nickname = message['data']['user']
        publish_message(message, client)

      when 'message'
        publish_message(message, client)

      else
        info "Unknown action type received: '#{type}'"
      end

      # For now, respond with successful status for all requests.
      yield("", "ok") if block_given?
    end

    def publish_message(message, client)
      message['data']['id'] = SecureRandom::uuid()
      message['data']['created_at'] = Time.now.to_s
      message['data']['user'] = client.nickname

      publish(message)
    end

    def publish(message)
      @publisher.async.publish(JSON.generate(message))
    end

  end
end