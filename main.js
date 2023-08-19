import './style.css'
import { getWeather } from './weather'
import {ICON_MAP} from './iconMap'
import axios from 'axios'

var address = document.querySelector("#address")
var lat = 30.27
var long = -97.74


async function findAddress() {
  var url = "https://nominatim.openstreetmap.org/search?format=json&limit=3&q=" + address.value 
  await fetch(url)
                  .then(response => response.json())
                  .then(data => {
                    // Assuming the first result contains the latitude and longitude
                    if (data.length > 0) {
                      lat = parseFloat(data[0].lat);
                      long = parseFloat(data[0].lon);
                      console.log("Latitude:", lat);
                      console.log("Longitude:", long);
                    } else {
                      console.log("No results found.");
                    }
                  })
                  .catch(err => console.log(err))  
                  getWeather(lat, long, Intl.DateTimeFormat().resolvedOptions().timeZone).then(renderWeather).catch(e => {
                    console.error(e)
                    alert("error getting weather")
                  })
}


document.getElementById("address_btn").addEventListener("click",findAddress)



getWeather(lat, long, Intl.DateTimeFormat().resolvedOptions().timeZone).then(renderWeather).catch(e => {
  console.error(e)
  alert("error getting weather")
})


function renderWeather({current, daily, hourly}){
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)
  document.body.classList.remove("blurred")
}

function setValue(selector, value, {parent = document} = {}){
  parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconURL(iconCode){
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector("[data-current-icon]")
function renderCurrentWeather(current){
  currentIcon.src = getIconURL(current.iconCode)
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {weekday: "long"})  
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")
function renderDailyWeather(daily){
  dailySection.innerHTML = ""
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true)
    setValue("temp", day.maxTemp, {parent: element})
    setValue("date", DAY_FORMATTER.format(day.timestamp), {parent: element})
    element.querySelector("[data-icon]").src = getIconURL(day.iconCode)
    dailySection.append(element)
  })
}


const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, {hour: "numeric"})  
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")
function renderHourlyWeather(hourly){
  hourlySection.innerHTML = ""
  hourly.forEach(hour => {
    const element = hourRowTemplate.content.cloneNode(true)
    setValue("temp", hour.temp,{parent: element})
    setValue("fl-temp", hour.feelslike, {parent: element})
    setValue("wind", hour.windspeed, {parent: element})
    setValue("precip", hour.precip, {parent: element})
    setValue("day", DAY_FORMATTER.format(hour.timestamp), {parent: element})
    setValue("time", HOUR_FORMATTER.format(hour.timestamp), {parent: element})
    element.querySelector("[data-icon]").src = getIconURL(hour.iconCode)
    hourlySection.append(element)
  })
}