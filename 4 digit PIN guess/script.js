let solution = "";
let timeLeft = 30;
let timerInterval = null;
let clearInputsTimeout = null;
let gameStarted = false;

// Generates a 4-digit target using 0–9 with no repeated digits.
function generateSolution() {
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (let i = digits.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [digits[i], digits[randomIndex]] =
            [digits[randomIndex], digits[i]];
    }

    return digits.slice(0, 4).join("");
}

function getInputs() {
    return [1, 2, 3, 4].map(i =>
        document.getElementById(`input${i}`)
    );
}

function startGame() {
    clearInterval(timerInterval);
    clearTimeout(clearInputsTimeout);

    solution = generateSolution();
    timeLeft = 30;
    gameStarted = true;

    const timerBar = document.getElementById("timerBar");
    timerBar.style.width = "100%";
    timerBar.classList.remove("danger");

    const inputs = getInputs();

    inputs.forEach(input => {
        input.disabled = false;
        input.value = "";

        input.classList.remove(
            "correct",
            "wrong-location",
            "incorrect"
        );
    });

    document.getElementById("startButton").style.display = "none";
    document.getElementById("restartButton").style.display = "none";

    document.getElementById("input1").focus();

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);

    const timerBar = document.getElementById("timerBar");

    timerInterval = setInterval(() => {
        timeLeft--;

        const timePercentage = Math.max(0, (timeLeft / 30) * 100);
        timerBar.style.width = `${timePercentage}%`;

        if (timeLeft <= 10) {
            timerBar.classList.add("danger");
        }

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function moveFocus(current, next) {
    if (!gameStarted) return;

    const input = document.getElementById(`input${current}`);

    // Only allow numbers 0–9.
    input.value = input.value.replace(/[^0-9]/g, "").slice(0, 1);

    input.classList.remove(
        "correct",
        "wrong-location",
        "incorrect"
    );

    if (next && input.value.length === 1) {
        document.getElementById(`input${next}`).focus();
    }

    if (current === 4 && input.value.length === 1) {
        submitGuess();
    }
}

function submitGuess() {
    if (!gameStarted) return;

    const inputs = getInputs();
    const guess = inputs.map(input => input.value).join("");

    if (guess.length !== 4) return;

    // Repeated digits in player guesses are allowed.
    const feedback = generateFeedback(guess);

    applyFeedback(inputs, feedback);

    if (guess === solution) {
        endGame(true);
        return;
    }

    // Lock boxes briefly so feedback stays visible.
    inputs.forEach(input => {
        input.disabled = true;
    });

    clearTimeout(clearInputsTimeout);

    clearInputsTimeout = setTimeout(() => {
        if (!gameStarted) return;

        inputs.forEach(input => {
            input.value = "";
            input.disabled = false;

            input.classList.remove(
                "correct",
                "wrong-location",
                "incorrect"
            );
        });

        document.getElementById("input1").focus();
    }, 1000);
}

function generateFeedback(guess) {
    const feedback = new Array(4).fill("gray");
    const solutionChars = solution.split("");
    const guessChars = guess.split("");

    // Right number in the right box.
    guessChars.forEach((digit, index) => {
        if (digit === solutionChars[index]) {
            feedback[index] = "green";
            solutionChars[index] = null;
        }
    });

    // Right number but wrong box.
    guessChars.forEach((digit, index) => {
        if (
            feedback[index] === "gray" &&
            solutionChars.includes(digit)
        ) {
            feedback[index] = "yellow";

            const matchedIndex = solutionChars.indexOf(digit);
            solutionChars[matchedIndex] = null;
        }
    });

    return feedback;
}

function applyFeedback(inputs, feedback) {
    inputs.forEach((input, index) => {
        input.classList.remove(
            "correct",
            "wrong-location",
            "incorrect"
        );

        if (feedback[index] === "green") {
            input.classList.add("correct");
        } else if (feedback[index] === "yellow") {
            input.classList.add("wrong-location");
        } else {
            input.classList.add("incorrect");
        }
    });
}

function endGame(won) {
    clearInterval(timerInterval);
    clearTimeout(clearInputsTimeout);

    gameStarted = false;

    getInputs().forEach(input => {
        input.disabled = true;
    });

    if (won) {
        alert(`Correct! You solved it with ${timeLeft} seconds remaining.`);
    } else {
        alert(`Time is up! The correct number was ${solution}.`);
    }

    document.getElementById("restartButton").style.display = "inline-block";
}

function restartGame() {
    startGame();
}

window.onload = () => {
    const timerBar = document.getElementById("timerBar");

    timerBar.style.width = "100%";
    timerBar.classList.remove("danger");

    getInputs().forEach(input => {
        input.disabled = true;
    });
};
