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
function getColorCode(size){
  return size > 100 * 1024
      ? 'red'
      : size > 40 * 1024
        ? 'yellow'
        : size > 20 * 1024
          ? 'cyan'
          : 'green';
}
function decorateDelta(delta){
  let deltaText = (delta > 0 ? '+' : '') + prettyBytes(delta);
  if (delta > 1024) {
    deltaText = textWithEmoji('red', deltaText);
  } else if (delta < -10) {
    deltaText = textWithEmoji('green', deltaText);
  }
  return deltaText;
}
function decorateHeading(name,files){
  try{
    const result=files.reduce((agg,item)=>{
      agg.total=agg.total-0 + item.size;
      agg.delta=agg.delta-0 + item.diff;
      return agg;
    },{
      total:0,delta:0
    })
  
    const total= `Overall size: ${prettyBytes(result.total)}`;
    const delta= result.delta && Math.abs(result.delta) > 1?` (${decorateDelta(result.delta)})`:'';
    return `
${name.replace('.json', '')}
${total} ${delta}`;
  }catch(err){console.log(err)}
}
function decorateComment(files) {
  const width = Math.max(...files.map(file => file.filename.length));
  let output = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const { filename: name, size, diff: delta } = file;
    const msg = `${new Array(width - name.length + 2).join(' ') + name} ⏤  `;
    const color = getColorCode(size);
    let sizeText = colorText(color, prettyBytes(size));
    if (delta && Math.abs(delta) > 1) {
      sizeText += ` (${decorateDelta(delta)})`;
    }
    const text = `${msg + sizeText}\n`;
    output += text;
  }
  return output;
}
module.exports = { decorateComment,decorateHeading };
