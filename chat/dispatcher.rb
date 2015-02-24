require 'securerandom'
require_relative 'publisher'

module Chat
  class Dispatcher    
    include Celluloid::Logger

    def initialize
      @publisher = Publisher.new
    end

    # assume all actions are either read or write of actions.
    def dispatch(message, client, &block)
      debug "Dispatching #{message.inspect}"

      if message['method'] == 'read'
        dispatch_read(message, client, &block)
      elsif message['method'] == 'create'
        dispatch_create(message, client, &block)
      end
    end

    def dispatch_read(message, client, &block)
      collection = [
        {id: 1, type: 'message', user: 'blah', message: 'hey there'},
        {id: 2, type: 'message', user: 'blah', message: 'hey there'},
        {id: 3, type: 'message', user: 'blah', message: 'hey there'},
        {id: 4, type: 'leave', user: 'blah', message: 'joined'},
        {id: 5, type: 'join', user: 'blah', message: 'left'}
      ]

      yield(collection, "ok") if block_given?
    end

    def dispatch_create(message, client, &block)
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