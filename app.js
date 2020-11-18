//Global selections and variables

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

//This is for local storage
let savedPalettes = [];

//Functions

//event listeners

lockButton.forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement.parentElement.classList.toggle("locked");
    button.children[0].classList.toggle("fa-lock-open");
    button.children[0].classList.toggle("fa-lock");
  });
});

generateBtn.addEventListener("click", randomColors);

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((slider, index) => {
  slider.addEventListener("change", () => {
    updateTextUI(index);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

//Color Generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(randomColor.hex());
    }
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    //Check for contrast
    checkTextContrast(randomColor, hexText);
    const icons = div.querySelectorAll(".controls button");
    for (icon of icons) {
      checkTextContrast(randomColor, icon);
    }
    //Initial Colorize Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSlider(color, hue, brightness, saturation);
  });
  resetInput();
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSlider(color, hue, brightness, saturation) {
  //Scale Saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  //Scale Brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright");
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  colorizeSlider(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInput() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const hueColor = initialColors[slider.getAttribute("data-bright")];
      const hueValue = chroma(hueColor).hsl()[2];
      slider.value = hueValue;
    }
    if (slider.name === "saturation") {
      const hueColor = initialColors[slider.getAttribute("data-sat")];
      const hueValue = chroma(hueColor).hsl()[1];
      slider.value = hueValue;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  //Popup Animaition

  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

//Implement Save to palette and LOCAL STORAGE STUFF
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibrary1 = document.querySelector(".close-library");
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);

libraryBtn.addEventListener("click", openLibrary);
closeLibrary1.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }
  const palleteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(palleteObj);
  //Save to local storages
  savetoLocal(palleteObj);
  saveInput.value = "";
  //Generate
  const pallete = document.createElement("div");
  pallete.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = palleteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  palleteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;

    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(palleteObj.nr);
  paletteBtn.innerText = "Select";

  pallete.appendChild(title);
  pallete.appendChild(preview);
  pallete.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(pallete);

  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    console.log(paletteIndex);
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInput();
  });
}

function savetoLocal(palleteObj) {
  let localPalletes;
  if (localStorage.getItem("palettes") === null) {
    localPalletes = [];
  } else {
    localPalletes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalletes.push(palleteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalletes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalletes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((palleteObj) => {
      const pallete = document.createElement("div");
      pallete.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = palleteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      palleteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;

        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(palleteObj.nr);
      paletteBtn.innerText = "Select";

      pallete.appendChild(title);
      pallete.appendChild(preview);
      pallete.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(pallete);

      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        console.log(paletteIndex);
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInput();
      });
    });
  }
}

getLocal();
randomColors();
