import "./style.css";

const input = document.getElementById("search");
const button = document.getElementById("search-submit");
const unitInput = document.getElementById("unit");
const display = document.getElementById("weather");


const weather = async(location = "Toronto, Canada", unitGroup) => {
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?key=KLU5KE9GL7QRF5EPV2FUQESFV&unitGroup=${unitGroup}`, {mode: "cors"});
    const data = await response.json();
    console.log(data);
    const { resolvedAddress, currentConditions, days } = data;
    console.log(currentConditions);
    let tempUnit, precipUnit, windUnit, visibilityUnit;

    if (unitGroup === "us") {
        tempUnit = "\u00B0 F";
        precipUnit = "inches";
        windUnit = "mph";
        visibilityUnit = "miles"
    };

    if (unitGroup === "metric") {
        tempUnit = "\u00B0 C";
        precipUnit = "millimeters";
        windUnit = "km/h";
        visibilityUnit = "km"
    };

    const getWindDirection = (degree) => {
        const directions = [
            "N", "NNE", "NE", "ENE", 
            "E", "ESE", "SE", "SSE", 
            "S", "SSW", "SW", "WSW", 
            "W", "WNW", "NW", "NNW"
        ];
        return directions[Math.round(degree / 22.5) % 16];
    }


    const info = {
        Conditions: currentConditions.conditions,
        'Current Temperature': `${currentConditions.temp || "N/A"}${tempUnit}`,
        'Feels Like': `${currentConditions.feelslike || "N/A"}${tempUnit}`,
        "Today's High": `${days[0].tempmax || "N/A"}${tempUnit}`,
        "Today's Low": `${days[0].tempmin || "N/A"}${tempUnit}`,
        Wind: `${days[0].windspeed || "N/A"}${windUnit} ${getWindDirection(days[0].winddir || 0)}`,
        Humidity: `${days[0].humidity || "N/A"}%`,
        Precipitation: `${days[0].precip || 0} ${precipUnit}`,
        Visibility: `${currentConditions.visibility || "N/A"} ${visibilityUnit}`,
        'UV Index': currentConditions.uvindex || "N/A",
        Sunrise: currentConditions.sunrise || "N/A",
        Sunset: currentConditions.sunset || "N/A"
    }

    // console.log(currentConditions);
    return { resolvedAddress, info };
    
};

window.addEventListener("load", async () => {
    const { resolvedAddress, info } = await weather("Toronto, Canada", "metric");
    render(resolvedAddress, info);
});



button.addEventListener("click", async () => {
    let location = input.value;
    let unit = unitInput.value;
    const { resolvedAddress, info } = await weather(location, unit);
    render(resolvedAddress, info);
});


const render = (city, info) => {
    while (display.firstChild) {
        display.removeChild(display.firstChild);
    };
    const cityName = document.createElement("div");
    cityName.textContent = city;
    display.append(cityName);
    for (const key in info) {
        const cell = document.createElement("div");
        cell.textContent = `${key}: ${info[key]}`;
        display.append(cell);
    }
}