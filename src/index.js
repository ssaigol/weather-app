import "./style.css";
import { format, addDays, getDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const pageContainer = document.getElementById("page-container");
const loadingDialog = document.getElementById("loading");
const searchInput = document.getElementById("search");
const unitSelect = document.getElementById("unit");
const headerDate = document.getElementById("todays-date");
const cityNameDisp = document.querySelector("#city-name");
const currentTimeDisp = document.querySelector("#current-time div");
const lastUpdatedDisp = document.querySelector("#last-updated div");
const todaysLowDisp = document.querySelector("#todays-low div");
const currentTempDisp = document.querySelector("#current-temp div");
const todaysHighDisp = document.querySelector("#todays-high div");
const descriptionDisp = document.querySelector("#description");
const feelsLikeDisp = document.querySelector("#feels-like div");
const currentIconDisp = document.querySelector("#current-icon img");
const precipDisp = document.querySelector("#precip div");
const cloudCoverDisp = document.querySelector("#cloud-cover div");
const humidityDisp = document.querySelector("#humidity div");
const moonPhaseDisp = document.querySelector("#moon-phase div");
const sunriseDisp = document.querySelector("#sunrise div");
const sunsetDisp = document.querySelector("#sunset div");
const uvIndexDisp = document.querySelector("#uv-index div");
const visibilityDisp = document.querySelector("#visibility div");
const windDisp = document.querySelector("#wind div");
const windDirDisp = document.querySelector("#cardinal");
const hourlySection = document.getElementById("hourly");
const weeklySection = document.getElementById("seven-days");
const hourlyCollapse = document.getElementById("hourly-collapse");
const weeklyCollapse = document.getElementById("weekly-collapse");

const imageContext = import.meta.webpackContext("./imgs", {
  recursive: false,
  regExp: /\.(svg)$/,
});
const images = {};
imageContext.keys().forEach((file) => {
  const fileName = file.replace("./", "").replace(/\.[a-zA-Z0-9]+$/, "");
  images[fileName] = imageContext(file);
});

const TODAY = format(new Date(), "yyyy-MM-dd");
const ONEWEEK = format(addDays(TODAY, 8), "yyyy-MM-dd");
const hours = [
  "12 a.m.",
  "1 a.m.",
  "2 a.m.",
  "3 a.m.",
  "4 a.m.",
  "5 a.m.",
  "6 a.m.",
  "7 a.m.",
  "8 a.m.",
  "9 a.m.",
  "10 a.m.",
  "11 a.m.",
  "12 p.m.",
  "1 p.m.",
  "2 p.m.",
  "3 p.m.",
  "4 p.m.",
  "5 p.m.",
  "6 p.m.",
  "7 p.m.",
  "8 p.m.",
  "9 p.m.",
  "10 p.m.",
  "11 p.m.",
];
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let location = "Toronto";
let unitGroup = "metric";
let currentUnits = {
  temp: " \u00B0F",
  amount: " inches",
  distance: " miles",
  speed: " mph",
};
let currentTimeZone;

//Helper Functions
const searchCity = () => {
  const inputValue = searchInput.value.trim();
  location = inputValue || "Toronto";
  render();
};

const unitMappings = {
  us: { temp: "°F", amount: " inches", distance: " miles", speed: " mph" },
  metric: { temp: "°C", amount: " mm", distance: " km", speed: " km/h" },
  uk: { temp: "°C", amount: " mm", distance: " miles", speed: " mph" },
  base: { temp: "K", amount: " mm", distance: " km", speed: " m/s" },
};

const updateUnits = () => {
  currentUnits = unitMappings[unitGroup] || unitMappings["us"];
};

const getZonedTime = () => {
  const time = toZonedTime(new Date(), currentTimeZone);
  return format(time, "h:mm aaaa");
};

const moonPhaseCalculator = (value) => {
  if (value === 0) return "New Moon";
  if (value > 0 && value < 0.25) return "Waxing Crescent";
  if (value === 0.25) return "First Quarter";
  if (value > 0.25 && value < 0.5) return "Waxing Gibbous";
  if (value === 0.5) return "Full Moon";
  if (value > 0.5 && value < 0.75) return "Waning Gibbous";
  if (value === 0.75) return "Last Quarter";
  if (value > 0.75 && value < 1) return "Waning Crescent";
};

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

//API Fetch
const weather = async () => {
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/${TODAY}/${ONEWEEK}?key=KLU5KE9GL7QRF5EPV2FUQESFV&unitGroup=${unitGroup}&lang=en&include=days,hours,current&elements=resolvedAddress,description,datetime,temp,feelslike,icon,tempmin,tempmax,precip,cloudcover,humidity,visibility,windspeedmean,winddir,moonphase,sunrise,sunset,uvindex,precipprob&iconSet=icons2`,
    { mode: "cors" },
  );
  const data = await response.json();

  const current = {
    city: data.resolvedAddress,
    timezone: data.timezone,
    lastUpdated: data.currentConditions.datetime,
    temperature: data.currentConditions.temp,
    description: data.days[0].description,
    feelsLike: data.currentConditions.feelslike,
    icon: data.currentConditions.icon,
  };

  const todaysConditions = {
    todaysLow: data.days[0].tempmin,
    todaysHigh: data.days[0].tempmax,
    precip: data.days[0].precip,
    cloudCover: data.days[0].cloudcover,
    humidity: data.days[0].humidity,
    visibility: data.days[0].visibility,
    windSpeed: data.days[0].windspeedmean,
    windDirection: data.days[0].winddir,
    moonPhase: data.days[0].moonphase,
    sunrise: data.days[0].sunrise,
    sunset: data.days[0].sunset,
    uvIndex: data.days[0].uvindex,
  };

  const hourlyConditions = [];
  for (let i = 0; i < 24; i++) {
    const hour = {
      temp: data.days[0].hours[i].temp,
      icon: data.days[0].hours[i].icon,
    };
    hourlyConditions.push(hour);
  }

  const sevenDayForecast = [];
  for (let i = 1; i < 8; i++) {
    const day = {
      dayLow: data.days[i].tempmin,
      dayHigh: data.days[i].tempmax,
      icon: data.days[i].icon,
      precipProb: data.days[i].precipprob,
    };
    sevenDayForecast.push(day);
  }

  console.log(current, todaysConditions, hourlyConditions, sevenDayForecast);
  currentTimeZone = current.timezone;
  return { current, todaysConditions, hourlyConditions, sevenDayForecast };
};

//Render Functions
const render = async () => {
  const { current, todaysConditions, hourlyConditions, sevenDayForecast } =
    await weather();
  updateUnits();
  renderPrimary(current, todaysConditions);
  renderSecondary(todaysConditions);
  renderHourly(hourlyConditions);
  renderWeekly(sevenDayForecast);
  loadingDialog.close();
};

const renderPrimary = (current, todaysConditions) => {
  cityNameDisp.textContent = current.city;
  currentTimeDisp.textContent = getZonedTime();
  const lastUpdatedTime = new Date(TODAY.concat("T", current.lastUpdated));
  lastUpdatedDisp.textContent = format(lastUpdatedTime, "h:mm aaaa");
  todaysLowDisp.textContent = todaysConditions.todaysLow + currentUnits.temp;
  currentTempDisp.textContent = current.temperature + currentUnits.temp;
  todaysHighDisp.textContent = todaysConditions.todaysHigh + currentUnits.temp;
  descriptionDisp.textContent = current.description;
  feelsLikeDisp.textContent = current.feelsLike + currentUnits.temp;
  currentIconDisp.src = images[current.icon];
};

const renderSecondary = (todaysConditions) => {
  precipDisp.textContent = todaysConditions.precip + currentUnits.amount;
  cloudCoverDisp.textContent = todaysConditions.cloudCover + "%";
  humidityDisp.textContent = todaysConditions.humidity + "%";
  moonPhaseDisp.textContent = moonPhaseCalculator(todaysConditions.moonPhase);
  const sunriseTime = new Date(TODAY.concat("T", todaysConditions.sunrise));
  sunriseDisp.textContent = format(sunriseTime, "h:mm aaaa");
  const sunsetTime = new Date(TODAY.concat("T", todaysConditions.sunset));
  sunsetDisp.textContent = format(sunsetTime, "h:mm aaaa");
  uvIndexDisp.textContent = todaysConditions.uvIndex;
  visibilityDisp.textContent =
    todaysConditions.visibility + currentUnits.distance;
  windDisp.textContent = todaysConditions.windSpeed + currentUnits.speed;
  windDirDisp.textContent = getWindDirection(todaysConditions.windDirection);
};

const renderHourly = (hourlyConditions) => {
  while (hourlySection.firstChild) {
    hourlySection.removeChild(hourlySection.firstChild);
  }
  hourlyConditions.forEach((hour, index) => {
    const cell = document.createElement("div");
    const time = document.createElement("div");
    time.textContent = hours[index];
    const hourTemp = document.createElement("div");
    hourTemp.textContent = hour.temp + currentUnits.temp;
    const hourIcon = document.createElement("img");
    hourIcon.src = images[hour.icon];
    hourIcon.style.height = "20%";
    cell.append(time, hourIcon, hourTemp);
    hourlySection.append(cell);
  });
};

const renderWeekly = (week) => {
  const today = getDay(new Date());
  while (weeklySection.firstChild) {
    weeklySection.removeChild(weeklySection.firstChild);
  }
  week.forEach((day, index) => {
    const cell = document.createElement("div");
    const date = document.createElement("div");
    date.textContent = days[(today + index + 1) % 7];
    const temps = document.createElement("div");
    const dayHigh = document.createElement("div");
    dayHigh.textContent = day.dayHigh + currentUnits.temp;
    const dayLow = document.createElement("div");
    dayLow.textContent = day.dayLow + currentUnits.temp;
    temps.append(dayLow, dayHigh);
    temps.classList.add("temps");
    const dayIcon = document.createElement("img");
    dayIcon.src = images[day.icon];
    dayIcon.style.height = "20%";
    cell.append(date, temps, dayIcon);
    weeklySection.append(cell);
  });
};

const renderHeader = () => {
  const date = format(new Date(), "EEEE, MMMM do, yyyy");
  headerDate.textContent = date;
};

const collapseHourly = () => {
  hourlySection.classList.toggle("collapsed");
  adjustGridTemplate();
};

const collapseWeekly = () => {
  weeklySection.classList.toggle("collapsed");
  adjustGridTemplate();
};

const adjustGridTemplate = () => {
  if (
    hourlySection.classList.contains("collapsed") &&
    weeklySection.classList.contains("collapsed")
  ) {
    pageContainer.style.gridTemplateRows =
      "100px minmax(2.5fr, 600px) 2.5rem 2.5rem";
  } else if (
    !hourlySection.classList.contains("collapsed") &&
    weeklySection.classList.contains("collapsed")
  ) {
    pageContainer.style.gridTemplateRows =
      "100px minmax(2.5fr, 600px) 2.5rem 0.75fr 2.5rem";
  } else if (
    !hourlySection.classList.contains("collapsed") &&
    !weeklySection.classList.contains("collapsed")
  ) {
    pageContainer.style.gridTemplateRows =
      "100px minmax(2.5fr, 600px) 2.5rem 0.75fr 2.5rem 1fr";
  }
};

//Event Listeners
window.addEventListener("load", () => {
  loadingDialog.showModal();
  renderHeader();
  searchCity();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    loadingDialog.showModal();
    searchCity();
  }
});

unitSelect.addEventListener("change", () => {
  loadingDialog.showModal();
  unitGroup = unitSelect.value;
  searchCity();
});

hourlyCollapse.addEventListener("click", collapseHourly);
weeklyCollapse.addEventListener("click", collapseWeekly);
