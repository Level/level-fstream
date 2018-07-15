var assert = require('referee').assert
var refute = require('referee').refute
var fstream = require('fstream')
var async = require('async')
var mkfiletree = require('mkfiletree')
var readfiletree = require('readfiletree')
var rimraf = require('rimraf')
var bogan = require('boganipsum')
var level = require('level')

var fixtureFiles = {
  'foo': 'FOO!\n',
  'a directory': {
    'bogantastic.txt': bogan(),
    'subdir': {
      'boganmeup.dat': bogan(),
      'sub sub dir': {
        'bar': 'BAR!\n',
        'maaaaaaaate': bogan()
      },
      'bang': 'POW'
    },
    'boo': 'W00t'
  }
}

var dblocation = 'levelup_test_fstream.db'

var opendb = function (dir, callback) {
  level(dblocation, { createIfMissing: true, errorIfExists: false }, function (err, db) {
    refute(err)
    callback(null, dir, db)
  })
}

var fstreamWrite = function (dir, db, callback) {
  fstream.Reader(dir)
    .pipe(db.writeStream({ fstreamRoot: dir })
      .on('close', function () {
        db.close(function (err) {
          refute(err)
          callback(null, dir)
        })
      }))
}

var fstreamRead = function (dir, db, callback) {
  db.readStream({ type: 'fstream' })
    .pipe(new fstream.Writer({ path: dir + '.out', type: 'Directory' })
      .on('close', function () {
        db.close(function (err) {
              refute(err)
          callback(null, dir)
        })
      }))
}

var verify = function (dir, obj, callback) {
  assert.equals(obj, fixtureFiles)
  console.log('Guess what?? It worked!!')
  callback(null, dir)
}

var cleanUp = function (dir, callback) {
  async.parallel([
    rimraf.bind(null, dir + '.out'),
    rimraf.bind(null, dblocation),
    mkfiletree.cleanUp
  ], callback)
}

process.on('uncaughtException', function (err) {
  refute(err)
})

console.log('***************************************************')
console.log('RUNNING FSTREAM-TEST...')

async.waterfall([
  rimraf.bind(null, dblocation),
  mkfiletree.makeTemp.bind(null, 'levelup_test_fstream', fixtureFiles),
  opendb,
  fstreamWrite,
  opendb,
  fstreamRead,
  function (dir, callback) {
    readfiletree(dir, function (err, obj) {
      refute(err)
      callback(err, dir, obj)
    })
  },
  verify,
  cleanUp,
  function () {
    console.log('***************************************************')
  }
])
