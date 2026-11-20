# Earway

A static Android Chrome ear-training game with spoken answers, generated tones and on-device score storage. No backend, account, or paid service is required.

## Use

1. Open the site in Android Chrome over HTTPS. Connect Bluetooth and start a level **while parked**. Allow microphone access when prompted. The first session downloads an approximately 41 MB English speech model; preparation can take a while. Keep the page open and remain parked until the first notes play. An internet connection is required for the initial download.
2. While parked, choose an instrument on the level screen and tap **Test spoken feedback** to check that the voice is audible through your Tesla. Soft keys, mellow tone, pure sine and warm organ are synthesized sounds, not recordings of real instruments. The selection is saved on this device. Use Preview to hear an example.
3. Listen, then say an interval name (for example “minor third” or “perfect fifth”) or a chord quality (for example “major seventh”). Say “repeat”, “skip”, or “stop”. Natural phrasing works, such as “I think it is a minor third”, “minor three”, “flat third”, or “three semitones”. For intervals where the number is ambiguous, include the quality (for example, major or minor). The recognizer is constrained to the current level’s answer vocabulary and game commands. It also accepts variants such as “forth” for “fourth”. Chord answers can include “chord” or “triad”. Unrecognised or ambiguous responses do not cost points. A constrained recognizer can still mishear one valid answer as another; when an answer is wrong, the game speaks what it heard before asking you to retry. Touch buttons are a fallback for use while parked.
4. Get five correct answers in a level to unlock the next. Each correct answer earns 100 points, less 20 per wrong answer or replay, to a minimum of 20. Scores and unlocks remain in the same browser on the same device; clearing browser data deletes them. Use the question-mark menu to reset.

**Driving safety:** Set up, grant permissions, change levels, and use touch controls only while parked. If voice recognition or Bluetooth routing is unreliable, stop using it while driving. The game cannot guarantee hands-free operation. Test with your specific Tesla and phone while parked first; using the Bluetooth microphone can change audio quality or routing. Android may show a microphone privacy indicator, and a device may still play its own audio cues; removing the Android speech-recognition API does not guarantee complete silence on every device. The app requests a screen wake lock during play; this requires a supported browser and can be refused (for example under battery-saving policies). Check the screen-wake message while parked. Manually locking the screen, switching apps or letting the screen turn off can still interrupt or throttle audio and recognition; background operation is not guaranteed.

## Voice and privacy

- Speech recognition now runs **on the device** with [Vosk Browser 0.0.8](https://github.com/ccoreilly/vosk-browser) and its small US English Vosk model; microphone audio is not sent to a speech-recognition server by this app. The recognizer is not Android's system SpeechRecognition API, so its start/stop beep should no longer occur. Accent, background noise and model accuracy can affect recognition.
- The microphone stays open until you end the session. The app only feeds it to the recognizer while waiting for your answer, not while playing notes or spoken feedback. Once a session ends, microphone tracks stop. The browser and Android still control permissions and device routing.
- At first use, the app downloads the model (41,184,862 bytes) from `ccoreilly.github.io`, a third-party host. That host receives a normal web request, including your IP address. Vosk attempts to cache the extracted model in browser storage for later visits; this can use substantially more space than the compressed download. The browser may evict it or deny storage, which means it must be downloaded again. The loaded model stays in memory between sessions in the same tab; closing the tab releases it. Page assets and voice feedback are not guaranteed offline: this is not an offline PWA. Phone storage, memory and CPU use are significant; small Vosk models may need hundreds of MB of RAM.
- If setup fails, end the session and check Chrome's microphone permission and internet connection; or use the touch-only fallback while parked. “Resume listening” retries the local recognizer while a voice session is running. The app does not automatically fall back to Android speech recognition.
- Vosk Browser and the model are Apache 2.0 licensed; the library license is in `vendor/VOSK-LICENSE.txt`. Model information: https://alphacephei.com/vosk/models. Spoken feedback consists of bundled, AI-generated voice recordings compressed as mono MP3 clips and played via Web Audio on the same output as the notes, rather than the device text-to-speech service. All 49 clips together are around 400 KB. Use Test spoken feedback on the level screen to check the voice and audio routing while parked.

## Deploy on Cloudflare Pages free tier

1. Create a GitHub repository and upload `index.html`, `style.css`, `app.js`, `README.md`, and the **entire `vendor` and `feedback` folders** at the repository root. Do not upload any secrets. The 41 MB model is hosted separately and is not part of the repository or ZIP.
2. In Cloudflare dashboard, go to **Workers & Pages**, create a **Pages** application, and connect your GitHub repository. If prompted, authorize Cloudflare to access that repository.
3. Select your repository. Use the static/no-framework preset if offered. No build is necessary: leave the build command blank and set the build output directory to `/` (repository root). Deploy.
4. Open the resulting HTTPS Pages URL in Android Chrome. Future pushes to the configured production branch trigger redeployment.

Cloudflare's interface may change; if a build command is required, use `exit 0` and output directory `/`. This is a plain static site and does not require Workers, D1, or Cloudflare credentials in the repository.

## Local preview

Run `python3 -m http.server 8000` in this directory and open `http://localhost:8000` on the same computer. Microphone access on another device requires HTTPS, so use the deployed Pages URL for phone testing.

## Notes

- Levels are sequential: ascending, descending, harmonic intervals, triads, then sevenths/ninths. The last level uses root-position major, minor and dominant sevenths and ninths.
- Notes are generated using Web Audio, with randomized roots; no audio files or third-party audio service are needed.
- There is no cross-device sync. Install to the home screen if desired, but behavior may depend on Chrome and Android; this is not an offline PWA.
