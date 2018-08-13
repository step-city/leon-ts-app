/* config-overrides.js */
const tsImportPluginFactory = require('ts-import-plugin')
const { getLoader } = require("react-app-rewired")
const rewireLess = require('react-app-rewire-less')
const path = require('path')

module.exports = function override(config, env) {
  const tsLoader = getLoader(
    config.module.rules,
    rule =>
      rule.loader &&
      typeof rule.loader === 'string' &&
      rule.loader.includes('ts-loader')
  )

  tsLoader.options = {
    getCustomTransformers: () => ({
      before: [ tsImportPluginFactory({
        libraryDirectory: 'es',
        libraryName: 'antd',
        style: true,
      }) ]
    })
  }

  // 修改基础样式
  config = rewireLess.withLoaderOptions({
    javascriptEnabled: true
    // modifyVars: { 
    //   "@primary-color": "#1DA57A" 
    // },
  })(config, env)  

  return config
}