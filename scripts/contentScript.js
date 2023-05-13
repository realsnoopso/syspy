function rgbToHsl(r, g, b) {
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
}

async function fetchFontsData() {
  const fontFaceRules = [];
  const styleSheets = document.styleSheets;

  async function fetchStylesheet(url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      return text;
    } catch (error) {
      console.error('Error while fetching stylesheet:', error);
      return null;
    }
  }

  async function findFontFaceRulesInText(text) {
    const regex = /@font-face\s*{[^}]*}/g;
    const foundRules = text.match(regex);
    if (foundRules) {
      fontFaceRules.push(...foundRules);
    }
  }

  for (const styleSheet of styleSheets) {
    try {
      if (styleSheet.href) {
        const stylesheetText = await fetchStylesheet(styleSheet.href);
        if (stylesheetText) {
          await findFontFaceRulesInText(stylesheetText);
        }
      } else {
        const cssRules = styleSheet.cssRules;
        for (const rule of cssRules) {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            fontFaceRules.push(rule.cssText);
          }
        }
      }
    } catch (error) {
      console.error('Error while accessing styleSheet:', error);
    }
  }

  return fontFaceRules;
}

(async () => {
  const { uniqueColors, uniqueTypography } = await fetchElementsData();
  const fontFaceRules = await fetchFontsData();

  chrome.runtime.sendMessage({
    type: 'FONTS_AND_STYLES',
    data: {
      colors: uniqueColors,
      typography: uniqueTypography,
      fontFaceRules: fontFaceRules,
    },
  });
})();

function sortByLightness(a, b) {
  const aRgb = a.match(/\d+/g).map(Number);
  const bRgb = b.match(/\d+/g).map(Number);
  const [, , aLightness] = rgbToHsl(...aRgb);
  const [, , bLightness] = rgbToHsl(...bRgb);

  return bLightness - aLightness;
}

function sortByColor(a, b) {
  return sortByLightness(a, b);
}

function sortByFontSize(a, b) {
  const aSize = parseFloat(a.fontSize);
  const bSize = parseFloat(b.fontSize);

  return bSize - aSize;
}

function sortByTypoType(a, b) {
  const order = { title: 1, body: 2, button: 3 };
  return order[a.typoType] - order[b.typoType];
}

function removeDuplicateObjects(arr) {
  const seen = new Set();
  return arr.filter((item) => {
    const k = JSON.stringify(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

async function fetchElementsData() {
  const elements = document.querySelectorAll('*');
  const colors = [];
  const typography = [];

  for (let i = 0; i < elements.length; i++) {
    const tagName = elements[i].tagName.toLowerCase();
    const style = window.getComputedStyle(elements[i]);
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

    const titleRegex = /^h[1-6]$/i; // 대소문자 구분 없이 변경합니다.
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
  }

  const uniqueColors = Array.from(new Set(colors)).sort(sortByColor);
  const uniqueTypography = removeDuplicateObjects(typography)
    .sort(sortByFontSize)
    .sort(sortByTypoType); // typoType 기준으로 정렬 추가
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
