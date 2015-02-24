require 'celluloid/redis'
require 'celluloid/io'

module Chat
  class Storer
    include Celluloid::IO

    KEY = "messages-list"

    def initialize
      @redis = ::Redis.new(url: ENV['REDIS_URL'], driver: :celluloid)
    end

    def store(score, payload)
      @redis.zadd(KEY, score, payload)
    end

    def fetch_last(how_many)
      @redis.zrange(KEY, -how_many, -1)
    end
  end
end