require 'securerandom'
require_relative 'storer'
require_relative 'publisher'

module Chat
  class Dispatcher    
    include Celluloid::Logger

    def initialize
      @storer = Storer.new
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
      # read last 10 actions.
      collection = @storer.fetch_last(10).map{|a| JSON.parse(a)}

      yield(collection, "ok") if block_given?
    end

    def dispatch_create(message, client, &block)
      type = message['data']['type']
      
      unless %(join message).include? type
        error "Unknown action type received: '#{type}'"
        return
      end

      if type == 'join'
        client.nickname = message['data']['user']
        message['data']['message'] = ' joined.'
      end

      # add necessary message data
      message['data']['id'] = SecureRandom::uuid()
      message['data']['created_at'] = Time.now
      message['data']['user'] = client.nickname

      # store message in the database and publish it to all clients.
      store(message)
      publish(message)

      # For now, respond with successful status for all requests.
      yield("", "ok") if block_given?
    end

    def store(message)
      score = message['data']['created_at'].to_i
      @storer.async.store(score, JSON.generate(message['data']))
    end

    def publish(message)
      @publisher.async.publish(JSON.generate(message))
    end

  end
end