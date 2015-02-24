require 'celluloid/redis'
require 'celluloid/io'

module Chat
  class Subscriber
    include Celluloid::IO
    include Celluloid::Logger

    def initialize(channel = ENV['DEFAULT_CHANNEL'])
      @clients = []
      @channel = channel
      @redis = ::Redis.new(url: ENV['REDIS_URL'], driver: :celluloid)

      async.subscribe_to_channel
    end

    def add_client(client)
      @clients << client
    end

    def remove_client(client)
      @clients.delete(client)
    end

    private

    def subscribe_to_channel
      @redis.subscribe @channel do |on|
        on.message do |channel, message|
          # when a message is received write it to all clients, and remove the reference
          # to those who are no longer alive.
          @clients.select! do |client|
            client.alive? && client.write(message)
          end
        end
      end
    end
  end
end