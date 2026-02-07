// Data storage
let weightLogs = JSON.parse(localStorage.getItem('weightLogs') || '[]');
let goalWeight = parseFloat(localStorage.getItem('goalWeight') || '70');
let goalUnit = localStorage.getItem('goalUnit') || 'kg';
let userHeight = parseFloat(localStorage.getItem('userHeight') || '175'); // in cm
let heightUnit = localStorage.getItem('heightUnit') || 'cm';
let currentUnit = 'kg';
let selectedMood = null;
let selectedWeight = 75.5;
let dashboardChart = null;
let insightsChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeWeightPicker();
    setTodayDate();
    loadGoal();
    loadHeight();
    updateDashboard();
    updateInsights();
    updateHistory();
    showPage('dashboard');
    registerServiceWorker();
});

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available, prompt user to refresh
                                console.log('New service worker available. Refresh to update.');
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('log-date').value = today;
}

function initializeWeightPicker() {
    const wholeCol = document.getElementById('weight-whole');
    const decimalCol = document.getElementById('weight-decimal');
    
    if (!wholeCol || !decimalCol) return;
    
    // Clear existing items
    wholeCol.innerHTML = '';
    decimalCol.innerHTML = '';
    
    // Whole numbers 40-200
    for (let i = 200; i >= 40; i--) {
        const item = document.createElement('div');
        item.className = 'picker-item';
        item.textContent = i;
        item.onclick = () => selectWeight(i, null);
        wholeCol.appendChild(item);
    }
    
    // Decimals 0-9
    for (let i = 0; i <= 9; i++) {
        const item = document.createElement('div');
        item.className = 'picker-item';
        item.textContent = '.' + i;
        item.onclick = () => selectWeight(null, i);
        decimalCol.appendChild(item);
    }
    
    // Set initial selection based on latest weight or default
    if (weightLogs.length > 0) {
        const latestWeight = weightLogs[0].weight;
        const whole = Math.floor(latestWeight);
        const decimal = Math.round((latestWeight % 1) * 10);
        selectedWeight = latestWeight;
        selectWeight(whole, decimal);
    } else {
        selectWeight(75, 5);
    }
}

function selectWeight(whole, decimal) {
    if (whole !== null) {
        selectedWeight = whole + (selectedWeight % 1);
    }
    if (decimal !== null) {
        selectedWeight = Math.floor(selectedWeight) + (decimal / 10);
    }
    
    updateWeightDisplay();
    updatePickerSelection();
}

function updateWeightDisplay() {
    let display = selectedWeight;
    if (currentUnit === 'lbs') {
        display = (selectedWeight * 2.20462).toFixed(1);
    }
    const displayEl = document.getElementById('weight-display');
    if (displayEl) {
        displayEl.textContent = display;
    }
}

function updatePickerSelection() {
    const whole = Math.floor(selectedWeight);
    const decimal = Math.round((selectedWeight % 1) * 10);
    
    const wholeItems = document.querySelectorAll('#weight-whole .picker-item');
    const decimalItems = document.querySelectorAll('#weight-decimal .picker-item');
    
    wholeItems.forEach(item => {
        item.classList.remove('selected');
        if (parseInt(item.textContent) === whole) {
            item.classList.add('selected');
            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        }
    });
    
    decimalItems.forEach(item => {
        item.classList.remove('selected');
        if (parseInt(item.textContent.replace('.', '')) === decimal) {
            item.classList.add('selected');
            setTimeout(() => {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        }
    });
}

function setUnit(unit) {
    currentUnit = unit;
    const kgBtn = document.getElementById('unit-kg');
    const lbsBtn = document.getElementById('unit-lbs');
    
    if (kgBtn) {
        kgBtn.className = unit === 'kg' 
            ? 'px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'
            : 'px-4 py-1 bg-gray-200 rounded-full text-sm font-medium';
    }
    
    if (lbsBtn) {
        lbsBtn.className = unit === 'lbs'
            ? 'px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'
            : 'px-4 py-1 bg-gray-200 rounded-full text-sm font-medium';
    }
    
    updateWeightDisplay();
}

function selectMood(mood) {
    selectedMood = mood;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    if (event && event.target) {
        const btn = event.target.closest('.mood-btn');
        if (btn) btn.classList.add('selected');
    }
}

function saveWeightLog() {
    const dateEl = document.getElementById('log-date');
    const notesEl = document.getElementById('log-notes');
    
    if (!dateEl) return;
    
    const date = dateEl.value;
    const notes = notesEl ? notesEl.value : '';
    const weight = currentUnit === 'kg' ? selectedWeight : (selectedWeight / 2.20462);
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    const log = {
        date: date,
        weight: parseFloat(weight.toFixed(1)),
        mood: selectedMood,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    // Remove existing log for same date
    weightLogs = weightLogs.filter(l => l.date !== date);
    weightLogs.push(log);
    
    // Sort by date
    weightLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    localStorage.setItem('weightLogs', JSON.stringify(weightLogs));
    
    // Reset form
    selectedMood = null;
    if (notesEl) notesEl.value = '';
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    
    updateDashboard();
    updateInsights();
    updateHistory();
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
    }
    
    // Show subtle success notification
    showSuccessNotification();
    showPage('dashboard');
}

function updateDashboard() {
    const currentWeightEl = document.getElementById('current-weight');
    const lastUpdatedEl = document.getElementById('last-updated');
    const currentBmiEl = document.getElementById('current-bmi');
    const bmiTrendEl = document.getElementById('bmi-trend');
    const goalWeightEl = document.getElementById('goal-weight');
    const goalProgressEl = document.getElementById('goal-progress');
    const streakDaysEl = document.getElementById('streak-days');
    
    if (weightLogs.length === 0) {
        if (currentWeightEl) {
            currentWeightEl.innerHTML = '-- <span class="text-lg font-medium text-gray-400">kg</span>';
        }
        if (lastUpdatedEl) lastUpdatedEl.textContent = '--';
        if (currentBmiEl) currentBmiEl.textContent = '--';
        if (bmiTrendEl) bmiTrendEl.innerHTML = '<span class="material-symbols-outlined text-sm">trending_up</span> <span>--</span>';
        if (goalWeightEl) goalWeightEl.textContent = `${goalWeight} kg`;
        if (goalProgressEl) goalProgressEl.textContent = '--';
        if (streakDaysEl) streakDaysEl.textContent = '0 days';
        return;
    }
    
    const latest = weightLogs[0];
    if (currentWeightEl) {
        currentWeightEl.innerHTML = `${latest.weight} <span class="text-lg font-medium text-gray-400">kg</span>`;
    }
    
    const date = new Date(latest.date);
    const today = new Date();
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    
    if (lastUpdatedEl) {
        if (diffDays === 0) {
            lastUpdatedEl.textContent = 'Today';
        } else if (diffDays === 1) {
            lastUpdatedEl.textContent = 'Yesterday';
        } else {
            lastUpdatedEl.textContent = `${diffDays} days ago`;
        }
    }
    
    // Calculate BMI using stored height
    const heightInMeters = userHeight / 100; // Convert cm to meters
    const bmi = (latest.weight / (heightInMeters * heightInMeters)).toFixed(1);
    if (currentBmiEl) currentBmiEl.textContent = bmi;
    
    // Calculate weight trend (not BMI trend)
    if (weightLogs.length > 1 && bmiTrendEl) {
        const prev = weightLogs[1];
        const change = ((latest.weight - prev.weight) / prev.weight * 100).toFixed(1);
        const trend = change > 0 ? 'trending_up' : 'trending_down';
        const color = change > 0 ? 'text-red-500' : 'text-blue-500';
        bmiTrendEl.className = `text-xs ${color} flex items-center metric-trend`;
        bmiTrendEl.innerHTML = `<span class="material-symbols-outlined text-sm">${trend}</span> <span>${Math.abs(change)}%</span>`;
    } else if (bmiTrendEl) {
        bmiTrendEl.innerHTML = '<span class="material-symbols-outlined text-sm">trending_up</span> <span>--</span>';
    }
    
    // Update goal weight display
    if (goalWeightEl) {
        goalWeightEl.textContent = `${goalWeight.toFixed(1)} kg`;
    }
    
    // Calculate goal progress
    if (goalProgressEl) {
        const remaining = (latest.weight - goalWeight).toFixed(1);
        goalProgressEl.textContent = remaining > 0 ? `${remaining} kg left` : 'Goal reached!';
    }
    
    // Calculate streak
    let streak = 1;
    for (let i = 1; i < weightLogs.length; i++) {
        const prevDate = new Date(weightLogs[i-1].date);
        const currDate = new Date(weightLogs[i].date);
        const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }
    if (streakDaysEl) {
        streakDaysEl.textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;
    }
    
    // Update chart
    updateDashboardChart();
}

function updateDashboardChart() {
    const ctx = document.getElementById('dashboard-chart');
    if (!ctx) return;
    
    const last7Days = weightLogs.slice(0, 7).reverse();
    const labels = last7Days.map(log => {
        const date = new Date(log.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const weights = last7Days.map(log => log.weight);
    
    if (dashboardChart) {
        dashboardChart.destroy();
    }
    
    dashboardChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Weight (kg)',
                data: weights.length > 0 ? weights : [0],
                borderColor: '#007AFF',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#007AFF',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function updateInsights() {
    const weeklyAvgEl = document.getElementById('weekly-avg');
    const weeklyTrendEl = document.getElementById('weekly-trend');
    const monthlyChangeEl = document.getElementById('monthly-change');
    
    if (weightLogs.length === 0) {
        if (weeklyAvgEl) weeklyAvgEl.textContent = '-- kg';
        if (monthlyChangeEl) monthlyChangeEl.textContent = '-- kg';
        return;
    }
    
    // Weekly average
    const last7 = weightLogs.slice(0, 7);
    const weeklyAvg = (last7.reduce((sum, log) => sum + log.weight, 0) / last7.length).toFixed(1);
    if (weeklyAvgEl) weeklyAvgEl.textContent = `${weeklyAvg} kg`;
    
    if (last7.length > 1 && weeklyTrendEl) {
        const change = ((last7[0].weight - last7[last7.length-1].weight) / last7[last7.length-1].weight * 100).toFixed(1);
        const trend = change < 0 ? 'trending_down' : 'trending_up';
        weeklyTrendEl.innerHTML = `<span class="material-symbols-outlined text-sm">${trend}</span> ${Math.abs(change)}%`;
    }
    
    // Monthly change
    const last30 = weightLogs.filter(log => {
        const logDate = new Date(log.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return logDate >= thirtyDaysAgo;
    });
    
    if (last30.length > 1 && monthlyChangeEl) {
        const change = (last30[0].weight - last30[last30.length-1].weight).toFixed(1);
        monthlyChangeEl.textContent = `${change > 0 ? '+' : ''}${change} kg`;
    }
    
    // Update chart
    updateInsightsChart();
}

function updateInsightsChart() {
    const ctx = document.getElementById('insights-chart');
    if (!ctx) return;
    
    const last30Days = weightLogs.slice(0, 30).reverse();
    const labels = last30Days.map(log => {
        const date = new Date(log.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const weights = last30Days.map(log => log.weight);
    
    if (insightsChart) {
        insightsChart.destroy();
    }
    
    insightsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : [],
            datasets: [{
                label: 'Weight (kg)',
                data: weights.length > 0 ? weights : [],
                borderColor: '#007AFF',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });
}

function updateHistory() {
    const container = document.getElementById('logs-container');
    const noLogs = document.getElementById('no-logs');
    
    if (!container) return;
    
    if (weightLogs.length === 0) {
        container.innerHTML = '';
        if (noLogs) noLogs.style.display = 'block';
        return;
    }
    
    if (noLogs) noLogs.style.display = 'none';
    container.innerHTML = '';
    
    weightLogs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'log-entry bg-gray-50 rounded-xl p-4';
        
        const date = new Date(log.date);
        const today = new Date();
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        
        let dateStr;
        if (diffDays === 0) {
            dateStr = 'Today';
        } else if (diffDays === 1) {
            dateStr = 'Yesterday';
        } else if (diffDays < 7) {
            dateStr = date.toLocaleDateString('en-US', { weekday: 'long' });
        } else {
            dateStr = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
        
        const moodEmoji = {
            'happy': '😊',
            'neutral': '😐',
            'sad': '😔',
            'tired': '😴',
            'energetic': '💪'
        }[log.mood] || '';
        
        entry.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <div class="flex-1">
                    <p class="font-bold text-xl mb-1">${log.weight} kg</p>
                    <p class="text-sm text-gray-500">${dateStr}</p>
                </div>
                ${moodEmoji ? `<span class="text-3xl ml-3">${moodEmoji}</span>` : ''}
            </div>
            ${log.notes ? `<div class="mt-3 pt-3 border-t border-gray-200"><p class="text-sm text-gray-600 leading-relaxed">${log.notes}</p></div>` : ''}
        `;
        
        container.appendChild(entry);
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const pageEl = document.getElementById(pageId);
    if (pageEl) {
        pageEl.classList.add('active');
    }
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const tabMap = {
        'dashboard': 0,
        'log-weight': 1,
        'insights': 2,
        'history': 3
    };
    
    const tabIndex = tabMap[pageId];
    if (tabIndex !== undefined) {
        const tabs = document.querySelectorAll('.nav-tab');
        if (tabs[tabIndex]) {
            tabs[tabIndex].classList.add('active');
        }
    }
    
    // Update charts when switching to their pages
    if (pageId === 'dashboard') {
        setTimeout(updateDashboardChart, 100);
    } else if (pageId === 'insights') {
        setTimeout(updateInsightsChart, 100);
    } else if (pageId === 'log-weight') {
        // Update picker selection when opening log page
        setTimeout(() => {
            updatePickerSelection();
        }, 100);
    }
}

function loadGoal() {
    const goalInput = document.getElementById('goal-weight-input');
    if (goalInput) {
        goalInput.value = goalWeight;
    }
    setGoalUnit(goalUnit);
}

function loadHeight() {
    if (heightUnit === 'cm') {
        const heightInput = document.getElementById('height-input');
        if (heightInput) heightInput.value = userHeight;
        const ftInInputs = document.getElementById('height-ft-in');
        if (ftInInputs) ftInInputs.style.display = 'none';
        setHeightUnit('cm');
    } else {
        // Convert cm to feet and inches
        const totalInches = userHeight / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = (totalInches % 12).toFixed(1);
        const ftInput = document.getElementById('height-ft-input');
        const inInput = document.getElementById('height-in-input');
        const ftInInputs = document.getElementById('height-ft-in');
        if (ftInput) ftInput.value = feet;
        if (inInput) inInput.value = inches;
        if (ftInInputs) ftInInputs.style.display = 'flex';
        setHeightUnit('ft');
    }
}

function setHeightUnit(unit) {
    heightUnit = unit;
    const cmBtn = document.getElementById('height-unit-cm');
    const ftBtn = document.getElementById('height-unit-ft');
    const ftInInputs = document.getElementById('height-ft-in');
    
    if (unit === 'cm') {
        if (cmBtn) cmBtn.className = 'px-4 py-3 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium';
        if (ftBtn) ftBtn.className = 'px-4 py-3 bg-gray-200 rounded-xl text-sm font-medium';
        if (ftInInputs) ftInInputs.style.display = 'none';
    } else {
        if (cmBtn) cmBtn.className = 'px-4 py-3 bg-gray-200 rounded-xl text-sm font-medium';
        if (ftBtn) ftBtn.className = 'px-4 py-3 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium';
        if (ftInInputs) ftInInputs.style.display = 'flex';
    }
}

function saveHeight() {
    let heightInCm;
    
    if (heightUnit === 'cm') {
        const input = document.getElementById('height-input');
        if (!input || !input.value) {
            alert('Please enter your height');
            return;
        }
        heightInCm = parseFloat(input.value);
    } else {
        const feetInput = document.getElementById('height-ft-input');
        const inchesInput = document.getElementById('height-in-input');
        const feet = feetInput ? parseFloat(feetInput.value) || 0 : 0;
        const inches = inchesInput ? parseFloat(inchesInput.value) || 0 : 0;
        if (feet === 0 && inches === 0) {
            alert('Please enter your height');
            return;
        }
        // Convert feet and inches to cm
        const totalInches = (feet * 12) + inches;
        heightInCm = totalInches * 2.54;
    }
    
    userHeight = heightInCm;
    localStorage.setItem('userHeight', userHeight);
    localStorage.setItem('heightUnit', heightUnit);
    
    updateDashboard();
    alert('Height saved!');
}

function setGoalUnit(unit) {
    goalUnit = unit;
    const kgBtn = document.getElementById('goal-unit-kg');
    const lbsBtn = document.getElementById('goal-unit-lbs');
    
    if (kgBtn) {
        kgBtn.className = unit === 'kg'
            ? 'flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'
            : 'flex-1 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium';
    }
    
    if (lbsBtn) {
        lbsBtn.className = unit === 'lbs'
            ? 'flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'
            : 'flex-1 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium';
    }
}

function saveGoal() {
    const input = document.getElementById('goal-weight-input');
    if (!input || !input.value) {
        alert('Please enter a goal weight');
        return;
    }
    
    goalWeight = parseFloat(input.value);
    if (goalUnit === 'lbs') {
        goalWeight = goalWeight / 2.20462;
    }
    
    localStorage.setItem('goalWeight', goalWeight);
    localStorage.setItem('goalUnit', goalUnit);
    
    updateDashboard();
    alert('Goal saved!');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        weightLogs = [];
        localStorage.removeItem('weightLogs');
        updateDashboard();
        updateInsights();
        updateHistory();
        alert('All data cleared');
    }
}

function showSuccessNotification() {
    const notification = document.getElementById('success-notification');
    if (!notification) return;
    
    // Show notification
    notification.classList.remove('hide');
    notification.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
    }, 2000);
}

