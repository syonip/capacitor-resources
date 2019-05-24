#!/usr/bin/env node

/**
 * @license MIT
 * @version 1.0.0
 * @author Leonardo Quevedo
 */

require('colors')

const copyAndroid = require('./android/index')
const copyIOS = require('./ios/index')
const { log } = console

const copyIOS = () => {}

module.exports = async () => {
  return new Promise((resolve, reject) => {
    copyAndroid()
      .then(() => {
        resolve()
      })
      .catch(e => {
        reject(e)
      })
  })
}
