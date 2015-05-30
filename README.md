Collecting data of kanji usage frequencies from Twitter [Streaming API][streaming-api].

See [`POST statuses/filter`][statuses-filter] for details.

[streaming-api]: https://dev.twitter.com/streaming/overview
[statuses-filter]: https://dev.twitter.com/streaming/reference/post/statuses/filter

# Usage

1. `git clone https://github.com/THIS/REPO.git`
2. `npm install`
3. `cp tokens.json.dist tokens.json`
4. `vi tokens.json` - fill in your tokens ([create a new app](https://apps.twitter.com/app/new))
5. `node collect-data.js` - type `help` to see help message about how to use it
6. Data will be saved into `kanji.json` once you type `save` command in interactive prompt
