
<p align="center">
  <img src="https://github.com/kuldeepkeshwar/size-plugin-bot/blob/master/static/images/icon.png?raw=true" alt="size-plugin" >
</p>
<p align="center">
  <h1 align="center">size-plugin</h1>
</p>


> A GitHub App built with Probot that comments the gzipped sizes of your webpack assets and the changes since the last build into the relevant PR

## Usage
First add an instance of the plugin to your webpack configuration:

```diff
// webpack.config.js
+ const SizePlugin = require('size-plugin');

module.exports = {
  plugins: [
+    new SizePlugin({writeToDisk:true})
  ]
}
```

Second Simply [install the app](https://github.com/apps/size-plugin) and watch the magic happen

<p align="center">
  <img src="https://github.com/kuldeepkeshwar/size-plugin-bot/blob/master/static/images/sample.png?raw=true" alt="size-plugin commenting on a PR with bundle stats" width="760">
</p>


## Contributing

If you have suggestions for how size-plugin could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 kuldeepkeshwar <kuldeepkeshwar@gmail.com>
