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

const start = () => {
  log(`📦  Capacitor Resources v${pjson.version}`.bold.green)
  log('-----------------------------'.bold.green)
}

const finish = () => {
  log()
  log('----------------------------------------------'.bold.green)
  log()
  log('📦  Capacitor resources generated successfully!'.green.bold)
  log()
}

module.exports = new Promise(resolve => {
  start()
  generate()
    .then(() => {
      copy()
      finish()
      resolve()
    })
    .catch(e => {
      log(e)
    })
})
