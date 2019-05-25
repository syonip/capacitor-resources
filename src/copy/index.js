#!/usr/bin/env node

/**
 * @license MIT
 * @version 1.0.0
 * @author Leonardo Quevedo
 */

require('colors')

const copyAndroid = require('./platforms/android/index')
const copyIOS = require('./platforms/ios/index')
const { log } = console

module.exports = async () => {
  return new Promise((resolve, reject) => {
    copyAndroid()
      .then(() => {
        copyIOS().then(() => {
          resolve()
        })
      })
      .catch(e => {
        reject(e)
      })
  })
}
