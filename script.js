/* =========================================================
   ZÉ DA MANGA
   JAVASCRIPT COMPLETO
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const ZDM_CONFIG = {

    name:
        "Zé da Manga",

    storageKeys: {

        settings:
            "zeDaMangaSettings",

        history:
            "zeDaMangaHistory",

        voice:
            "zeDaMangaVoice",

        interactionMode:
            "zdmInteractionMode",

        responseCache:
            "zdmResponseCache"

    },

    speechRate:
        1,

    speechPitch:
        1,

    speechVolume:
        1,

    /*
     * Reduzimos o histórico enviado para a IA.
     *
     * O histórico completo continua salvo localmente,
     * mas somente uma quantidade menor é enviada para
     * a Groq.
     */

    maxHistory:
        14,

    groq: {

        endpoint:
            "https://api.groq.com/openai/v1/chat/completions",

        /*
         * NÃO coloque uma chave real publicamente.
         *
         * Insira sua chave localmente.
         */

        apiKey:
            "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",

        model:
            "openai/gpt-oss-120b",

        temperature:
            0.7,

        /*
         * Menos tokens = menor consumo por requisição.
         */

        maxTokens:
            900

    },

    audio: {

        recognitionLanguage:
            "pt-BR",

        autoSendVoiceMessage:
            true

    },

    /*
     * =====================================================
     * PROTEÇÃO CONTRA EXCESSO DE REQUISIÇÕES
     * =====================================================
     */

    requestProtection: {

        /*
         * Tempo mínimo entre requisições.
         *
         * 4 segundos.
         */

        minimumInterval:
            4000,

        /*
         * Não permite duas requisições simultâneas.
         */

        maxConcurrent:
            1,

        /*
         * Guarda respostas repetidas.
         *
         * 5 minutos.
         */

        cacheDuration:
            5 * 60 * 1000,

        /*
         * Número máximo de tentativas quando a API
         * responder com 429.
         */

        max429Retries:
            2,

        /*
         * Espera inicial para 429.
         */

        retryDelay:
            6000

    }

};


/* =========================================================
   ESTADO
   ========================================================= */

const state = {

    mode:
        "text",

    messages:
        [],

    isLoading:
        false,

    isSpeaking:
        false,

    isListening:
        false,

    recognition:
        null,

    recognitionSupported:
        false,

    recognitionFinalTranscript:
        "",

    recognitionAutoSendLocked:
        false,

    isProgrammaticInput:
        false,

    selectedVoice:
        null,

    voicesLoaded:
        false,

    settings:
        {},

    currentConversationTitle:
        "Nova conversa",

    currentConversationId:
        null,

    /*
     * Controle de requisições.
     */

    requestInProgress:
        false,

    lastRequestTime:
        0,

    requestQueue:
        Promise.resolve(),

    lastRequestText:
        "",

    lastRequestId:
        0,

    /*
     * Cache em memória.
     */

    responseCache:
        new Map()

};


/* =========================================================
   OSCILOSCÓPIO
   ========================================================= */

let oscPhase =
    0;

let oscSmoothLevel =
    0;

let oscTargetLevel =
    0;

let oscPulse =
    0;

let oscLastFrameTime =
    0;

let bpmTarget =
    0;

let bpmDisplay =
    0;

let lastSpeechBoundaryTime =
    0;

let canvasCssWidth =
    300;

let canvasCssHeight =
    300;

let canvasDpr =
    1;


/* =========================================================
   DOM
   ========================================================= */

let landingScreen;
let landingStatus;
let appShell;

let mangaFace;
let mangaMouth;

let coreMangaFace;

let textModeButton;
let voiceModeButton;

let sidebar;
let sidebarToggle;
let newChatButton;

let messagesContainer;
let welcomeScreen;

let messageInput;
let sendButton;

let voiceInputButton;
let stopSpeechButton;

let typingIndicator;
let temporaryStatus;

let chatTitle;
let modeStatus;

let voiceSettingsButton;
let settingsButton;
let clearHistoryButton;

let voiceModal;
let settingsModal;

let closeVoiceModal;
let closeSettingsModal;

let voiceSelect;

let speechRateInput;
let speechPitchInput;
let speechVolumeInput;
let speechEnabledToggle;

let saveSettingsButton;

let oscilloscopeCanvas;
let zeVisual;

let bpmValue;
let voiceStatus;
let speechStatus;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeZDM
);


function initializeZDM() {

    cacheDOM();

    loadSettings();

    loadSavedMode();

    loadResponseCache();

    bindEvents();

    initializeMangaEyes();

    initializeSpeechRecognition();

    initializeSpeechVoices();

    initializeOscilloscope();

    loadHistory();

    updateInterface();

    prepareLandingButtons();

}


/* =========================================================
   CACHE DOM
   ========================================================= */

function cacheDOM() {

    landingScreen =
        document.getElementById(
            "landingScreen"
        );

    landingStatus =
        document.getElementById(
            "landingStatus"
        );

    appShell =
        document.getElementById(
            "appShell"
        );

    mangaFace =
        document.getElementById(
            "mangaFace"
        );

    mangaMouth =
        document.getElementById(
            "mangaMouth"
        );

    coreMangaFace =
        document.getElementById(
            "coreMangaFace"
        );

    textModeButton =
        document.getElementById(
            "textModeButton"
        );

    voiceModeButton =
        document.getElementById(
            "voiceModeButton"
        );

    sidebar =
        document.getElementById(
            "sidebar"
        );

    sidebarToggle =
        document.getElementById(
            "sidebarToggle"
        );

    newChatButton =
        document.getElementById(
            "newChatButton"
        );

    messagesContainer =
        document.getElementById(
            "messages"
        );

    welcomeScreen =
        document.getElementById(
            "welcomeScreen"
        );

    messageInput =
        document.getElementById(
            "messageInput"
        );

    sendButton =
        document.getElementById(
            "sendButton"
        );

    voiceInputButton =
        document.getElementById(
            "voiceInputButton"
        );

    stopSpeechButton =
        document.getElementById(
            "stopSpeechButton"
        );

    typingIndicator =
        document.getElementById(
            "typingIndicator"
        );

    temporaryStatus =
        document.getElementById(
            "temporaryStatus"
        );

    chatTitle =
        document.getElementById(
            "chatTitle"
        );

    modeStatus =
        document.getElementById(
            "modeStatus"
        );

    voiceSettingsButton =
        document.getElementById(
            "voiceSettingsButton"
        );

    settingsButton =
        document.getElementById(
            "settingsButton"
        );

    clearHistoryButton =
        document.getElementById(
            "clearHistoryButton"
        );

    voiceModal =
        document.getElementById(
            "voiceModal"
        );

    settingsModal =
        document.getElementById(
            "settingsModal"
        );

    closeVoiceModal =
        document.getElementById(
            "closeVoiceModal"
        );

    closeSettingsModal =
        document.getElementById(
            "closeSettingsModal"
        );

    voiceSelect =
        document.getElementById(
            "voiceSelect"
        );

    speechRateInput =
        document.getElementById(
            "speechRate"
        );

    speechPitchInput =
        document.getElementById(
            "speechPitch"
        );

    speechVolumeInput =
        document.getElementById(
            "speechVolume"
        );

    speechEnabledToggle =
        document.getElementById(
            "speechEnabled"
        );

    saveSettingsButton =
        document.getElementById(
            "saveSettingsButton"
        );

    oscilloscopeCanvas =
        document.getElementById(
            "oscilloscopeCanvas"
        );

    zeVisual =
        document.getElementById(
            "zeVisual"
        );

    bpmValue =
        document.getElementById(
            "bpmValue"
        );

    voiceStatus =
        document.getElementById(
            "voiceStatus"
        );

    speechStatus =
        document.getElementById(
            "speechStatus"
        );

}


/* =========================================================
   BOTÕES DA LANDING
   ========================================================= */

function prepareLandingButtons() {

    if (
        textModeButton &&
        !textModeButton.dataset.bound
    ) {

        textModeButton.dataset.bound =
            "true";

        textModeButton.onclick =
            function () {

                enterAssistant(
                    "text"
                );

            };

    }


    if (
        voiceModeButton &&
        !voiceModeButton.dataset.bound
    ) {

        voiceModeButton.dataset.bound =
            "true";

        voiceModeButton.onclick =
            function () {

                enterAssistant(
                    "voice"
                );

            };

    }

}


/* =========================================================
   EVENTOS
   ========================================================= */

function bindEvents() {

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendCurrentMessage
        );

    }


    if (messageInput) {

        messageInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendCurrentMessage();

                }

            }
        );


        messageInput.addEventListener(
            "input",
            () => {

                autoResizeTextarea();


                /*
                 * Se o usuário começar a digitar enquanto
                 * o Zé está falando, a fala é interrompida.
                 */

                if (
                    !state.isProgrammaticInput &&
                    messageInput.value.trim() &&
                    state.isSpeaking
                ) {

                    stopSpeaking(
                        "usuário digitou"
                    );

                }

            }
        );

    }


    if (voiceInputButton) {

        voiceInputButton.addEventListener(
            "click",
            toggleVoiceRecognition
        );

    }


    if (stopSpeechButton) {

        stopSpeechButton.addEventListener(
            "click",
            silenceZDM
        );

    }


    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            createNewConversation
        );

    }


    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            toggleSidebar
        );

    }


    if (voiceSettingsButton) {

        voiceSettingsButton.addEventListener(
            "click",
            openVoiceModal
        );

    }


    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            openSettingsModal
        );

    }


    if (clearHistoryButton) {

        clearHistoryButton.addEventListener(
            "click",
            clearHistory
        );

    }


    if (closeVoiceModal) {

        closeVoiceModal.addEventListener(
            "click",
            () =>
                closeModal(
                    voiceModal
                )
        );

    }


    if (closeSettingsModal) {

        closeSettingsModal.addEventListener(
            "click",
            () =>
                closeModal(
                    settingsModal
                )
        );

    }


    if (saveSettingsButton) {

        saveSettingsButton.addEventListener(
            "click",
            saveSettings
        );

    }


    if (voiceSelect) {

        voiceSelect.addEventListener(
            "change",
            () => {

                const voices =
                    speechSynthesis.getVoices();

                const index =
                    Number(
                        voiceSelect.value
                    );

                if (voices[index]) {

                    state.selectedVoice =
                        voices[index];

                    localStorage.setItem(
                        ZDM_CONFIG.storageKeys.voice,
                        String(index)
                    );

                }

            }
        );

    }


    [
        voiceModal,
        settingsModal
    ].forEach(
        modal => {

            if (!modal) return;

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        closeModal(
                            modal
                        );

                    }

                }
            );

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal(
                    voiceModal
                );

                closeModal(
                    settingsModal
                );

            }

        }
    );


    document.addEventListener(
        "pointermove",
        trackMangaEyes
    );

}


/* =========================================================
   ENTRAR NO ASSISTENTE
   ========================================================= */

function enterAssistant(
    mode
) {

    if (
        mode !== "text" &&
        mode !== "voice"
    ) {

        mode =
            "text";

    }


    state.mode =
        mode;


    localStorage.setItem(
        ZDM_CONFIG.storageKeys.interactionMode,
        mode
    );


    if (landingStatus) {

        landingStatus.innerHTML =
            mode === "voice"

                ? '<i class="fa-solid fa-microphone"></i> Ativando modo voz...'

                : '<i class="fa-solid fa-comment-dots"></i> Abrindo modo texto...';

    }


    if (mangaMouth) {

        mangaMouth.classList.add(
            "mouth-transition"
        );

    }


    setTimeout(
        () => {

            if (landingScreen) {

                landingScreen.classList.add(
                    "landing-hidden"
                );

            }


            if (appShell) {

                appShell.classList.remove(
                    "hidden"
                );


                requestAnimationFrame(
                    () => {

                        appShell.classList.add(
                            "app-visible"
                        );

                    }
                );

            }


            updateModeUI();


            setTimeout(
                () => {

                    if (messageInput) {

                        messageInput.focus();

                    }

                },
                500
            );


            if (
                mode === "voice" &&
                state.recognitionSupported
            ) {

                setTimeout(
                    startVoiceRecognition,
                    650
                );

            }

        },
        260
    );

}


/* =========================================================
   OLHOS
   ========================================================= */

function initializeMangaEyes() {

    document
        .querySelectorAll(
            ".manga-character"
        )
        .forEach(
            face => {

                face.style.setProperty(
                    "--eye-x",
                    "0px"
                );

                face.style.setProperty(
                    "--eye-y",
                    "0px"
                );

            }
        );

}


function trackMangaEyes(
    event
) {

    const faces =
        document.querySelectorAll(
            ".manga-character"
        );

    if (!faces.length)
        return;


    faces.forEach(
        face => {

            const rect =
                face.getBoundingClientRect();

            if (
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return;
            }


            const centerX =
                rect.left +
                rect.width / 2;

            const centerY =
                rect.top +
                rect.height / 2;


            let x =
                (
                    event.clientX -
                    centerX
                ) /
                (rect.width / 2);


            let y =
                (
                    event.clientY -
                    centerY
                ) /
                (rect.height / 2);


            x =
                clamp(
                    x,
                    -1,
                    1
                );

            y =
                clamp(
                    y,
                    -1,
                    1
                );


            face.style.setProperty(
                "--eye-x",
                `${x * 10}px`
            );

            face.style.setProperty(
                "--eye-y",
                `${y * 8}px`
            );

        }
    );

}


/* =========================================================
   MODO SALVO
   ========================================================= */

function loadSavedMode() {

    const mode =
        localStorage.getItem(
            ZDM_CONFIG.storageKeys.interactionMode
        );


    if (
        mode === "voice" ||
        mode === "text"
    ) {

        state.mode =
            mode;

    }

}


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

function loadSettings() {

    let saved =
        null;


    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    ZDM_CONFIG.storageKeys.settings
                )
            );

    } catch (_) {}


    state.settings = {

        speechRate:
            saved?.speechRate ??
            ZDM_CONFIG.speechRate,

        speechPitch:
            saved?.speechPitch ??
            ZDM_CONFIG.speechPitch,

        speechVolume:
            saved?.speechVolume ??
            ZDM_CONFIG.speechVolume,

        speechEnabled:
            saved?.speechEnabled ??
            true

    };

}


function saveSettings() {

    state.settings = {

        speechRate:
            speechRateInput
                ? Number(
                    speechRateInput.value
                )
                : 1,

        speechPitch:
            speechPitchInput
                ? Number(
                    speechPitchInput.value
                )
                : 1,

        speechVolume:
            speechVolumeInput
                ? Number(
                    speechVolumeInput.value
                )
                : 1,

        speechEnabled:
            speechEnabledToggle
                ? speechEnabledToggle.checked
                : true

    };


    localStorage.setItem(
        ZDM_CONFIG.storageKeys.settings,
        JSON.stringify(
            state.settings
        )
    );


    if (voiceSelect) {

        localStorage.setItem(
            ZDM_CONFIG.storageKeys.voice,
            voiceSelect.value
        );

    }


    closeModal(
        settingsModal
    );


    showTemporaryStatus(
        "Configurações salvas."
    );

}


/* =========================================================
   VOZES
   ========================================================= */

function initializeSpeechVoices() {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    loadSpeechVoices();


    speechSynthesis.onvoiceschanged =
        loadSpeechVoices;

}


function loadSpeechVoices() {

    const voices =
        speechSynthesis.getVoices();


    if (!voices.length)
        return;


    state.voicesLoaded =
        true;


    populateVoiceSelect();

}


function populateVoiceSelect() {

    if (!voiceSelect)
        return;


    const voices =
        speechSynthesis.getVoices();


    if (!voices.length)
        return;


    voiceSelect.innerHTML =
        "";


    const saved =
        localStorage.getItem(
            ZDM_CONFIG.storageKeys.voice
        );


    voices.forEach(
        (
            voice,
            index
        ) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(index);

            option.textContent =
                `${voice.name} — ${voice.lang}`;

            voiceSelect.appendChild(
                option
            );

        }
    );


    if (
        saved !== null &&
        voices[
            Number(saved)
        ]
    ) {

        voiceSelect.value =
            saved;

        state.selectedVoice =
            voices[
                Number(saved)
            ];

        return;

    }


    const ptIndex =
        voices.findIndex(
            voice =>
                voice.lang
                    .toLowerCase()
                    .startsWith(
                        "pt-br"
                    )
        );


    const index =
        ptIndex >= 0
            ? ptIndex
            : 0;


    voiceSelect.value =
        String(index);

    state.selectedVoice =
        voices[index];

}


/* =========================================================
   RECONHECIMENTO DE VOZ
   ========================================================= */

function initializeSpeechRecognition() {

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!Recognition) {

        state.recognitionSupported =
            false;

        return;

    }


    state.recognitionSupported =
        true;


    const recognition =
        new Recognition();


    recognition.lang =
        ZDM_CONFIG.audio.recognitionLanguage;

    recognition.continuous =
        false;

    recognition.interimResults =
        true;


    recognition.onstart =
        () => {

            state.isListening =
                true;

            state.recognitionFinalTranscript =
                "";

            state.recognitionAutoSendLocked =
                false;

            updateListeningUI();

        };


    recognition.onresult =
        event => {

            let finalText =
                "";

            let interimText =
                "";


            for (
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                const text =
                    event.results[i][0]
                        .transcript;


                if (
                    event.results[i]
                        .isFinal
                ) {

                    finalText +=
                        text + " ";

                } else {

                    interimText +=
                        text;

                }

            }


            if (
                finalText.trim()
            ) {

                state
                    .recognitionFinalTranscript +=
                    finalText;

            }


            const combined =
                (
                    state.recognitionFinalTranscript +
                    interimText
                ).trim();


            if (messageInput) {

                state.isProgrammaticInput =
                    true;

                messageInput.value =
                    combined;

                autoResizeTextarea();

                state.isProgrammaticInput =
                    false;

            }

        };


    recognition.onerror =
        event => {

            console.warn(
                "Speech Recognition:",
                event.error
            );

            state.isListening =
                false;

            updateListeningUI();

        };


    recognition.onend =
        () => {

            state.isListening =
                false;

            updateListeningUI();


            const transcript =
                state.recognitionFinalTranscript
                    .trim();


            if (
                transcript &&
                !state.recognitionAutoSendLocked
            ) {

                state.recognitionAutoSendLocked =
                    true;


                if (messageInput) {

                    state.isProgrammaticInput =
                        true;

                    messageInput.value =
                        transcript;

                    autoResizeTextarea();

                    state.isProgrammaticInput =
                        false;

                }


                setTimeout(
                    sendCurrentMessage,
                    120
                );

            }

        };


    state.recognition =
        recognition;

}


/* =========================================================
   VOZ - START
   ========================================================= */

function startVoiceRecognition() {

    if (
        !state.recognitionSupported ||
        !state.recognition
    ) {

        showTemporaryStatus(
            "Reconhecimento de voz não suportado neste navegador."
        );

        return;

    }


    if (state.isListening)
        return;


    if (state.isSpeaking) {

        stopSpeaking(
            "entrada de voz"
        );

    }


    try {

        state.recognition.start();

    } catch (error) {

        console.warn(
            "Não foi possível iniciar o microfone:",
            error
        );

    }

}


/* =========================================================
   VOZ - STOP
   ========================================================= */

function stopVoiceRecognition() {

    if (!state.recognition)
        return;


    try {

        state.recognition.stop();

    } catch (_) {}


    state.isListening =
        false;

    updateListeningUI();

}


/* =========================================================
   TOGGLE VOZ
   ========================================================= */

function toggleVoiceRecognition() {

    if (state.isListening) {

        stopVoiceRecognition();

    } else {

        startVoiceRecognition();

    }

}


/* =========================================================
   UI MICROFONE
   ========================================================= */

function updateListeningUI() {

    if (!voiceInputButton)
        return;


    if (state.isListening) {

        voiceInputButton.classList.add(
            "listening"
        );

        voiceInputButton.innerHTML =
            '<i class="fa-solid fa-stop"></i>';


        if (voiceStatus) {

            voiceStatus.textContent =
                "Estou ouvindo...";

        }

    } else {

        voiceInputButton.classList.remove(
            "listening"
        );

        voiceInputButton.innerHTML =
            '<i class="fa-solid fa-microphone"></i>';


        if (
            voiceStatus &&
            !state.isSpeaking
        ) {

            voiceStatus.textContent =
                "Pronto para conversar";

        }

    }

}


/* =========================================================
   FALA
   ========================================================= */

function speak(
    text
) {

    if (
        !state.settings.speechEnabled ||
        !("speechSynthesis" in window)
    ) {

        return;

    }


    const cleanText =
        stripMarkdownForSpeech(
            text
        );


    if (!cleanText)
        return;


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );


    const voice =
        getSelectedVoice();


    if (voice) {

        utterance.voice =
            voice;

        utterance.lang =
            voice.lang;

    } else {

        utterance.lang =
            "pt-BR";

    }


    utterance.rate =
        Number(
            state.settings.speechRate
        ) || 1;

    utterance.pitch =
        Number(
            state.settings.speechPitch
        ) || 1;

    utterance.volume =
        Number(
            state.settings.speechVolume
        ) || 1;


    utterance.onstart =
        () => {

            state.isSpeaking =
                true;

            updateSpeakingUI();

        };


    utterance.onboundary =
        handleSpeechBoundary;


    utterance.onend =
        () => {

            finishSpeaking();

        };


    utterance.onerror =
        () => {

            finishSpeaking();

        };


    state.isSpeaking =
        true;

    updateSpeakingUI();


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   VOZ SELECIONADA
   ========================================================= */

function getSelectedVoice() {

    if (
        !("speechSynthesis" in window)
    ) {

        return null;

    }


    const voices =
        speechSynthesis.getVoices();


    if (!voices.length) {

        return null;

    }


    if (voiceSelect) {

        const index =
            Number(
                voiceSelect.value
            );

        if (voices[index]) {

            return voices[index];

        }

    }


    return (
        state.selectedVoice ||

        voices.find(
            voice =>
                voice.lang
                    .toLowerCase()
                    .startsWith(
                        "pt-br"
                    )
        ) ||

        voices.find(
            voice =>
                voice.lang
                    .toLowerCase()
                    .startsWith(
                        "pt"
                    )
        ) ||

        voices[0]
    );

}


/* =========================================================
   FINISH SPEAKING
   ========================================================= */

function finishSpeaking() {

    state.isSpeaking =
        false;

    oscTargetLevel =
        0;

    oscPulse =
        0;

    bpmTarget =
        0;

    bpmDisplay =
        0;

    lastSpeechBoundaryTime =
        0;


    updateSpeakingUI();


    if (bpmValue) {

        bpmValue.textContent =
            "0";

    }

}


/* =========================================================
   STOP SPEAKING
   ========================================================= */

function stopSpeaking(
    reason = "manual"
) {

    try {

        if (
            "speechSynthesis" in window
        ) {

            speechSynthesis.cancel();

        }

    } catch (_) {}


    finishSpeaking();


    console.log(
        "Fala interrompida:",
        reason
    );

}


/* =========================================================
   CALAR A BOCA
   ========================================================= */

function silenceZDM() {

    stopSpeaking(
        "Calar a boca"
    );


    showTemporaryStatus(
        "Zé da Manga ficou em silêncio."
    );

}


/* =========================================================
   UI DA FALA
   ========================================================= */

function updateSpeakingUI() {

    if (zeVisual) {

        zeVisual.classList.toggle(
            "speaking",
            state.isSpeaking
        );

    }


    /*
     * Agora os dois personagens acompanham
     * o estado da fala.
     */

    [
        mangaFace,
        coreMangaFace
    ].forEach(
        face => {

            if (!face)
                return;

            face.classList.toggle(
                "speaking",
                state.isSpeaking
            );

        }
    );


    document
        .querySelectorAll(
            ".manga-mouth"
        )
        .forEach(
            mouth => {

                mouth.classList.toggle(
                    "speaking",
                    state.isSpeaking
                );

            }
        );


    if (voiceStatus) {

        voiceStatus.textContent =
            state.isSpeaking

                ? "Zé da Manga está falando..."

                : "Pronto para conversar";

    }


    if (speechStatus) {

        speechStatus.textContent =
            state.isSpeaking
                ? "Falando"
                : "Aguardando";

    }


    if (stopSpeechButton) {

        stopSpeechButton.disabled =
            !state.isSpeaking;

    }

}


/* =========================================================
   CADÊNCIA DA FALA
   ========================================================= */

function handleSpeechBoundary() {

    const now =
        performance.now();


    if (
        lastSpeechBoundaryTime
    ) {

        const interval =
            now -
            lastSpeechBoundaryTime;


        if (
            interval >= 120 &&
            interval <= 2000
        ) {

            const instant =
                clamp(
                    60000 /
                    interval,
                    60,
                    180
                );


            bpmTarget =
                bpmTarget * 0.7 +
                instant * 0.3;

        }

    }


    lastSpeechBoundaryTime =
        now;


    oscPulse =
        1;


    oscTargetLevel =
        0.7 +
        Math.random() * 0.3;

}


/* =========================================================
   OSCILOSCÓPIO
   ========================================================= */

function initializeOscilloscope() {

    const canvas =
        document.getElementById(
            "oscilloscopeCanvas"
        );


    if (
        !(canvas instanceof HTMLCanvasElement)
    ) {

        console.warn(
            "oscilloscopeCanvas não é um canvas."
        );

        return;

    }


    oscilloscopeCanvas =
        canvas;


    resizeOscilloscope();


    window.addEventListener(
        "resize",
        resizeOscilloscope
    );


    requestAnimationFrame(
        animateOscilloscope
    );

}


function resizeOscilloscope() {

    const canvas =
        document.getElementById(
            "oscilloscopeCanvas"
        );


    if (
        !(canvas instanceof HTMLCanvasElement)
    ) {

        return;

    }


    const rect =
        canvas.getBoundingClientRect();


    canvasCssWidth =
        Math.max(
            1,
            rect.width
        );

    canvasCssHeight =
        Math.max(
            1,
            rect.height
        );


    canvasDpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        Math.round(
            canvasCssWidth *
            canvasDpr
        );

    canvas.height =
        Math.round(
            canvasCssHeight *
            canvasDpr
        );


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx)
        return;


    ctx.setTransform(
        canvasDpr,
        0,
        0,
        canvasDpr,
        0,
        0
    );

}


function animateOscilloscope(
    timestamp
) {

    const canvas =
        document.getElementById(
            "oscilloscopeCanvas"
        );


    if (
        !(canvas instanceof HTMLCanvasElement)
    ) {

        return;

    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx)
        return;


    const delta =
        Math.min(
            40,
            timestamp -
            (
                oscLastFrameTime ||
                timestamp
            )
        );


    oscLastFrameTime =
        timestamp;


    const width =
        canvasCssWidth;

    const height =
        canvasCssHeight;


    const centerX =
        width / 2;

    const centerY =
        height / 2;


    const radius =
        Math.min(
            width,
            height
        ) * 0.33;


    oscSmoothLevel +=
        (
            oscTargetLevel -
            oscSmoothLevel
        ) * 0.12;


    oscPulse *=
        0.9;


    if (!state.isSpeaking) {

        oscTargetLevel *=
            0.92;

    }


    bpmDisplay +=
        (
            bpmTarget -
            bpmDisplay
        ) * 0.06;


    if (!state.isSpeaking) {

        bpmDisplay *=
            0.94;

    }


    if (bpmValue) {

        bpmValue.textContent =
            state.isSpeaking
                ? String(
                    Math.round(
                        bpmDisplay
                    )
                )
                : "0";

    }


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    oscPhase +=
        state.isSpeaking

            ? 0.018 +
              delta * 0.00002

            : 0.003;


    /*
     * HALO
     */

    const halo =
        ctx.createRadialGradient(
            centerX,
            centerY,
            radius * 0.2,
            centerX,
            centerY,
            radius * 1.5
        );


    halo.addColorStop(
        0,
        "rgba(0,230,208,0.09)"
    );

    halo.addColorStop(
        0.5,
        "rgba(20,156,255,0.035)"
    );

    halo.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius * 1.5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        halo;

    ctx.fill();


    /*
     * ANÉIS
     */

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            radius *
            (
                0.75 +
                i * 0.17
            ),
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            `rgba(0,220,220,${0.09 - i * 0.02})`;

        ctx.lineWidth =
            1;

        ctx.stroke();

    }


    /*
     * ONDA
     */

    ctx.beginPath();


    const points =
        180;


    for (
        let i = 0;
        i <= points;
        i++
    ) {

        const angle =
            i /
            points *
            Math.PI *
            2;


        const wave1 =
            Math.sin(
                angle * 5 +
                oscPhase * 2
            );


        const wave2 =
            Math.sin(
                angle * 9 -
                oscPhase * 1.3
            );


        const wave3 =
            Math.sin(
                angle * 14 +
                oscPhase * 0.7
            );


        const movement =
            wave1 * 0.5 +
            wave2 * 0.3 +
            wave3 * 0.2;


        const amplitude =
            state.isSpeaking

                ? 6 +
                  oscSmoothLevel * 18 +
                  oscPulse * 12

                : 2;


        const currentRadius =
            radius +
            movement *
            amplitude;


        const x =
            centerX +
            Math.cos(angle) *
            currentRadius;


        const y =
            centerY +
            Math.sin(angle) *
            currentRadius;


        if (i === 0) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );

        }

    }


    ctx.closePath();


    ctx.lineWidth =
        state.isSpeaking
            ? 2.4
            : 1.3;


    ctx.strokeStyle =
        "rgba(0,240,210,0.78)";


    ctx.shadowBlur =
        state.isSpeaking
            ? 18
            : 5;


    ctx.shadowColor =
        "rgba(0,220,255,0.6)";


    ctx.stroke();


    ctx.shadowBlur =
        0;


    /*
     * NÚCLEO ESCURO DO OSCILOSCÓPIO
     */

    const coreRadius =
        radius * 0.51;


    const core =
        ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            coreRadius
        );


    core.addColorStop(
        0,
        "rgba(5,18,23,0.98)"
    );


    core.addColorStop(
        1,
        "rgba(1,4,8,0.99)"
    );


    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        coreRadius,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        core;

    ctx.fill();


    ctx.strokeStyle =
        "rgba(0,230,208,0.24)";

    ctx.stroke();


    /*
     * TEXTO
     */

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.font =
        "700 12px Orbitron, Arial";

    ctx.fillStyle =
        "rgba(255,255,255,0.82)";


    ctx.fillText(
        "ZÉ DA MANGA",
        centerX,
        centerY - 9
    );


    ctx.font =
        "600 9px Orbitron, Arial";

    ctx.fillStyle =
        "rgba(0,230,208,0.72)";


    ctx.fillText(
        state.isSpeaking
            ? `${Math.round(bpmDisplay)} BPM`
            : "AGUARDANDO",
        centerX,
        centerY + 10
    );


    requestAnimationFrame(
        animateOscilloscope
    );

}


/* =========================================================
   ENVIO DE MENSAGEM
   ========================================================= */

async function sendCurrentMessage() {

    if (!messageInput)
        return;


    const text =
        messageInput.value.trim();


    if (!text)
        return;


    /*
     * Comandos locais não gastam
     * uma requisição da Groq.
     */

    if (
        isSilenceCommand(
            text
        )
    ) {

        silenceZDM();

        messageInput.value =
            "";

        autoResizeTextarea();

        return;

    }


    if (state.isSpeaking) {

        stopSpeaking(
            "nova mensagem"
        );

    }


    /*
     * Evita disparos acidentais enquanto
     * a requisição anterior está sendo processada.
     */

    if (state.isLoading) {

        showTemporaryStatus(
            "Aguarde a resposta atual do Zé da Manga."
        );

        return;

    }


    addMessage(
        "user",
        text
    );


    state.messages.push({

        role:
            "user",

        content:
            text

    });


    saveHistory();


    messageInput.value =
        "";

    autoResizeTextarea();


    if (
        state.currentConversationTitle ===
        "Nova conversa"
    ) {

        state.currentConversationTitle =
            createConversationTitle(
                text
            );

        updateChatTitle();

    }


    hideWelcome();


    /*
     * COMANDOS LOCAIS
     */

    const local =
        processLocalCommand(
            text
        );


    if (local) {

        addMessage(
            "assistant",
            local
        );


        state.messages.push({

            role:
                "assistant",

            content:
                local

        });


        saveHistory();

        speak(local);

        return;

    }


    /*
     * REQUISIÇÃO PARA A IA
     */

    setLoading(
        true
    );


    try {

        const answer =
            await requestGroqProtected(
                text
            );


        setLoading(
            false
        );


        addMessage(
            "assistant",
            answer
        );


        state.messages.push({

            role:
                "assistant",

            content:
                answer

        });


        saveHistory();


        speak(answer);

    } catch (error) {

        setLoading(
            false
        );


        console.error(
            "Erro Groq:",
            error
        );


        const friendly =
            getFriendlyApiError(
                error
            );


        addMessage(
            "assistant",
            friendly
        );


        state.messages.push({

            role:
                "assistant",

            content:
                friendly

        });


        saveHistory();

    }

}


/* =========================================================
   PROTEÇÃO DE REQUISIÇÕES
   ========================================================= */

/*
 * Esta é a principal alteração desta versão.
 *
 * Ela impede:
 *
 * - chamadas simultâneas;
 * - chamadas muito próximas;
 * - repetição imediata da mesma pergunta;
 * - consumo desnecessário com perguntas repetidas;
 * - excesso de histórico;
 * - excesso de tokens.
 */

async function requestGroqProtected(
    userText
) {

    /*
     * Coloca cada requisição em uma fila.
     */

    const currentRequest =
        state.requestQueue.then(
            () =>
                executeProtectedGroqRequest(
                    userText
                )
        );


    state.requestQueue =
        currentRequest.catch(
            () => {}
        );


    return currentRequest;

}


/* =========================================================
   EXECUÇÃO PROTEGIDA
   ========================================================= */

async function executeProtectedGroqRequest(
    userText
) {

    const normalized =
        normalizeCommand(
            userText
        );


    /*
     * =====================================================
     * CACHE
     * =====================================================
     *
     * Se o usuário fizer exatamente a mesma pergunta
     * novamente em poucos minutos, não fazemos nova
     * chamada para a Groq.
     */

    const cached =
        getCachedResponse(
            normalized
        );


    if (cached) {

        showTemporaryStatus(
            "Resposta recuperada do cache."
        );

        return cached;

    }


    /*
     * =====================================================
     * INTERVALO MÍNIMO
     * =====================================================
     */

    const now =
        Date.now();


    const elapsed =
        now -
        state.lastRequestTime;


    const minimum =
        ZDM_CONFIG
            .requestProtection
            .minimumInterval;


    if (
        elapsed <
        minimum
    ) {

        const waitTime =
            minimum -
            elapsed;


        showTemporaryStatus(
            `Aguardando proteção de requisições... ${Math.ceil(waitTime / 1000)}s`
        );


        await delay(
            waitTime
        );

    }


    /*
     * =====================================================
     * BLOQUEIO DE CONCORRÊNCIA
     * =====================================================
     */

    if (
        state.requestInProgress
    ) {

        throw new Error(
            "REQUISICAO_EM_ANDAMENTO"
        );

    }


    state.requestInProgress =
        true;


    state.lastRequestTime =
        Date.now();


    state.lastRequestText =
        normalized;


    const requestId =
        ++state.lastRequestId;


    try {

        let retries =
            0;


        while (true) {

            try {

                const answer =
                    await askGroq(
                        userText,
                        requestId
                    );


                saveCachedResponse(
                    normalized,
                    answer
                );


                return answer;

            } catch (error) {

                /*
                 * Se for 429, espera e tenta novamente.
                 */

                if (
                    error?.status === 429 &&
                    retries <
                        ZDM_CONFIG
                            .requestProtection
                            .max429Retries
                ) {

                    retries++;


                    const wait =
                        ZDM_CONFIG
                            .requestProtection
                            .retryDelay *
                        retries;


                    showTemporaryStatus(
                        `Limite da API detectado. Aguardando ${Math.ceil(wait / 1000)}s...`
                    );


                    await delay(
                        wait
                    );


                    state.lastRequestTime =
                        Date.now();


                    continue;

                }


                throw error;

            }

        }

    } finally {

        state.requestInProgress =
            false;

    }

}


/* =========================================================
   GROQ
   ========================================================= */

async function askGroq(
    userText,
    requestId
) {

    const apiKey =
        ZDM_CONFIG.groq.apiKey;


    if (
        !apiKey ||
        apiKey ===
            "COLE_SUA_CHAVE_GROQ_AQUI"
    ) {

        throw new Error(
            "CHAVE_GROQ_NAO_CONFIGURADA"
        );

    }


    const systemPrompt = `
Você é o Zé da Manga, um assistente virtual inteligente.

Seu nome é Zé da Manga.

Responda sempre em português do Brasil, salvo quando o usuário pedir outro idioma.

Seja inteligente, natural, amigável, contextual e objetivo.

Pode utilizar Markdown quando for útil.

Não invente informações.

Não afirme ter pesquisado a internet quando uma pesquisa web real não tiver sido realizada.

Quando não souber alguma informação, diga isso claramente.

Você possui personalidade própria e pode conversar de maneira descontraída, mas deve continuar sendo útil.

O usuário está conversando diretamente com você através da interface Zé da Manga.

Identificador desta requisição:
${requestId}
`;


    /*
     * IMPORTANTE:
     *
     * O histórico local pode ter até 50 mensagens,
     * mas somente as últimas mensagens são enviadas.
     *
     * Isso reduz o consumo de tokens.
     */

    const recent =
        state.messages
            .slice(
                -ZDM_CONFIG.maxHistory
            )
            .map(
                message => ({

                    role:
                        message.role,

                    content:
                        message.content

                })
            );


    const controller =
        new AbortController();


    /*
     * Segurança adicional para evitar uma chamada
     * ficando pendurada indefinidamente.
     */

    const timeout =
        setTimeout(
            () => {

                controller.abort();

            },
            45000
        );


    let response;


    try {

        response =
            await fetch(
                ZDM_CONFIG.groq.endpoint,
                {

                    method:
                        "POST",

                    signal:
                        controller.signal,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiKey}`

                    },

                    body:
                        JSON.stringify({

                            model:
                                ZDM_CONFIG.groq.model,

                            messages: [

                                {

                                    role:
                                        "system",

                                    content:
                                        systemPrompt

                                },

                                ...recent

                            ],

                            temperature:
                                ZDM_CONFIG.groq.temperature,

                            max_tokens:
                                ZDM_CONFIG.groq.maxTokens

                        })

                }
            );

    } catch (error) {

        if (
            error?.name ===
            "AbortError"
        ) {

            throw new Error(
                "REQUISICAO_TIMEOUT"
            );

        }

        throw error;

    } finally {

        clearTimeout(
            timeout
        );

    }


    if (!response.ok) {

        let errorData =
            null;


        try {

            errorData =
                await response.json();

        } catch (_) {}


        const error =
            new Error(
                `HTTP ${response.status}`
            );


        error.status =
            response.status;

        error.data =
            errorData;


        throw error;

    }


    const data =
        await response.json();


    /*
     * CORREÇÃO IMPORTANTE:
     *
     * O código antigo possuía:
     *
     * data?.choices?.0
     *
     * Isso é sintaxe inválida.
     *
     * O correto é:
     *
     * data?.choices?.[0]
     */

    const content =
        data
            ?.choices
            ?.[0]
            ?.message
            ?.content;


    if (!content) {

        throw new Error(
            "RESPOSTA_VAZIA"
        );

    }


    return content.trim();

}


/* =========================================================
   CACHE DE RESPOSTAS
   ========================================================= */

function loadResponseCache() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    ZDM_CONFIG.storageKeys.responseCache
                )
            ) || [];


        if (
            Array.isArray(saved)
        ) {

            const now =
                Date.now();


            saved.forEach(
                item => {

                    if (
                        item &&
                        item.key &&
                        item.answer &&
                        item.time &&
                        now - item.time <
                            ZDM_CONFIG
                                .requestProtection
                                .cacheDuration
                    ) {

                        state.responseCache.set(
                            item.key,
                            item
                        );

                    }

                }
            );

        }

    } catch (_) {}

}


function saveResponseCache() {

    try {

        const now =
            Date.now();


        const data =
            Array.from(
                state.responseCache.values()
            )
            .filter(
                item =>
                    now - item.time <
                    ZDM_CONFIG
                        .requestProtection
                        .cacheDuration
            )
            .slice(
                -20
            );


        localStorage.setItem(
            ZDM_CONFIG.storageKeys.responseCache,
            JSON.stringify(
                data
            )
        );

    } catch (_) {}

}


function getCachedResponse(
    key
) {

    if (!key)
        return null;


    const item =
        state.responseCache.get(
            key
        );


    if (!item)
        return null;


    if (
        Date.now() -
        item.time >
        ZDM_CONFIG
            .requestProtection
            .cacheDuration
    ) {

        state.responseCache.delete(
            key
        );

        saveResponseCache();

        return null;

    }


    return item.answer;

}


function saveCachedResponse(
    key,
    answer
) {

    if (
        !key ||
        !answer
    ) {

        return;

    }


    state.responseCache.set(
        key,
        {

            key:
                key,

            answer:
                answer,

            time:
                Date.now()

        }
    );


    saveResponseCache();

}


/* =========================================================
   COMANDOS LOCAIS
   ========================================================= */

function processLocalCommand(
    text
) {

    const normalized =
        normalizeCommand(
            text
        );


    if (
        normalized.includes(
            "que horas sao"
        ) ||
        normalized.includes(
            "qual a hora"
        ) ||
        normalized.includes(
            "hora agora"
        ) ||
        normalized.includes(
            "horario agora"
        ) ||
        normalized.includes(
            "me diga as horas"
        )
    ) {

        return getCurrentTimeResponse();

    }


    if (
        normalized.includes(
            "que dia e hoje"
        ) ||
        normalized.includes(
            "data de hoje"
        ) ||
        normalized.includes(
            "qual a data"
        )
    ) {

        return getCurrentDateResponse();

    }


    if (
        normalized ===
            "quem e voce" ||
        normalized.includes(
            "quem e o ze da manga"
        )
    ) {

        return (
            "Eu sou o Zé da Manga. " +
            "Seu assistente virtual, companheiro " +
            "de conversa e especialista em transformar " +
            "perguntas em respostas."
        );

    }


    return null;

}


/* =========================================================
   HORA
   ========================================================= */

function getCurrentTimeResponse() {

    const time =
        new Intl.DateTimeFormat(
            "pt-BR",
            {

                timeZone:
                    "America/Sao_Paulo",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"

            }
        ).format(
            new Date()
        );


    return `Agora são ${time}.`;

}


/* =========================================================
   DATA
   ========================================================= */

function getCurrentDateResponse() {

    const date =
        new Intl.DateTimeFormat(
            "pt-BR",
            {

                timeZone:
                    "America/Sao_Paulo",

                weekday:
                    "long",

                day:
                    "2-digit",

                month:
                    "long",

                year:
                    "numeric"

            }
        ).format(
            new Date()
        );


    return `Hoje é ${date}.`;

}


/* =========================================================
   SILÊNCIO
   ========================================================= */

function isSilenceCommand(
    text
) {

    const value =
        normalizeCommand(
            text
        );


    const commands = [

        "cale a boca",

        "cala a boca",

        "ze cale a boca",

        "ze cala a boca",

        "pare de falar",

        "pare de ler",

        "silencio",

        "pare",

        "pare de falar ze",

        "ze pare de falar",

        "ze pare de ler"

    ];


    return commands.some(
        command =>
            value === command ||
            value.startsWith(
                command + " "
            )
    );

}


/* =========================================================
   NORMALIZAR
   ========================================================= */

function normalizeCommand(
    text
) {

    return String(
        text || ""
    )

        .toLowerCase()

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[.,!?;:()[\]{}"'`]/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   MENSAGENS
   ========================================================= */

function addMessage(
    role,
    content
) {

    if (!messagesContainer)
        return;


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        `message message-${role}`;


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble";


    if (
        role === "assistant"
    ) {

        bubble.innerHTML =
            formatAssistantMessage(
                content
            );

    } else {

        bubble.textContent =
            content;

    }


    wrapper.appendChild(
        bubble
    );


    messagesContainer.appendChild(
        wrapper
    );


    scrollChatToBottom();

}


/* =========================================================
   MARKDOWN
   ========================================================= */

function formatAssistantMessage(
    text
) {

    let html =
        escapeHTML(
            text
        );


    html =
        html.replace(
            /```([\s\S]*?)```/g,
            (
                _,
                code
            ) =>
                `<pre class="code-block"><code>${code.trim()}</code></pre>`
        );


    html =
        html.replace(
            /(https?:\/\/[^\s<]+)/g,
            url =>
                `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );


    html =
        html.replace(
            /^### (.*)$/gm,
            "<h4>$1</h4>"
        );


    html =
        html.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );


    html =
        html.replace(
            /^# (.*)$/gm,
            "<h2>$1</h2>"
        );


    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    html =
        html.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    return html;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   TEXTO PARA TTS
   ========================================================= */

function stripMarkdownForSpeech(
    text
) {

    return String(
        text || ""
    )

        .replace(
            /```[\s\S]*?```/g,
            ""
        )

        .replace(
            /https?:\/\/\S+/g,
            ""
        )

        .replace(
            /[*_~`#>]/g,
            ""
        )

        .replace(
            /\[([^\]]+)\]\([^)]+\)/g,
            "$1"
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(
    loading
) {

    state.isLoading =
        loading;


    if (typingIndicator) {

        typingIndicator.classList.toggle(
            "hidden",
            !loading
        );

    }


    if (sendButton) {

        sendButton.disabled =
            loading;

    }

}


/* =========================================================
   WELCOME
   ========================================================= */

function hideWelcome() {

    if (welcomeScreen) {

        welcomeScreen.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollChatToBottom() {

    if (!messagesContainer)
        return;


    requestAnimationFrame(
        () => {

            messagesContainer.scrollTop =
                messagesContainer.scrollHeight;

        }
    );

}


/* =========================================================
   TEXTAREA
   ========================================================= */

function autoResizeTextarea() {

    if (!messageInput)
        return;


    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            180
        ) + "px";

}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function loadHistory() {

    let saved =
        [];


    try {

        saved =
            JSON.parse(
                localStorage.getItem(
                    ZDM_CONFIG.storageKeys.history
                )
            ) || [];

    } catch (_) {

        saved =
            [];

    }


    if (
        !Array.isArray(saved)
    ) {

        saved =
            [];

    }


    state.messages =
        saved.slice(
            -50
        );


    if (
        state.messages.length &&
        messagesContainer
    ) {

        hideWelcome();


        state.messages.forEach(
            message => {

                addMessage(
                    message.role,
                    message.content
                );

            }
        );

    }


    updateHistorySidebar();

}


function saveHistory() {

    localStorage.setItem(
        ZDM_CONFIG.storageKeys.history,
        JSON.stringify(
            state.messages.slice(
                -50
            )
        )
    );


    updateHistorySidebar();

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function updateHistorySidebar() {

    const list =
        document.getElementById(
            "historyList"
        );


    if (!list)
        return;


    list.innerHTML =
        "";


    if (
        !state.messages.length
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "history-empty";


        empty.textContent =
            "Nenhuma conversa recente.";


        list.appendChild(
            empty
        );


        return;

    }


    const item =
        document.createElement(
            "button"
        );


    item.type =
        "button";

    item.className =
        "history-item";


    item.innerHTML =
        `
            <i class="fa-solid fa-message"></i>
            <span>
                ${escapeHTML(
                    state.currentConversationTitle
                )}
            </span>
        `;


    list.appendChild(
        item
    );

}


/* =========================================================
   NOVA CONVERSA
   ========================================================= */

function createNewConversation() {

    stopSpeaking(
        "nova conversa"
    );


    if (
        state.isListening
    ) {

        stopVoiceRecognition();

    }


    state.messages =
        [];

    state.currentConversationTitle =
        "Nova conversa";


    localStorage.removeItem(
        ZDM_CONFIG.storageKeys.history
    );


    if (messagesContainer) {

        messagesContainer.innerHTML =
            "";


        if (welcomeScreen) {

            messagesContainer.appendChild(
                welcomeScreen
            );


            welcomeScreen.classList.remove(
                "hidden"
            );

        }

    }


    updateChatTitle();

    updateHistorySidebar();

    closeSidebarMobile();


    if (messageInput) {

        messageInput.value =
            "";

        autoResizeTextarea();

        messageInput.focus();

    }

}


/* =========================================================
   TÍTULO
   ========================================================= */

function createConversationTitle(
    text
) {

    const clean =
        String(
            text
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    return clean.length > 34

        ? clean.substring(
            0,
            34
        ) + "..."

        : clean;

}


function updateChatTitle() {

    if (chatTitle) {

        chatTitle.textContent =
            state.currentConversationTitle;

    }

}


/* =========================================================
   LIMPAR HISTÓRICO
   ========================================================= */

function clearHistory() {

    if (
        !confirm(
            "Deseja apagar o histórico do Zé da Manga?"
        )
    ) {

        return;

    }


    state.messages =
        [];


    localStorage.removeItem(
        ZDM_CONFIG.storageKeys.history
    );


    state.currentConversationTitle =
        "Nova conversa";


    if (messagesContainer) {

        messagesContainer.innerHTML =
            "";


        if (welcomeScreen) {

            messagesContainer.appendChild(
                welcomeScreen
            );


            welcomeScreen.classList.remove(
                "hidden"
            );

        }

    }


    updateChatTitle();

    updateHistorySidebar();


    showTemporaryStatus(
        "Histórico apagado."
    );

}


/* =========================================================
   SIDEBAR MOBILE
   ========================================================= */

function toggleSidebar() {

    if (!sidebar)
        return;


    sidebar.classList.toggle(
        "sidebar-open"
    );

}


function closeSidebarMobile() {

    if (!sidebar)
        return;


    sidebar.classList.remove(
        "sidebar-open"
    );

}


/* =========================================================
   MODAIS
   ========================================================= */

function openVoiceModal() {

    if (!voiceModal)
        return;


    populateVoiceSelect();


    voiceModal.classList.remove(
        "hidden"
    );


    requestAnimationFrame(
        () => {

            voiceModal.classList.add(
                "modal-visible"
            );

        }
    );

}


function openSettingsModal() {

    if (!settingsModal)
        return;


    if (speechRateInput) {

        speechRateInput.value =
            state.settings.speechRate;

    }


    if (speechPitchInput) {

        speechPitchInput.value =
            state.settings.speechPitch;

    }


    if (speechVolumeInput) {

        speechVolumeInput.value =
            state.settings.speechVolume;

    }


    if (speechEnabledToggle) {

        speechEnabledToggle.checked =
            state.settings.speechEnabled;

    }


    settingsModal.classList.remove(
        "hidden"
    );


    requestAnimationFrame(
        () => {

            settingsModal.classList.add(
                "modal-visible"
            );

        }
    );

}


function closeModal(
    modal
) {

    if (!modal)
        return;


    modal.classList.remove(
        "modal-visible"
    );


    setTimeout(
        () => {

            if (
                !modal.classList.contains(
                    "modal-visible"
                )
            ) {

                modal.classList.add(
                    "hidden"
                );

            }

        },
        180
    );

}


/* =========================================================
   MODO
   ========================================================= */

function updateModeUI() {

    if (!modeStatus)
        return;


    modeStatus.textContent =
        state.mode === "voice"

            ? "Modo voz"

            : "Somente texto";

}


/* =========================================================
   STATUS
   ========================================================= */

function showTemporaryStatus(
    message
) {

    if (!temporaryStatus) {

        console.log(
            message
        );

        return;

    }


    temporaryStatus.textContent =
        message;


    temporaryStatus.classList.add(
        "status-visible"
    );


    clearTimeout(
        showTemporaryStatus.timer
    );


    showTemporaryStatus.timer =
        setTimeout(
            () => {

                temporaryStatus.classList.remove(
                    "status-visible"
                );

            },
            3000
        );

}


/* =========================================================
   INTERFACE
   ========================================================= */

function updateInterface() {

    updateModeUI();

    updateListeningUI();

    updateSpeakingUI();

    updateChatTitle();

}


/* =========================================================
   ERROS DA GROQ
   ========================================================= */

function getFriendlyApiError(
    error
) {

    if (
        error?.message ===
        "CHAVE_GROQ_NAO_CONFIGURADA"
    ) {

        return (
            "O Zé da Manga está funcionando, " +
            "mas a chave da Groq ainda não foi " +
            "configurada no script.js."
        );

    }


    if (
        error?.status ===
        401
    ) {

        return (
            "A chave da Groq foi recusada. " +
            "Verifique a chave configurada."
        );

    }


    if (
        error?.status ===
        429
    ) {

        return (
            "A Groq informou que o limite de " +
            "requisições foi atingido. " +
            "O sistema do Zé da Manga já possui " +
            "proteção contra novas chamadas rápidas. " +
            "Aguarde alguns segundos e tente novamente."
        );

    }


    if (
        error?.message ===
        "REQUISICAO_EM_ANDAMENTO"
    ) {

        return (
            "Já existe uma requisição sendo processada. " +
            "Aguarde a resposta atual."
        );

    }


    if (
        error?.message ===
        "REQUISICAO_TIMEOUT"
    ) {

        return (
            "A requisição demorou demais para responder. " +
            "Verifique sua conexão e tente novamente."
        );

    }


    if (
        error?.message ===
        "RESPOSTA_VAZIA"
    ) {

        return (
            "A inteligência do Zé da Manga retornou " +
            "uma resposta vazia. Tente novamente."
        );

    }


    return (
        "Não consegui acessar a inteligência " +
        "do Zé da Manga neste momento. " +
        "Verifique sua conexão e tente novamente."
    );

}


/* =========================================================
   DELAY
   ========================================================= */

function delay(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


/* =========================================================
   CLAMP
   ========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


/* =========================================================
   EXPOR FUNÇÕES
   ========================================================= */

window.enterAssistant =
    enterAssistant;

window.finishSpeaking =
    finishSpeaking;

window.stopSpeaking =
    stopSpeaking;

window.silenceZDM =
    silenceZDM;

window.startVoiceRecognition =
    startVoiceRecognition;

window.stopVoiceRecognition =
    stopVoiceRecognition;

window.toggleVoiceRecognition =
    toggleVoiceRecognition;

window.sendCurrentMessage =
    sendCurrentMessage;

window.createNewConversation =
    createNewConversation;


/* =========================================================
   SEGURANÇA AO SAIR
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        try {

            speechSynthesis.cancel();

        } catch (_) {}

    }
);


/* =========================================================
   DEBUG
   ========================================================= */

console.log(
    "%c ZÉ DA MANGA ",
    "background:#02070b;color:#00e6d0;font-weight:bold;padding:7px 12px;border-radius:8px;"
);

console.log(
    "Sistema inicializado com proteção contra excesso de requisições."
);
