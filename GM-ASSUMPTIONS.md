# Seven Seas: GM review register

Updated 16 September 2026. This is the ongoing record of rules, interpretations and app defaults. **Player agreement is not GM approval.** For each A-number below, replace Pending with Approved / Change / Rejected and add the ruling. Keep the IDs when revising the app so decisions remain traceable.

## Rules transcribed from the supplied documents

Sources: the GM-provided *Cannons & Ammunition.pdf*, *Cargo.pdf* and revised *Ships.pdf*, as identified below. These are reference rules, not newly inferred mechanics.

| ID | Rule represented in the app | Source |
|---|---|---|
| R01 | Four gun families: Long Gun, Carronade, Howitzer and Swivel Gun. The catalogue includes all 18 poundage variants with damage, crew, range and cost. | pp. 1–2 |
| R02 | Broadside fitments are port/starboard; chase fitments are bow/stern and may target stations. Gun family and fitment are distinct concepts. | p. 1 |
| R03 | Long guns have 24-hex range; carronades 12; howitzers 12–36 (including a minimum); swivels 12. | pp. 1–2 |
| R04 | Swivels damage crew only and may load only lead shot. App reload controls enforce lead shot for swivels. | p. 2 |
| R05 | Chain shot doubles damage to masts. Grape and fire shot halve range and ship damage, and add 5× damage to crew. Effects are displayed as reference notes, not rolled automatically. | pp. 2–3 |
| R06 | Fire shot critically fails on 1 or 2; critical hits add fires by weight: d4 / 2d4 / 3d4 / 4d4. | p. 3 |
| R07 | Sloop Small / Medium / Large values: hull 10/15/20; crew minimum 2/3/5, maximum 24/36/48; maximum guns 5/7/9. | Ships.pdf |
| R08 | Each ship has a maximum load shared between equipment and free cargo; arming the vessel reduces cargo space. Numerical Sloop capacities were subsequently supplied in R13. | GM statement relayed by the player, September 2026 |
| R09 | Cargo units combine mass and volume. Equipment carried on a character is excluded. | Cargo.pdf p. 1 |
| R10 | Swivels use 1 CU each; long guns use poundage x 1 CU; carronades x 0.75; howitzers x 1.5. | Cargo.pdf p. 1 |
| R11 | Rounds per CU: swivel 35, light 16, mid 8, heavy 4, super-heavy 2. Small arms 40, armour 20, fabrics/leather 50, lumber 10, stone/metals 5, rations 30, bulk food 100, bulk liquid 50 items per CU. | Cargo.pdf p. 1 |
| R12 | Catalogue values represent new goods sold at retail; actual party resale prices may be substantially lower. Bulk goods are priced per CU, including value ranges for treasures. Common/uncommon/rare follow the PDF row colours. | Cargo.pdf pp. 2-5 |
| R13 | Sloop cargo capacities: Small 50 CU, Medium 100 CU, Large 150 CU. Brigantine values are blank; encounter cargo amounts are not vessel capacities. | Revised Ships.pdf pp. 1-2; Cargo.pdf p. 5 |

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
| A08 | Hull zero prompts a manual d12 sinking countdown; 1 means immediate sinking. Hull repairs do not automatically cancel that countdown. Once hull HP is positive, the table can explicitly end sinking. | Naval-combat interpretation; repair interaction unresolved. | Pending |
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
| A21 | Class changes preserve crew, cargo, officers and installed guns; crew capacity/slot conflicts are rejected; excess load warns without blocking. | Existing fleet-management policy. | Pending |
| A22 | New vessels start with up to 16 crew and up to four loaded 9lb long guns in available permitted broadside slots, with 30 total lead rounds (unused loaded rounds remain in stores). | Sea Wren playtest defaults, not a general equipment entitlement. | Pending |
| A23 | Movement remains 6/9/12 hexes with turn costs 3/6/9 for every class until other vessel rules are supplied. | Only Sloop movement is established. | Pending |
| A24 | Damage rolls, target eligibility, range, critical effects, fires, repair costs, daily consumption and combat turns remain table adjudication. | Management app rather than a combat rules engine. | Pending |
| A25 | Cannon/station crew are not automatically interchangeable within a turn; officer bonuses/qualifications are not automated. | Detailed officer and staffing rules missing. | Pending |
| A26 | Record direct casualty counts, explicitly choosing unassigned sailors, section assignments or gun teams. Decrease general crew and the selected assignments together. Officers and section HP stay unchanged; no wound/crew-HP model. | Player confirmed direct casualties; targeting by section remains an assumption for GM review. | Pending |
| A27 | Original pound-based placeholder retired. Cargo-unit formulas now follow R09-R13. Old pound overrides are retained as legacy references, never numerically relabelled CU. | Superseded by Cargo.pdf and revised Ships.pdf. | Superseded |
| A28 | Load is installed guns (including damaged/destroyed guns still aboard), stored cargo/equipment and loaded rounds. Crew and hull are excluded; personal equipment follows R09. Catalogue or custom CU values are used. Legacy cargo/loaded rounds remain unknown until explicitly classified. | Minimal implementation of R08; no missing weights invented. | Pending |
| A29 | Sloop capacities follow R13 when no explicit capacity or old pound override exists. Other unknown capacities remain unset. Excess load produces a warning and does not block combat, cargo additions or class changes. No automatic speed or sinking penalty. | Overload consequences are not supplied; non-Sloop capacities remain unknown. | Pending |
| A30 | Fractional cargo units are retained, with display-only rounding to three decimals. Individual item and round counts are whole numbers; bulk cargo quantities can be fractional CU. | No rounding rule supplied. | Pending |
| A31 | Chain, grape and fire rounds use the cargo ratio for their ammunition size category, like lead cannonballs. Size/calibre compatibility is still checked at the table. | The capacity table says cannonballs, while the price table lists all shot types by size. | Pending |
| A32 | Weapon and ammunition prices are per individual gun/round. 10 sp is represented as 1 gp; swivel shot 5 sp becomes 0.5 gp. Bulk values remain per CU. | Item prices lack an explicit per-item label; currency convention retained for reference. | Pending |
| A33 | Bulk trade goods can be recorded directly in CU instead of inventing physical bundle sizes. Piece-count presets also exist; daily rations use 30 per CU and 2 gp per CU. Generic fabrics/metals etc. have no inferred item price or rarity until a specific material is selected. | Keeps unspecified physical units and variants explicit. | Pending |

## Original Sea Wren setup (historical, not a reset instruction)

Placeholder name Sea Wren; Large Sloop; 20 hull HP; 16 general crew; four 9lb light long guns, two port/two starboard; four lead rounds loaded plus 26 stored. Full section HP, half sails, no officer or crew assignments. Later gameplay edits must remain intact.

Large Sloop section HP: Bridge 5, Rudder 3, Mast 5, Gun Deck 8, Powder Dock 3, Anchors 3, Infirmary 3, Larder 3, Hold 5.

## Open questions for the next rules discussion

- Is damage/HP per mast or deck? What penalty applies when only one is disabled?
- Do officers contribute cannon crew or overlap roles? Must reload crew remain assigned for a whole turn?
- What repair actions/costs restore services or stop sinking?
- How does damage convert to casualties or wounds? Can a hit target a section’s crew, and are officers ever affected?
- What are non-Sloop capacities and overload penalties? Do loaded rounds count, are fractional units rounded, and do special shot types use the same size-category cargo ratio?
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

- Sound effects are local feedback after successful actions, with per-device mute/volume. They carry no rules implications; two damage clips are edits of the same supplied wood-break source.

- Cargo-unit migration is additive: `capacityUnits`, `cargoUnits` and `loadedCargo` are separate from historical pound fields. Classifying an entry preserves its quantity and legacy values; changing quantity basis requires explicit review. No startup writes, inventory resets or ownership changes occur.
- Cargo catalogue choices copy editable snapshots into items. Transfers and returning loaded rounds retain their cargo-unit, rarity and retail-value metadata and do not merge unlike entries. Installed guns and spare guns in cargo remain distinct; administrative loadout changes do not consume cargo stock.

- Broadside buttons group existing fire/reload actions, without granting extra actions or bypassing the uninterrupted reload turn. Port/starboard only; bow/stern chase guns remain individual. Batch reload uses one selected ammunition entry and skips incompatible/loaded/disabled guns, with no partial reload on insufficient stock. Calibre and staffing remain table checks; this convenience does not introduce new combat rulings.
