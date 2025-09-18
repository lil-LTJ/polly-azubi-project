document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const textInput = document.getElementById('text-input');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const translateBtn = document.getElementById('translate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const downloadTranslatedBtn = document.getElementById('download-translated-btn');
    const demoBtn = document.getElementById('demo-btn');
    const audioPlayer = document.getElementById('audio-player');
    const progressBar = document.getElementById('progress-bar');
    const statusMessage = document.getElementById('status-message');
    const voiceSelect = document.getElementById('voice-select');
    const sourceLangSelect = document.getElementById('source-lang');
    const targetLangSelect = document.getElementById('target-lang');
    const transcript = document.getElementById('transcript');
    const voiceSpeed = document.getElementById('voice-speed');
    const voicePitch = document.getElementById('voice-pitch');
    const voiceStyle = document.getElementById('voice-style');


    // **IMPORTANT:** Replace with your actual API Gateway URL
    const API_GATEWAY_URL = 'https://29evc4c0xg.execute-api.us-east-1.amazonaws.com/prod/convert';


    // Voice settings for different accents - expanded with more options
    const voiceSettings = {
        'american-male': { rate: 1.0, pitch: 1.0, lang: 'en-US', demo: "Hello, I'm a standard American male voice. Clear and professional.", speed: "Medium", pitchLevel: "Medium", style: "Neutral" },
        'american-female-1': { rate: 1.1, pitch: 1.2, lang: 'en-US', demo: "Hi there! I'm a warm American female voice, perfect for friendly conversations.", speed: "Medium", pitchLevel: "Medium-High", style: "Friendly" },
        'american-female-2': { rate: 1.0, pitch: 1.1, lang: 'en-US', demo: "Welcome. I'm a professional American female voice, ideal for business contexts.", speed: "Medium", pitchLevel: "Medium", style: "Professional" },
        'american-southern': { rate: 0.8, pitch: 0.9, lang: 'en-US', demo: "Well howdy there! I'm a Southern American voice, slow and melodic like sweet tea.", speed: "Slow", pitchLevel: "Medium-Low", style: "Melodic" },
        'american-teen': { rate: 1.4, pitch: 1.3, lang: 'en-US', demo: "Hey, like, I'm a teenager voice and stuff. It's totally cool, right?", speed: "Fast", pitchLevel: "High", style: "Casual" },
        'american-news': { rate: 1.0, pitch: 1.0, lang: 'en-US', demo: "This is the news reporter voice, bringing you the latest updates with clarity and authority.", speed: "Medium", pitchLevel: "Medium", style: "Formal" },
        'american-narration': { rate: 0.9, pitch: 1.0, lang: 'en-US', demo: "And so the story unfolds. I'm a narration voice, calm and expressive for storytelling.", speed: "Slow", pitchLevel: "Medium", style: "Expressive" },
        'british-male-1': { rate: 1.0, pitch: 1.0, lang: 'en-GB', demo: "Hello, I'm a traditional British male voice with Received Pronunciation. Quite proper.", speed: "Medium", pitchLevel: "Medium", style: "Refined" },
        'british-male-2': { rate: 1.1, pitch: 1.0, lang: 'en-GB', demo: "Hi there! I'm a modern British male voice, clear and contemporary.", speed: "Medium", pitchLevel: "Medium", style: "Contemporary" },
        'british-female-1': { rate: 1.0, pitch: 1.1, lang: 'en-GB', demo: "Hello, I'm an elegant British female voice with Received Pronunciation.", speed: "Medium", pitchLevel: "Medium", style: "Elegant" },
        'british-female-2': { rate: 1.1, pitch: 1.2, lang: 'en-GB', demo: "Hi! I'm a friendly British female voice, approachable and warm.", speed: "Medium", pitchLevel: "Medium-High", style: "Friendly" },
        'cockney': { rate: 1.3, pitch: 1.0, lang: 'en-GB', demo: "Alright mate! I'm a proper Cockney voice from London, innit?", speed: "Fast", pitchLevel: "Medium", style: "Urban" },
        'british-posh': { rate: 0.9, pitch: 1.0, lang: 'en-GB', demo: "I say, this is rather a posh British accent, don't you think? Quite sophisticated.", speed: "Slow", pitchLevel: "Medium", style: "Sophisticated" },
        'british-news': { rate: 1.0, pitch: 1.0, lang: 'en-GB', demo: "This is the BBC news, bringing you the latest information with authority and clarity.", speed: "Medium", pitchLevel: "Medium", style: "Authoritative" },
        'scottish': { rate: 1.0, pitch: 0.9, lang: 'en-GB', demo: "Och aye! I'm a Scottish English voice, rich and melodic like the highlands.", speed: "Medium", pitchLevel: "Medium-Low", style: "Melodic" },
        'australian-male': { rate: 1.0, pitch: 1.0, lang: 'en-AU', demo: "G'day mate! I'm an Australian male voice, friendly and laid-back.", speed: "Medium", pitchLevel: "Medium", style: "Casual" },
        'australian-female': { rate: 1.1, pitch: 1.2, lang: 'en-AU', demo: "Hello! I'm an Australian female voice, warm and engaging.", speed: "Medium", pitchLevel: "Medium-High", style: "Friendly" },
        'irish-male': { rate: 1.1, pitch: 1.0, lang: 'en-IE', demo: "Top of the morning! I'm an Irish male voice, lyrical and expressive.", speed: "Medium", pitchLevel: "Medium", style: "Expressive" },
        'irish-female': { rate: 1.2, pitch: 1.2, lang: 'en-IE', demo: "Hello! I'm an Irish female voice, musical and charming.", speed: "Medium", pitchLevel: "Medium-High", style: "Charming" },
        'indian-male': { rate: 1.0, pitch: 1.0, lang: 'en-IN', demo: "Hello, I'm an Indian male voice, clear and melodic.", speed: "Medium", pitchLevel: "Medium", style: "Melodic" },
        'indian-female': { rate: 1.1, pitch: 1.1, lang: 'en-IN', demo: "Namaste! I'm an Indian female voice, expressive and rhythmic.", speed: "Medium", pitchLevel: "Medium", style: "Expressive" },
        'canadian': { rate: 1.0, pitch: 1.0, lang: 'en-CA', demo: "Hello, I'm a Canadian English voice, neutral and pleasant, eh?", speed: "Medium", pitchLevel: "Medium", style: "Neutral" },
        'south-african': { rate: 1.0, pitch: 1.0, lang: 'en-ZA', demo: "Hello, I'm a South African English voice, distinct and engaging.", speed: "Medium", pitchLevel: "Medium", style: "Distinct" },
        'new-zealand': { rate: 1.0, pitch: 1.0, lang: 'en-NZ', demo: "Hello, I'm a New Zealand English voice, unique and friendly.", speed: "Medium", pitchLevel: "Medium", style: "Friendly" },
        'robot': { rate: 0.8, pitch: 0.5, lang: 'en-US', demo: "I. Am. A. Robot. Voice. Beep. Boop. Mechanical. And. Synthetic.", speed: "Slow", pitchLevel: "Low", style: "Mechanical" },
        'deep-voice': { rate: 0.8, pitch: 0.4, lang: 'en-US', demo: "I have a very deep and commanding voice, powerful and resonant.", speed: "Slow", pitchLevel: "Very Low", style: "Powerful" },
        'elf': { rate: 1.2, pitch: 1.3, lang: 'en-US', demo: "I am an elf from the fantasy realm, with a melodic and magical voice.", speed: "Medium", pitchLevel: "High", style: "Magical" },
        'old-wizard': { rate: 0.7, pitch: 0.8, lang: 'en-US', demo: "I am an old wizard with centuries of wisdom in my voice, mysterious and wise.", speed: "Slow", pitchLevel: "Low", style: "Wise" },
        'child': { rate: 1.4, pitch: 1.5, lang: 'en-US', demo: "I'm a little kid with a high-pitched voice! Everything is exciting!", speed: "Fast", pitchLevel: "Very High", style: "Energetic" },
        'whisper': { rate: 0.9, pitch: 1.1, lang: 'en-US', demo: "I'm a whisper voice, soft and intimate, perfect for secrets.", speed: "Slow", pitchLevel: "Medium", style: "Soft" },
        'storyteller': { rate: 1.0, pitch: 1.0, lang: 'en-US', demo: "Let me tell you a story. I'm a storyteller voice, expressive and dramatic.", speed: "Medium", pitchLevel: "Medium", style: "Dramatic" }
    };


    // Update voice info when selection changes
    voiceSelect.addEventListener('change', function() {
        const selectedVoice = voiceSelect.value;
        if (voiceSettings[selectedVoice]) {
            const settings = voiceSettings[selectedVoice];
            voiceSpeed.innerHTML = `<i class="fas fa-tachometer-alt"></i> Speed: ${settings.speed}`;
            voicePitch.innerHTML = `<i class="fas fa-waveform"></i> Pitch: ${settings.pitchLevel}`;
            voiceStyle.innerHTML = `<i class="fas fa-theater-masks"></i> Style: ${settings.style}`;
        }
    });


    // Initialize voice info
    voiceSpeed.innerHTML = `<i class="fas fa-tachometer-alt"></i> Speed: ${voiceSettings['american-male'].speed}`;
    voicePitch.innerHTML = `<i class="fas fa-waveform"></i> Pitch: ${voiceSettings['american-male'].pitchLevel}`;
    voiceStyle.innerHTML = `<i class="fas fa-theater-masks"></i> Style: ${voiceSettings['american-male'].style}`;


    // Variables to store audio data
    let audioURL = null;
    let translatedAudioURL = null;
    let translatedText = "";


    // Set up demo button functionality
    demoBtn.addEventListener('click', function() {
        const selectedVoice = voiceSelect.value;
        const demoText = voiceSettings[selectedVoice].demo;
        textInput.value = demoText;
        convertTextToSpeech(demoText, selectedVoice);
    });


    // Convert text to speech
    convertBtn.addEventListener('click', function() {
        const text = textInput.value.trim();


        if (text === '') {
            statusMessage.textContent = 'Please enter some text to convert.';
            statusMessage.classList.add('status-error');
            return;
        }


        const selectedVoice = voiceSelect.value;
        convertTextToSpeech(text, selectedVoice);
    });


    // Function to convert text to speech using an AWS backend
    async function convertTextToSpeech(text, voiceId) {
        convertBtn.disabled = true;
        downloadBtn.disabled = true;
        demoBtn.disabled = true;
        statusMessage.textContent = 'Converting text to speech...';
        statusMessage.classList.remove('status-error', 'status-success');


        try {
            // Send a POST request to your API Gateway endpoint
            const response = await fetch(API_GATEWAY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voiceId: voiceId
                })
            });


            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }


            const data = await response.json();


            if (data.audioUrl) {
                audioURL = data.audioUrl;
                audioPlayer.src = audioURL;
                audioPlayer.style.display = 'block';
                statusMessage.textContent = 'Conversion complete. Audio is ready!';
                statusMessage.classList.add('status-success');
                downloadBtn.disabled = false;
            } else {
                throw new Error('No audio URL received from the server.');
            }


        } catch (error) {
            console.error('Text-to-speech conversion failed:', error);
            statusMessage.textContent = `Error: ${error.message}. Please try again.`;
            statusMessage.classList.add('status-error');
        } finally {
            convertBtn.disabled = false;
            demoBtn.disabled = false;
        }
    }


    // Translate text (simulated, would require another API Gateway/Lambda)
    translateBtn.addEventListener('click', async function() {
        const text = textInput.value.trim();


        if (text === '') {
            statusMessage.textContent = 'Please enter some text to translate.';
            statusMessage.classList.add('status-error');
            return;
        }


        const sourceLang = sourceLangSelect.value;
        const targetLang = targetLangSelect.value;


        if (sourceLang === targetLang) {
            statusMessage.textContent = 'Source and target languages are the same.';
            statusMessage.classList.add('status-warning');
            transcript.textContent = text;
            translatedText = text;
            downloadTranslatedBtn.disabled = false;
            return;
        }


        statusMessage.textContent = 'Translating text...';
        statusMessage.classList.remove('status-error', 'status-success');
        translateBtn.disabled = true;


        // Simulate translation delay
        setTimeout(async () => {
            translatedText = await simulateTranslation(text, sourceLang, targetLang);
            transcript.innerHTML = `
                <p><strong>Original (${getLanguageName(sourceLang)}):</strong> ${text}</p>
                <p class="translated-text"><strong>Translated (${getLanguageName(targetLang)}):</strong> ${translatedText}</p>
            `;
            statusMessage.textContent = 'Translation complete. Now, convert the translated text to speech.';
            statusMessage.classList.add('status-success');
            translateBtn.disabled = false;
            downloadTranslatedBtn.disabled = false;
        }, 1500);
    });


    // Download audio file
    downloadBtn.addEventListener('click', function() {
        if (!audioURL) {
            statusMessage.textContent = 'No audio available to download. Please convert text to speech first.';
            statusMessage.classList.add('status-error');
            return;
        }
        const a = document.createElement('a');
        a.href = audioURL;
        a.download = 'text-to-speech.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        statusMessage.textContent = 'Download started...';
        statusMessage.classList.add('status-success');
    });


    // Download translated audio (requires separate conversion step)
    downloadTranslatedBtn.addEventListener('click', function() {
        if (!translatedText) {
            statusMessage.textContent = 'No translated text available to download.';
            statusMessage.classList.add('status-error');
            return;
        }
        // This would trigger a new conversion API call with the translated text
        convertTextToSpeech(translatedText, voiceSelect.value);
    });


    // Clear text input
    clearBtn.addEventListener('click', function() {
        textInput.value = '';
        audioPlayer.src = '';
        progressBar.style.width = '0%';
        transcript.textContent = 'Translated text will appear here...';
        statusMessage.textContent = '';
        statusMessage.classList.remove('status-error', 'status-success');
        audioURL = null;
        translatedAudioURL = null;
        downloadBtn.disabled = true;
        downloadTranslatedBtn.disabled = true;
    });


    // Helper function to simulate translation (not a real API call)
    async function simulateTranslation(text, sourceLang, targetLang) {
        // Simple word-by-word translation for common words
        const wordTranslations = {
            'en': {
                'es': {
                    'hello': 'hola', 'hi': 'hola', 'welcome': 'bienvenido', 'to': 'a', 'our': 'nuestro',
                    'advanced': 'avanzado', 'text': 'texto', 'speech': 'voz', 'converter': 'convertidor',
                    'this': 'este', 'demonstration': 'demostración', 'shows': 'muestra', 'how': 'cómo',
                    'you': 'tú', 'can': 'puedes', 'use': 'usar', 'different': 'diferentes',
                    'voices': 'voces', 'with': 'con', 'various': 'varios', 'accents': 'acentos',
                    'the': 'el', 'and': 'y', 'is': 'es', 'are': 'son', 'good': 'bueno', 'bad': 'malo'
                },
                'fr': {
                    'hello': 'bonjour', 'hi': 'salut', 'welcome': 'bienvenue', 'to': 'à', 'our': 'notre',
                    'advanced': 'avancé', 'text': 'texte', 'speech': 'parole', 'converter': 'convertisseur',
                    'this': 'ce', 'demonstration': 'démonstration', 'shows': 'montre', 'how': 'comment',
                    'you': 'vous', 'can': 'pouvez', 'use': 'utiliser', 'different': 'différentes',
                    'voices': 'voix', 'with': 'avec', 'various': 'divers', 'accents': 'accents',
                    'the': 'le', 'and': 'et', 'is': 'est', 'are': 'sont', 'good': 'bon', 'bad': 'mauvais'
                },
                'de': {
                    'hello': 'hallo', 'hi': 'hallo', 'welcome': 'willkommen', 'to': 'zu', 'our': 'unser',
                    'advanced': 'fortgeschritten', 'text': 'text', 'speech': 'sprache', 'converter': 'konverter',
                    'this': 'diese', 'demonstration': 'demonstration', 'shows': 'zeigt', 'how': 'wie',
                    'you': 'sie', 'can': 'können', 'use': 'verwenden', 'different': 'verschiedene',
                    'voices': 'stimmen', 'with': 'mit', 'various': 'verschiedene', 'accents': 'akzente',
                    'the': 'der', 'and': 'und', 'is': 'ist', 'are': 'sind', 'good': 'gut', 'bad': 'schlecht'
                }
            }
        };

        if (wordTranslations[sourceLang] && wordTranslations[sourceLang][targetLang]) {
            const dictionary = wordTranslations[sourceLang][targetLang];
            const words = text.toLowerCase().split(/\s+/);
            const translatedWords = words.map(word => {
                // Remove punctuation for lookup
                const cleanWord = word.replace(/[.,!?;:]/g, '');
                return dictionary[cleanWord] || word;
            });
            return translatedWords.join(' ');
        }
        
        return `[Translation to ${getLanguageName(targetLang)}]: ${text}`;
    }


    // Helper function to get language name from code
    function getLanguageName(code) {
        const languages = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
            'ja': 'Japanese', 'zh': 'Chinese', 'ru': 'Russian', 'ar': 'Arabic', 'pt': 'Portuguese', 'hi': 'Hindi'
        };
        return languages[code] || code;
    }
});
