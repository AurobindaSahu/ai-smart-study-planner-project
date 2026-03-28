// --- Configuration ---
const API_URL = 'https://ai-smart-study-planner-project.onrender.com/';
let subjects = [];
let studyChartInstance = null; // Holds the chart so it can be redrawn

// Get the currently logged-in user's email from localStorage
const currentUserEmail = localStorage.getItem('studentEmail');

// Security check: If no email is found, kick them back to login
if (!currentUserEmail) {
  window.location.href = 'index.html';
}

const START_TIME = 9.0; // 9:00 AM
const END_TIME = 22.0;  // 10:00 PM

// --- 1. Load Data for Specific User ---
async function fetchSubjects() {
  try {
    const response = await fetch(`${API_URL}/subjects?email=${encodeURIComponent(currentUserEmail)}`);
    if (response.ok) {
      subjects = await response.json();
      renderStudyPlan();
      renderChart(); // Draw the graph when data loads!
    }
  } catch (error) {
    console.error("Error fetching subjects:", error);
    document.getElementById('studyPlanContainer').innerHTML =
      '<p style="color: red;">Cannot connect to AI Backend. Is Python running?</p>';
  }
}

// --- 2. Add New Subject (Send to AI) ---
document.getElementById('subjectForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const submitBtn = this.querySelector('button');
  submitBtn.textContent = "🧠 AI is calculating...";
  submitBtn.disabled = true;

  const subjectData = {
    user_email: currentUserEmail,
    name: document.getElementById('subjectName').value,
    days: parseInt(document.getElementById('daysLeft').value),
    difficulty: parseInt(document.getElementById('difficulty').value)
  };

  try {
    const response = await fetch(`${API_URL}/subjects/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });

    if (response.ok) {
      this.reset();
      await fetchSubjects();
    }
  } catch (error) {
    console.error("Error adding subject:", error);
    alert("Failed to connect to the AI model.");
  } finally {
    submitBtn.textContent = "Generate Plan";
    submitBtn.disabled = false;
  }
});

// --- 3. Delete Subject ---
window.removeSubject = async function (id) {
  try {
    const response = await fetch(`${API_URL}/subjects/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      await fetchSubjects();
    }
  } catch (error) {
    console.error("Error deleting subject:", error);
  }
};

// --- Helper: Convert Decimal to Time (e.g., 9.5 -> "9:30 AM") ---
function formatTime(decimalTime) {
  let hrs = Math.floor(decimalTime);
  let mins = Math.round((decimalTime - hrs) * 60);
  let period = "AM";

  if (hrs >= 12) {
    period = "PM";
    if (hrs > 12) hrs -= 12;
  }
  if (hrs === 0) hrs = 12;

  let minStr = mins < 10 ? '0' + mins : mins;
  return `${hrs}:${minStr} ${period}`;
}

// --- 4. Render the Time-Blocked Plan ---
function renderStudyPlan() {
  const container = document.getElementById('studyPlanContainer');
  container.innerHTML = '';

  if (subjects.length === 0) {
    container.innerHTML = '<p class="text-muted" style="padding:1rem;">No subjects added. Let the AI plan your day!</p>';
    return;
  }

  // Sort subjects by urgency (days left ascending)
  subjects.sort((a, b) => a.days - b.days);

  let currentTime = START_TIME; // Start clock at 9:00 AM

  subjects.forEach((sub) => {
    let timeRemaining = sub.total_hours;
    let studySlots = [];
    let breakSlots = [];

    // Generate max 2-hour blocks
    while (timeRemaining > 0 && currentTime < END_TIME) {
      let chunk = Math.min(2.0, timeRemaining);
      let slotStart = currentTime;
      let slotEnd = currentTime + chunk;

      if (slotEnd > END_TIME) {
        slotEnd = END_TIME;
        chunk = slotEnd - slotStart;
      }

      studySlots.push(`<strong>${formatTime(slotStart)} to ${formatTime(slotEnd)}</strong>`);
      currentTime = slotEnd;
      timeRemaining -= chunk;

      // Add Break Time
      if (currentTime < END_TIME) {
        let breakStart = currentTime;
        let breakDuration = timeRemaining > 0.1 ? 0.5 : 0.25;
        let breakEnd = Math.min(currentTime + breakDuration, END_TIME);

        let breakType = timeRemaining > 0.1 ? "Break" : "Transition";
        breakSlots.push(`${breakType}: ${formatTime(breakStart)} to ${formatTime(breakEnd)}`);
        currentTime = breakEnd;
      }
    }

    // Build the UI Card
    const div = document.createElement('div');
    div.className = 'schedule-card';
    div.innerHTML = `
        <div class="schedule-header">
            <span class="subj-name">${sub.name}</span>
            <div class="subj-meta-container">
                <span class="subj-meta">Days Left: <strong>${sub.days}</strong></span>
                <span class="subj-meta">Level: <strong>${sub.difficulty}</strong></span>
            </div>
            <button onclick="removeSubject(${sub.id})" class="remove-btn">✖</button>
        </div>
        <div class="schedule-body">
            <p class="summary-text">
                <span class="ai-badge">🤖 AI Recommendation</span><br>
                <strong>Total Today: ${sub.total_hours} hrs</strong> 
                <span class="split-text">(Theory: ${sub.theory_hours}h | Practice: ${sub.practice_hours}h)</span>
            </p>
            <div class="time-row">
                <span class="label">Study Time:</span>
                <span class="times">${studySlots.length > 0 ? studySlots.join(', ') : 'No time left in day'}</span>
            </div>
            <div class="time-row">
                <span class="label">Break Time:</span>
                <span class="times text-muted">${breakSlots.length > 0 ? breakSlots.join(', ') : 'None'}</span>
            </div>
        </div>
    `;
    container.appendChild(div);
  });
}

// --- 5. Render the Bar Chart ---
function renderChart() {
  const canvas = document.getElementById('studyChart');
  if (!canvas) return; // Safety check

  const ctx = canvas.getContext('2d');

  // Destroy old chart before drawing a new one
  if (studyChartInstance) {
    studyChartInstance.destroy();
  }

  // If no subjects, don't draw the chart
  if (subjects.length === 0) return;

  // Extract names for X-axis and hours for Y-axis
  const subjectNames = subjects.map(sub => sub.name);
  const studyHours = subjects.map(sub => sub.total_hours);

  // Create the new Chart
  studyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: subjectNames,
      datasets: [{
        label: 'Study Time (Hours/Day)',
        data: studyHours,
        backgroundColor: 'rgba(79, 70, 229, 0.7)', // Matches your theme var(--primary)
        borderColor: '#4F46E5',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // This forces the chart to fit inside our 300px HTML container
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Hours per Day' }
        },
        x: {
          title: { display: true, text: 'Subjects' }
        }
      },
      plugins: {
        legend: { display: false } // Hides the legend to keep it clean
      }
    }
  });
}

// --- Logout ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('studyPlannerAuth');
    localStorage.removeItem('studentEmail');
    window.location.href = 'index.html';
  });
}

// Initialize on page load
fetchSubjects();