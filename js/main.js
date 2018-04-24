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
        indicatorBarEl: document.querySelector(".controls__indicator-bar"),
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
                const { buffer, source } = initializeAudio(audioBuffer);

                audioFileLoaded({
                    filename: file.name,
                    buffer,
                    source
                });

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

    const initializeAudio = (buffer) => {
        let source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        return {
            buffer,
            source,
        };
    };

    /**
     * Decodes the given array buffer into an AudioBuffer
     * @param {ArrayBuffer} arrayBuffer
     */
    const decode = (arrayBuffer) => audioContext.decodeAudioData(arrayBuffer);

    const audioFileLoaded = ({ filename, buffer, source }) => {
        player.fileLoaded = true;
        player.buffer = buffer;
        player.source = source;

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
    }

    /**
     * Handle click on play/pause button
     */
    const handlePlayClick = () => {
        // TODO: Setup source, if song is stopped.
        player.isPlaying = !player.isPlaying;
        if (player.isPlaying) {
            player.position = player.position || 0;
            player.startTime = audioContext.currentTime - player.position;
            player.source.start(audioContext.currentTime, this.position);
            updateTimeDisplay();
        } else {
            // TODO: Handle Pause
        }
    }

    /**
     * Handle click on stop button
     */
    const handleStopClick = () => stopPlayer();

    // Bind Events
    controls.playEl.addEventListener("click", handlePlayClick, false);
    controls.stopEl.addEventListener("click", handleStopClick, false);
    fileSelectEl.addEventListener("change", handleFileSelected, false);
})();