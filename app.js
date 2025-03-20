//  Disclaimer by Ankit Raj 
//  This project contains comments in HTML, CSS, and JavaScript files to help understand why each part is used. 
//  The comments explain the purpose of different sections, making it easier to learn and modify the code. 
//  Feel free to explore and improve the project! Happy coding! 😊 


// DOM Elements
const dayViewBtn = document.getElementById('day-view');
const weekViewBtn = document.getElementById('week-view');
const monthViewBtn = document.getElementById('month-view');
const dayViewContainer = document.getElementById('day-view-container');
const weekViewContainer = document.getElementById('week-view-container');
const monthViewContainer = document.getElementById('month-view-container');
const moodOptions = document.querySelectorAll('.mood-option');
const saveMoodBtn = document.getElementById('save-mood');
const resetTrackerBtn = document.getElementById('reset-tracker');
const moodNote = document.getElementById('mood-note');
const todayMoodDisplay = document.getElementById('today-mood-display');
const currentDateEl = document.getElementById('current-date');
const weekMoodsContainer = document.getElementById('week-moods');
const calendarDaysContainer = document.getElementById('calendar-days');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const commonMoodEl = document.getElementById('common-mood');
const moodStreakEl = document.getElementById('mood-streak');
const daysTrackedEl = document.getElementById('days-tracked');

// App State
let selectedMood = null;
let currentDate = new Date();
let displayedMonth = new Date();
let moodData = loadMoodData();

// Emoji mapping
const moodEmojis = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    excited: '😃',
    annoyed: '😒',
    scared: '😨',
};

// Initialize the app
function init() {
    setupEventListeners();
    updateCurrentDate();
    renderTodayMood();
    renderWeekView();
    renderMonthView();
    updateStats();
}

// Setup Event Listeners
function setupEventListeners() {
    // View toggle buttons
    dayViewBtn.addEventListener('click', () => switchView('day'));
    weekViewBtn.addEventListener('click', () => switchView('week'));
    monthViewBtn.addEventListener('click', () => switchView('month'));

    // Mood selection
    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectMood(option.getAttribute('data-mood'));
        });
    });

    // Save mood button
    saveMoodBtn.addEventListener('click', saveMood);
    
    // Reset tracker button
    resetTrackerBtn.addEventListener('click', resetTracker);

    // Month navigation
    prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
    nextMonthBtn.addEventListener('click', () => navigateMonth(1));
}

// Reset tracker functionality
function resetTracker() {
    if (confirm('Are you sure you want to reset all mood tracking data? This action cannot be undone.')) {
        // Clear local storage
        localStorage.removeItem('moodTrackerData');
        
        // Reload the page to reset everything
        window.location.reload();
    }
}

// Switch between day, week, and month views
function switchView(view) {
    // Remove active class from all view buttons and containers
    dayViewBtn.classList.remove('active');
    weekViewBtn.classList.remove('active');
    monthViewBtn.classList.remove('active');
    dayViewContainer.classList.remove('active');
    weekViewContainer.classList.remove('active');
    monthViewContainer.classList.remove('active');

    // Add active class to selected view button and container
    if (view === 'day') {
        dayViewBtn.classList.add('active');
        dayViewContainer.classList.add('active');
    } else if (view === 'week') {
        weekViewBtn.classList.add('active');
        weekViewContainer.classList.add('active');
    } else if (view === 'month') {
        monthViewBtn.classList.add('active');
        monthViewContainer.classList.add('active');
    }
}

// Select a mood
function selectMood(mood) {
    selectedMood = mood;
    
    // Update visual selection
    moodOptions.forEach(option => {
        if (option.getAttribute('data-mood') === mood) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Enable save button
    saveMoodBtn.disabled = false;
}

// Save the selected mood
function saveMood() {
    if (!selectedMood) return;
    
    const dateKey = formatDateKey(currentDate);
    const notes = moodNote.value.trim();
    
    // Save to mood data
    moodData[dateKey] = {
        mood: selectedMood,
        date: new Date().toISOString(),
        notes: notes
    };
    
    // Save to localStorage
    saveMoodData();
    
    // Update UI
    renderTodayMood();
    renderWeekView();
    renderMonthView();
    updateStats();
    
    // Show confirmation
    alert('Your mood has been saved!');
}

// Update the current date display
function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = currentDate.toLocaleDateString(undefined, options);
}

// Render today's mood in the day view
function renderTodayMood() {
    const dateKey = formatDateKey(currentDate);
    const todayMood = moodData[dateKey];
    
    if (todayMood) {
        const emoji = moodEmojis[todayMood.mood] || '❓';
        todayMoodDisplay.innerHTML = `
            <div class="mood-emoji">${emoji}</div>
            <div class="mood-name mood-${todayMood.mood}">${todayMood.mood.toUpperCase()}</div>
            ${todayMood.notes ? `<div class="mood-notes-display">"${todayMood.notes}"</div>` : ''}
        `;
    } else {
        todayMoodDisplay.textContent = 'No mood recorded yet';
    }
}

// Render the week view
function renderWeekView() {
    weekMoodsContainer.innerHTML = '';
    
    // Get start of the week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    // Create a cell for each day of the week
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dateKey = formatDateKey(day);
        const dayMood = moodData[dateKey];
        
        const dayEl = document.createElement('div');
        dayEl.className = 'week-mood-item';
        
        // Check if this day is today
        const isToday = isSameDay(day, new Date());
        if (isToday) {
            dayEl.classList.add('today');
        }
        
        // Format date for display
        const dateDisplay = day.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
        
        if (dayMood) {
            const emoji = moodEmojis[dayMood.mood] || '❓';
            dayEl.classList.add(`mood-${dayMood.mood}`);
            dayEl.innerHTML = `
                <div class="mood-date">${dateDisplay}</div>
                <div class="mood-emoji">${emoji}</div>
                <div class="mood-name">${dayMood.mood}</div>
            `;
        } else {
            dayEl.innerHTML = `
                <div class="mood-date">${dateDisplay}</div>
                <div class="no-mood">-</div>
            `;
        }
        
        // Add click event to view details
        dayEl.addEventListener('click', () => {
            if (dayMood && dayMood.notes) {
                alert(`${day.toLocaleDateString()}\nMood: ${dayMood.mood}\nNotes: ${dayMood.notes}`);
            }
        });
        
        weekMoodsContainer.appendChild(dayEl);
    }
}

// Render the month view
function renderMonthView() {
    // Update current month display
    currentMonthEl.textContent = displayedMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    
    // Clear calendar days
    calendarDaysContainer.innerHTML = '';
    
    // Get first day of the month and last day of the month
    const firstDayOfMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate the number of days to display from the previous month
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate the start date to begin rendering (might be in previous month)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - daysFromPrevMonth);
    
    // Calculate total days to render (always show 6 weeks = 42 days)
    const totalDays = 42;
    
    // Render each day
    for (let i = 0; i < totalDays; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        const dateKey = formatDateKey(day);
        const dayMood = moodData[dateKey];
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        // Check if day is in current month
        const isCurrentMonth = day.getMonth() === displayedMonth.getMonth();
        if (!isCurrentMonth) {
            dayEl.classList.add('other-month');
        }
        
        // Check if this day is today
        const isToday = isSameDay(day, new Date());
        if (isToday) {
            dayEl.classList.add('today');
        }
        
        // Add day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day.getDate();
        dayEl.appendChild(dayNumber);
        
        // Add mood if exists
        if (dayMood) {
            const emoji = moodEmojis[dayMood.mood] || '❓';
            dayEl.classList.add(`mood-${dayMood.mood}`);
            
            const moodEmoji = document.createElement('div');
            moodEmoji.className = 'mood-emoji';
            moodEmoji.textContent = emoji;
            dayEl.appendChild(moodEmoji);
        }
        
        // Add click event to view details
        dayEl.addEventListener('click', () => {
            if (dayMood) {
                alert(`${day.toLocaleDateString()}\nMood: ${dayMood.mood}\nNotes: ${dayMood.notes || 'No notes'}`);
            }
        });
        
        calendarDaysContainer.appendChild(dayEl);
    }
}

// Navigate to previous or next month
function navigateMonth(direction) {
    displayedMonth.setMonth(displayedMonth.getMonth() + direction);
    renderMonthView();
}

// Update statistics
function updateStats() {
    // Count total days tracked
    const daysTracked = Object.keys(moodData).length;
    daysTrackedEl.textContent = daysTracked;
    
    if (daysTracked === 0) {
        commonMoodEl.textContent = '-';
        moodStreakEl.textContent = '-';
        return;
    }
    
    // Find most common mood
    const moodCounts = {};
    Object.values(moodData).forEach(data => {
        moodCounts[data.mood] = (moodCounts[data.mood] || 0) + 1;
    });
    
    let commonMood = null;
    let maxCount = 0;
    
    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            commonMood = mood;
        }
    }
    
    if (commonMood) {
        const emoji = moodEmojis[commonMood] || '❓';
        commonMoodEl.innerHTML = `${emoji} ${commonMood}`;
    }
    
    // Calculate longest streak
    let currentStreak = 0;
    let longestStreak = 0;
    let streakMood = null;
    
    // Sort dates chronologically
    const sortedDates = Object.keys(moodData).sort();
    
    let prevDate = null;
    let prevMood = null;
    
    sortedDates.forEach(dateKey => {
        const currentMood = moodData[dateKey].mood;
        
        if (prevMood && currentMood === prevMood) {
            // Check if dates are consecutive
            const prevDateObj = new Date(prevDate.split('-')[0], prevDate.split('-')[1] - 1, prevDate.split('-')[2]);
            const currentDateObj = new Date(dateKey.split('-')[0], dateKey.split('-')[1] - 1, dateKey.split('-')[2]);
            
            const timeDiff = currentDateObj - prevDateObj;
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            
            if (daysDiff === 1) {
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    streakMood = currentMood;
                }
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }
        
        prevDate = dateKey;
        prevMood = currentMood;
    });
    
    if (streakMood && longestStreak > 1) {
        const emoji = moodEmojis[streakMood] || '❓';
        moodStreakEl.innerHTML = `${longestStreak} days ${emoji}`;
    } else {
        moodStreakEl.textContent = '-';
    }
}

// Helper Functions
function formatDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// LocalStorage Functions
function loadMoodData() {
    const data = localStorage.getItem('moodTrackerData');
    return data ? JSON.parse(data) : {};
}

function saveMoodData() {
    localStorage.setItem('moodTrackerData', JSON.stringify(moodData));
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);