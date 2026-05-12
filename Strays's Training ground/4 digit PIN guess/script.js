let solution = generateSolution();
let timeLeft = 30;
let timerInterval;

function generateSolution() {
    let numbers = [];
    for (let i = 0; i < 4; i++) {
        let num;
        do {
            num = Math.floor(Math.random() * 9) + 1; // Generates numbers 1-9, avoiding 0
        } while (num === 0);
        numbers.push(num);
    }
    return numbers.join('');
}

function startTimer() {
    clearInterval(timerInterval);
    const timerBar = document.getElementById('timerBar');
    timerBar.style.width = '100%';
    timeLeft = 30;

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerBar.style.width = `${(timeLeft / 30) * 100}%`;
        } else {
            clearInterval(timerInterval);
            disableInputs();
            alert(`Time is up! The correct number was ${solution}.`);
            document.getElementById('restartButton').style.display = 'block';
        }
    }, 1000);
}

function moveFocus(current, next) {
    const input = document.getElementById(`input${current}`);
    if (next && input.value.length === 1) {
        document.getElementById(`input${next}`).focus();
    }
    if (current === 4 && input.value.length === 1) {
        submitGuess();
    }
}

function submitGuess() {
    const inputs = [1, 2, 3, 4].map(i => document.getElementById(`input${i}`));
    const guess = inputs.map(input => input.value).join('');

    if (guess === solution) {
        clearInterval(timerInterval);
        applyFeedback(inputs, generateFeedback(guess));
        alert(`Correct! You solved it with ${timeLeft} seconds remaining.`);
        disableInputs();
        document.getElementById('restartButton').style.display = 'block';
    } else {
        applyFeedback(inputs, generateFeedback(guess));
        setTimeout(() => clearInputs(inputs), 1000);
    }
}

function generateFeedback(guess) {
    const feedback = new Array(4).fill('gray');
    const solutionChars = solution.split('');
    const guessChars = guess.split('');

    guessChars.forEach((digit, i) => {
        if (digit === solutionChars[i]) {
            feedback[i] = 'green';
            solutionChars[i] = null;
        }
    });

    guessChars.forEach((digit, i) => {
        if (feedback[i] === 'gray' && solutionChars.includes(digit)) {
            feedback[i] = 'yellow';
            solutionChars[solutionChars.indexOf(digit)] = null;
        }
    });

    return feedback;
}

function applyFeedback(inputs, feedback) {
    inputs.forEach((input, idx) => {
        input.className = '';
        if (feedback[idx] === 'green') {
            input.classList.add('correct');
        } else if (feedback[idx] === 'yellow') {
            input.classList.add('wrong-location');
        } else {
            input.classList.add('incorrect');
        }
    });
}

function clearInputs(inputs) {
    inputs.forEach(input => {
        input.value = '';
        input.className = '';
    });
    document.getElementById('input1').focus();
}

function disableInputs() {
    [1, 2, 3, 4].forEach(i => {
        const input = document.getElementById(`input${i}`);
        input.disabled = true;
    });
}

function restartGame() {
    clearInterval(timerInterval);
    solution = generateSolution();
    [1, 2, 3, 4].forEach(i => {
        const input = document.getElementById(`input${i}`);
        input.disabled = false;
        input.value = '';
        input.className = '';
    });
    document.getElementById('restartButton').style.display = 'none';
    startTimer();
}

window.onload = startTimer;
