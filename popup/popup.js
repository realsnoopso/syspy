const getColorsFromStorage = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get('colors', (result) => {
      resolve(result.colors || []);
    });
  });
};

const displayColors = (color) => {
  const colorsContainer = document.querySelector('#colorsContainer');
  const element = document.createElement('div');
  element.classList.add('color-block');
  element.style.backgroundColor = color;

  console.log(element);
  console.log(colorsContainer);
  colorsContainer.append(element);
};

document
  .getElementById('fetchColorsBtn')
  .addEventListener('click', async () => {
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

      colors.forEach((color) => {
        displayColors(color);
      });
    } catch (error) {
      console.error('Error executing script:', error);
    }
  });
