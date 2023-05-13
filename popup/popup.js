chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FONTS_AND_STYLES') {
    const { colors, typography, fontFaceRules } = message.data;

    // (생략된 코드: colors, typography를 사용하여 popup 창의 내용을 업데이트)

    const styleTag = document.createElement('style');
    styleTag.textContent = fontFaceRules.join('\n');
    document.head.appendChild(styleTag);
  }
});

const getColorsFromStorage = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get('colors', (result) => {
      resolve(result.colors || []);
    });
  });
};

const getTypographyFromStorage = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get('typography', (result) => {
      resolve(result.typography || []);
    });
  });
};

function rgbaStringToHex(rgbaString) {
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
}

const displayColors = (color) => {
  const colorsContainer = document.querySelector('#colorsContainer');
  const element = document.createElement('div');
  element.classList.add('color-block');
  element.style.backgroundColor = color;
  const hex = rgbaStringToHex(color);

  element.innerText = hex;

  colorsContainer.append(element);
};

const displayTypography = (typography) => {
  const {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    typoType,
  } = typography;

  const colorsContainer = document.querySelector('#typosContainer');
  const element = document.createElement('div');
  const title = document.createElement('h3');

  title.innerText =
    typoType === 'title'
      ? '타이틀입니다'
      : typoType === 'button'
      ? '버튼'
      : lineHeight === '0px'
      ? '짧은 텍스트'
      : '긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다. 긴 텍스트입니다.';

  title.style.fontFamily = fontFamily;
  title.style.fontSize = fontSize;
  title.style.fontWeight = fontWeight;
  title.style.lineHeight = lineHeight;
  title.style.letterSpacing = letterSpacing;
  const contents = document.createElement('p');
  element.classList.add('typo-block');
  contents.innerText = `fontFamily: ${fontFamily.split(',')[0].trim()},
  fontSize: ${fontSize},
  fontWeight: ${fontWeight},
  lineHeight: ${lineHeight},
  letterSpacing: ${letterSpacing},
  `;

  element.append(title, contents);
  colorsContainer.append(element);
};

const renderSystem = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['scripts/contentScript.js'],
    });
    const colors = await getColorsFromStorage();
    const typography = await getTypographyFromStorage();

    colors.forEach((color) => {
      displayColors(color);
    });
    typography.forEach((typography) => {
      displayTypography(typography);
    });

    const contents = document.querySelector('#contents');
    contents.classList.add('show');
  } catch (error) {
    console.error('Error executing script:', error);
  }
};

renderSystem();
