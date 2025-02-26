import "./style.css";
import { format, addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const searchInput = document.getElementById("search");
const searchSubmit = document.getElementById("search-submit");
const unitSelect = document.getElementById("unit");
const primary = document.getElementById("primary");
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
let location = "New York";
let unitGroup = "us";
let currentTimeZone;

//Helper Functions
const searchCity = () => {
  if (searchInput.value.trim() === "") {
    render();
  } else {
    location = searchInput.value;
    render();
  }
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
}



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
      precipProb: data.days[0].hours[i].precipprob,
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
    const { current, todaysConditions, hourlyConditions, sevenDayForecast } = await weather();
    clearValues();
    renderPrimary(current, todaysConditions);
    renderSecondary(todaysConditions);
    addUnits();
}

const renderPrimary = (current, todaysConditions) => {
  cityNameDisp.textContent = current.city;
  currentTimeDisp.textContent = getZonedTime();
  const lastUpdatedTime = new Date(TODAY.concat("T", current.lastUpdated));
  lastUpdatedDisp.textContent = format(lastUpdatedTime, "h:mm aaaa");
  todaysLowDisp.prepend(todaysConditions.todaysLow);
  currentTempDisp.prepend(current.temperature);
  todaysHighDisp.prepend(todaysConditions.todaysHigh);
  descriptionDisp.textContent = current.description;
  feelsLikeDisp.prepend(current.feelsLike);
  // currentIconDisp.src = `url('${images[current.icon]}')`
};

const renderSecondary = (todaysConditions) => {
    precipDisp.prepend(todaysConditions.precip);
    cloudCoverDisp.prepend(todaysConditions.cloudCover);
    humidityDisp.prepend(todaysConditions.humidity);
    moonPhaseDisp.textContent = moonPhaseCalculator(todaysConditions.moonPhase);
    const sunriseTime = new Date(TODAY.concat("T", todaysConditions.sunrise));
    sunriseDisp.textContent = format(sunriseTime, "h:mm aaaa");
    const sunsetTime = new Date(TODAY.concat("T", todaysConditions.sunset));
    sunsetDisp.textContent = format(sunsetTime, "h:mm aaaa");
    uvIndexDisp.textContent = todaysConditions.uvIndex;
    visibilityDisp.prepend(todaysConditions.visibility);
    windDisp.prepend(todaysConditions.windSpeed);
    windDirDisp.textContent = getWindDirection(todaysConditions.windDirection);
}

const clearValues = () => {
    const valueElements = document.getElementsByClassName("value");
    [...valueElements].forEach(element => {
        element.firstChild.textContent = "";
    })
}

const addUnits = () => {
    const units = {
        us: {
            temp: " \u00B0F",
            amount: " inches",
            distance: " miles",
            speed: " mph"
        },
    
        metric: {
            temp: " \u00B0C",
            amount: " millimeters",
            distance: " kilometers",
            speed: " km/h"
        },    
        uk: {
            temp: " \u00B0C",
            amount: " millimeters",
            distance: " miles",
            speed: " mph"
        },    
        base: {
            temp: " K",
            amount: " millimeters",
            distance: " kilometers",
            speed: " meters per second"
        }
    }
    const unitElements = document.getElementsByClassName("unit");
    const currentUnitGroup = units[unitGroup];
    [...unitElements].forEach(element => {
        if (element.classList.contains("temp")) {
            element.textContent = currentUnitGroup.temp;
        };
        if (element.classList.contains("amount")) {
            element.textContent = currentUnitGroup.amount;
        };
        if (element.classList.contains("distance")) {
            element.textContent = currentUnitGroup.distance;
        };
        if (element.classList.contains("speed")) {
            element.textContent = currentUnitGroup.speed
        };
        if (element.classList.contains("percentage")) {
            element.textContent = "%";
        };
    })
}

//Event Listeners
window.addEventListener("load", searchCity);

searchSubmit.addEventListener("click", searchCity);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchCity();
  }
});

unitSelect.addEventListener("change", () => {
  unitGroup = unitSelect.value;
  searchCity();
});

// const render = (city, info, icon) => {
//   while (display.firstChild) {
//     display.removeChild(display.firstChild);
//   }
//   const cityName = document.createElement("div");
//   cityName.textContent = city;
//   display.append(cityName);
//   for (const key in info) {
//     const cell = document.createElement("div");
//     cell.innerHTML = `<strong>${key}:</strong> ${info[key]}`;
//     display.append(cell);
//   }
//   renderBackground(icon);
//   input.value = "";
// };

// const renderLoading = () => {
//   while (display.firstChild) {
//     display.removeChild(display.firstChild);
//   }
//   const loadingMessage = document.createElement("div");
//   loadingMessage.textContent = "Loading...";
//   display.append(loadingMessage);
// };

// const renderBackground = (icon) => {
//   const background = document.getElementById("background");
//   background.style.backgroundImage = `url('${images[icon]}')`;
// };

// const weather = async() => {
//     const response = await fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Toronto/2025-02-25/2025-03-04?key=KLU5KE9GL7QRF5EPV2FUQESFV&unitGroup=metric&lang=en&include=days,hours,current&elements=datetime,temp,feelslike,icon,tempmin,tempmax,precip,cloudcover,humidivisibility,windspeedmean,moonphase,sunrise,sunset,uvindex,precipprob&iconSet=icons2", {mode: "cors"})

//     const data = await response.json();
//     console.log(data);
// }

// weather();
