exports.getCanvas = async id => {
  return document.getElementById(id);
};

exports.get2DContext = async canvas => {
  return canvas.getContext("2d");
};
