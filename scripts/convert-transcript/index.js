const LineByLineReader = require('line-by-line');
var fs = require('fs');

const convertTranscript = function(lineReader) {
  const transcript = [];

  lineReader.on('error', function(err) {
    console.log(err);
    return;
  });

  lineReader.on('line', function(line) {
    const data = processLine(line);
    if (data) {
      transcript.push(data);
    }
  });

  lineReader.on('end', function() {
    const json_object = {
      note:
        'Do not edit this file directly. Edit the txt file and then run the convertTranscript script to generate this file.',
      podcast: process.argv[2],
      episode: process.argv[3],
      transcript,
    };

    fs.writeFile(
      process.argv[5],
      JSON.stringify(json_object, null, 2),
      'utf8',
      error => {
        return;
      }
    );
  });
};

const processLine = line => {
  if (line == '') {
    return;
  } else if (line.includes('**')) {
    return time_speaker_text(line);
  } else if (!isNaN(parseInt(line[0], 10))) {
    return time_text(line);
  } else {
    return text_only(line);
  }
};

const time_speaker_text = line => {
  const result = line.split('**');
  if (result.length < 3) {
    throw new Error(
      `The line appears to be in the format time **speakers** text, but is invalid: ${line}`
    );
  }
  return {
    timestamp: result[0].trim(),
    speaker: result[1],
    text: result[2].trim(),
  };
};

const text_only = line => ({ text: line.trim() });

const time_text = line => ({
  timestamp: line.slice(0, 9),
  text: line.slice(10, line.length),
});

if (process.argv.length > 2) {
  const lineReader = new LineByLineReader(process.argv[4]);

  convertTranscript(lineReader);
}

exports.convertTranscript = convertTranscript;
exports.processLine = processLine;
