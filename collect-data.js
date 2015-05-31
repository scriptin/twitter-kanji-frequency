'use strict';

var
  fs = require('fs'),
  Twit = require('twit'),
  repl = require('repl'),
  bloem = require('bloem');

var FREQ_TABLE_FILE_NAME = './kanji.json';
var TWITTER_API_TOKENS_FILE_NAME = './tokens.json';

var japanLocation = [129.484177, 30.923179, 145.985641, 45.799878]; // Most of Japan
var nonKanjiRegExp = /[^\u4e00-\u9fff]+/g;
var fallingBehindPercentFull = 0;

var kanjiData = { all: 0 };
try {
  var data = JSON.parse(fs.readFileSync(FREQ_TABLE_FILE_NAME));
  data.forEach(function (row) {
    kanjiData[row[0]] = row[1];
  });
  console.log('Continuing with data from ' + FREQ_TABLE_FILE_NAME);
} catch (e) {
  console.log('Could not read data from ' + FREQ_TABLE_FILE_NAME + ', ' +
              'starting from scratch. Error: ' + e.message);
}

// Bloem filter to prevent duplicate tweets from being processed.
// Filter scales automatically to hold larger number of items.
var filter = new bloem.ScalingBloem(0.99, { initial_capacity: 1000, scaling: 2, ratio: 0.9 });

var T = new Twit(JSON.parse(fs.readFileSync(TWITTER_API_TOKENS_FILE_NAME)));
var stream = T.stream('statuses/filter', { locations: japanLocation, stall_warnings: true });

function isUniqueTweet(tweet) {
  if (tweet.favorited) return false;
  if (tweet.retweeted) return false;
  if (tweet.quoted_status) return false;
  return true;
}

stream.on('tweet', function (tweet) {
  if (isUniqueTweet(tweet) && tweet.lang === 'ja' && !filter.has(Buffer(tweet.id_str))) {
    filter.add(Buffer(tweet.id_str));
    tweet.text.replace(nonKanjiRegExp, '').split('').forEach(function (char) {
      kanjiData.all += 1;
      kanjiData[char] = (kanjiData[char] || 0) + 1;
    });
  }
});

stream.on('warning', function (warning) {
  if (warning.code && (warning.code === 'FALLING_BEHIND')) {
    fallingBehindPercentFull = warning.percent_full;
  }
});

stream.on('error', function (error) {
  console.error(error.message);
});

function getStatus() {
  return {
    state: paused ? 'PAUSED' : 'RUNNING',
    percentFull: fallingBehindPercentFull,
    totalKanji: kanjiData.all
  };
}

function save(kanjiData, fileName) {
  var freqTable = Object.keys(kanjiData).map(function (char) {
    return [char, kanjiData[char], kanjiData[char] / kanjiData.all];
  });
  freqTable.sort(function (a, b) {
    return b[1] - a[1]; // desc
  });
  fs.writeFileSync(
    fileName, 
    JSON.stringify(freqTable).replace(/\],/g, '],\n')
  );
}

function getHelp() {
  return [
    'status       - check status',
    'save         - save collected data to file',
    'pause/resume - pause/resume stream',
    'quit         - close stream and quit'
  ];
}

var paused = false;

function evaluate(cmd, context, filename, callback) {
  var command = cmd.replace('\n', '').trim();
  var result = {};
  switch (command) {
    case 'help':
    case '?':
      callback(null, getHelp());
      break;
    case 'status':
      callback(null, getStatus());
      break;
    case 'save':
      paused || stream.stop();
      save(kanjiData, FREQ_TABLE_FILE_NAME);
      paused || stream.start();
      callback(null, 'Saved data into ' + FREQ_TABLE_FILE_NAME);
      break;
    case 'pause':
    case 'stop':
      paused || stream.stop();
      paused = true;
      callback(null, 'PAUSED');
      break;
    case 'resume':
    case 'unpause':
    case 'continue':
      paused && stream.start();
      paused = false;
      callback(null, 'RESUMED');
      break;
    case 'quit':
    case 'exit':
      process.exit();
      break;
    default:
      callback(null, 'Unknown command: ' + command);
  }
}

repl.start({
  prompt: '> ',
  eval: evaluate
}).on('exit', function() {
  stream.stop();
  process.exit();
});
