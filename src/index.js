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

module.exports = () => {
  log(`Capacitor Resources v${pjson.version}`.bold.green)
  log('-------------------')
  generate()
    .then(() => {
      copy().then(() => {
        log('Capacitor resources generated successfully!')
      })
    })
    .catch(e => {
      log(e)
    })
}
