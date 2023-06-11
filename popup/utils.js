export const getValuesFromStorage = async (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] || []);
    });
  });
};

export const rgbaStringToHex = (rgbaString) => {
  if (typeof rgbaString !== 'string') {
    throw new Error('Input must be a string');
  }

  const rgbArray = rgbaString
    .substring(rgbaString.indexOf('(') + 1, rgbaString.lastIndexOf(')'))
    .split(',')
    .map((value) => value.trim());

  const [r, g, b] = rgbArray;

  const red = parseInt(r, 10).toString(16).padStart(2, '0');
  const green = parseInt(g, 10).toString(16).padStart(2, '0');
  const blue = parseInt(b, 10).toString(16).padStart(2, '0');

  return `#${red}${green}${blue}`;
};

export const getText = (typoType, lineHeight) => {
  if (typoType === 'title') return '타이틀입니다';
  if (typoType === 'button') return '버튼';
  if (lineHeight === '0px') return '짧은 텍스트';
  return '긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다.';
};
