import "../css/main.css";

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

    const state = {
        checkpoints: [],
    };

    const storageKeys = {
        checkpoints: "_choreo_checkpoints_",
    };

    // Reference to HTML elements
    const messageEl = document.querySelector(".message-box");
    const fileSelectEl = document.querySelector(".fileSelect");
    const songEl = document.querySelector(".song");
    const songNameEl = document.querySelector(".song__name");
    const controls = {
        playEl: document.querySelector(".controls__play"),
        stopEl: document.querySelector(".controls__stop"),
        addEl: document.querySelector(".controls__add"),
        timeCurrentEl: document.querySelector(".controls__time-current"),
        timeTotalEl: document.querySelector(".controls__time-total"),
        indicatorContainerEl: document.querySelector(".controls__indicator-container"),
        indicatorBarEl: document.querySelector(".controls__indicator-bar"),
    };

    const checkpointsList = document.querySelector(".checkpoints__list");
    const titlesList = document.querySelector(".titles__list");

    const initializeChoreoPlayer = () => {
        // Bind Events
        controls.playEl.addEventListener("click", handlePlayClick, false);
        controls.stopEl.addEventListener("click", handleStopClick, false);
        controls.addEl.addEventListener("click", handleAddClick, false);
        controls.indicatorContainerEl.addEventListener("click", handleIndicatorClick, false);
        fileSelectEl.addEventListener("change", handleFileSelected, false);

        if (isStorageAvailable) {
            const prevTitles = getPreviousTitles();
            displayPreviousTitles(prevTitles);

            const checkpoints = getSavedCheckpoints();
            displayCheckpoints(checkpoints);

            state.checkpoints = checkpoints;
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
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(file);
        } catch (e) {
            reject(e);
        }
    });

    /**
     * Creates an AudioSource from the given buffer and connects it to the AudioContext.
     * @param {AudioBuffer} buffer 
     */
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
    };

    /**
     * Gets the current position in the song
     */
    const getPosition = () => {
        return player.isPlaying ? (audioContext.currentTime - player.startTime) : player.position;
    };

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
        messageEl.classList.remove("message-box--hidden");
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
    };

    // TODO: IndexDB
    const isStorageAvailable = true; // typeof window.localStorage !== "undefined";

    const storeTitle = (name, data) => {
        if (!isStorageAvailable) {
            return;
        }

        console.log(name, data);

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
    // const loadTitle = (name) => {
    //     if (!isStorageAvailable) {
    //         return;
    //     }

    //     console.log(name);

    //     // TODO: IndexDB
    // };

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

    const saveCheckpoint = (checkpoint) => {
        const currentCheckpoints = getSavedCheckpoints();
        const checkpoints = [...currentCheckpoints, checkpoint];

        localStorage.setItem(storageKeys.checkpoints, JSON.stringify(checkpoints));
    };

    const getSavedCheckpoints = () => {
        if (!isStorageAvailable) {
            return [];
        }

        return JSON.parse(localStorage.getItem(storageKeys.checkpoints)) || [];
    };

    /**
     * Display a list of checkpoints
     * @param {Array} checkpoints 
     */
    const displayCheckpoints = (checkpoints) => {
        checkpointsList.innerHTML = checkpoints.map(renderCheckpointItem).join("");
    };

    /**
     * Renders a single checkpoint element
     * @param {string} checkpoint 
     */
    const renderCheckpointItem = (checkpoint) => `
        <li class="checkpoints__item">
            <span class="checkpoints__link">${checkpoint}</span>
            <span class="checkpoints__action">P</span>
            <span class="checkpoints__action">X</span>
        </li>
    `;

    const playFrom = (progress) => {
        // TODO: More defensive...

        const time = progress * player.buffer.duration;
        
        if (player.isPlaying) {
            player.source.stop();
            
            player.position = time;
            player.startTime = audioContext.currentTime - player.position;

            player.source = connectAudioContext(player.buffer);
            player.source.start(audioContext.currentTime, player.position);
        } else {
            player.position = time;
        }

        updateTimeDisplay();
    };

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
    };

    /**
     * Handle click on stop button
     */
    const handleStopClick = () => stopPlayer();

    /**
     * Handle click on add button
     */
    const handleAddClick = () => {
        const position = getPosition();
        const progress = Math.min(position / player.buffer.duration, 1);

        const checkpoint = {
            label: secondsToTime(position),
            progress: progress,
        };

        saveCheckpoint(checkpoint);

        // TODO: update list
    };

    /**
     * Handle click anywhere on the indicator bar
     * @param {MouseEvent} e 
     */
    const handleIndicatorClick = (e) => {
        if (!player.fileLoaded) {
            return;
        }

        const containerRect = controls.indicatorContainerEl.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const offsetX = e.clientX - containerRect.x;
        const offset = Math.max(0, Math.min(containerWidth, offsetX));
        const percentage = offset / containerWidth;

        playFrom(percentage);
    };

    initializeChoreoPlayer();
})();