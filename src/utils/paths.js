const path = require('path')
const fs = require('fs-extra')

module.exports = {
  getRootPath: () => {
    console.log(`Root path: ${path.resolve()}`)
    const developmentRoot = path.resolve(__dirname, '../../')
    const productionRoot = fs.existsSync(path.resolve('capacitor.config.json')) ?
      path.resolve() : path.resolve(__dirname, '../../../../')
    return process.env.CAPACITOR_RESOURCES_STAGE === 'development' ? developmentRoot : productionRoot
  }
}
