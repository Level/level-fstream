# level-fstream



Former `write-stream` implementation from levelup that allows for
[`fstream`][fstream] based streams to be piped into
a [`levelup`][levelup] database.

## Install

```sh
npm install level-fstream --save
```

## Usage

```js
var level = require('level');
var levelfstream = require('level-fstream');
var fstream = require('fstream');

var db = levelfstream(level('./test.db'));

fstream.Reader('./directory')
  .pipe(db.fileStream({ fstreamRoot: path.join(__dirname, '')} ))


```

## License
MIT


[fstream]: https://github.com/isaacs/fstream
[levelup]: https://github.com/rvagg/node-levelup
