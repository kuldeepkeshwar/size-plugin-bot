function toMap(arr, propertyname) {
  return arr.reduce((agg, item) => {
    const property = item[propertyname];
    // eslint-disable-next-line no-param-reassign
    agg[property] = item;
    return agg;
  }, {});
}
exports.toMap = toMap;
