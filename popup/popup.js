import { getValuesFromStorage, rgbaStringToHex, getText } from './utils.js';

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

  title.innerText = getText(typoType, lineHeight);
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

    const colors = await getValuesFromStorage('colors');
    const typography = await getValuesFromStorage('typography');

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
