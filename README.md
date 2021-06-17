[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)

<p align="center">
  <img src="https://github.com/kuldeepkeshwar/size-plugin-bot/blob/master/static/images/icon.png?raw=true" alt="size-plugin" >
</p>
<p align="center">
  <h1 align="center">size-plugin</h1>
</p>

> A GitHub 🤖 built with Probot that helps you to keep an 👁️ on static asset 📦 sizes of your application and gives instant feedback 📝 for developer whenever they make change.

##### 🤖 comments the gzipped sizes of your webpack assets and the changes since the last build into the relevant PR

## Usage

First add an instance of the [size-plugin](https://github.com/GoogleChromeLabs/size-plugin) to your webpack configuration:

> using rollup ? use [rollup-plugin-size](https://github.com/luwes/rollup-plugin-size)

```diff
// webpack.config.js
+ const SizePlugin = require('size-plugin');

module.exports = {
  plugins: [
+    new SizePlugin({publish:true})
  ]
}
```

Second Simply [install the app](https://github.com/apps/size-plugin) and make some changes, open a pr and watch the magic happen 😊

<p align="center">
  <img src="https://github.com/kuldeepkeshwar/size-plugin-bot/blob/master/static/images/sample.png?raw=true" alt="size-plugin commenting on a PR with bundle stats" width="760">
</p>

Currently works with [Travis CI](https://travis-ci.org), [CircleCI](https://circleci.com/), [Wercker](http://www.wercker.com), and [Drone](http://readme.drone.io/).

Using a different CI? Under the hood, [size-plugin](https://github.com/GoogleChromeLabs/size-plugin) uses [ci-env](https://github.com/siddharthkp/ci-env) to extract meta information which works perfectly with Custom CI 🙃

## Configure Bot

Create a file `.github/size-plugin.yml`.

example 👇

```yml
base-branches: # base branches against which bot can open a pull request.
    - master
    - next
size-files: # list(string/object) of size*.json files
    ## In case of multiple builds.
    - sizes-browser.json
    - sizes-server.json
    ## In case of multiple packages in a single repo or mono repo
    - dir: packages/a
      filename: sizes-a.json
    - dir: packages/b
      filename: sizes-b.json
    - dir: packages/c
      filename: sizes-c-browser.json
    - dir: packages/c
      filename: sizes-c-server.json
```

> Note: `filename` must be unique

## Contributing

If you have suggestions for how size-plugin could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

#### like it?

⭐️ this repo

&nbsp;

## License

[ISC](LICENSE) © 2019 kuldeepkeshwar <kuldeepkeshwar@gmail.com>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://in.linkedin.com/in/kuldeepkeshwar"><img src="https://avatars1.githubusercontent.com/u/10448534?v=4" width="100px;" alt="anotherjsguy"/><br /><sub><b>anotherjsguy</b></sub></a><br /><a href="https://github.com/kuldeepkeshwar/size-plugin-bot/commits?author=kuldeepkeshwar" title="Code">💻</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
