"use strict";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

(() => {
    // Global AudioContext
    const audioContext = new AudioContext();

    // State of the music player
    const player = {
        fileLoaded: false,
        buffer: null,
        source: null,
        startTime: 0,
        position: 0,
        isPlaying: false,
    };

    // Reference to HTML elements
    const messageEl = document.querySelector(".message-box");
    const fileSelectEl = document.querySelector(".fileSelect");
    const songEl = document.querySelector(".song");
    const songNameEl = document.querySelector(".song__name");
    const controls = {
        playEl: document.querySelector(".controls__play"),
        stopEl: document.querySelector(".controls__stop"),
        timeCurrentEl: document.querySelector(".controls__time-current"),
        timeTotalEl: document.querySelector(".controls__time-total"),
        indicatorContainerEl: document.querySelector(".controls__indicator-container"),
        indicatorBarEl: document.querySelector(".controls__indicator-bar"),
    };

    const titlesList = document.querySelector(".titles__list");

    const initializeChoreoPlayer = () => {
        // Bind Events
        controls.playEl.addEventListener("click", handlePlayClick, false);
        controls.stopEl.addEventListener("click", handleStopClick, false);
        controls.indicatorContainerEl.addEventListener("click", handleIndicatorClick, false);
        fileSelectEl.addEventListener("change", handleFileSelected, false);

        if (isStorageAvailable) {
            const prevTitles = getPreviousTitles();
            displayPreviousTitles(prevTitles);
        }
    };

    /**
     * Handles the selection of a new audio file
     * @param {Event} e
     */
    const handleFileSelected = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        displayMessage(`Loading file "${file.name}"...`);

        loadFile(file)
            .then(decode)
            .then((audioBuffer) => {
                audioFileLoaded({ filename: file.name, buffer: audioBuffer });
                clearMessage();
            })
            .catch((e) => {
                displayMessage("Could not load audio file! Please select a different file.", "error");
                console.error(e);
            });
    };

    /**
     * Loads the given file as an array buffer
     * @param {File} file 
     */
    const loadFile = (file) => new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(file);
        } catch (e) {
            reject(e);
        }
    });

    const connectAudioContext = (buffer) => {
        let source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        return source;
    };

    /**
     * Decodes the given array buffer into an AudioBuffer
     * @param {ArrayBuffer} arrayBuffer
     */
    const decode = (arrayBuffer) => audioContext.decodeAudioData(arrayBuffer);

    const audioFileLoaded = ({ filename, buffer }) => {
        player.fileLoaded = true;
        player.buffer = buffer;

        storeTitle(filename, buffer);
        songEl.classList.add("song--selected");
        songNameEl.innerHTML = filename;
        controls.timeTotalEl.innerHTML = secondsToTime(player.buffer.duration);
    };

    /**
     * Converts the given seconds to a time string in the format "mm:ss"
     * @param {Number} totalSeconds
     */
    const secondsToTime = (totalSeconds) => {
        const minutes = parseInt(totalSeconds / 60, 10);
        const seconds = parseInt(totalSeconds - (minutes * 60), 10);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    /**
     * Gets the current position in the song
     */
    const getPosition = () => {
        return player.isPlaying ? (audioContext.currentTime - player.startTime) : player.position;
    }

    /**
     * Updates the progress bar and the time display
     */
    const updateTimeDisplay = () => {
        const position = getPosition();
        const progress = Math.min(position / player.buffer.duration, 1);

        controls.indicatorBarEl.style.transform = `scaleX(${progress})`;
        controls.timeCurrentEl.innerHTML = secondsToTime(position);

        player.position = position;

        if (progress === 1) {
            stopPlayer();
        }

        if (player.isPlaying) {
            requestAnimationFrame(updateTimeDisplay);
        }
    };

    /**
     * Clears the currently displayed message and hides the message-box.
     */
    const clearMessage = () => {
        messageEl.innerHTML = "";
        messageEl.classList.remove("message-box--error");
        messageEl.classList.remove("message-box--info");
        messageEl.classList.add("message-box--hidden");
    };

    /**
     * Displays an info or error message to the user.
     * @param {string} message
     * @param {string} type
     */
    const displayMessage = (message, type = "info") => {
        clearMessage();

        messageEl.innerHTML = message;
        messageEl.classList.remove(`message-box--hidden`);
        messageEl.classList.add(`message-box--${type}`);
    };

    const stopPlayer = () => {
        player.isPlaying = false;
        player.position = 0;

        if (player.source) {
            player.source.stop();
            player.source = null;
        }
        
        controls.playEl.classList.remove("controls__play--playing");
    }

    // TODO: IndexDB
    const isStorageAvailable = true; // typeof window.localStorage !== "undefined";

    const storeTitle = (name, data) => {
        if (!isStorageAvailable) {
            return;
        }

        // TODO: IndexDB
        // const listKey = "_choreo_titles_"
        // const listOfTitlesStr = localStorage.getItem(listKey) || "[]";
        // const listOfTitles = JSON.parse(listOfTitlesStr);

        // const newListOfTitles = [...listOfTitles, name];
        // localStorage.setItem(listKey, JSON.stringify(newListOfTitles));
        // localStorage.setItem(`choreo_title_${name}`, JSON.stringify(data));
    };

    /**
     * Loads a previous title from storage by its name
     * @param {string} name 
     */
    const loadTitle = (name) => {
        if (!isStorageAvailable) {
            return;
        }

        // TODO: IndexDB
    };

    /**
     * Get a list of stored previous titles
     */
    const getPreviousTitles = () => {
        if (!isStorageAvailable) {
            return [];
        }

        // TODO: IndexDB
        // return localStorage.getItem("_choreo_titles_") || [];
        return [];
    };

    /**
     * Display a list of previous titles
     * @param {Array} prevTitles
     */
    const displayPreviousTitles = (prevTitles) => {
        titlesList.innerHTML = prevTitles.map(renderPreviousTitlesItem).join("");
    };

    /**
     * Renders a single previous title element
     * @param {string} title
     */
    const renderPreviousTitlesItem = (title) => `
        <li class="titles__item">
            <span class="titles__link">${title}</span>
            <span>x</span>
        </li>
    `;

    /**
     * Handle click on play/pause button
     */
    const handlePlayClick = () => {
        if (!player.fileLoaded) {
            return;
        }

        player.isPlaying = !player.isPlaying;
        controls.playEl.classList.toggle("controls__play--playing", player.isPlaying);

        if (player.isPlaying) {
            player.position = player.position || 0;
            player.startTime = audioContext.currentTime - player.position;

            player.source = connectAudioContext(player.buffer);
            player.source.start(audioContext.currentTime, player.position);
            updateTimeDisplay();
        } else {
            player.source.stop();
            player.source = null;
        }
    }

    /**
     * Handle click on stop button
     */
    const handleStopClick = () => stopPlayer();

    const handleIndicatorClick = (e) => {
        if (!player.fileLoaded) {
            return;
        }

        const containerWidth = controls.indicatorContainerEl.getBoundingClientRect().width;
        const offset = Math.max(0, Math.min(containerWidth, e.offsetX));
        const percentage = offset / containerWidth;

        // TODO: Implement and do something with value
        console.log(percentage);
    };

    initializeChoreoPlayer();
})();