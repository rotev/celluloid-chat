require 'celluloid/redis'
require 'celluloid/io'

module Chat
  class Publisher
    include Celluloid::IO

    attr_accessor :clients

    def initialize(channel = ENV['DEFAULT_CHANNEL'])
      @clients = []
      @channel = channel
      @redis = ::Redis.new(url: ENV['REDIS_URL'], driver: :celluloid)
    end

    def publish(payload)
      @redis.publish @channel, payload
    end
  end
end