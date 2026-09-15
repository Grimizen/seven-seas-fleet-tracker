# Seven Seas: GM review register

Updated 15 September 2026. This is the ongoing record of rules, interpretations and app defaults. **Player agreement is not GM approval.** For each A-number below, replace Pending with Approved / Change / Rejected and add the ruling. Keep the IDs when revising the app so decisions remain traceable.

## Rules transcribed from the supplied documents

Source: *Cannons & Ammunition.pdf*, supplied by the GM, pages 1–3. These are reference rules, not newly inferred mechanics.

| ID | Rule represented in the app | Source |
|---|---|---|
| R01 | Four gun families: Long Gun, Carronade, Howitzer and Swivel Gun. The catalogue includes all 18 poundage variants with damage, crew, range and cost. | pp. 1–2 |
| R02 | Broadside fitments are port/starboard; chase fitments are bow/stern and may target stations. Gun family and fitment are distinct concepts. | p. 1 |
| R03 | Long guns have 24-hex range; carronades 12; howitzers 12–36 (including a minimum); swivels 12. | pp. 1–2 |
| R04 | Swivels damage crew only and may load only lead shot. App reload controls enforce lead shot for swivels. | p. 2 |
| R05 | Chain shot doubles damage to masts. Grape and fire shot halve range and ship damage, and add 5× damage to crew. Effects are displayed as reference notes, not rolled automatically. | pp. 2–3 |
| R06 | Fire shot critically fails on 1 or 2; critical hits add fires by weight: d4 / 2d4 / 3d4 / 4d4. | p. 3 |
| R07 | Sloop Small / Medium / Large values: hull 10/15/20; crew minimum 2/3/5, maximum 24/36/48; maximum guns 5/7/9. | Ships.pdf |

## Assumptions awaiting GM decisions

| ID | Current interpretation or app behaviour | Why / origin | GM decision and correction |
|---|---|---|---|
| A01 | PCs do not count toward general crew minimums or capacity. | Player interpretation of the escape scenario. | Pending |
| A02 | Officer positions are separate from general crew; assigning a PC or NPC officer never changes the crew total. | Player preference; officer rules incomplete. | Pending |
| A03 | General crew are required even when all officer positions are filled by PCs. | Escape scenario interpretation. | Pending |
| A04 | Zero section HP disables its service; partial damage has no automatic penalty. | Initial section model. | Pending |
| A05 | Compartment damage does not remove inventory, consume supplies or restrict cargo access, including Larder and Hold. | Explicit provisional player preference. | Pending |
| A06 | Mast and Gun Deck each use one shared HP pool, not per physical mast/deck. | Simplification until per-instance rules exist. | Pending |
| A07 | Gun Deck destruction blocks firing and reload for every gun, including chase and swivels. Powder Dock destruction blocks reload but preserves loaded rounds. | Inferred service dependencies; particularly needs review for rail-mounted swivels. | Pending |
| A08 | Hull zero prompts a manual d12 sinking countdown; 1 means immediate sinking. Hull repairs do not automatically cancel that countdown. | Naval-combat interpretation; repair interaction unresolved. | Pending |
| A09 | Crew shortages warn but do not prevent firing. Crew assignments may not exceed total general crew, but officer staffing is not counted. | Let the table adjudicate staffing and turns. | Pending |
| A10 | A reload is completed manually after an uninterrupted turn. It consumes one stored round; firing consumes the loaded round only. | Existing combat workflow; no turn engine. | Pending |
| A11 | Maximum Sloop guns 5/7/9 means 2+2+1, 3+3+1, or 4+4+1: equal broadsides plus one chase slot. | Player proposal; the document does not give the slot split. | Pending |
| A12 | The single default Sloop chase slot is at the bow. Stern chase slots can be added, and layouts are editable independently per vessel or template. | Chosen provisional location, not stated by the GM. | Pending |
| A13 | Every gun family may occupy broadside or chase slots by default. Owners/GMs can restrict permitted families for each fitment, including swivel-only chase slots. | The PDF does not restrict chase slots to swivels. The proposed swivel-only rule is available but not imposed. | Pending |
| A14 | One gun occupies one slot, irrespective of weight; swivel guns count toward the same slot capacity. No structural weight or recoil restriction is enforced. | Necessary initial mounting model. | Pending |
| A15 | Ammunition quantities remain generic named inventory. Exact poundage/weight compatibility is not enforced; the GM must check it. Swivel lead-shot naming is recognised case-insensitively. | Existing inventory lacks ammunition calibre metadata; swivel ammunition price is missing. | Pending |
| A16 | Loadout editing is an administrative correction/equipment-setting operation. It does not buy/sell cannons, debit gold, or add/remove cannon inventory. Catalogue costs are reference only. | Economy and ownership of spare cannons are not modelled. | Pending |
| A17 | Replacing/removing a cannon returns any loaded round to ammunition stores and frees its assigned crew, leaving total crew unchanged. A newly installed/replacement gun is operational, empty and unassigned. | Conservation and predictable setup defaults. | Pending |
| A18 | Moving a cannon to an empty compatible slot preserves damage condition, loaded round and assigned crew. | Reconfiguration, not a timed combat action. | Pending |
| A19 | Shrinking a layout cannot delete occupied slots. Incompatible installed guns block new mounting restrictions. Move/remove those guns first. | Avoid silent equipment loss. | Pending |
| A20 | Changing class preserves missing HP as an absolute amount; already-destroyed sections stay destroyed. Smaller maxima may reduce damaged sections to zero. Sinking countdowns are preserved. | Avoid free repairs or silent state loss. | Pending |
| A21 | Class changes preserve crew, cargo, officers and installed guns; capacity/slot conflicts are rejected. | Existing fleet-management policy. | Pending |
| A22 | New vessels start with up to 16 crew and up to four loaded 9lb long guns in available permitted broadside slots, with 30 total lead rounds (unused loaded rounds remain in stores). | Sea Wren playtest defaults, not a general equipment entitlement. | Pending |
| A23 | Movement remains 6/9/12 hexes with turn costs 3/6/9 for every class until other vessel rules are supplied. | Only Sloop movement is established. | Pending |
| A24 | Damage rolls, target eligibility, range, critical effects, fires, repair costs, daily consumption and combat turns remain table adjudication. | Management app rather than a combat rules engine. | Pending |
| A25 | Cannon/station crew are not automatically interchangeable within a turn; officer bonuses/qualifications are not automated. | Detailed officer and staffing rules missing. | Pending |

## Original Sea Wren setup (historical, not a reset instruction)

Placeholder name Sea Wren; Large Sloop; 20 hull HP; 16 general crew; four 9lb light long guns, two port/two starboard; four lead rounds loaded plus 26 stored. Full section HP, half sails, no officer or crew assignments. Later gameplay edits must remain intact.

Large Sloop section HP: Bridge 5, Rudder 3, Mast 5, Gun Deck 8, Powder Dock 3, Anchors 3, Infirmary 3, Larder 3, Hold 5.

## Open questions for the next rules discussion

- Is damage/HP per mast or deck? What penalty applies when only one is disabled?
- Do officers contribute cannon crew or overlap roles? Must reload crew remain assigned for a whole turn?
- What repair actions/costs restore services or stop sinking?
- How do crew damage and wounded sailors change the general crew count?
- Does ammunition compatibility use weight category or exact poundage, and what does swivel ammunition cost?
- Does chain shot fired from a chase gun get extra targeting benefits? Are swivels outside Gun Deck service dependencies?
- Naval combat: confirm the missing critical-failure roll 5 and the partial-cover modifier/example.

## Product decisions (separate from tabletop rules)

- Approved signed-in participants can use gameplay controls and manage cargo. Owner/GM configure fleet, loadouts, templates and access; ownership documents are unchanged by these updates.
- The diagram is schematic, not an authoritative deck plan or firing arc. Gun tokens identify family, poundage and readiness; selection blue is distinct from damage amber.
- Vessel removal is recoverable archiving. Templates are explicit snapshots: editing/deleting one never changes vessels already in play. Built-in Sloop presets remain available.
- Group templates load after owner/GM sign-in and subscribe to updates. A stale template edit/delete is rejected rather than overwriting another user's changes.
- A full cargo transfer removes the source row; both source and destination are recorded in the log. Undo checks for conflicting changes and will not cross a loadout change.
- No automatic conversion/reset of existing fleet data is performed. Existing gun records without a type are treated as 9lb long guns. Legacy asymmetric gun placements are kept visible.
- Slot layouts are capped at 100 for this small app; larger values require revisiting the presentation and validation.
