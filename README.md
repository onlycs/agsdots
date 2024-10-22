# gnyprlome

My dotfiles for aylurs-gtk-shell (ags), basically recreating a hyprland-friendly version
of gnome-shell.

I like gnome shell don't kill me for it. This project is not finished.

## Task List

- [x] Active Window
- [x] Active Workspace
- [x] Date/Time
- [x] Notifications
- [x] Do not disturb
- [x] Clock & Calendar Widgets
- [x] Weather Widget
- [ ] Quick Settings
- [ ] Minimized app drawer thingy
- [ ] Overview (no, i'm actually going to implement gnome-shell's overview, watch me)
- [ ] Apps list
- [ ] More stuff I couldn't think of in the five minutes I spent writing this

## Install for Arch Linux

- Install bun, aylurs-gtk-shell-git (aur)
- Setup a google cloud project and setup google calendar api. save an oauth token for DESKTOP APPLICATION in oauth.json
- In the same google cloud project, make an API key for google maps geocoding.
- Setup a pirate weather API key.

`.env`:

```env
GMAPS_KEY = "..."
PW_KEY = "..."
LOCATION = "Somewhere" #e.g. "New York, NY"
```

`oauth.json`:

```json
{"installed":{"client_id": ...}}
```

- Move this git repo to `~/.config/ags`
- Install deps: `bun install`
- Run `bun start` in current directory NOT `ags` (there is a build step).
