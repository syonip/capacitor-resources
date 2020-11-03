#!/usr/bin/env node

require('colors')

const commander = require('commander')
const Q = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const Jimp = require('jimp')
const _ = require('lodash')
const Gauge = require('gauge')
const pjson = require('../../package.json')

const { log } = console

// helpers

const display = {
  info: str => {
    log(str)
  },
  success: str => {
    str = ' ' + '✓ '.green + ' ' + str
    log(str)
  },
  error: str => {
    str = ' ' + '× '.red + ' ' + str
    log(str)
  },
  header: str => {
    log('')
    log(str.yellow)
  }
}

// app main variables and constants

const PLATFORMS = {
  android: {
    definitions: ['./platforms/icons/android', './platforms/splash/android']
  },
  ios: {
    definitions: ['./platforms/icons/ios', './platforms/splash/ios']
  },
  windows: {
    definitions: ['./platforms/icons/windows', './platforms/splash/windows']
  },
  blackberry10: {
    definitions: ['./platforms/icons/blackberry10']
  }
}
let imageObjects
let selectedPlatforms = []

// app functions

function check(settings) {
  display.header('Checking files and directories...')

  return checkPlatforms(settings)
    .then(selPlatforms => (selectedPlatforms = selPlatforms))
    .then(() => getImages(settings))
    .then(iobjs => {
      imageObjects = iobjs
    })
    .then(() => checkOutPutDir(settings))
}

function checkPlatforms(settings) {
  const platformsKeys = _.keys(PLATFORMS)

  if (!settings.platforms || !Array.isArray(settings.platforms)) {
    display.success('Processing files for all platforms')
    return Q.resolve(platformsKeys)
  }

  const platforms = settings.platforms
  const platformsToProcess = []
  const platformsUnknown = []

  platforms.forEach(platform => {
    if (_.find(platformsKeys, p => platform === p)) {
      platformsToProcess.push(platform)
    } else {
      platformsUnknown.push(platform)
    }
  })

  if (platformsUnknown.length > 0) {
    display.error('Bad platforms: ' + platformsUnknown)
    return Q.reject('Bad platforms: ' + platformsUnknown)
  }

  display.success('Processing files for: ' + platformsToProcess)
  return Q.resolve(platformsToProcess)
}

function getImages(settings) {
  const imageObjects = {
    icon: null,
    splash: null
  }

  let promise = Q.resolve()

  if (settings.makeicon) {
    promise = promise
      .then(() => checkIconFile(settings.iconfile))
      .then(image => {
        imageObjects.icon = image
      })
  }
  if (settings.makesplash) {
    promise = promise
      .then(() => checkSplashFile(settings.splashfile))
      .then(image => {
        imageObjects.splash = image
      })
  }

  return promise.then(() => imageObjects)

  function checkIconFile(iconFileName) {
    const defer = Q.defer()

    Jimp.read(iconFileName)
      .then(image => {
        const width = image.bitmap.width
        const height = image.bitmap.height
        if (width === 1024 && width === height) {
          display.success('Icon file ok (' + width + 'x' + height + ')')
          defer.resolve(image)
        } else {
          display.error('Bad icon file (' + width + 'x' + height + ')')
          defer.reject('Bad image format')
        }
      })
      .catch(err => {
        display.error('Could not load icon file')
        defer.reject(err)
      })

    return defer.promise
  }

  function checkSplashFile(splashFileName) {
    const defer = Q.defer()

    Jimp.read(splashFileName)
      .then(image => {
        const width = image.bitmap.width
        const height = image.bitmap.height
        if (width >= 2732 && width === height) {
          display.success('Splash file ok (' + width + 'x' + height + ')')
          defer.resolve(image)
        } else {
          display.error('Bad splash file (' + width + 'x' + height + ')')
          defer.reject('Bad image format')
        }
      })
      .catch(err => {
        display.error('Could not load splash file')
        defer.reject(err)
      })

    return defer.promise
  }
}

function checkOutPutDir(settings) {
  const dir = settings.outputdirectory

  return fs.pathExists(dir).then(exists => {
    if (exists) {
      display.success('Output directory ok (' + dir + ')')
    } else {
      display.error('Output directory not found (' + dir + ')')
      throw 'Output directory not found: ' + dir
    }
  })
}

function generateForConfig(imageObj, settings, config) {
  const platformPath = path.join(settings.outputdirectory, config.path)

  const transformIcon = definition => {
    const defer = Q.defer()
    const image = imageObj.icon.clone()

    const outputFilePath = path.join(platformPath, definition.name)

    image.resize(definition.size, definition.size).write(outputFilePath, err => {
      if (err) defer.reject(err)
      //display.info('Generated icon file for ' + outputFilePath);
      defer.resolve()
    })

    return defer.promise
  }

  return fs.ensureDir(platformPath).then(() => {
    const definitions = config.definitions
    const sectionName = 'Generating ' + config.type + ' files for ' + config.platform
    const definitionCount = definitions.length
    let progressIndex = 0

    const gauge = new Gauge()
    gauge.show(sectionName, 0)

    return Q.mapSeries(definitions, def => {
      let transformPromise = Q.resolve()
      transformPromise = transformPromise.then(() => {
        progressIndex++
        const progressRate = progressIndex / definitionCount
        gauge.show(sectionName, progressRate)
        gauge.pulse(def.name)
      })
      switch (config.type) {
        case 'icon':
          transformPromise = transformPromise.then(() => transformIcon(def))
          break
        case 'splash':
          transformPromise = transformPromise.then(() => transformSplash(def, imageObj, platformPath))
          break
      }
      return transformPromise
    })
      .then(() => {
        gauge.disable()
        display.success('Generated ' + config.type + ' files for ' + config.platform)
      })
      .catch(err => {
        gauge.disable()
        throw err
      })
  })
}

function generate(imageObj, settings) {
  return new Promise((resolve, reject) => {
    try {
      display.header('Generating files...')

      const configs = []

      selectedPlatforms.forEach(platform => {
        PLATFORMS[platform].definitions.forEach(def => configs.push(require(def)))
      })

      const filteredConfigs = _.filter(configs, config => {
        if (config.type === 'icon' && settings.makeicon) return true
        if (config.type === 'splash' && settings.makesplash) return true
        return false
      })

      Q.mapSeries(filteredConfigs, config => generateForConfig(imageObj, settings, config)).then(
        () => {
          display.success('Successfully generated all files')
          resolve()
        }
      )
    } catch (e) {
      reject(e)
    }
  })
}

// cli helper configuration

function processList(val) {
  return val.split(',')
}

commander
  .version(pjson.version)
  .description(pjson.description)
  .option('-i, --icon [optional]', 'optional icon file path (default: ./resources/icon.png)')
  .option('-s, --splash [optional]', 'optional splash file path (default: ./resources/splash.png)')
  .option('-t, --transform-splash [crop|cover]', 'optional splash transformation', 'crop')
  .option(
    '-p, --platforms [optional]',
    'optional platform token comma separated list (default: all platforms processed)',
    processList
  )
  .option('-o, --outputdir [optional]', 'optional output directory (default: ./resources/)')
  .option('-I, --makeicon [optional]', 'option to process icon files only')
  .option('-S, --makesplash [optional]', 'option to process splash files only')
  .parse(process.argv)

// app settings and default values

const settings = {
  iconfile: commander.icon || path.join('.', 'resources', 'icon.png'),
  splashfile: commander.splash || path.join('.', 'resources', 'splash.png'),
  platforms: commander.platforms || undefined,
  outputdirectory: commander.outputdir || path.join('.', 'resources'),
  makeicon: commander.makeicon || (!commander.makeicon && !commander.makesplash) ? true : false,
  makesplash: commander.makesplash || (!commander.makeicon && !commander.makesplash) ? true : false
}


// Dinamically set splash transformation function
function setTransformationFunction(transformation){
  switch (transformation){
    case 'cover':
      return require('./splash/cover.js');
    default:
      return require('./splash/crop.js');
  }
}
const transformSplash = setTransformationFunction(commander.transformSplash)


module.exports = () =>
  new Promise((resolve, reject) => {
    check(settings)
      .then(() =>
        generate(imageObjects, settings).then(() => {
          resolve()
        })
      )
      .catch(e => reject(e))
  })
