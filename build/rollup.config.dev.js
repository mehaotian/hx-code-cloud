const configList = require('./rollup.config');

configList.map((config, index) => {
  config.output.sourcemap = false
})


module.exports = configList;