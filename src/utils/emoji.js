const list = require("emojis-list");

const total = list.length;

function random(n = 2) {
  const items = [];
  for (let index = 0; index < n; index += 1) {
    const i = Math.floor(Math.random() * total);
    items.push(list[i]);
  }
  return items;
}
module.exports = { random };
