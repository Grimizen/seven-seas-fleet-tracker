# Seven Seas Fleet Tracker

A mobile-first shared ship sheet hosted on GitHub Pages, using Firebase Google sign-in and Cloud Firestore. See [FIREBASE-SETUP.md](FIREBASE-SETUP.md) for the one-time security rules and owner setup.

## Run and test

Serve `dist/` over HTTP: `python -m http.server 4173 --directory dist`. Local Google sign-in requires the local hostname to be authorised in Firebase. This uses the real configured project; rules tests use a separate demo emulator.

Run `npm install --ignore-scripts`, then `npm test`. With Java 21 installed, run `npm run test:rules` for Firestore access and transaction tests. GitHub Actions runs both before deploying `dist/` to Pages.

## Features

Selectable section/cannon diagram, bounded damage/repair, manual sinking countdown, sails, cannon loading/firing, general crew and officer assignments, searchable cargo and transfers, shared activity, conflict-aware session undo, account invitations, and administrator vessel creation/renaming.

The web Firebase configuration is public by design. Database rules enforce access; do not add service-account keys or secrets to this repository. Firebase rules are deployed separately through the Console or Firebase CLI; the Pages workflow does not change them.

Existing local playtest data is preserved for export and never silently uploaded. The shared fleet is explicitly initialised by the owner. See GM-ASSUMPTIONS.md for the campaign defaults. Full ship-template editing, officer ability levels, fire simulation and granular ammunition compatibility remain future work.
