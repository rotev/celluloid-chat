require 'securerandom'
require 'time'
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
      message['data']['id'] = "r#{SecureRandom::uuid()}"

      # store message in the database and publish it to all clients.
      score = parse_score(message)
      store(score, message['data'])
      publish(message)

      # For now, respond with successful status for all requests.
      # Send back the updated message data, including its new ID.
      yield(message, "ok") if block_given?
    end

    def store(score, message_data)
      @storer.async.store(score, JSON.generate(message_data))
    end

    def publish(message)
      @publisher.async.publish(JSON.generate(message))
    end

    def parse_score(message)
      time = message['data']['created_at']
      return time if time.is_a? Fixnum
      time = Time.parse(time) unless time.is_a? Time
      return time.to_i
    end

  end
end