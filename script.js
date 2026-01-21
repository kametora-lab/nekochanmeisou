// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const meditationScreen = document.getElementById('meditation-screen');
const finishScreen = document.getElementById('finish-screen');
const displayTime = document.getElementById('display-time');
const addTimeBtn = document.getElementById('add-time-btn');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');
const countdownEl = document.getElementById('countdown');
const catImage = document.getElementById('cat-image');
const breathGuide = document.getElementById('breath-guide');
const appContainer = document.getElementById('app');

// State
let durationMinutes = 5;
let remainingSeconds = 0;
let timerInterval = null;
let breathTimeout = null;
let isMeditating = false;

// Breathing Cycle Constants (ms)
const INHALE_TIME = 4000;
const HOLD_TIME = 7000;
const EXHALE_TIME = 8000;
const CYCLE_TOTAL = INHALE_TIME + HOLD_TIME + EXHALE_TIME;

// Setup Event Listeners
addTimeBtn.addEventListener('click', () => {
    durationMinutes++;
    displayTime.textContent = durationMinutes;
});

startBtn.addEventListener('click', startMeditation);
stopBtn.addEventListener('click', finishMeditation);
restartBtn.addEventListener('click', resetApp);

function startMeditation() {
    // Switch Screens
    setupScreen.classList.remove('active');
    meditationScreen.classList.add('active');

    // Init Timer
    remainingSeconds = durationMinutes * 60;
    updateCountdownDisplay();

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateCountdownDisplay();
        if (remainingSeconds <= 0) {
            finishMeditation();
        }
    }, 1000);

    // Start Breathing Loop
    isMeditating = true;
    appContainer.classList.add('breathing');
    runBreathCycle(); // Start immediately
}

function updateCountdownDisplay() {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    countdownEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function runBreathCycle() {
    if (!isMeditating) return;

    // 1. Inhale (4s) - "ブブブブブブ" (Continuous rumble/tremor)
    breathGuide.textContent = "吸って...";
    // Generate 4s of rapid pulsing to create "bubububu" sensation
    // Cycle: ~250ms (ON 200, OFF 50) * 16 = 4000ms
    const inhalePattern = [];
    for (let i = 0; i < 16; i++) {
        inhalePattern.push(200, 50);
    }
    vibratePattern(inhalePattern);

    // 2. Hold (7s) - starts after INHALE_TIME
    breathTimeout = setTimeout(() => {
        if (!isMeditating) return;
        breathGuide.textContent = "止めて...";

        // "ブ・ブ・ブ・・・" 7 times, 1s interval (ON 500, OFF 500)
        // 7 cycles * 1000ms = 7000ms
        const holdPattern = [];
        for (let i = 0; i < 7; i++) {
            holdPattern.push(500, 500);
        }
        vibratePattern(holdPattern);

        // 3. Exhale (8s) - starts after INHALE + HOLD
        breathTimeout = setTimeout(() => {
            if (!isMeditating) return;
            breathGuide.textContent = "吐いて...";

            // "ブブッブブッ" 8 times to match 8s interval
            // Pattern: "Bu-Bu-" (ON 150, OFF 50, ON 150) + Rest (OFF 650) = 1000ms
            const exhalePattern = [];
            for (let i = 0; i < 8; i++) {
                exhalePattern.push(150, 50, 150, 650);
            }
            vibratePattern(exhalePattern);

            // Schedule next cycle
            breathTimeout = setTimeout(() => {
                if (isMeditating) {
                    runBreathCycle();
                }
            }, EXHALE_TIME);

        }, HOLD_TIME);

    }, INHALE_TIME);
}

function vibratePattern(pattern) {
    // Check if Vibration API is supported
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

function finishMeditation() {
    isMeditating = false;
    clearInterval(timerInterval);
    clearTimeout(breathTimeout);

    // Stop any ongoing vibration
    if (navigator.vibrate) {
        navigator.vibrate(0);
    }

    appContainer.classList.remove('breathing');

    meditationScreen.classList.remove('active');
    finishScreen.classList.add('active');
}

function resetApp() {
    finishScreen.classList.remove('active');
    setupScreen.classList.add('active');
}
