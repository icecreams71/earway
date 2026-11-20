# Earway

A static Android Chrome ear-training game with spoken answers, generated tones and on-device score storage. No backend, account, or paid service is required.

## Use

1. Open the site in Android Chrome over HTTPS. Connect Bluetooth and start a level **while parked**. Allow microphone access when prompted.
2. While parked, choose an instrument on the level screen. Soft keys, mellow tone, pure sine and warm organ are synthesized sounds, not recordings of real instruments. The selection is saved on this device. Use Preview to hear an example.
3. Listen, then say an interval name (for example “minor third” or “perfect fifth”) or a chord quality (for example “major seventh”). Say “repeat”, “skip”, or “stop”. Each answer should be a complete name. Touch buttons are a fallback for use while parked.
4. Get five correct answers in a level to unlock the next. Each correct answer earns 100 points, less 20 per wrong answer or replay, to a minimum of 20. Scores and unlocks remain in the same browser on the same device; clearing browser data deletes them. Use the question-mark menu to reset.

**Driving safety:** Set up, grant permissions, change levels, and use touch controls only while parked. If voice recognition or Bluetooth routing is unreliable, stop using it while driving. The game cannot guarantee hands-free operation. Test with your specific Tesla and phone while parked first; switching to the Bluetooth microphone can change audio quality or routing. Speech recognition depends on browser and network support and may send audio to your browser's speech provider. It may not work offline. The app requests continuous recognition, but Android Chrome may end a session after silence and then restart it after a short pause. During that pause it cannot hear your answer. Any start/stop beeps come from the device or speech service and cannot be disabled through the Web Speech API. Actual listening duration and tones vary by phone and speech provider. If voice stops, tap Listen while parked. The site's HTTPS origin is required for microphone access (localhost is also allowed for development).

## Deploy on Cloudflare Pages free tier

1. Create a GitHub repository and upload `index.html`, `style.css`, `app.js`, and this README at the repository root. Do not upload any secrets.
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
