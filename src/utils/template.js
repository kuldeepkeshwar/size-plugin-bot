/* eslint-disable no-nested-ternary */
const prettyBytes = require('pretty-bytes');

function bold(text) {
  return text;
  // return `<b>${text}</b>`;
}

function textWithEmoji(color, text) {
  const emoji = { red: '🚫', green: '✅' };
  return `${text} ${emoji[color]}`;
}
function colorText(color, text) {
  return text;
  // return `<span style="color:${color}">${text} </span>`;
}
function decorateComment(files) {
  const width = Math.max(...files.map(file => file.filename.length));
  let output = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const { filename: name, size, diff: delta } = file;
    const msg = `${new Array(width - name.length + 2).join(' ') + name} ⏤  `;
    const color = size > 100 * 1024
      ? 'red'
      : size > 40 * 1024
        ? 'yellow'
        : size > 20 * 1024
          ? 'cyan'
          : 'green';
    let sizeText = colorText(color, prettyBytes(size));
    let deltaText = '';
    if (delta && Math.abs(delta) > 1) {
      deltaText = (delta > 0 ? '+' : '') + prettyBytes(delta);
      if (delta > 1024) {
        sizeText = bold(sizeText);
        deltaText = textWithEmoji('red', deltaText);
      } else if (delta < -10) {
        deltaText = textWithEmoji('green', deltaText);
      }
      sizeText += ` (${deltaText})`;
    }
    const text = `${msg + sizeText}\n`;
    output += text;
  }
  return output;
}
module.exports = { decorateComment };
