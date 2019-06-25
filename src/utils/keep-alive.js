const http = require('http');

function createOptions(options){
  const _options = {
    path: options.path ||'/_keepalive',
    delay:options.delay || 3
  };
  _options.url=`http://${process.env.PROJECT_DOMAIN}.glitch.me${_options.path}`;
  return _options;
}
module.exports = function(options){
  const _options=createOptions(options)
  setInterval(() => http.get(_options.url), _options.delay * 60 * 1000);
  return (req, res, next) => {
    if (req.path === _options.path) {
      res.send("I'm alive");
    } else {
      next();
    }
  };
}