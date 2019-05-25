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

const androidIconsOrigin = path.join(rootPath, 'resources', 'android', 'icon')
const androidIconsDestination = path.join(rootPath, 'android', 'app', 'src', 'main', 'res')

const androidSplashesOrigin = path.join(rootPath, 'resources', 'android', 'splash')
const androidSplashesDestination = path.join(rootPath, 'android', 'app', 'src', 'main', 'res')

const getAndroidIcons = () => {
  return new Promise((resolve, reject) => {
    try {
      const files = klawSync(androidIconsOrigin)
        .map(file => file.path.replace(androidIconsOrigin, ''))
        .filter(
          filePath => filePath && filePath.indexOf('mipmap') > -1 && filePath.indexOf('.') > -1
        )
      resolve(files)
    } catch (e) {
      reject(e)
    }
  })
}

const copyAndroidIcons = async () => {
  const icons = await getAndroidIcons()
  return Promise.all(
    icons.map(iconPath => {
      new Promise((resolve, reject) => {
        try {
          fs.copyFileSync(
            path.join(androidIconsOrigin, iconPath),
            path.join(androidIconsDestination, iconPath)
          )
          fs.copyFileSync(
            path.join(androidIconsOrigin, iconPath),
            path.join(androidIconsDestination, iconPath.replace('.png', '_foreground.png'))
          )
          fs.copyFileSync(
            path.join(androidIconsOrigin, iconPath),
            path.join(androidIconsDestination, iconPath.replace('.png', '_round.png'))
          )
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  )
}

const getAndroidSplashes = () => {
  return new Promise((resolve, reject) => {
    try {
      const files = klawSync(androidSplashesOrigin)
        .map(file => file.path.replace(androidSplashesOrigin, ''))
        .filter(filePath => filePath && filePath.indexOf('.') > -1)
      resolve(files)
    } catch (e) {
      reject(e)
    }
  })
}

const copyAndroidSplashes = async () => {
  const splashes = await getAndroidSplashes()
  return Promise.all(
    splashes.map(splashPath => {
      new Promise((resolve, reject) => {
        try {
          fs.copyFileSync(
            path.join(androidSplashesOrigin, splashPath),
            path.join(androidSplashesDestination, splashPath.replace('-screen.png', '/splash.png'))
          )
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  )
}

module.exports = () =>
  new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(androidIconsDestination)) {
        copyAndroidIcons()
        copyAndroidSplashes()
        resolve()
      } else {
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
