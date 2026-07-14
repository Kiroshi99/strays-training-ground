/*==========================================================
    SPECTRE DECRYPT MINIGAME

    The old shell/log system has been removed.
==========================================================*/


//==========================================================
// GAME SETTINGS
//==========================================================

const CONFIG = {

    // Minimum number of words.
    minWordCount: 8,

    // Maximum number of words.
    maxWordCount: 13,

    // Total time in seconds.
    timeLimit: 45,

    // Maximum allowed errors.
    maxMistakes: 10,

    /*
        true:
        Word completes after its final correct letter.

        false:
        Player must press Enter or Space.
    */
    autoSubmitCompletedWord: false,

    /*
        Count an unfinished submission as an error.
    */
    incompleteSubmissionCountsAsError: true,

    /*
        Count an attempted paste as an error.
    */
    pasteCountsAsError: true

};


//==========================================================
// HACKER WORD DATABASE
//==========================================================

const hackerWords = [

    "cryptographic",
    "steganography",
    "cryptanalysis",
    "ciphertext",
    "authentication",
    "authorization",
    "encapsulation",
    "fragmentation",
    "interoperability",
    "synchronization",
    "virtualization",
    "instrumentation",
    "disassembler",
    "decompiler",
    "obfuscation",
    "exfiltration",
    "fingerprinting",
    "privilegeescalation",
    "bufferoverflow",
    "heapcorruption",
    "racecondition",
    "polymorphic",
    "metamorphic",
    "ransomware",
    "hypervisor",
    "shellcode",
    "keyexchange",
    "initialization",
    "counterintelligence",
    "reconnaissance",
    "persistence",
    "enumeration",
    "vulnerability",
    "administrator",
    "daemonization",
    "sandboxescape",
    "microarchitecture",
    "reverseengineering",
    "commandandcontrol",
    "sessionhijacking",
    "packetinspection",
    "memorycorruption",
    "cryptocurrency",
    "countermeasure",
    "cybersecurity",
    "infrastructure",
    "deauthentication",
    "interception",
    "multiplexing",
    "deobfuscation",
    "cryptoprocessor",
    "backdooring",
    "bootloader",
    "keylogger",
    "telemetry",
    "filesystem",
    "permissions",
    "environment",
    "malwareanalysis",
    "networkintrusion",
    "payloadexecution",
    "binaryexploitation",
    "securityprotocol",
    "forensicanalysis",
    "credentialdumping",
    "accessviolation",
    "firewallbypass",
    "packetfragmentation"

];


//==========================================================
// HTML ELEMENTS
//==========================================================

const timeText =
    document.getElementById("time-text");

const progressText =
    document.getElementById("progress-text");

const mistakesText =
    document.getElementById("mistakes-text");

const timerBar =
    document.getElementById("timer-bar");

const fragmentText =
    document.getElementById("fragment-text");

const wordText =
    document.getElementById("word-text");

const wordInput =
    document.getElementById("word-input");

const resultScreen =
    document.getElementById("result-screen");

const resultTitle =
    document.getElementById("result-title");

const resultMessage =
    document.getElementById("result-message");

const restartButton =
    document.getElementById("restart-button");

const playAgainButton =
    document.getElementById("play-again-button");


//==========================================================
// GAME VARIABLES
//==========================================================

let gameState = null;
let timerInterval = null;


//==========================================================
// SHUFFLE ARRAY
//==========================================================

function shuffleArray(array) {

    const shuffled = [...array];

    for (
        let index = shuffled.length - 1;
        index > 0;
        index -= 1
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (index + 1)
            );

        [
            shuffled[index],
            shuffled[randomIndex]
        ] = [
            shuffled[randomIndex],
            shuffled[index]
        ];

    }

    return shuffled;

}


//==========================================================
// RANDOM NUMBER
//==========================================================

function getRandomInteger(minimum, maximum) {

    return Math.floor(
        Math.random() *
        (
            maximum -
            minimum +
            1
        )
    ) + minimum;

}


//==========================================================
// GET CURRENT WORD
//==========================================================

function getCurrentWord() {

    if (!gameState) {

        return "";

    }

    const currentWord =
        gameState.words[
            gameState.completed
        ];

    return currentWord
        ? currentWord.toUpperCase()
        : "";

}


//==========================================================
// UPDATE INTERFACE
//==========================================================

function updateInterface() {

    if (
        !gameState ||
        gameState.finished
    ) {

        return;

    }

    const currentWord =
        getCurrentWord();

    fragmentText.textContent =
        `CIPHER BLOCK ${String(
            gameState.completed + 1
        ).padStart(2, "0")}`;

    wordText.textContent =
        currentWord;

    progressText.textContent =
        `${gameState.completed} / ${gameState.wordCount}`;

    mistakesText.textContent =
        `${gameState.mistakes} / ${gameState.maxMistakes}`;

    wordInput.value = "";

    wordInput.disabled = false;

    wordInput.focus();

}


//==========================================================
// ERROR ANIMATION
//==========================================================

function showInputError() {

    /*
        Remove the previous class so the animation
        can restart.
    */

    wordInput.classList.remove("error");

    void wordInput.offsetWidth;

    wordInput.classList.add("error");

    /*
        Remove the red class when the animation ends.

        This prevents the input staying red.
    */

    setTimeout(
        () => {

            wordInput.classList.remove("error");

        },
        480
    );

}


//==========================================================
// REGISTER ERROR
//==========================================================

function registerMistake() {

    if (
        !gameState ||
        gameState.finished
    ) {

        return;

    }

    gameState.mistakes += 1;

    mistakesText.textContent =
        `${gameState.mistakes} / ${gameState.maxMistakes}`;

    showInputError();

    if (
        gameState.mistakes >=
        gameState.maxMistakes
    ) {

        finishGame(
            false,
            "mistakes"
        );

    }

}


//==========================================================
// FINISH GAME
//==========================================================

function finishGame(success, reason) {

    if (
        !gameState ||
        gameState.finished
    ) {

        return;

    }

    gameState.finished = true;

    clearInterval(timerInterval);

    timerInterval = null;

    wordInput.disabled = true;

    resultScreen.className =
        `result-screen ${
            success
                ? "success"
                : "fail"
        }`;

    if (success) {

        resultTitle.textContent =
            "ACCESS GRANTED";

        resultMessage.textContent =
            "Message recovered. Opening secured media...";

        return;

    }

    resultTitle.textContent =
        "ACCESS DENIED";

    if (reason === "mistakes") {

        resultMessage.textContent =
            "Maximum input errors reached.";

    } else if (reason === "timeout") {

        resultMessage.textContent =
            "Decryption window expired.";

    } else {

        resultMessage.textContent =
            "Decryption session terminated.";

    }

}


//==========================================================
// COMPLETE CURRENT WORD
//==========================================================

function completeCurrentWord() {

    if (
        !gameState ||
        gameState.finished
    ) {

        return;

    }

    gameState.completed += 1;

    if (
        gameState.completed >=
        gameState.wordCount
    ) {

        progressText.textContent =
            `${gameState.completed} / ${gameState.wordCount}`;

        finishGame(
            true,
            "success"
        );

        return;

    }

    updateInterface();

}


//==========================================================
// SUBMIT CURRENT WORD
//==========================================================

function submitCurrentWord() {

    if (
        !gameState ||
        gameState.finished
    ) {

        return;

    }

    const typedWord =
        wordInput.value
            .trim()
            .toUpperCase();

    const expectedWord =
        getCurrentWord();

    /*
        Ignore empty submissions.
    */

    if (typedWord.length === 0) {

        return;

    }

    if (typedWord === expectedWord) {

        completeCurrentWord();

        return;

    }

    if (
        CONFIG.incompleteSubmissionCountsAsError
    ) {

        registerMistake();

    }

}


//==========================================================
// TIMER
//==========================================================

function updateTimer() {

    if (
        !gameState ||
        gameState.finished
    ) {

        return;

    }

    const elapsedMilliseconds =
        Date.now() -
        gameState.startedAt;

    const elapsedSeconds =
        elapsedMilliseconds / 1000;

    const remainingSeconds =
        Math.max(
            0,
            gameState.timeLimit -
            elapsedSeconds
        );

    const remainingPercentage =
        (
            remainingSeconds /
            gameState.timeLimit
        ) * 100;

    timeText.textContent =
        remainingSeconds.toFixed(1);

    timerBar.style.width =
        `${remainingPercentage}%`;

    /*
        Timer colour:
        More than 50% = gold
        25% to 50% = orange
        Under 25% = red
    */

    if (remainingPercentage <= 25) {

        timerBar.style.background =
            "#ff554d";

    } else if (remainingPercentage <= 50) {

        timerBar.style.background =
            "#ff9f43";

    } else {

        timerBar.style.background =
            "#efc94d";

    }

    if (remainingSeconds <= 0) {

        finishGame(
            false,
            "timeout"
        );

    }

}


//==========================================================
// START GAME
//==========================================================

function startGame() {

    clearInterval(timerInterval);

    timerInterval = null;

    const roundWordCount =
        getRandomInteger(
            CONFIG.minWordCount,
            CONFIG.maxWordCount
        );

    let selectedWords =
        shuffleArray(hackerWords);

    while (
        selectedWords.length <
        roundWordCount
    ) {

        selectedWords =
            selectedWords.concat(
                shuffleArray(hackerWords)
            );

    }

    selectedWords =
        selectedWords.slice(
            0,
            roundWordCount
        );

    gameState = {

        wordCount:
            roundWordCount,

        timeLimit:
            CONFIG.timeLimit,

        maxMistakes:
            CONFIG.maxMistakes,

        completed:
            0,

        mistakes:
            0,

        words:
            selectedWords,

        startedAt:
            Date.now(),

        finished:
            false

    };

    resultScreen.className =
        "result-screen hidden";

    wordInput.disabled =
        false;

    wordInput.classList.remove(
        "error"
    );

    timeText.textContent =
        CONFIG.timeLimit.toFixed(1);

    timerBar.style.width =
        "100%";

    timerBar.style.background =
        "#efc94d";

    updateInterface();

    timerInterval =
        setInterval(
            updateTimer,
            50
        );

}


//==========================================================
// UPPERCASE INPUT
//==========================================================

wordInput.addEventListener(
    "input",
    () => {

        wordInput.value =
            wordInput.value.toUpperCase();

        wordInput.setSelectionRange(
            wordInput.value.length,
            wordInput.value.length
        );

    }
);


//==========================================================
// KEYBOARD CONTROLS
//==========================================================

wordInput.addEventListener(
    "keydown",
    (event) => {

        if (
            !gameState ||
            gameState.finished
        ) {

            return;

        }

        const expectedWord =
            getCurrentWord();

        const currentInput =
            wordInput.value.toUpperCase();


        /*
            ENTER OR SPACE:

            Submit the current word.
        */

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            submitCurrentWord();

            return;

        }


        /*
            Allow Backspace.
        */

        if (event.key === "Backspace") {

            return;

        }


        /*
            Block cursor and editing keys.
        */

        const blockedEditingKeys = [

            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
            "PageUp",
            "PageDown"

        ];

        if (
            blockedEditingKeys.includes(
                event.key
            )
        ) {

            event.preventDefault();

            return;

        }


        /*
            Ignore modifier keys.
        */

        const ignoredKeys = [

            "Shift",
            "Control",
            "Alt",
            "Meta",
            "CapsLock",
            "Tab",
            "Escape"

        ];

        if (
            ignoredKeys.includes(
                event.key
            )
        ) {

            return;

        }


        /*
            Block keyboard shortcuts.
        */

        if (
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
        ) {

            event.preventDefault();

            return;

        }


        /*
            Ignore non-character keys.
        */

        if (event.key.length !== 1) {

            return;

        }


        const pressedKey =
            event.key.toUpperCase();

        const expectedKey =
            expectedWord[
                currentInput.length
            ];


        /*
            Extra character after completing the word.
        */

        if (!expectedKey) {

            event.preventDefault();

            registerMistake();

            return;

        }


        /*
            Wrong character.
        */

        if (pressedKey !== expectedKey) {

            event.preventDefault();

            registerMistake();

            return;

        }


        /*
            Optional automatic word completion.
        */

        const wordWillBeComplete =
            currentInput.length + 1 ===
            expectedWord.length;

        if (
            wordWillBeComplete &&
            CONFIG.autoSubmitCompletedWord
        ) {

            setTimeout(
                () => {

                    if (
                        gameState &&
                        !gameState.finished &&
                        wordInput.value.toUpperCase() ===
                        expectedWord
                    ) {

                        completeCurrentWord();

                    }

                },
                0
            );

        }

    }
);


//==========================================================
// PREVENT PASTING
//==========================================================

wordInput.addEventListener(
    "paste",
    (event) => {

        event.preventDefault();

        if (
            CONFIG.pasteCountsAsError
        ) {

            registerMistake();

        }

    }
);


//==========================================================
// PREVENT DRAGGING TEXT
//==========================================================

wordInput.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();

        if (
            CONFIG.pasteCountsAsError
        ) {

            registerMistake();

        }

    }
);


//==========================================================
// KEEP INPUT FOCUSED
//==========================================================

document.addEventListener(
    "click",
    () => {

        if (
            gameState &&
            !gameState.finished
        ) {

            wordInput.focus();

        }

    }
);


//==========================================================
// BUTTONS
//==========================================================

restartButton.addEventListener(
    "click",
    startGame
);

playAgainButton.addEventListener(
    "click",
    startGame
);


//==========================================================
// START MINIGAME
//==========================================================

startGame();