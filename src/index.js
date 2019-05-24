#!/usr/bin/env node

/**
 * @license MIT
 * @version 1.0.0
 * @author Leonardo Quevedo
 */

require('colors')

const pjson = require('../package.json')
const generate = require('./generate/index')
const copy = require('./copy/index')
const { log } = console

const run = async () => {
  log(`Capacitor Resources v${pjson.version}`.bold.green)
  log('-------------------')
  generate()
    .then(() => {
      copy().then(() => {
        console.log('Yay!')
        log('Capacitor resources generated successfully!')
      })
    })
    .catch(e => {
      log(e)
    })
}

run()
