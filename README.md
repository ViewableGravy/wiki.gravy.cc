# wiki.gravy.cc

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

Note: If this crashes for some reason (ie, computer restarts), this can be restarted by running `bun dev &` and then `disown {process id}` which will run the command as a background process and detach it from the terminal session.

Further investigation may be necessary to investigate why running `sudo systemctl start wiki` causes the application to crash
(/lib/systemd/system/wiki.service)
