const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
};

const sortByLightness = (a, b) => {
  const aRgb = a.match(/\d+/g).map(Number);
  const bRgb = b.match(/\d+/g).map(Number);
  const [, , aLightness] = rgbToHsl(...aRgb);
  const [, , bLightness] = rgbToHsl(...bRgb);

  return bLightness - aLightness;
};

export const sortByColor = (a, b) => {
  return sortByLightness(a, b);
};

export const sortByFontSize = (a, b) => {
  const aSize = parseFloat(a.fontSize);
  const bSize = parseFloat(b.fontSize);

  return bSize - aSize;
};

export const sortByTypoType = (a, b) => {
  const order = { title: 1, body: 2, button: 3 };
  return order[a.typoType] - order[b.typoType];
};

export const removeDuplicateObjects = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    const k = JSON.stringify(item);
    return seen.has(k) ? false : seen.add(k);
  });
};
