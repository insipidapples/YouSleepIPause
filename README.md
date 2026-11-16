# You Sleep, I Pause

A minimal Firefox extension that pauses HTML5 video playback (YouTube, Twitch, and any sites you add) after a configurable period of keyboard/mouse inactivity — so a stream doesn't run all night while you sleep.

## Features

- Configurable idle threshold (in minutes)
- Optional extra delay before pausing
- Built-in support for YouTube and Twitch
- Add any custom site by domain
- Toolbar badge shows how many times it has fired this session
- Quick popup for YouTube/Twitch toggles and idle timer
- Full options page for custom sites and delays
- Zero network activity — everything stays local

## Limitations

- **Does not shut down your PC.** It only pauses video. Combine with your OS power settings if you want auto-shutdown.
- **Detects idle, not sleep.** If you're using a phone remote, Bluetooth controller, or other external input, the timer never fires.
- **Fires once per idle session.** If YouTube or Twitch auto-plays new content while you're still away, it won't re-pause until you return and go idle again.
- **HTML5 video only.** Audio-only tabs, canvas-based players, and some DRM-restricted content are unaffected.

## Installation

### Development (temporary)

1. Clone this repo.
2. Open Firefox → `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** → select `manifest.json`.
4. The extension loads but won't survive a browser restart.

### Permanent

1. Package the extension files as a `.zip` (select the files, not the folder).
2. Submit to [addons.mozilla.org](https://addons.mozilla.org/developers/) as an **unlisted** add-on (self-distributed).
3. Download the signed `.xpi`.
4. In Firefox: `about:addons` → gear icon → **Install Add-on From File…** → select the `.xpi`.

## Usage

Click the toolbar icon for quick YouTube/Twitch toggles and the idle timer. Click **More sites & timers…** for custom domains and the extra-delay option.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV2) |
| `background.js` | Idle detection and pause logic |
| `popup.html` / `popup.js` | Toolbar popup UI |
| `options.html` / `options.js` | Full settings page |
| `icon.png` / `icon-active.png` | Toolbar icons |

## Permissions

- `idle` — detect keyboard/mouse inactivity
- `tabs` — find matching video tabs
- `storage` — save settings locally
- `<all_urls>` — inject the pause script into matching tabs (including any custom domains you add)

No data is sent anywhere. No analytics, no telemetry, no remote code.

## License

MIT
