var minimist = require('minimist')
var argv = minimist(process.argv)
var events = require('events')
var ee = new events.EventEmitter()
var tia = new require('../lib/tia')({})
var tLib = require('../beautified')
var conf = require('./level.json')
var tlib = new tLib({ ee: ee,  tia: tia, levelcfg: conf })

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const order_types = {
  'limit': true,
  'fill-or-kill': true,
  'market': true,
  'immediate-or-cancel': true
}

const commands = {
  'ob': {msg: 'list the orderbook', parser: function () {
     console.log(tlib.orderbook())
  }},
  'help': { msg: 'display this menu', parser: function () { usage() }},
  'bid': { msg: 'bid <number> <type> <price> (Note: types are :' +
    Object.keys(order_types).join() + ')', parser: parseBid },
  'ask': { msg: 'ask <number> <type> <price>', parser: parseAsk +
    Object.keys(order_types).join() + ')', parser: parseAsk },
  'cancel': {msg: 'cancel <id>', parser: function (i) {
      var args = i.split(/ /)
      var id = parseInt(args[1], 10)
      if (!isNaN(id)) {
        console.log('cancelling : ', id)
        console.log(tlib.cancel(id))
      } else {
        usage()
      }
  }}
}

function usage () {
  Object.keys(commands).forEach(function (cmd) {
    console.log(cmd, ' ', commands[cmd].msg)
  })
}

function genericParse (input) {
  var args = input.split(/ /)
  console.log(args[2])
  if (args.length !== 4) {
    console.log('Parse error : args : ', args.length, ' ', args.join(' '))
    usage()
    return ''
  }
  if (!(args[2] in order_types)) {
    console.log('invalid order type ' + args[2])
    usage()
    return ''
  }
  return [
    args[0],
    parseInt(args[1], 10),
    args[2],
    parseInt(args[3], 10)
  ]
}

function parseBid (input) {
  var args = genericParse(input)
  console.log('parseBid')
  var r = tlib.buy(args[1], args[2], args[3])
  console.log('typeof r', typeof r, ' : ', r)
}

function parseAsk (input) {
  var args = genericParse(input)
  console.log(tlib.sell(args[1], args[2], args[3]))
}

function question () {
  rl.on('line', function (cmd) {
    // that.exec(cmd.trim())
    Object.keys(commands).forEach(function (c) {
      var toks = cmd.split(/ /)
      if (toks[0].match(new RegExp(`${c}`, 'g'))) {
        if (commands[c].parser) {
          commands[c].parser(cmd)
        } else {
          console.log(' com ' + commands[c].msg)
        }
      }
    })
    rl.prompt()
  }).on('close', function () {
    process.stdout.write('\n')
    process.exit(0)
  })
  rl.setPrompt('>')
  rl.prompt()
}

question()
