Collecting data of kanji usage frequencies from Twitter [Streaming API][streaming-api].

See [`POST statuses/filter`][statuses-filter] for details.

[streaming-api]: https://dev.twitter.com/streaming/overview
[statuses-filter]: https://dev.twitter.com/streaming/reference/post/statuses/filter

# Usage

1. `git clone https://github.com/THIS/REPO.git`
2. `npm install`
3. `cp tokens.json.dist tokens.json`
4. Fill in your tokens in `tokens.json` ([create a new app](https://apps.twitter.com/app/new))
5. `node collect-data.js` - a new stream is started right away, but data is not being saved automatically!
6. Enter `help` to see a list of available commands
7. Enter `save` to store data in a file (`kanji.json` in root directory)

# Status message

    { state: 'RUNNING', percentFull: 0, totalKanji: 123 }

- `state` - if `'PAUSED'`, data is **not** being collected
- `percentFull` - how full is a stream queue, see description of [`stall_warnings` parameter](https://dev.twitter.com/streaming/overview/request-parameters#stallwarnings)
- `totalKanji` - how much kanji has been collected so far
