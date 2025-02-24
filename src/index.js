import "./style.css";

const input = document.getElementById("input");
const button = document.getElementById("button");
const unitInput = document.getElementById("unit");
const display = document.getElementById("weather");


const weather = async(location = "Toronto, Canada", unit) => {
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?key=KLU5KE9GL7QRF5EPV2FUQESFV&unitGroup=${unit}`, {mode: "cors"});
    
    const { resolvedAddress, currentConditions } = await response.json();

    // console.log(currentConditions);
    return { resolvedAddress, currentConditions };
    
};

window.addEventListener("load", async () => {
    const { resolvedAddress, currentConditions } = await weather("Toronto, Canada", "metric");
    render(resolvedAddress, currentConditions);
});



button.addEventListener("click", async () => {
    let location = input.value;
    let unit = unitInput.value;
    const { resolvedAddress, currentConditions } = await weather(location, unit);
    render(resolvedAddress, currentConditions);
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