// PREGAME.JS - Custom Form Submission to Google Sheets

// YOUR GOOGLE APPS SCRIPT URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXAOW2UcvcNxvgxifPscEHTuva48IO9F3-JyoxR0w1RuquDk8_0eMs_jsozeNiuVNm/exec';

// DOM Elements
const form = document.getElementById('participantForm');
const startGameBtn = document.getElementById('startGameBtnPre');
const formStatus = document.getElementById('formStatus');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const howToPlayModal = document.getElementById('howToPlayModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalOnlyBtn = document.getElementById('closeModalOnlyBtn');

let formSubmitted = false;

// Disable start button initially
startGameBtn.disabled = true;

// Form submission handler
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form values
    const participantId = document.getElementById('participantId').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const age = document.querySelector('input[name="age"]:checked')?.value;
    const consent = document.getElementById('consent').checked;

    // Validate
    if (!participantId) {
        showStatus('Please enter a Participant ID.', 'error');
        return;
    }
    if (!gender) {
        showStatus('Please select your gender.', 'error');
        return;
    }
    if (!age) {
        showStatus('Please select your age range.', 'error');
        return;
    }
    if (!consent) {
        showStatus('Please confirm the consent form.', 'error');
        return;
    }

    // Prepare data for Google Sheet
    const postData = {
        timestamp: new Date().toISOString(),
        participantId: participantId,
        gender: gender,
        age: age,
        consent: 'Yes',
        sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
    };

    // Log for debugging
    console.log('Sending data to Google Sheet:', postData);
    console.log('Google Script URL:', GOOGLE_SCRIPT_URL);

    // Show loading state
    const submitBtn = form.querySelector('.submit-form-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        // Send to Google Sheets via Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        console.log('Fetch completed (no-cors mode - check your Google Sheet for data)');

        // Save to sessionStorage for the game to use
        sessionStorage.setItem('participantId', participantId);
        sessionStorage.setItem('gender', gender);
        sessionStorage.setItem('age', age);

        formSubmitted = true;
        showStatus('✓ Data saved successfully! You can now start the game.', 'success');
        startGameBtn.disabled = false;

        // Disable form fields after successful submission
        document.getElementById('participantId').disabled = true;
        document.querySelectorAll('input[name="gender"]').forEach(i => i.disabled = true);
        document.querySelectorAll('input[name="age"]').forEach(i => i.disabled = true);
        document.getElementById('consent').disabled = true;

        submitBtn.textContent = '✓ SUBMITTED';
        submitBtn.style.background = '#27ae60';

    } catch (error) {
        console.error('Error sending data:', error);
        showStatus('Error saving data. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Show status message
function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';

    // Auto-hide after 4 seconds
    setTimeout(() => {
        formStatus.style.opacity = '0';
        setTimeout(() => {
            formStatus.style.display = 'none';
            formStatus.style.opacity = '1';
        }, 500);
    }, 4000);
}

// Start game button
startGameBtn.addEventListener('click', () => {
    if (formSubmitted) {
        const participantId = sessionStorage.getItem('participantId');
        window.location.href = `game.html?participantId=${encodeURIComponent(participantId)}`;
    } else {
        alert('Please complete and submit the form first.');
    }
});

// How To Play Modal functions
function openHowToPlay() {
    howToPlayModal.style.display = 'flex';
}

function closeModal() {
    howToPlayModal.style.display = 'none';
}

// Event listeners for modal
if (howToPlayBtn) howToPlayBtn.addEventListener('click', openHowToPlay);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (closeModalOnlyBtn) closeModalOnlyBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === howToPlayModal) {
        closeModal();
    }
});

// Log that script loaded
console.log('pregame.js loaded successfully');
console.log('Google Script URL configured:', GOOGLE_SCRIPT_URL);