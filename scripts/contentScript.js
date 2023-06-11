import {
  sortByColor,
  sortByFontSize,
  sortByTypoType,
  removeDuplicateObjects,
} from './utils.js';

(async () => {
  const { uniqueColors, uniqueTypography } = await fetchElementsData();

  chrome.runtime.sendMessage({
    type: 'FONTS_AND_STYLES',
    data: {
      colors: uniqueColors,
      typography: uniqueTypography,
    },
  });
})();

async function fetchElementsData() {
  const elements = document.querySelectorAll('*');
  const colors = [];
  const typography = [];

  elements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    const style = window.getComputedStyle(element);
    const color = style.getPropertyValue('color');
    const bgColor = style.getPropertyValue('background-color');
    const fontFamily = style.getPropertyValue('font-family');
    const fontSize = style.getPropertyValue('font-size');
    const fontWeight = style.getPropertyValue('font-weight');
    const lineHeight = style.getPropertyValue('line-height');
    const letterSpacing = style.getPropertyValue('letter-spacing');

    if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
      colors.push(color);
    }
    if (
      bgColor &&
      bgColor !== 'transparent' &&
      bgColor !== 'rgba(0, 0, 0, 0)'
    ) {
      colors.push(bgColor);
    }

    const titleRegex = /^h[1-6]$/i;
    const typoType = titleRegex.test(tagName)
      ? 'title'
      : tagName === 'button'
      ? 'button'
      : 'body';

    const currentTypography = {
      typoType: typoType,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: fontWeight,
      lineHeight: lineHeight,
      letterSpacing: letterSpacing,
    };

    typography.push(currentTypography);
  });

  const uniqueColors = Array.from(new Set(colors)).sort(sortByColor);
  const uniqueTypography = removeDuplicateObjects(typography)
    .sort(sortByFontSize)
    .sort(sortByTypoType);
  return { uniqueColors, uniqueTypography };
}

const saveToChromeStorage = async () => {
  const { uniqueColors, uniqueTypography } = await fetchElementsData();
  chrome.storage.local.set({
    colors: uniqueColors,
    typography: uniqueTypography,
  });
};

saveToChromeStorage();
