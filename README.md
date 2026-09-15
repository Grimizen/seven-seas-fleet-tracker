# Seven Seas Fleet Tracker

A mobile-first shared ship sheet hosted on GitHub Pages, using Firebase Google sign-in and Cloud Firestore. See [FIREBASE-SETUP.md](FIREBASE-SETUP.md) for the one-time security rules and owner setup.

## Run and test

Serve `dist/` over HTTP: `python -m http.server 4173 --directory dist`. Local Google sign-in requires the local hostname to be authorised in Firebase. This uses the real configured project; rules tests use a separate demo emulator.

Run `npm install --ignore-scripts`, then `npm test`. With Java 21 installed, run `npm run test:rules` for Firestore access and transaction tests. GitHub Actions runs both before deploying `dist/` to Pages.

## Features

Selectable section/cannon diagram, bounded damage/repair, manual sinking countdown, sails, cannon loading/firing, general crew and officer assignments, searchable cargo and transfers, shared activity, conflict-aware session undo, account invitations, and administrator vessel creation/renaming.

The web Firebase configuration is public by design. Database rules enforce access; do not add service-account keys or secrets to this repository. Firebase rules are deployed separately through the Console or Firebase CLI; the Pages workflow does not change them.

Existing local playtest data is preserved for export and never silently uploaded. The shared fleet is explicitly initialised by the owner. See GM-ASSUMPTIONS.md for the campaign defaults. Full ship-template editing, officer ability levels, fire simulation and granular ammunition compatibility remain future work.

### Manage fleet

Owners and GMs can archive/restore vessels and change class using Sloop size presets or custom HP and capacity settings. Class changes preserve cargo, equipment and damage; insufficient capacity is rejected. Custom defaults can be saved for the group. Publish the updated Firestore rules as described in FIREBASE-SETUP.md; existing ownership remains intact.

### Gun loadouts and GM review

Use **Guns** to install, replace, remove or move a cannon; owner/GM controls also configure slot counts and allowed gun families. Empty slots are shown in the diagram. The GM catalogue contains 18 variants across Long Gun, Carronade, Howitzer and Swivel Gun, each with its own statistics. Players retain fire/reload and crew controls.

Use **Manage fleet** for automatically synced group templates, including edit/rename/delete. The existing Firestore rules already protect these administrator settings; no new rules are required for this batch. Loadout changes preserve loaded ammunition as described in the confirmation. Existing vessels are not reset.

[GM assumption register](GM-ASSUMPTIONS.md) distinguishes supplied rules from provisional decisions and provides stable approval IDs. [Change queue](CHANGE-QUEUE.md) records the completed batch and unresolved rules questions.
