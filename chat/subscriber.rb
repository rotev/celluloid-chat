require 'celluloid/redis'
require 'celluloid/io'

module Chat
  class Subscriber
    include Celluloid::IO
    include Celluloid::Logger

    attr_accessor :clients

    def initialize(channel = ENV['DEFAULT_CHANNEL'])
      @clients = []
      @channel = channel
      @redis = ::Redis.new(url: ENV['REDIS_URL'], driver: :celluloid)

      async.subscribe
    end

    def subscribe
      @redis.subscribe @channel do |on|
        on.subscribe do |channel, subscriptions|
          info "Listening to channel '#{channel}'"
        end

        on.message do |channel, message|
          @clients.select! do |client|
            client.alive? && client.write(message)
          end
        end

        on.unsubscribe do |channel, subscriptions|
          info "Unsubscribed from channel '#{channel}'"
        end
      end
    end
  end
end