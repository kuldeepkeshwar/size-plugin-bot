const { MAX_RETRY, RETRY_INTERVAL } = require('./../config');

function logError(error) {
  if (error.response) {
    console.error({ data: error.response.data, status: error.response.status });
  } else if (error.request) {
    console.error(error.request);
  } else {
    console.error('Error', error.message);
  }
}
function parseError(error) {
  if (error.response) {
    return { message: error.response.data, status: error.response.status };
  }
  return error;
}

function fetchWithRetry(
  makeRequest,
  options = { max: MAX_RETRY, interval: RETRY_INTERVAL },
) {
  return new Promise((resolve, reject) => {
    let retry = 0;
    const id = setInterval(() => {
      (async function poll() {
        try {
          retry += 1;
          const response = await makeRequest();
          clearInterval(id);
          resolve(response && response.data);
        } catch (error) {
          logError(error);
          if (retry === options.max) {
            clearInterval(id);
            console.error(`failed after retrying ${retry} times`);
            reject(parseError(error));
          }
        }
      }());
    }, options.interval);
  });
}
module.exports = { logError, parseError, fetchWithRetry };
