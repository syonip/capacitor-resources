const path = require('path')

module.exports = {
  getRootPath: () => {
    const developmentRoot = path.resolve(__dirname, '../../')
    const productionRoot = path.resolve(__dirname, '../../../../')
    return process.env.CAPACITOR_RESOURCES_STAGE === 'development' ? developmentRoot : productionRoot
  }
}
