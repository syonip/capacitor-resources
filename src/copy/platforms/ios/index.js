/**
 * @license MIT
 * @version 1.1.0
 * @author Leonardo Quevedo
 */

require('colors')
const fs = require('fs-extra')
const klawSync = require('klaw-sync')
const path = require('path')

const rootPath = process.env.CAPACITOR_PROJECT_ROOT

const iosPath = path.join(rootPath, 'ios')
const resourcesPath = path.join(rootPath, 'resources')

const iosIconsOrigin = path.join(resourcesPath, 'ios', 'icon')
const iosIconsDestination = path.join(iosPath, 'App/App/Assets.xcassets/AppIcon.appiconset')

const iosSplashOrigin = path.join(resourcesPath, 'splash.png')
const iosSplashesDestination = path.join(iosPath, 'App/App/Assets.xcassets/Splash.imageset')

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
  fs.ensureDirSync(iosIconsDestination)
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

const copyIOSSplash = async () => {
  new Promise((resolve, reject) => {
    try {
      fs.ensureDirSync(iosSplashesDestination)
      fs.copyFileSync(
        path.join(iosSplashOrigin),
        path.join(iosSplashesDestination, 'splash-2732x2732.png')
      )
      fs.copyFileSync(
        path.join(iosSplashOrigin),
        path.join(iosSplashesDestination, 'splash-2732x2732-1.png')
      )
      fs.copyFileSync(
        path.join(iosSplashOrigin),
        path.join(iosSplashesDestination, 'splash-2732x2732-2.png')
      )
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = new Promise(async (resolve, reject) => {
  try {
    if (fs.existsSync(iosPath)) {
      await copyIOSIcons()
      await copyIOSSplash()
      resolve()
    } else {
      resolve()
    }
  } catch (e) {
    reject(e)
  }
})
