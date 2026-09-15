# Seven Seas — working assumptions for GM review

## Agreed campaign defaults
- PCs do not count toward general crew minimums or capacity.
- Assigning an NPC or PC officer never automatically changes general crew totals.
- General crew are required independently of officer positions.
- Section HP at zero disables its service. Partial damage currently has no automatic penalty.
- Compartment damage never alters inventory quantities or access.
- Hull HP reaching zero triggers a manually recorded d12 sinking countdown; 1 means immediate sinking. Repair does not automatically cancel a countdown.

## Starting playtest vessel
- Sea Wren, Large Sloop; 20 hull HP; 16 general crew; minimum 5, maximum 48.
- Four 9lb light long guns, two port and two starboard; d4 damage, 24 hex range, three crew each.
- 30 lead shot TOTAL: four loaded rounds and 26 rounds in stores.
- Full hull and section HP; half sails; no officers or crew allocations entered.
- Speed 6 / 9 / 12 hexes; turning costs 3 / 6 / 9 hexes.
- Large Sloop station defaults: Bridge 5, Rudder 3, Mast 5, Gun Deck 8, Powder Dock 3, Anchors 3, Infirmary 3, Larder 3, Hold 5.

## Provisional implementation decisions
- One shared Mast and Gun Deck HP pool, pending confirmation of per-instance HP.
- Diagram is schematic: compartment positions are not an authoritative deck plan or fire grid.
- Gun Deck destruction prevents firing/reloading. Powder Dock destruction prevents reloading, but loaded rounds remain aboard. Confirm these specific service dependencies.
- Staffing shortages warn but do not block firing; table adjudication remains authoritative.
- Reload is completed manually after an uninterrupted turn. Loading deducts one round from stores; firing empties the gun without deducting twice.
- No automatic turn enforcement, damage rolls, critical effects, fires, consumption, or repair costs.
- Ammunition compatibility beyond the starting lead shot is not enforced yet. Before expanded loadouts, add weight categories and special shot modifiers.
- Officers have names/assignments only in this first slice. Levels, qualifications and ability reference are future additions.
- New vessels in the local playtest copy the Sea Wren loadout; no other class defaults are invented.

## Questions to settle
1. Are mast and gun deck HP per physical instance or shared? What happens when only one mast is destroyed?
2. Does partial damage change performance? What restores a destroyed service?
3. Can officer assignments overlap, and do any officers provide cannon crew?
4. Does gun crew need to remain assigned during reload? Can the same crew operate different batteries in one turn?
5. What are station repair actions/costs? Can hull repair stop sinking?
6. Should stored contents become inaccessible or suffer loss in future?
7. How should crew damage translate into casualties? Are wounded crew tracked separately?
8. Critical failure table omits roll 5; confirm intended result. Confirm hit-modifier table/example for partial cover.
9. Does ammunition compatibility use weight category or exact poundage? What is the swivel ammunition cost?

## Product decisions
- All signed-in participants can take gameplay actions and manage inventory.
- Owner and GM manage templates, permissions and rule settings.
- Account/display identity is separate from officer or character assignments.
- Mobile controls below the diagram; laptop controls in a right panel.
- Firebase sign-in and shared storage are implemented. Production access requires publishing firestore.rules and manually bootstrapping the owner UID; see FIREBASE-SETUP.md. Existing local playtest data is retained separately.

## Vessel class changes and archiving

- Removing a vessel archives it; it never permanently deletes crew, ammunition, cargo or history.
- Changing class preserves missing HP as an absolute amount. Destroyed hulls and sections stay destroyed even when their maximum increases. A smaller maximum can reduce damaged sections to zero. Sinking countdowns remain manual.
- Crew, officers, installed guns, loaded rounds and cargo are retained. A class with insufficient crew or gun capacity is rejected.
- Small, Medium and Large Sloop presets use the supplied values. Other class values require GM entry. The schematic and movement controls remain the existing Sloop layout and movement values; custom defaults currently cover integrity and capacity only.
- Templates are snapshots: applying a saved template is explicit; later template edits do not alter vessels already in play.
