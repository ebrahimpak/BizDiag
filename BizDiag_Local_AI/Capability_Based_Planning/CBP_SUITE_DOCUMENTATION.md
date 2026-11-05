# Capability-Based Planning (CBP) Suite

## 1. Purpose and status

This document is the functional and technical guide to the Capability-Based Planning (CBP) suite distributed as part of
BizDiag Local AI. It describes the currently implemented scripts and helpers as one subsystem, including the user
workflow, model-property contract, calculations, generated views, runtime dependencies, and a plan for reproducing the
suite.

The suite operationalizes selected, repeatable parts of the capability-based planning approach discussed in:

- A. Aldea, I.E. Maria, M. Lankhorst, D. Quartel and B. Wimsatt, "Capability-Based Planning, The Link between Strategy and Enterprise Architecture," November 2016. [Online]. Available: https://publications.opengroup.org/d183.
- R. Karami, “Capability-based Planning in 7 moves!” LinkedIn, Dec. 21, 2022. [Online]. Available: https://www.linkedin.com/pulse/capability-based-planning-7-moves-reza-karami/.
- The Open Group, "Capability-Based Planning Supporting Project/Portfolio and Digital Capabilities Mapping Using the TOGAF® and ArchiMate® Standards," 16 July 2019. [Online]. Available: https://publications.opengroup.org/g193.

The 2019 and 2022 papers share a capability-centered, strategy-driven approach to enterprise transformation, in which
business capabilities provide the link between strategic objectives and coordinated organizational change. The 
seven-moves methodology operationalizes the Open Group’s four CBP stages—Map, Assess, Plan, and Control, through a 
practical sequence of identifying capabilities, assessing their maturity and strategic importance, analyzing capability 
gaps, setting improvement goals, defining actions, and designing a change portfolio. While the Open Group Guide, 
published in 2019, establishes the broader framework and connects CBP to Enterprise Architecture, TOGAF ADM, and 
ArchiMate, the seven-moves methodology provides more specific techniques for capability assessment and improvement 
planning. Both emphasize aligning change initiatives with strategy, prioritizing capability development, and 
monitoring progress through an iterative planning cycle.

On the whole, these three publications provide the method and motivation; they do not prescribe this software's property
names, code structure, score normalization, views, or implementation details. Those are explicit BizDiag design 
decisions documented below. The software validates and visualizes supplied information. It does not replace the human 
work of discovering and validating capabilities, selecting strategies, assessing evidence, setting targets, designing 
actions, or governing a change portfolio.

The current implementation is a two-stage, user-controlled workflow. It requires Archi with jArchi and an active
ArchiMate model. Local Ollama is optional and, when explicitly requested in Move 1, proposes evidence-linked
provisional Capabilities from strategic model context. It does not suggest assessment ratings.

## 2. Scope and modeling rules

### 2.1 Move 1 scope and Capability Map contents

The generated Capability Map contains existing and, when the user opts in, AI-proposed provisional ArchiMate
**Capability** elements, plus explicitly modeled Capability-to-Capability Composition or Aggregation relationships.
The profile/input worklist also displays these Capabilities, but Value Streams, Resources, and Courses of Action are
not placed in the Capability Map.

| ArchiMate element | Role in the suite |
|---|---|
| Capability | The only Capability Map node and assessment subject; receives maturity, target, action, project, and priority properties. |
| Course of Action | Separate potential-strategy input; only these elements may be marked `CBP.Role=Strategy` and receive Capability-impact properties. Not a Capability Map node. |

Value Streams, Resources, Business Functions, Business Processes, Business Services, Drivers, Goals, and Requirements
are evidence sources, not Move 1 Capability Map nodes. Optional Ollama discovery proposes provisional Capabilities
from bounded element names/types, directly composed Value Stream stage names, and capped text from structurally
identified native Canvas or ArchiMate BMC views; only proposals that pass evidence validation become separate
Capability elements.

### 2.2 Selection and discovery

The scope resolver first reads the current element selection and filters it to non-generated Capability elements. If
the selection contains at least one Capability, those selected Capabilities form the exact run scope. If it contains
none, the resolver queries the active model for all non-generated Capabilities and deduplicates them by model ID.

The map generator displays only in-scope Capability concepts and existing Composition/Aggregation relationships whose
two endpoints are both in scope. It lays out the modeled hierarchy; it does not invent parent-child links, infer
relationships from names, or add Capability concepts. If no such relationships exist in scope, it shows the
Capabilities without a hierarchy and records that condition in the map documentation; when multiple Capabilities are
in scope, it also warns that decomposition must be modeled explicitly.

Potential strategy Courses of Action are discovered model-wide, independently of the Capability selection. They
appear only in the separate Strategy Inputs worklist and are not treated as strategies unless the user sets
`CBP.Role=Strategy`.

The supplied “Capability-based Planning in 7 moves!” paper (Move #1, PDF pp. 2–3) describes extracting needed
capabilities from strategic documents and analyzing value streams to identify the capabilities needed at their
stages. Optional Move 1 discovery supports this analysis with a single compact Ollama request containing up to 10
non-generated Value Stream names, up to 15 directly composed stage names (maximum three per selected stream), up to
10 Course of Action, Resource, Goal, Outcome, or Driver names, and up to 20 existing Capability names. These labels
are truncated to 60 characters. The request also includes non-empty content items from native `canvas-model` or
`archimate-diagram-model` views. A view qualifies when at least six of the nine standard Business Model Canvas block
headings are recognized among its Canvas blocks or ArchiMate elements, or its name identifies it as a Business Model
Canvas; folder names do not affect discovery. From qualifying views, the script includes Canvas block/sticky labels and text, ArchiMate element labels and
documentation, and diagram-note text. It includes at most three content-bearing views, 12 items per view, and 24
items total; each item's text is limited to 180 characters and BMC text to 2,400 characters total. View and item
names are truncated to 60 characters. Each item is labeled with its type, name, and view name. Ollama may return up to
three provisional proposals with source references
and an exact source/stage quotation or BMC-content excerpt; the script validates grounding and duplicate names
before creating them. Proposals require architect review and do not establish completeness or correctness. No
hierarchy is inferred.

### 2.3 Human decisions and automated checks

The software automates repeatable property validation, weighted arithmetic, gap classification, managed-view
generation, and traceability links. It does not determine:

- whether the capability map is complete, correctly scoped, or appropriately granular;
- whether a Course of Action is strategically relevant;
- what a maturity or impact rating ought to be;
- which targets are feasible or appropriate;
- whether actions, projects, and priorities are sufficient; or
- how organizational dependencies, budgets, capacity, owners, and governance should be resolved.

## 3. User workflow

```text
Prepare an ArchiMate model
        |
        v
Run CBP_Move_1_Setup.ajs
        |
        +-- create/update a Capability-only map and input worklists
        +-- optionally propose provisional Capabilities from strategic model evidence via local Ollama
        +-- store model-local run state
        |
        v
Enter and review planning inputs in model Properties
        |
        v
Run CBP_Continue_Moves_2_to_7.ajs
        |
        +-- use the current Capability concepts on the managed Capability Map
        +-- validate run/model/year identity
        +-- leave missing or invalid assessment inputs unresolved
        +-- calculate assessments, landscape, goals, and actions
        +-- generate/update the analytical views
        +-- mark the run completed
        |
        v
Review outputs and save the Archi model
```

These are separate script invocations. Enter and review evidence-based inputs manually in the model's Properties tab.
Running the continuation without an `INPUTS_PENDING` run fails with a message directing the user to run Move 1 first.

### 3.1 Move 1 details

`CBP_Move_1_Setup.ajs`:

1. Requires an active model.
2. Reads the model-local CBP run record. If a prior run is still `INPUTS_PENDING`, it asks the user to explicitly abort
   that run or cancel. It does not silently replace a pending scope.
3. Reads `CBP.Increments` from the model. If absent, asks the user to enter planning years. Cancellation occurs before
   setup changes are made.
4. Validates that increments are unique consecutive four-digit years.
5. Discovers the existing Capability scope and preflights the Capability Map and two managed Move 1 worklists.
6. Optionally asks permission to send bounded strategic element names/types, directly composed Value Stream stage
   names, and bounded text from identified Business Model Canvas views to local Ollama. A view
   qualifies when at least six of the nine standard BMC block headings are recognized among its Canvas blocks or
   ArchiMate elements, or its name identifies it as a Business Model Canvas; folder names are not used to select it.
   The user selects an installed model; no
   model is contacted when discovery is declined or no source content exists.
7. Validates all returned proposals before creating provisional Capability elements, and adds them to the map scope.
   If there are no existing Capabilities and discovery is declined or yields no valid candidate, Move 1 stops.
8. Assigns `CBP.InputCode` values to in-scope Capabilities that do not already have one.
9. Adds empty entries for required maturity and per-year target/action/project/priority property names where absent.
   Archi versions that do not preserve blank custom properties are handled by showing exact keys in the views for the
   user to add manually.
10. Adds `CBP.Role` and one `CBP.Impact.<CapabilityCode>` field to potential Course of Action elements when absent.
11. Builds or updates the Capability-only Map, profile/input worklist, and strategy-input worklist; then saves a pending
    run record on the model.

The map displays only in-scope Capability elements and their existing direct Composition/Aggregation relationships.
AI-proposed candidates are marked `CBP.AI.Provisional=true`, shaded green in the map, and include source IDs,
evidence quotations, and the model's rationale in their properties/profile card. The script does not infer a hierarchy,
prefill assessment values, or assign `CBP.Role=Strategy`. Optional weight properties are not initialized by Move 1.

### 3.2 User checkpoint

The user may edit or remove Capability concepts from the managed Capability Map before continuing; that current map
membership defines the assessment scope. AI candidates are ordinary Capability model elements with review metadata.
The user edits custom properties on the underlying Capability or Course of Action shown in a worklist; view cards are
instructions, not the data store. Verify candidate names/evidence, select intended Courses of Action using
`CBP.Role=Strategy`, complete required assessment fields, review all values, and save the Archi model before running
the continuation. If a Capability is added to the map after Move 1, the continuation prepares its codes and required
fields, reports the codes, and pauses so the user can enter the new ratings and strategy-impact values first.

### 3.3 Continuation details

`CBP_Continue_Moves_2_to_7.ajs`:

1. Loads the model-input, run-state, assessment, view-generation, landscape-diagram, and improvement-table helpers.
2. Requires a valid `INPUTS_PENDING` run and verifies that the active model identity and `CBP.Increments` still match
   the Move 1 checkpoint.
3. Resolves the managed Capability Map by its recorded view identity; the Capability concepts currently displayed
   in that view define the effective scope, so a deleted/removed member is excluded.
4. Prepares input codes and required property keys for any newly added map Capability. If the scope has expanded, it
   pauses before calculation to let the user fill the new keys and rerun.
5. Restores potential Courses of Action by model ID and selects only those explicitly marked `CBP.Role=Strategy`;
   maturity and impact inputs remain user-supplied and unresolved values are reported.
6. Calculates the results and writes derived result properties to Capabilities.
7. Preflights and creates or updates the six analytical views.
8. Marks the model-local run record `COMPLETED`, records selected strategy IDs, Move 1 discovery metadata, completion time,
   and managed view IDs, and presents a completion summary.

Ollama is not invoked during continuation and never supplies maturity, strategy impact, targets, actions, project
names, weights, or priorities. Missing or invalid assessment inputs remain visibly unresolved.

## 4. Data contract: model properties

All properties are custom properties on the indicated Archi model element or model. Empty required fields are missing,
not zero. Replace `<YYYY>` with an actual year in `CBP.Increments`; replace `<Dimension>` with `People`, `Process`, or
`Technology`. Do not enter angle-bracket placeholders literally.

### 4.1 Capability properties

These are stored on each Capability in the Move 1 run scope.

| Property | Required? | Valid value / meaning |
|---|---:|---|
| `CBP.InputCode` | Assigned by Move 1 | Stable, unique short code such as `CAP-001`. New impact properties use this code. Existing valid codes are preserved. |
| `CBP.Maturity.People` | Yes | Integer `0` through `4`. |
| `CBP.Maturity.Process` | Yes | Integer `0` through `4`. |
| `CBP.Maturity.Technology` | Yes | Integer `0` through `4`. |
| `CBP.Weight.People` | No | Optional finite number greater than zero; absent means `1`. Relative multiplier for the People dimension. |
| `CBP.Weight.Process` | No | Optional finite number greater than zero; absent means `1`. Relative multiplier for the Process dimension. |
| `CBP.Weight.Technology` | No | Optional finite number greater than zero; absent means `1`. Relative multiplier for the Technology dimension. |

Weights are relative multipliers, not scores. For example, weight `2` gives a component twice the influence of weight
`1`; `0.5` gives it half the influence. Multiplying all weights within one weighted mean by the same positive factor
does not change the result. Zero, negative, and non-finite values are invalid.

The current profile worklist also displays these optional descriptive properties if supplied:

| Property | Display label |
|---|---|
| `CBP.Profile.Definition` | Definition |
| `CBP.Profile.Source` | Source |
| `CBP.Profile.BusinessUnits` | Business units |
| `CBP.Profile.Processes` | Processes |
| `CBP.Profile.Applications` | Applications |
| `CBP.Profile.Measures` | Measures |

These descriptive profile properties are not calculated or validated by the assessment engine.

### 4.2 Per-increment target properties

For each configured planning year, the following properties are stored on each in-scope Capability.

| Property pattern | Example for 2027 | Valid value / meaning |
|---|---|---|
| `CBP.TargetML.<YYYY>` | `CBP.TargetML.2027` | Required finite number from `0` through `4`. Must match the weighted mean of the three dimension targets within `0.01`. |
| `CBP.Target.People.<YYYY>` | `CBP.Target.People.2027` | Required integer from `0` through `4`. |
| `CBP.Target.Process.<YYYY>` | `CBP.Target.Process.2027` | Required integer from `0` through `4`. |
| `CBP.Target.Technology.<YYYY>` | `CBP.Target.Technology.2027` | Required integer from `0` through `4`. |

Target dimensions may not fall below the corresponding starting maturity or the preceding accepted target. The current
implementation initializes each dimension's starting value from the calculated maturity dimensions. After an
increment's target passes `target.valid`, the target dimensions become the next increment's starting point. Targets are
not inferred from maturity, strategic importance, dates, or model structure.

### 4.3 Improvement action and project properties

For a Capability and increment where a target dimension is greater than its starting dimension, enter:

| Property pattern | Example | Value |
|---|---|---|
| `CBP.Action.<Dimension>.<YYYY>` | `CBP.Action.People.2027` | Non-empty description of the improvement action. |
| `CBP.Project.<Dimension>.<YYYY>` | `CBP.Project.People.2027` | Non-empty project/package name. |
| `CBP.ProjectPriority.<Dimension>.<YYYY>` | `CBP.ProjectPriority.People.2027` | Positive integer; smaller numbers rank first. There is no upper bound in the current validation. |

The action, project, and priority are read as required for an increase. The implementation reports missing values as
errors and does not create an action record unless all three are present and valid. A target can still be a valid
Goal when action inputs are incomplete; those action details are reported as unresolved.

### 4.4 Course of Action strategy properties

These properties belong on potential Course of Action elements. A Course of Action is only counted as a strategy when
its role property is exactly the case-sensitive text `Strategy`.

| Property | Required? | Valid value / meaning |
|---|---:|---|
| `CBP.Role` | For inclusion | Exact text `Strategy` to include as a strategy; otherwise leave unset or use another value. Move 1 does not assign it. |
| `CBP.StrategyWeight` | No | Optional finite number greater than zero; absent means `1`. Relative influence in the strategic-importance weighted mean. |
| `CBP.Impact.<CapabilityCode>` | Yes for every selected strategy/Capability pair | Integer `0`, `1`, or `2`: `0` no contribution, `1` some contribution, `2` strong contribution. Example: `CBP.Impact.CAP-001`. |

The impact property's short code identifies the Capability being rated. Its value describes that Capability's
contribution to the Course of Action. The property is entered on the Course of Action, not on the Capability. If the
short-code property is empty, the calculation also checks `CBP.Impact.<fullCapabilityID>`. The Move 1 worklist
displays the short-code-to-Capability-name mapping.

### 4.5 Model-level properties

| Property | Required? | Valid value / meaning |
|---|---:|---|
| `CBP.Increments` | Yes | Comma-separated unique consecutive four-digit years, e.g. `2027,2028`. Move 1 prompts if absent. |
| `CBP.AcceptanceTolerance` | No | Finite number from `0` through `4`; absent means `0`. Used in Move 4 classification and final-target-vs-importance validation. |

### 4.6 Derived, internal, and AI properties

The scripts write additional properties; users normally do not edit these:

| Property | Stored on | Purpose |
|---|---|---|
| `CBP.Result.Maturity` | Capability | Current weighted maturity, written to two decimal places when calculable. |
| `CBP.Result.StrategicImportance` | Capability | Current normalized weighted importance, written to two decimal places when calculable. |
| `CBP.Result.Zone` | Capability | `Gap`, `Comfort`, or `Acceptance` when both assessments are calculable. |
| `CBP.Result.Gap` | Capability | Strategic importance minus maturity, written to two decimal places. |
| `CBP.Internal.ModelID` | Model | Stable CBP identity used to compare stage/model identity. |
| `CBP.Internal.RunRecord` | Model | JSON checkpoint containing scope IDs, increments, run status, and managed view IDs. |
| `CBP.GeneratedBy` | Generated model concept | Identifies concepts generated by the CBP subsystem. |
| `CBP.GeneratedKey` | Generated model concept | Stable idempotency key for generated concepts. |
| `CBP.ManagedBy` | Managed view | View ownership marker. |
| `CBP.ViewKey` | Managed view | Stable internal identity of a managed view. |
| `CBP.CandidateStatus` | Provisional Capability | `AI-PROVISIONAL` until an architect reviews the candidate. |
| `CBP.Candidate.SourceType` | Provisional Capability | Identifies local Ollama capability discovery as the source. |
| `CBP.Candidate.SourceName` | Provisional Capability | Names of the cited source model elements. |
| `CBP.Candidate.Rationale` | Provisional Capability | Discovery model's rationale, retained for review. |
| `CBP.Candidate.Evidence` | Provisional Capability | Verbatim quotation grounded in the cited model context. |
| `CBP.Candidate.SourceElementIDs` | Provisional Capability | Comma-separated source element IDs used to trace the proposal. |
| `CBP.AI.Provisional` | Provisional Capability | Set to `true` for discovery-generated Capability candidates. |
| `CBP.AI.DiscoveryKey` | Provisional Capability | Stable name-based key that prevents repeat discovery from duplicating the candidate. |
| `CBP.AI.DiscoveryModel` | Provisional Capability | Selected Ollama model tag recorded for provenance. |

Generated Goals also carry `CBP.SourceCapabilityID` and `CBP.Increment`. Generated project/action Work Packages carry
increment, dimension, start and target levels, project name, priority, and source Capability ID as applicable.

## 5. Calculation rules by move

### Move 1 — Identify and frame the capability map

Move 1 performs Capability-only scope discovery, optional evidence-grounded proposal generation, hierarchy
visualization from existing Composition/Aggregation relationships, Capability code allocation, property preparation,
and checkpoint creation. It is not a quantitative assessment. AI proposals become reviewable Capability elements;
hierarchy is never inferred. Courses of Action remain potential strategy inputs in a separate worklist.

### Move 2 — Assess maturity

For one Capability, let `P`, `Pr`, and `T` be People, Process, and Technology maturity values, and let `wP`, `wPr`,
and `wT` be their positive weights (defaulting to `1`). Each rating must be an integer in `[0,4]`.

```text
Maturity = (P*wP + Pr*wPr + T*wT) / (wP + wPr + wT)
```

The result is a decimal in `[0,4]`. The score is unavailable unless all three ratings and all provided weights are
valid. `CBP.Result.Maturity` stores two decimal places; the heatmap shows the exact two-decimal result and uses the
nearest integer band for color/placement.

### Move 3 — Assess strategic importance

Move 3 estimates how strongly a capability supports the selected sttrategies, the expresses that estimate on the same
0-4 scale used for maturity.

- Iᵢ is the impact rating for one Capability against strategy i: 0 = no contribution, 1 = moderate contribution, 2 = strong contribution.

- sᵢ is that strategy’s relative weight. If it is not set, the script uses 1, so all strategies count equally by default.

The script computes a weighted average of the impact ratings, then multiplies by 2 to convert the original 0–2 scale to 0–4.
For one Capability and each Course of Action marked as a strategy, let `Iᵢ` be that strategy's integer impact in
`[0,2]`, and `sᵢ` its positive `CBP.StrategyWeight` (default `1`).

```text
StrategicImportance = 2 * Σ(Iᵢ*sᵢ) / Σ(sᵢ)
```

Multiplication by two maps the 0–2 impact scale to the 0–4 importance scale. The score is unavailable when no Course
of Action is marked as a strategy, or when any selected strategy's impact for that Capability is missing or invalid.
The engine does not omit incomplete strategies from the weighted mean. The result is stored in
`CBP.Result.StrategicImportance` with two decimal places.

For example, suppose a Capability has impact 2 for Strategy A (weight 1) and impact 1 for Strategy B (weight 2):

```text
StrategicImportance = 2 × ((2×1 + 1×2) / (1+2)) = 2 × (4/3) ≈ 2.67
```
So the Capability’s strategic importance is 2.67 out of 4. A higher strategy weight gives that strategy more influence; 
it does not change the impact rating itself. If any selected strategy is missing a valid impact rating for the 
Capability, its importance score is unresolved rather than calculated from only the strategies that have values.

### Move 4 — Analyze the maturity/importance landscape

When both current assessments exist:

```text
Gap = StrategicImportance - Maturity
```

Classification uses the model's acceptance tolerance `t`:

| Condition | Zone |
|---|---|
| `Gap > t` | `Gap` |
| `Gap < -t` | `Comfort` |
| Otherwise | `Acceptance` |

The exact result is written to `CBP.Result.Gap` and `CBP.Result.Zone`. The matrix rounds maturity and importance to
integer coordinates for display only; classification uses the unrounded difference. Multiple Capabilities in one cell
are vertically offset to remain visible.

### Move 5 — Set and validate improvement goals

For each configured increment and Capability, the engine validates:

- overall target `CBP.TargetML.<YYYY>` is a number in `[0,4]`;
- each dimension target is an integer in `[0,4]`;
- the weighted dimension-target mean matches the overall target to a tolerance of `0.01`;
- no dimension target is below its starting maturity or the preceding accepted target; and
- the final configured overall target is not below strategic importance by more than `CBP.AcceptanceTolerance`.

Only targets whose `target.valid` flag remains true are materialized as Goals. A Goal is created for each accepted
Capability/increment pair, contains target maturity and dimension detail, and is linked to its Capability by an
influence relationship when that Capability is displayed in the matrix.

### Move 6 — Define dimension-level actions

For each dimension increase over its starting value, the engine reads the action description, project/package name,
and positive-integer project priority. It returns an action record only when all three are present and valid. Actions
become Work Package concepts with dimension transition, increment, project, priority, and source Capability
properties. The script does not generate action prose or infer a project.

As noted in Section 4.3, the current engine appends missing action/project/priority messages to errors but does not
invalidate the Goal solely for those missing fields. It omits the incomplete action from the action record list.

### Move 7 — Design the change portfolio

The view generator groups validated actions by `(increment, project name)`. All actions in the same project/year group
must have the same priority. If priorities conflict, it displays a conflict card and omits that project's actions from
the rendered portfolio. Otherwise, projects sort by increment and then ascending priority (lower number first).
Generated project Work Packages contain generated action Work Packages; action packages link to the source Capability.

## 6. Generated Archi views

Names are exact and are used for ownership checks.

| Move(s) | View name | Contents and purpose |
|---|---|---|
| 1 | `CBP - Capability Map` | Only in-scope Capability elements and their existing direct Composition/Aggregation relationships to other in-scope Capabilities. |
| 1 | `CBP - Capability Profiles and Inputs` | Capability profile-property display, input checklist, and exact maturity and per-increment property names. |
| 1 | `CBP - Strategy Inputs` | Potential Course of Action concepts, current role, adjacent modeled context, and one impact-key mapping per in-scope Capability. |
| 2 | `CBP - Maturity and Strategic Importance - Maturity Heatmap` | Five maturity bands, Capability cards with exact score, and unresolved maturity/weight messages. |
| 3 | `CBP - Maturity and Strategic Importance - Strategic Importance Heatmap` | Five importance bands, Capability cards with exact score, and unresolved strategy/impact messages. |
| 4–5 | `CBP - ML-SI Matrix and Improvement Goals` | Readable 0–4 maturity and strategic-importance axis labels, integer-coordinate matrix, zone colors, unresolved-input cards, and validated Goals. |
| 4–7 | `CBP - Strategic Importance and Maturity Diagrams` | Three chart forms inspired by the paper's pp. 9, 10, and 12 figures: score landscape, three-zone matrix, and validated increment paths. |
| 6–7 | `CBP - Actions and Change Portfolio` | Validated dimension-level Work Packages grouped into projects, project priority, conflict warnings, and unresolved planning input messages. |
| 5–7 | `CBP - Improvement Roadmap Tables` | Tables for every in-scope Capability's roadmap, validated dimension increments, and validated actions with project priority and portfolio status. |
| Overview | `Capability-based Planning View` | Navigational summary of the work/analysis views plus run and unresolved-input counts. |

Heatmap colors are generated from low to high maturity (red through green) and low to high strategic importance
(green through red). In the ML-SI matrix, `Gap` is red, `Comfort` green, and `Acceptance` yellow.
In the portfolio view, action Work Packages are colored by People, Process, or Technology; Capability diagram objects
use the same Gap/Comfort/Acceptance colors as the matrix, with a legend at the top of the view.
The Strategic Importance and Maturity Diagrams view contains three panels modeled on the paper's figures: (1) a
neutral 0–4 maturity/importance grid with a diagonal alignment reference, (2) a Gap Zone / Acceptance Band /
Comfort Zone landscape, and (3) maturity targets by configured increment at each Capability's current strategic
importance. All panels use the current managed Capability Map scope and the already-calculated assessment results. The first two
panels show assessed Capabilities at rounded grid coordinates while labeling their exact scores; the zone panel
displays the exact calculated zone. The roadmap panel plots only accepted Goals and connects consecutive validated
increments; it does not interpolate across an unvalidated increment. Capabilities without both current scores and
increments without an accepted Goal are explicitly labeled as unavailable or not validated rather than inferred.
The colored zone cells are a visual guide; the assessment engine's exact gap and configured tolerance remain
authoritative for each Capability's zone.
The Improvement Roadmap Tables view uses the same assessment results, accepted Goals, validated action records, and
project-priority conflict groups as the analytical views. It includes every Capability in the effective map scope;
unvalidated per-increment targets are labeled rather than inferred. Actions in priority-conflicted projects remain
visible in the action table with an explicit excluded-from-portfolio status.

### 6.1 Managed-view safety and generated concepts

Before creating or rebuilding a view, the generator checks the model's view collection (with a fallback query for
diagram views). An existing view with a managed name is reusable only when its `CBP.ManagedBy` and `CBP.ViewKey`
properties match the expected CBP identities. Duplicate names, changed identities, or user-owned name collisions stop
generation instead of overwriting unrelated views. A view named `CBP - Capability Map and Profiles` can be reused
for `CBP - Capability Profiles and Inputs` only when its ownership identity matches; otherwise generation stops.

Generated cards are Business Object concepts. Generated Goals and Work Packages use stable `CBP.GeneratedKey` values
so repeat runs can update owned concepts rather than duplicate them. Relationships are reused by type and endpoint
identity; ambiguous duplicates are errors. Each generated relationship displayed in a view is added with its
relationship and both diagram endpoints, as required by jArchi's `view.add` contract.

## 7. Software architecture and file responsibilities

The suite's ArchiMate planning module is under `BizDiag_Local_AI/Capability_Based_Planning/`. The independent
`lib/CBP_Strategic_Importance_Maturity_Diagrams.js` module renders the three landscape/roadmap chart forms; the
continuation script loads it after the managed-view helpers and supplies the same processed results. Its optional
Ollama transport worker is in the module's `lib/` directory.

| File | Responsibility |
|---|---|
| `CBP_Move_1_Setup.ajs` | First-stage entry point; preflight, year validation, scope preparation, property creation, Move 1 views, and pending run checkpoint. |
| `CBP_Continue_Moves_2_to_7.ajs` | Second-stage entry point; checkpoint verification, edited-map scope, calculations, output-view generation, completion record, and UI summary. |
| `lib/CBP_Model_Inputs.js` | Property access, numeric/range parsing, increment parsing, weighted mean, maturity calculation, importance calculation, and impact-key generation. This helper is independent of Archi queries except for the model object's property API. |
| `lib/CBP_Run_State.js` | Archi/jArchi adapters, supported element types, selected-scope discovery, managed-map scope, stable Capability input codes, model identity, and model-local run-record persistence. |
| `lib/CBP_Capability_Discovery.js` | Bounded strategic-label and identified BMC content extraction, grounded Ollama proposal validation, deduplication, and creation of traceable provisional Capability elements. |
| `lib/CBP_Assessment_Engine.js` | Pure assessment orchestration across Moves 2–7: result records, gap/zone, target consistency/progression, Goals, and validated action records. |
| `lib/CBP_View_Generator.js` | View enumeration/preflight, ownership markers, idempotent concepts and relationships, Move 1 worklists, heatmaps, matrix, portfolio, and overview. |
| `lib/CBP_Strategic_Importance_Maturity_Diagrams.js` | Separate managed-view renderer for the paper-inspired score, zone, and increment-roadmap panels; consumes assessment results without recalculation. |
| `lib/CBP_Improvement_Tables.js` | Separate managed-view renderer for the roadmap, dimension-increment, and required-action tables; consumes assessment results, validated Goals/actions, and shared project-grouping helpers. |
| `lib/CBP_Ollama_Worker.js` | Optional local Ollama HTTP transport, model discovery, asynchronous request wait with SWT event dispatch, timeout/error handling, and response transport validation. |

The helper modules expose APIs on `globalThis`:

- `cbpModelInputs`
- `cbpRunState`
- `cbpAssessmentEngine`
- `cbpViewGenerator`
- `cbpCapabilityDiscovery`
- `cbpStrategicLandscapeDiagrams`
- `cbpImprovementTables`
- optional `cbpOllamaWorker`

The entry scripts load CBP helpers in dependency order. Move 1 loads the Ollama worker only after the user opts in and
selects a local model. The suite does not require an npm package to run inside Archi.

## 8. Optional local Ollama Capability discovery

### 8.1 Activation, sources, and candidate grounding

Discovery is opt-in in Move 1. The user chooses an installed local Ollama model after confirming the proposed
analysis. The compact evidence set contains up to 10 non-generated Value Stream names, up to 15 directly composed
Value Stream stage names (maximum three per stream), and up to 10 Course of Action, Resource, Goal, Outcome, or Driver
names. Up to 20 existing Capability names are included only to help avoid duplicates. These labels are truncated to
60 characters. The request also includes non-empty text from native `canvas-model` and `archimate-diagram-model`
views. A view qualifies when at least six of the nine standard BMC block headings are recognized among its Canvas
blocks or ArchiMate elements, or its name identifies it as a Business Model Canvas; folder names are not used to
select it. At most three qualifying
content-bearing views, 12 items per view, and 24 items total are included; each item's text is truncated to 180
characters and total BMC text to 2,400 characters. View and item names are truncated to 60 characters and accompany
each item with its type label. Text comes from Canvas block/sticky labels and `documentation`, ArchiMate element labels and
`documentation`, and `text` on diagram notes inside qualifying views. It does not infer context that is absent from
those names, modelled Value Stream stages, or included BMC text.

All selected model evidence is sent in one Ollama request, rather than one request per batch. The prompt asks for at
most three enduring organizational abilities (not activities, processes, projects, systems, or teams) and requires
compact JSON with a source reference and a grounded source/stage name or Canvas-content excerpt. The script validates
those references, quote/name match, field sizes, and duplicate names before creating candidates. Ollama generation is
capped at 512 tokens with a 2,048 token context window and a ten-minute request timeout. If the response fails, no
proposed Capability elements are created.

Creation writes the definition as Capability documentation and
stores `CBP.CandidateStatus=AI-PROVISIONAL`, `CBP.AI.Provisional=true`, source type/name/IDs, rationale, evidence,
discovery key, and Ollama model tag. These are review markers, not model-owned/generated concepts. The Capability Map
shades provisional candidates green. No hierarchy is inferred.

### 8.2 Human checkpoint and assessment boundary

Review the candidates' names, definition, rationale, cited model-element IDs, and evidence before running the
continuation. Edit or remove them from the model/map as appropriate. All maturity ratings, strategic impact,
weights, targets, actions, projects, and priorities are human-entered; the continuation does not invoke Ollama.
To record an accepted candidate as reviewed and remove its green map highlight, set
`CBP.CandidateStatus=HUMAN-REVIEWED` and `CBP.AI.Provisional=false`; its source IDs, evidence, and rationale remain
available as provenance.
If an assessment property has a matching `CBP.AI.Rationale.<PropertyKey>` marker, the continuation pauses before
using that value. Review or replace the value, remove the marker property, save, and rerun.
When the user adds a Capability to the map after Move 1, the continuation assigns its input code and required blank
properties, updates the pending scope, then pauses and reports the new codes so assessment and strategy-impact values
can be entered before rerunning.

### 8.3 Transport behavior and privacy

The worker calls only the local Ollama endpoint at `http://localhost:11434`. Model discovery has a seven-second
timeout; ordinary generation requests have a 120-second timeout, while Move 1 discovery allows up to 600 seconds
for its single compact request, plus the five-second scheduling allowance. HTTP requests use Java's asynchronous
HTTP client. While waiting, the worker dispatches Archi SWT events and logs a heartbeat every 20 seconds. The future
is cancelled if the SWT display becomes unavailable/disposed or the request times out.

“Local” describes the configured endpoint, not a guarantee about the user's entire system. Model data are supplied by
the user-installed Ollama runtime and model. The prompt includes bounded strategic element names/types, Value Stream
stage names, existing Capability names, and bounded text from identified Business Model Canvas views.
Included text is limited to Canvas block/sticky labels and text, ArchiMate element labels/documentation, and diagram notes
inside qualifying views; BMC view names or their contents identify candidate views, regardless of folder name.
Users should still review their local
Ollama/model configuration.

## 9. Run-state schema and lifecycle

The model stores internal properties `CBP.Internal.ModelID` and `CBP.Internal.RunRecord`. The JSON record currently
uses schema version `1` and includes:

| Field | Meaning |
|---|---|
| `schema` | Run-record schema version (`1`). |
| `runId` | Unique run label generated for the setup. |
| `model` | Stable model ID and readable name. |
| `capabilityIds` | Current Capability IDs on the managed Capability Map; updated to match the effective scope. |
| `capabilityCodes` | Capability ID/code pairs preserved for the current scope. |
| `potentialStrategyIds` | Model-wide Course of Action IDs shown in Strategy Inputs. |
| `strategyIds` | Potential strategies currently marked `CBP.Role=Strategy` at setup; the continuation refreshes this list when it completes. |
| `increments` | Validated ordered year strings. |
| `status` | Lifecycle state, normally `INPUTS_PENDING`, then `COMPLETED`; explicit replacement can set `ABORTED`. |
| `createdAt`, `completedAt`, `abortedAt` | ISO timestamp fields when applicable. |
| `aiDiscovery` | Optional Move 1 model tag, source count, proposal/rejection counts, and created candidate IDs. |
| `views` | Managed view IDs recorded for reuse and identity checks. |

Move 1 refuses unsupported existing status values. A pending run requires explicit user abort before a new setup.
Continuation refuses absent, corrupt, unsupported, completed, aborted, or model/year-mismatched run state.

## 10. Reproduction plan

This section describes how to recreate the suite from first principles without relying on the current source files.

### 10.1 Establish requirements and method boundaries

1. Read the capability-based planning sources and identify which decisions are intended to be made by an architect.
2. Separate repeatable arithmetic and validation from judgments that require organizational evidence.
3. Keep the Capability Map semantically pure: Capability nodes and explicitly modeled Capability hierarchy only.
4. Permit opt-in, evidence-grounded AI proposals from strategic model context, but keep proposals provisional and
   subject to architect review; never treat source elements themselves as Capabilities.
5. Make strategy selection explicit and prevent the software from treating every Course of Action as a strategy.
6. Record any new interpretation or behavior change as a design decision rather than attributing it to a paper without
   evidence.

### 10.2 Define the two-stage workflow and persistent contract

1. Implement a setup entry point that validates model/increments, discovers Capabilities, assigns stable short codes,
   creates the Capability Map and editable worklists, and writes a pending model-local checkpoint.
2. Keep the two stages in distinct script invocations so the user can edit/save the model between them.
3. Persist exact model IDs and planning years so continuation does not silently recalculate a different scope.
4. Include lifecycle statuses, ownership markers, and explicit abort behavior for an uncompleted run.
5. Define each property name, owning concept, data type, permitted range, default, and validation message before
   writing the view generators.

### 10.3 Implement shared calculation modules

1. Build pure parsers for integers, bounded numbers, positive weights, priorities, and consecutive year lists.
2. Implement weighted maturity and strategy-impact normalization as separate testable functions.
3. Implement assessment orchestration for gap classification, target progression and consistency, goals, and
   actions.
4. Return explicit structured errors for incomplete inputs; never substitute a plausible-looking assessment for
   missing evidence.
5. Keep the Archi adapter and visual rendering separate from pure calculations.

### 10.4 Implement Archi integration and managed views

1. Use jArchi queries and selection adapters to discover only supported types and deduplicate by model ID.
2. Make Move 1 display the Capability-only hierarchy map, Capability fields, and short-code impact mappings in
   separate editable worklists.
3. Preflight view names, ownership metadata, and stable IDs before rebuilding views.
4. Generate the maturity and importance heatmaps, matrix/goals view, portfolio, and overview from assessment result
   records.
5. Give generated concepts stable keys, preserve links to source Capabilities, and detect user-owned name collisions.
6. Use the supported `view.add` signature with relationship and both endpoint diagram objects when adding a
   relationship to a view.
7. Test behavior in the supported Archi/jArchi runtime, including save/reopen, blank custom-property behavior, view
   enumeration, and repeat-run idempotency.

### 10.5 Keep optional AI limited to reviewed Move 1 discovery

1. Request strategic-context analysis only in Move 1, only after opt-in and explicit model selection.
2. Send bounded names/types, directly composed Value Stream stage names, and capped content from Business Model
   Canvas views identified by their name or block headings.
3. Require structured candidates with source refs and exact quoted source/stage labels or BMC-content excerpts;
   validate grounding and duplicates before creating any model elements.
4. Mark accepted candidates provisional and preserve traceable source IDs, evidence, rationale, and model tag.
5. Leave all assessments and planning inputs to the user. Never ask the model to choose maturity, importance,
   targets, actions, projects, weights, priorities, or strategy selections.
6. Make endpoint, model selection, timeouts, failure behavior, and data sent visible to users.

### 10.6 Acceptance criteria for a reproduction

- The Capability Map contains in-scope Capability elements and existing Composition/Aggregation relationships
  between them; optional AI candidates are provisional and evidence-linked.
- Value Streams, Resources, and Courses of Action remain evidence sources rather than Capability Map nodes.
- If no Capability exists, opt-in discovery can propose candidates; without a valid reviewed proposal Move 1 stops.
- Move 1 creates the Capability Map and two input worklists, and the continuation honors current map membership.
- A user can edit properties and save/reopen between Move 1 and continuation.
- The continuation rejects model and increment mismatches, excludes removed map members, and pauses to prepare inputs
  for newly added members.
- Maturity requires three valid integer dimension ratings and returns the documented weighted mean.
- Strategic importance requires complete 0–2 impacts for every selected Course of Action and uses the documented
  normalization.
- Matrix classification uses unrounded values and the configured tolerance.
- Targets are range-checked, weighted-mean checked, and progression checked; no target is invented.
- Actions require explicit action text, project name, and positive integer priority before an action Work Package is
  generated.
- Portfolio grouping exposes inconsistent priorities rather than hiding or arbitrarily choosing one.
- Managed views/concepts are idempotent and do not overwrite user-owned content.
- AI is optional and confined to Move 1 capability discovery. Proposals require grounded source evidence and remain
  provisional; all assessments and planning inputs remain human-entered.
- All seven move calculations and rendered views are tested in the supported Archi/jArchi application as well as
  with isolated helper tests.

## 11. Known constraints and implementation observations

- Move 1's initial Capability scope is determined by current selection when it contains Capabilities; otherwise it is
  model-wide. Potential strategy Courses of Action are discovered model-wide regardless of selected scope. The
  continuation uses current Capability membership in the identity-checked managed map.
- Capability additions after Move 1 are prepared and cause the continuation to pause for manual ratings and impact
  inputs; removed map members are excluded from the effective scope.
- The suite requires a nonempty `CBP.Increments` property with consecutive years. It does not default to the current
  year.
- Move 1 requests all per-year action/project/priority keys on Capabilities, even though the engine only reads them
  when the corresponding dimension target increases.
- The current Move 1 worklists create blank `CBP.Role` and impact properties, but do not initialize optional strategy
  weights. Optional maturity weights default in calculation without being created.
- The current assessment engine's action-input errors do not alone invalidate the corresponding target record; this
  can permit a Goal to be generated while its action is incomplete. See Section 4.3.
- Optional Ollama use is limited to provisional Capability discovery in Move 1; assessment and planning inputs remain
  user-entered.
- The `lib/` directory contains the capability-discovery, Ollama transport, model-input, run-state, assessment,
  view-generation, strategic-landscape diagram, and improvement-table helpers.
- There is no CBP `tests/` directory; isolated helper checks and in-application behavior should be validated when
  changing the suite.
- Archi/jArchi runtime behavior, model save/reopen semantics, and rendering should be verified in the target application;
  syntax checks alone do not prove GUI/runtime compatibility.

## 12. Sources and traceability

The workflow's seven-move structure is inspired by the cited capability-based planning publications. The software
mapping is:

| Planning concern | Implemented subsystem behavior |
|---|---|
| Identify/model capabilities | Capability-only map from existing Capability elements and modeled hierarchy, with optional Ollama candidate proposals for architect review. |
| Assess maturity | Weighted People/Process/Technology score. |
| Assess strategic importance | Explicit Course of Action role and Capability-impact ratings, strategy-weighted and normalized. |
| Analyze the landscape | Strategic-importance-minus-maturity gap, tolerance-based zone, ML-SI matrix. |
| Set goals | Explicit per-year overall and dimension targets, consistency and progression checks. |
| Define actions | Explicit improvement descriptions, project names, and priorities as traceable Work Packages. |
| Design portfolio | Increment/project grouping and priority ordering with conflict reporting. |

This mapping is an implementation interpretation, not a claim that the publications specify the exact property schema,
mathematical normalization, ArchiMate relationship types, or generated-view design used by BizDiag.
