# One-time Firebase setup

Project: `seven-seas-fleet-tracker`. GitHub Pages remains the website host.

## 1. Publish the access rules

In Firebase Console → Firestore Database → Rules, replace the starter rules with the complete contents of `firestore.rules` in this repository and click Publish. These rules default to denied access and permit only approved, verified accounts. The web app cannot publish its own security rules.

The deployment workflow tests these rules in an isolated `demo-seven-seas` emulator before publishing the website. It does not deploy rules to the real Firebase project.

## 2. Sign in and create the first owner

Open https://grimizen.github.io/seven-seas-fleet-tracker/ in a normal browser and sign in with Google. The onboarding screen displays your Firebase account ID (UID).

In Firestore's Data tab create this document path:

`campaigns/seven-seas/members/YOUR_UID`

The Firestore UI uses alternating collection and document IDs: collection `campaigns`, document `seven-seas`, subcollection `members`, document ID equal to your exact UID. A parent `seven-seas` document may be empty; its contents are not used for permission checks.

Add one field: `role` (type **string**), value `owner`. You do not need to add your email or name to this manually bootstrapped owner document. Do not use your email as its document ID.

The application has deliberately no first-visitor admin claim. Only someone with Firebase Console access can bootstrap an owner. Never publish a rule that permits everyone to write membership documents.

## 3. Create shared Sea Wren

Return to the app (refresh if prompted) and select **Create shared Sea Wren**. This creates the agreed starting vessel: 16 general crew, four loaded 9lb guns, 26 stored rounds (30 total), full HP and half sails. It never overwrites an existing shared Sea Wren.

Old device-only playtests remain in their existing localStorage key and are not silently uploaded. The signed-out screen offers **Export old playtest backup**. Data saved on localhost and GitHub Pages are separate browser origins.

## 4. Invite your group

Under **Manage fleet**, enter each person's Google email. Choose **GM** for administrator access or **Player** for gameplay controls. This saves an allowlist entry; it does not send email. Share the app URL yourself. They must sign in using the invited verified Google account.

Inviting an existing member does not change their existing role. The owner can change a member's `role` in the Console to `admin`, `member` or `revoked`. Revocation uses `revoked`, rather than deleting the member document, so an old invitation cannot automatically recreate their access. Remove any obsolete invitation too. Existing owners cannot be modified from the web client.

## What is shared

- Ship game state and configuration are separate fields in `campaigns/seven-seas/ships/{id}`. Only administrators may create ships or alter configuration; players can update gameplay state.
- Every gameplay change uses a Firestore transaction and revision counter. Transfers update both ships in one transaction. Failed saves do not fall back to device-only edits.
- Your chosen vessel and search controls are local preferences. Activity records include the authenticated actor UID and server time.
- Undo is a session-only receipt for your own actions. It reverses only affected fields and refuses to overwrite intervening edits to the same data. Inventory and cannon arrays are treated conservatively as whole fields for conflict checks.
- Offline clients may display previously received state. Writes require a live connection and are not queued as successful offline actions.
- The UI is a cooperative game tool, not a server-side combat engine. Rules protect group access/configuration and basic state bounds; game mechanics and detailed inventory validation also run in the client.

## Verification

After owner setup, sign in on two separate devices. Change sails on one and confirm the other updates. Fire a cannon once, confirm it needs reload on both, and reload it once. Confirm stored shot decreases by one. Sign in with an uninvited account and confirm it cannot read the fleet. Check a Player account has gameplay controls but no Manage fleet tab.

Google sign-in uses a popup; open the app in Safari/Chrome rather than a messaging app's embedded browser. The authorized domain is `grimizen.github.io`. Local development needs its exact hostname added separately to Firebase Authentication's authorized domains.
