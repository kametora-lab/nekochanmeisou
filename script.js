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

    // 1. Inhale (4s) - Continuous vibration
    breathGuide.textContent = "吸って...";
    vibratePattern([INHALE_TIME]);

    // 2. Hold (7s) - starts after INHALE_TIME
    breathTimeout = setTimeout(() => {
        if (!isMeditating) return;
        breathGuide.textContent = "止めて...";

        // "Bu . Bu . Bu ..." pattern (e.g., 500ms ON, 500ms OFF)
        const holdPulse = 500;
        const holdGap = 500;
        const holdCycles = Math.floor(HOLD_TIME / (holdPulse + holdGap));
        const holdPattern = [];
        for (let i = 0; i < holdCycles; i++) {
            holdPattern.push(holdPulse, holdGap);
        }
        vibratePattern(holdPattern);

        // 3. Exhale (8s) - starts after INHALE + HOLD
        breathTimeout = setTimeout(() => {
            if (!isMeditating) return;
            breathGuide.textContent = "吐いて...";

            // "Different feel continuous" - Rapid pulse (Buzz/Purr effect)
            // e.g., 50ms ON, 50ms OFF
            const buzzPulse = 40;
            const buzzGap = 40;
            const buzzCycles = Math.floor(EXHALE_TIME / (buzzPulse + buzzGap));
            const exhalePattern = [];
            for (let i = 0; i < buzzCycles; i++) {
                exhalePattern.push(buzzPulse, buzzGap);
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

    appContainer.classList.remove('breathing');

    meditationScreen.classList.remove('active');
    finishScreen.classList.add('active');
}

function resetApp() {
    finishScreen.classList.remove('active');
    setupScreen.classList.add('active');
}
