// DEBRIEF SCREEN LOGIC - SIMPLIFIED (NO WITHDRAWAL FORM)
const submitExitBtn = document.getElementById('submitExitBtn');
const consentYes = document.getElementById('consentYes');
const consentNo = document.getElementById('consentNo');

// Your Google Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXAOW2UcvcNxvgxifPscEHTuva48IO9F3-JyoxR0w1RuquDk8_0eMs_jsozeNiuVNm/exec';

// Get data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const finalPoints = urlParams.get('points') || '0';
const handsPlayed = urlParams.get('hands') || '0';
const reason = urlParams.get('reason') || 'complete';
const participantId = sessionStorage.getItem('participantId') || 'Unknown';

// Update the thank you message
const thankYouMessage = document.querySelector('.thank-you-message');
if (thankYouMessage) {
    if (reason === 'outofpoints') {
        thankYouMessage.innerHTML = `Thank you for playing Blackjack.<br><br>💀 You ran out of points after ${handsPlayed} hands.<br>💰 Final points: ${finalPoints}`;
    } else {
        thankYouMessage.innerHTML = `Thank you for playing Blackjack.<br><br>🏆 You completed ${handsPlayed}/50 hands!<br>💰 Your final points: ${finalPoints}`;
    }
}

// Track which consent option is selected
let selectedConsent = null;
let isSubmitted = false;

consentYes.addEventListener('change', function () {
    if (this.checked && !isSubmitted) {
        selectedConsent = 'yes';
    }
});

consentNo.addEventListener('change', function () {
    if (this.checked && !isSubmitted) {
        selectedConsent = 'no';
    }
});

// Function to send consent data to Google Sheet
function sendConsentToSheet() {
    const postData = {
        participantId: participantId,
        withdrawalRequested: selectedConsent === 'no' ? 'Yes' : 'No',
        withdrawalTimestamp: selectedConsent === 'no' ? new Date().toISOString() : ''
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    }).catch(function (error) {
        console.error('Error sending consent:', error);
    });

    console.log('Consent sent to sheet:', postData);
}

// Function to disable all controls after final submission
function disableAllControls() {
    consentYes.disabled = true;
    consentNo.disabled = true;
    submitExitBtn.disabled = true;

    if (consentYes.parentElement) consentYes.parentElement.style.opacity = '0.5';
    if (consentNo.parentElement) consentNo.parentElement.style.opacity = '0.5';
    submitExitBtn.style.opacity = '0.5';
    submitExitBtn.style.cursor = 'not-allowed';
}

// Submit and Exit function
function submitAndExit() {
    if (isSubmitted) return;

    if (!selectedConsent) {
        alert('Please select whether we can use your data for research purposes.');
        return;
    }

    isSubmitted = true;

    // Send consent to Google Sheet
    sendConsentToSheet();

    disableAllControls();

    if (selectedConsent === 'no') {
        alert(
            '✅ Withdrawal Requested\n\n' +
            'Final points: ' + finalPoints + '\n' +
            'Hands played: ' + handsPlayed + '/50\n\n' +
            'The researcher will delete your data.\n\n' +
            'Thank you for your participation.'
        );
    } else {
        alert(
            '✅ Study Complete\n\n' +
            'Final points: ' + finalPoints + '\n' +
            'Hands played: ' + handsPlayed + '/50\n\n' +
            'Thank you for participating!\n' +
            'You may now close this window.'
        );
    }
}

submitExitBtn.addEventListener('click', submitAndExit);