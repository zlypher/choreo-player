window.AudioContext = window.AudioContext || window.webkitAudioContext;
(() => {
    const audioContext = new AudioContext();

    const player = {
        fileLoaded: false,
        buffer: null,
        source: null,
        startTime: 0,
        position: 0,
        isPlaying: false,
    };

    const fileSelectEl = document.querySelector(".fileSelect");
    const songEl = document.querySelector(".song");
    const songNameEl = document.querySelector(".song__name");
    const controls = {
        playEl: document.querySelector(".controls__play"),
        stopEl: document.querySelector(".controls__stop"),
        timeEl: document.querySelector(".controls__time"),
        indicatorBarEl: document.querySelector(".controls__indicator-bar"),
    };

    const handleFileSelected = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        loadFile(file)
            .then(decode)
            .then((audioBuffer) => {
                const { buffer, source } = initializeAudio(audioBuffer);

                audioFileLoaded({
                    filename: file.name,
                    buffer,
                    source
                });
            });
    };

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

    const decode = (arrayBuffer) => new Promise((resolve, reject) => {
        try {
            audioContext.decodeAudioData(arrayBuffer, resolve);
        } catch(e) {
            console.error(e);
            reject(false);
        }
    });

    const audioFileLoaded = ({ filename, buffer, source }) => {
        player.fileLoaded = true;
        player.buffer = buffer;
        player.source = source;

        songEl.classList.add("song--selected");
        songNameEl.innerHTML = filename;
    };

    const getPosition = () => {
        const position = player.isPlaying ? (audioContext.currentTime - player.position) : player.position;
        return position;
    }

    const updateTimeDisplay = () => {
        // TODO: Implement
        const position = getPosition();
        const progress = position / player.buffer.duration * 100;
        controls.indicatorBarEl.style.width = `${progress}%`;

        if (player.isPlaying) {
            requestAnimationFrame(updateTimeDisplay);
        }
    };

    controls.playEl.addEventListener("click", (e) => {
        console.log("play/pause");
        player.isPlaying = !player.isPlaying;
        if (player.isPlaying) {
            player.startTime = audioContext.currentTime - (player.position || 0);
            player.source.start(audioContext.currentTime, this.position);
            updateTimeDisplay();
        }
    }, false);

    controls.stopEl.addEventListener("click", (e) => {
        console.log("stop");
        player.isPlaying = false;
        player.position = 0;
        player.source.stop();
    }, false);

    fileSelectEl.addEventListener("change", handleFileSelected, false);
})();