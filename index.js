// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area="

// Grab references to the elements already defined in index.html
const stateInput = document.getElementById('state-input');
const fetchBtn = document.getElementById('fetch-alerts');
const alertsDisplay = document.getElementById('alerts-display');
const errorMessage = document.getElementById('error-message');

// Only run the fetch when the button is clicked
fetchBtn.addEventListener('click', () => {
  const state = stateInput.value.trim().toUpperCase();

  // Basic input validation: must be exactly 2 letters
  if (!/^[A-Z]{2}$/.test(state)) {
    showError('Please enter a valid two-letter state abbreviation, like "MN" or "CA".');
    return; // stop here, don't call the API with bad input
  }

  fetchWeatherAlerts(state);
});

function fetchWeatherAlerts(state) {
  hideError();

  fetch(`${weatherApi}${state}`)
    .then(response => {
      // fetch() only rejects on a true network failure.
      // A bad state code still "succeeds" but with a non-OK status,
      // so we check response.ok manually and throw if it's bad.
      if (!response.ok) {
        throw new Error(`No data available for "${state}". Check the abbreviation and try again.`);
      }
      return response.json(); // parses the response body into a JS object
    })
    .then(data => {
      console.log(data); // log for testing, per the assignment
      displayAlerts(data, state);
      stateInput.value = ''; // clear input after a successful fetch
    })
    .catch(errorObject => {
      console.log(errorObject.message);
      showError(errorObject.message);
      clearResults();
    });
}

function displayAlerts(data, state) {
  hideError();
  clearResults();

  const alertCount = data.features.length;

  // Build the summary line
  const summary = document.createElement('p');
  summary.textContent = `Current watches, warnings, and advisories for ${data.title || state}: ${alertCount}`;
  alertsDisplay.appendChild(summary);

  if (alertCount === 0) {
    const p = document.createElement('p');
    p.textContent = 'No active alerts right now.';
    alertsDisplay.appendChild(p);
    return;
  }

  // Build the list of headlines
  const list = document.createElement('ul');
  data.features.forEach(feature => {
    const li = document.createElement('li');
    li.textContent = feature.properties.headline || 'Untitled alert';
    list.appendChild(li);
  });
  alertsDisplay.appendChild(list);
}

function clearResults() {
  alertsDisplay.innerHTML = ''; // wipe out old summary + list before adding new content
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden'); // reveal the div
}

function hideError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden'); // hide it again
}