# Seven Seas Fleet Tracker

A mobile-first shared ship sheet hosted on GitHub Pages, using Firebase Google sign-in and Cloud Firestore. See [FIREBASE-SETUP.md](FIREBASE-SETUP.md) for the one-time security rules and owner setup.

## Run and test

Serve `dist/` over HTTP: `python -m http.server 4173 --directory dist`. Local Google sign-in requires the local hostname to be authorised in Firebase. This uses the real configured project; rules tests use a separate demo emulator.

Run `npm install --ignore-scripts`, then `npm test`. With Java 21 installed, run `npm run test:rules` for Firestore access and transaction tests. GitHub Actions runs both before deploying `dist/` to Pages.

## Features

Selectable section/cannon diagram, bounded damage/repair, manual sinking countdown, sails, cannon loading/firing, general crew and officer assignments, searchable cargo and transfers, shared activity, conflict-aware session undo, account invitations, and administrator vessel creation/renaming.

The web Firebase configuration is public by design. Database rules enforce access; do not add service-account keys or secrets to this repository. Firebase rules are deployed separately through the Console or Firebase CLI; the Pages workflow does not change them.

Existing local playtest data is preserved for export and never silently uploaded. The shared fleet is explicitly initialised by the owner. See GM-ASSUMPTIONS.md for the campaign defaults. Officer ability levels, fire simulation and granular ammunition compatibility remain future work.

### Manage fleet

Owners and GMs can archive/restore vessels and change class using Sloop size presets or custom HP and capacity settings. Class changes preserve cargo, equipment and damage; insufficient crew or slot capacity is rejected. Custom defaults can be saved for the group. Publish the updated Firestore rules as described in FIREBASE-SETUP.md; existing ownership remains intact.

### Gun loadouts and GM review

Use **Guns** to install, replace, remove or move a cannon; owner/GM controls also configure slot counts and allowed gun families. Empty slots are shown in the diagram. The GM catalogue contains 18 variants across Long Gun, Carronade, Howitzer and Swivel Gun, each with its own statistics. Players retain fire/reload and crew controls.

Use **Manage fleet** for automatically synced group templates, including edit/rename/delete. The existing Firestore rules already protect these administrator settings; no new rules are required for this batch. Loadout changes preserve loaded ammunition as described in the confirmation. Existing vessels are not reset.

[GM assumption register](GM-ASSUMPTIONS.md) distinguishes supplied rules from provisional decisions and provides stable approval IDs. [Change queue](CHANGE-QUEUE.md) records the completed batch and unresolved rules questions.

### Load, casualties and sounds

All vessel load controls use **cargo units (CU)** from the GM's Cargo.pdf. Swivels use 1 CU; long guns, carronades and howitzers use poundage multiplied by 1, 0.75 and 1.5 respectively. Sloop capacities are 50/100/150 CU. Owner/GM overrides remain available.

In Cargo, add from the GM catalogue or create a custom item. Catalogue choices fill in CU usage, rarity and retail-reference prices; bulk goods are measured and priced per CU, while rounds and individual supplies use item counts. Fractional bulk quantities are supported. Personal equipment can be marked excluded from vessel load. Rarity filtering and value-per-CU sorting help compare loot. Reference prices are not sale proceeds; treasure ranges are retained.

**Reviewing older data:** old pound fields remain untouched. Cargo with no CU value is marked for review: open Edit / classify cargo, choose the correct catalogue entry or custom CU value, verify quantity and save. Review loaded rounds separately in Guns. An old gun pound override remains unknown until the GM saves a CU override (blank restores the GM formula). An old vessel capacity in pounds requires confirmation in Manage fleet; otherwise matching Sloop classes use the confirmed default. Group template pound capacities are likewise not converted silently. No startup migration writes occur.

Cargo-unit and price metadata are preserved by reloads, transfers, gun moves/removal and undo. Compatibility by ammunition size is still a GM check. Occupied equipment is counted once: stored rounds become loaded rounds when reloaded. Loadout configuration does not consume spare cannons from inventory.

Crew and Ship controls record direct casualties from explicitly selected unassigned sailors, station assignments or gun teams. Crew total and allocations change together; officers and HP are unaffected. Undo is available. After hull recovery, **End sinking** clears the countdown explicitly when the table agrees.

**Sound** in the header controls per-device mute and volume. Successful local fire, sail changes, damage and casualty actions play short effects; remote changes, failures, repairs and undo do not. Nine MP3 clips (~190 KB total) are trimmed from the eight owner-supplied sources. Source filenames and edits are retained in `dist/audio/credits.json`; `tools/prepare_audio.py` reproduces them using Python, NumPy and FFmpeg. Originals are unchanged.

This batch uses the existing Firestore rules and membership documents; no ownership reset or data migration is needed.


### Broadsides and UI ordering

In Guns, **Fire port/starboard broadside** fires every ready gun on that side. **Reload port/starboard broadside** uses the chosen ammunition for empty operational guns that can accept it, after the uninterrupted reload turn. The preview lists affected slots and rounds required. Unavailable guns are skipped; insufficient stock rejects the whole reload. Each batch is a single transaction, log entry and undo step. A changed gun or selected ammo record rejects an out-of-date preview. Existing calibre/crew rulings remain table checks.

Broadside audio layers the two owner-supplied cannon clips 140 ms apart, with gain reduced to limit the combined level. Up to eight voices represent a large volley; one eligible gun produces one shot. It respects local mute/volume and plays only after successful local fire. Preview it in Sound.

**UI convention for future changes:** every rendered list needs an explicit, deterministic order and an ID tie-breaker for equal names. Named entities use English natural alphabetical ordering; gun slots use Port/Starboard/Bow/Stern then slot number; sections and rule-defined choices keep their fixed semantic order. Cargo preserves the user's selected sort, with name/ID tie-breakers; activity remains newest-first. Sort display copies, never the paired stored gun configuration/game arrays. Renames and explicit quantity/value sorts may intentionally change positions.
