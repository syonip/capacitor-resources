#!/usr/bin/env node

const Q = require('bluebird')
const path = require('path')

module.exports = (definition, imageObj, platformPath) => {
  const defer = Q.defer()
  const image = imageObj.splash.clone()

  const width = definition.width
  const height = definition.height

  const outputFilePath = path.join(platformPath, definition.name)

  image.cover(width, height).write(outputFilePath, err => {
    if (err) defer.reject(err)
    //display.info('Generated splash file for ' + outputFilePath);
    defer.resolve()
  })

  return defer.promise
}
