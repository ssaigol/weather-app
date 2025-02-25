import "./style.css";

const input = document.getElementById("search");
const button = document.getElementById("search-submit");
const unitInput = document.getElementById("unit");
const display = document.getElementById("weather");
const imageContext = require.context("./imgs", false, /\.(svg)$/);
const images = {};
imageContext.keys().forEach((file) => {
  const fileName = file.replace("./", "").replace(/\.[a-zA-Z0-9]+$/, "");
  images[fileName] = imageContext(file);
});

//Helper Functions
const getWindDirection = (degree) => {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return directions[Math.round(degree / 22.5) % 16];
};

const convertTimeto12H = (string) => {
  const hour = Number(string.slice(0, 2)) - 12;
  const rest = string.slice(2, 5);
  return `${hour}${rest}`;
};

//API Fetch
const weather = async (location = "Toronto, Canada", unitGroup) => {
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?key=KLU5KE9GL7QRF5EPV2FUQESFV&unitGroup=${unitGroup}&iconSet=icons2`,
    { mode: "cors" },
  );
  const data = await response.json();
  console.log(data);
  const { resolvedAddress, currentConditions, days } = data;
  console.log(currentConditions);
  let tempUnit, precipUnit, windUnit, visibilityUnit;

  if (unitGroup === "us") {
    tempUnit = "\u00B0 F";
    precipUnit = "inches";
    windUnit = "mph";
    visibilityUnit = "miles";
  }

  if (unitGroup === "metric") {
    tempUnit = "\u00B0 C";
    precipUnit = "millimeters";
    windUnit = "km/h";
    visibilityUnit = "km";
  }

  const icon = currentConditions.icon;

  const info = {
    Conditions: currentConditions.conditions,
    "Current Temperature": `${currentConditions.temp ?? "N/A"}${tempUnit}`,
    "Feels Like": `${currentConditions.feelslike ?? "N/A"}${tempUnit}`,
    "Today's High": `${days[0].tempmax ?? "N/A"}${tempUnit}`,
    "Today's Low": `${days[0].tempmin ?? "N/A"}${tempUnit}`,
    Wind: `${days[0].windspeed ?? "N/A"}${windUnit} ${getWindDirection(days[0].winddir ?? 0)}`,
    Humidity: `${days[0].humidity ?? "N/A"}%`,
    Precipitation: `${days[0].precip ?? 0} ${precipUnit}`,
    Visibility: `${currentConditions.visibility ?? "N/A"} ${visibilityUnit}`,
    "UV Index": currentConditions.uvindex ?? "N/A",
    Sunrise: `${currentConditions.sunrise.slice(0, 5) ?? "N/A"} AM`,
    Sunset: `${convertTimeto12H(currentConditions.sunset) ?? "N/A"} PM`,
  };

  return { resolvedAddress, info, icon };
};

//Event Listeners
window.addEventListener("load", async () => {
  renderLoading();
  const { resolvedAddress, info, icon } = await weather(
    "Toronto, Canada",
    "metric",
  );
  render(resolvedAddress, info, icon);
});

button.addEventListener("click", async () => {
  renderLoading();
  let location = input.value || "Toronto";
  let unit = unitInput.value;
  const { resolvedAddress, info, icon } = await weather(location, unit);
  render(resolvedAddress, info, icon);
});

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    renderLoading();
    let location = input.value || "Toronto";
    let unit = unitInput.value;
    const { resolvedAddress, info, icon } = await weather(location, unit);
    render(resolvedAddress, info, icon);
  }
});

//Render Functions
const render = (city, info, icon) => {
  while (display.firstChild) {
    display.removeChild(display.firstChild);
  }
  const cityName = document.createElement("div");
  cityName.textContent = city;
  display.append(cityName);
  for (const key in info) {
    const cell = document.createElement("div");
    cell.innerHTML = `<strong>${key}:</strong> ${info[key]}`;
    display.append(cell);
  }
  renderBackground(icon);
  input.value = "";
};

const renderLoading = () => {
  while (display.firstChild) {
    display.removeChild(display.firstChild);
  }
  const loadingMessage = document.createElement("div");
  loadingMessage.textContent = "Loading...";
  display.append(loadingMessage);
};

const renderBackground = (icon) => {
  const background = document.getElementById("background");
  background.style.backgroundImage = `url('${images[icon]}')`;
};
