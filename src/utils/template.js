
const prettyBytes = require("pretty-bytes");
function decorateComment(files) {
    const width = Math.max(...files.map(file => file.filename.length));
    // filename,
    // previous,
    // size,
    // diff
    let output = '';
    for (const file of files) {
      const { filename:name, size, diff: delta } = file;
      const msg = new Array(width - name.length + 2).join(" ") + name + " ⏤  ";
      const color =
        size > 100 * 1024
          ? "red"
          : size > 40 * 1024
          ? "yellow"
          : size > 20 * 1024
          ? "cyan"
          : "green";
      let sizeText = colorText(color,prettyBytes(size));
      let deltaText = "";
      if (delta && Math.abs(delta) > 1) {
        deltaText = (delta > 0 ? "+" : "") + prettyBytes(delta);
        if (delta > 1024) {
          sizeText = bold(sizeText);
          deltaText = colorText('red',deltaText);
        } else if (delta < -10) {
          deltaText = colorText('green',deltaText);
        }
        sizeText += ` (${deltaText})`;
      }
      let text = msg + sizeText + "\n";
      output += text;
    }
    return output;
  }
  function bold(text) {
    return text;
    //return `<b>${text}</b>`;
  }
  function colorText(color, text) {
    return text;
    //return `<span style="color:${color}">${text}</span>`;
  }
  module.exports={decorateComment}