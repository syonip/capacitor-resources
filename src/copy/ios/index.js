/**
 * @license MIT
 * @version 1.1.0
 * @author Leonardo Quevedo
 */

require('colors')
const fs = require('fs-extra')
const klawSync = require('klaw-sync')
const path = require('path')

const rootPath = path.resolve(__dirname, '../../../../')

const iosIconsOrigin = path.join(rootPath, 'resources', 'ios', 'icon')
const iosIconsDestination = path.join(rootPath, 'ios', 'app', 'src', 'main', 'res')

const iosSplashesOrigin = path.join(rootPath, 'resources', 'ios', 'splash')
const iosSplashesDestination = path.join(rootPath, 'ios', 'app', 'src', 'main', 'res')

const getIOSIcons = () => {
  return new Promise((resolve, reject) => {
    try {
      const files = klawSync(iosIconsOrigin).map(file => file.path.replace(iosIconsOrigin, ''))
      resolve(files)
    } catch (e) {
      reject(e)
    }
  })
}

const copyIOSIcons = async () => {
  const icons = await getIOSIcons()
  return Promise.all(
    icons.map(iconPath => {
      new Promise((resolve, reject) => {
        try {
          fs.copyFileSync(
            path.join(iosIconsOrigin, iconPath),
            path.join(iosIconsDestination, iconPath)
          )
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  )
}

const getIOSSplashes = () => {
  return new Promise((resolve, reject) => {
    try {
      const files = klawSync(iosSplashesOrigin)
        .map(file => file.path.replace(iosSplashesOrigin, ''))
        .filter(filePath => filePath && filePath.indexOf('.') > -1)
      resolve(files)
    } catch (e) {
      reject(e)
    }
  })
}

const copyIOSSplashes = async () => {
  const splashes = await getIOSSplashes()
  return Promise.all(
    splashes.map(splashPath => {
      new Promise((resolve, reject) => {
        try {
          fs.copyFileSync(
            path.join(iosSplashesOrigin, splashPath),
            path.join(iosSplashesDestination, splashPath.replace('-screen.png', '/splash.png'))
          )
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  )
}

module.exports = new Promise((resolve, reject) => {
  try {
    copyIOSIcons()
    copyIOSSplashes()
    resolve()
  } catch (e) {
    reject(e)
  }
})
