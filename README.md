# Seven Seas Fleet Tracker

A dependency-free, mobile-first local playtest for the Sea Wren. Static ES modules in `dist/` can ultimately be served by GitHub Pages. No backend, Firebase connection or shared authentication is enabled yet.

## Run
Serve `dist/` over HTTP: `python -m http.server 4173 --directory dist`, then open http://localhost:4173. Do not open index.html as a file URL. Run model checks with `node --test`.

## Working features
Selectable station/cannon diagram; bounded damage and repairs; manual sinking countdown; sail state; individual cannon firing/loading/condition; crew assignments; separate officer positions; inventory adjustments and transfers; fleet selection; local activity history, session undo and JSON export. State persists in this browser's localStorage. An explicit display name labels actions; it is not authentication.

Initial ammunition comprises 26 stored rounds plus four loaded rounds. Actions and undo are local-only; undo is cleared on refresh or updates from another tab. Multiple browser tabs receive storage updates but are not a substitute for transactional shared persistence. Avoid concurrent edits in the local playtest.

## Next integration
Use Firebase Authentication (Google sign-in plus editable display name) and Firestore with transactional gameplay actions. Distinguish shared vessel state from local selected vessel. Enforce participant/admin roles in database rules; do not trust client UI restrictions. Store activity with actor UID and operation ID, and implement conflict-aware inverse actions for shared undo. Real Firebase project configuration, approved account identities and a GitHub repository are needed before connecting and deploying. No fake sign-in or client-only role security is shipped.

See GM-ASSUMPTIONS.md for campaign defaults, unresolved rules and temporary scope decisions. The build does not implement combat simulation, fire tiles, alternate ship classes, granular ammunition compatibility or officer ability levels yet.

Google Fonts are optional presentation dependencies; system/Georgia fallbacks work without them. No build system is required. Publish the contents of `dist/` to GitHub Pages when deployment is authorised and the repository is chosen. Keep Firebase secrets/service-account files out of public assets.
