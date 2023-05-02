async function fetchColors() {
  const elements = document.querySelectorAll('*');
  const colors = [];

  for (let i = 0; i < elements.length; i++) {
    const style = window.getComputedStyle(elements[i]);
    const color = style.getPropertyValue('color');
    const bgColor = style.getPropertyValue('background-color');

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
  }

  const uniqueColors = Array.from(new Set(colors));
  return uniqueColors;
}

const saveToChromeStorage = async () => {
  const colors = await fetchColors();
  chrome.storage.local.set({ colors: colors });
};

saveToChromeStorage();
