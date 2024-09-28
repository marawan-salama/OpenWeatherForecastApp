//Marawan Salama

//API key
const apiKey = 'b7668dca944cd00aae4b545051b5897d';

// This function builds the URL for the API call based on user input
function buildApiUrl(locationType, locationInput) {
	const baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
	let queryParams = `appid=${apiKey}&units=metric`; // Using metric units

	switch (locationType) {
		case 'city':
			queryParams += `&q=${encodeURIComponent(locationInput)}`;
			break;
		case 'zip':
			queryParams += `&zip=${encodeURIComponent(locationInput)}`;
			break;
		case 'coordinates':
			const [lat, lon] = locationInput.split(',');
			queryParams += `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
			break;
		default:
			console.error('Invalid location type');
			return '';
	}

	return `${baseUrl}?${queryParams}`;
}

// This function fetches the weather data from the OpenWeatherMap API
function fetchWeatherData(locationType, locationInput) {
	const url = buildApiUrl(locationType, locationInput);

	if (!url) return; 

	fetch(url)
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => processWeatherData(data))
		.catch(error => {
			console.error('Error fetching weather data:', error);
			displayError('Error fetching weather data. Please check your input or try again later.');
		});
}

// This function processes the fetched weather data and updates the HTML
function processWeatherData(data) {
	const forecastResults = document.getElementById('forecastResults');
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	// Calculate the dates for 3 days after today
	const targetDates = [];
	for (let i = 2; i <= 4; i++) {
		const targetDate = new Date(currentDate.getTime());
		targetDate.setDate(currentDate.getDate() + i);
		targetDates.push(targetDate.toISOString().split('T')[0]); // Store as 'YYYY-MM-DD'
	}

	const dailyForecasts = {};

	data.list.forEach(item => {
		const date = new Date(item.dt * 1000);
		date.setHours(0, 0, 0, 0);
		const dateString = date.toISOString().split('T')[0];

		if (!targetDates.includes(dateString)) {
			return;
		}

		if (!dailyForecasts[dateString]) {
			dailyForecasts[dateString] = { temps: [], pressures: [], cloudiness: [] };
		}

		dailyForecasts[dateString].temps.push(item.main.temp_max);
		dailyForecasts[dateString].pressures.push(item.main.pressure);
		dailyForecasts[dateString].cloudiness.push(item.clouds.all);
	});

	const forecastDisplayData = targetDates.map(dateString => {
		const forecast = dailyForecasts[dateString] || { temps: [], pressures: [], cloudiness: [] };
		const maxTemp = forecast.temps.length ? Math.max(...forecast.temps) : 'N/A';
		const avgPressure = forecast.pressures.length ? (forecast.pressures.reduce((a, b) => a + b, 0) / forecast.pressures.length).toFixed(1) : 'N/A';
		const avgCloudiness = forecast.cloudiness.length ? (forecast.cloudiness.reduce((a, b) => a + b, 0) / forecast.cloudiness.length).toFixed(1) : 'N/A';

		return {
			date: dateString,
			maxTemp: maxTemp !== 'N/A' ? `${maxTemp.toFixed(1)} ` : 'N/A',
			avgPressure: avgPressure !== 'N/A' ? `${avgPressure} ` : 'N/A',
			avgCloudiness: avgCloudiness !== 'N/A' ? `${avgCloudiness}` : 'N/A',
		};
	});

	updateDisplay(forecastDisplayData);
}

// This function updates the HTML to display the weather forecast
function updateDisplay(forecastDisplayData) {
	const forecastResults = document.getElementById('forecastResults');
	forecastResults.innerHTML = forecastDisplayData.map(forecast => `
		<div class="forecast-day">
			<strong>Date:</strong> ${new Date(forecast.date).toLocaleDateString()}<br>
			<strong>Max Temp:</strong> ${forecast.maxTemp} °C<br>
			<strong>Avg Pressure:</strong> ${forecast.avgPressure} hPa<br>
			<strong>Avg Cloudiness:</strong> ${forecast.avgCloudiness}%
		</div>
	`).join('');
}

// This function displays an error message in the HTML
function displayError(message) {
	const forecastResults = document.getElementById('forecastResults');
	forecastResults.innerHTML = `<p class="error">${message}</p>`;
}

// Add an event listener to the form to handle the submit event
document.getElementById('locationForm').addEventListener('submit', function(e) {
	e.preventDefault();
	const locationType = document.querySelector('input[name="locationType"]:checked').value;
	const locationInput = document.getElementById('locationInput').value.trim();
	if (!locationInput) {
		displayError('Please enter a location.');
		return;
	}
	fetchWeatherData(locationType, locationInput);
});
``
