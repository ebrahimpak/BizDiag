# Capability-Based Planning (CBP) Suite

## 1. Purpose and status

This document is the functional and technical guide to the Capability-Based Planning (CBP) suite distributed as part of
BizDiag Local AI. It describes the currently implemented scripts and helpers as one subsystem, including the user
workflow, model-property contract, calculations, generated views, runtime dependencies, and a plan for reproducing the
suite.

The suite operationalizes selected, repeatable parts of the capability-based planning approach discussed in:

- A. Aldea, I. E. Maria, M. Lankhorst, D. Quartel, and B. Wimsatt, “Capability-Based Planning, The Link between
  Strategy and Enterprise Architecture,” The Open Group, November 2016.
- Reza Karami, “Capability-based Planning in 7 moves!,” December 2022.

These publications provide the method and motivation; they do not prescribe this software's property names, code
structure, score normalization, views, or implementation details. Those are explicit BizDiag design decisions
documented below. The software validates and visualizes supplied information. It does not replace the human work of
discovering and validating capabilities, selecting strategies, assessing evidence, setting targets, designing actions,
or governing a change portfolio.

The current implementation is a two-stage, user-controlled workflow. It requires Archi with jArchi and an active
ArchiMate model. Local Ollama is optional and is used only when the user requests suggestions for eligible missing
assessment inputs.

## 2. Scope and modeling rules

### 2.1 Supported Move 1 element types

Move 1 accepts only these ArchiMate element types:

| ArchiMate element | Role in the suite |
|---|---|
| Capability | Assessment subject; receives maturity, target, action, project, and priority properties. |
| Value Stream | Capability-map context shown in the Move 1 profile worklist. |
| Course of Action | Potential strategy; only these elements may be marked `CBP.Role=Strategy` and receive Capability-impact properties. |
| Resource | Capability-map context shown in the Move 1 profile worklist. |

Business Functions, Business Processes, Business Services, Drivers, Goals, and Requirements are not in the Move 1
discovery scope. In particular, the suite does not infer or generate Capability candidates from business-layer
elements. At least one existing Capability must be in the discovered Move 1 scope. Goals may be generated later as
outputs of the planning workflow; their existence does not make existing Goal elements Move 1 strategy inputs.

### 2.2 Selection and discovery

The scope resolver first reads the current element selection and filters it to the four supported types, excluding
CBP-generated concepts. If the selection contains at least one supported element, those supported selected elements
form the scope. If it contains none, the resolver queries the active model for all four supported types and deduplicates
them by model ID.

Capability assessment subjects and context are kept separate:

- Capabilities in scope are assessed.
- Value Streams and Resources in scope are displayed as context; they do not receive CBP assessment inputs.
- Potential strategy Courses of Action are discovered model-wide, independently of the user's selection. They are
  displayed in the Strategy Inputs worklist but are not treated as strategies unless the user sets
  `CBP.Role=Strategy`.

The current Move 1 view generator displays Value Streams and Resources as context rows. It does not infer
Capability-to-Value-Stream or Capability-to-Resource semantics from relationships. The strategy worklist displays
up to eight modeled relationship-neighbor labels for each Course of Action as context only.

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
        +-- validate/select consecutive planning years
        +-- discover supported model elements and require a Capability
        +-- assign stable short codes to in-scope Capabilities
        +-- prepare blank required input properties when possible
        +-- create/update the two Move 1 input worklists
        +-- store model-local run state
        |
        v
Review the two input views, edit underlying model-element Properties, and save
        |
        v
Run CBP_Continue_Moves_2_to_7.ajs
        |
        +-- restore the exact Move 1 Capability and Course of Action IDs
        +-- validate run/model/year identity
        +-- optionally request local Ollama suggestions for missing ratings
        +-- calculate assessments, landscape, goals, and actions
        +-- generate/update the analytical views
        +-- mark the run completed
        |
        v
Review outputs and save the Archi model
```

These are separate script invocations. The pause between them is intentional: it lets the architect inspect the
capability-map worklists and edit properties on actual model elements. Running the continuation without an
`INPUTS_PENDING` run fails with a message directing the user to run Move 1 first.

### 3.1 Move 1 details

`CBP_Move_1_Setup.ajs`:

1. Requires an active model.
2. Reads the model-local CBP run record. If a prior run is still `INPUTS_PENDING`, it asks the user to explicitly abort
   that run or cancel. It does not silently replace a pending scope.
3. Reads `CBP.Increments` from the model. If absent, asks the user to enter planning years. Cancellation occurs before
   setup changes are made.
4. Validates that increments are unique consecutive four-digit years.
5. Discovers the supported scope and stops if there is no Capability.
6. Preflights the two managed Move 1 views before rebuilding them.
7. Assigns `CBP.InputCode` values to in-scope Capabilities that do not already have one.
8. Adds empty entries for required maturity and per-year target/action/project/priority property names where absent.
   Archi versions that do not preserve blank custom properties are handled by showing exact keys in the views for the
   user to add manually.
9. Adds `CBP.Role` and one `CBP.Impact.<CapabilityCode>` field to potential Course of Action elements when absent.
10. Builds or updates the two input worklists and saves a pending run record on the model.

The script does not prefill assessment values, assign `CBP.Role=Strategy`, or create generated capability candidates.
Optional weight properties are not initialized by Move 1.

### 3.2 User checkpoint

The user edits custom properties on the underlying Capability or Course of Action shown in a worklist; view cards are
instructions, not the data store. The user should verify candidate names and model evidence, select intended Courses
of Action using `CBP.Role=Strategy`, complete required assessment fields, review all values, and save the Archi model
before running the continuation.

### 3.3 Continuation details

`CBP_Continue_Moves_2_to_7.ajs`:

1. Loads the model-input, run-state, assessment, and view-generation helpers.
2. Requires a valid `INPUTS_PENDING` run and verifies that the active model identity and `CBP.Increments` still match
   the Move 1 checkpoint.
3. Restores Capabilities and potential Courses of Action by model ID. If an ID no longer resolves within the supported
   element types, it stops rather than silently changing the run scope.
4. Selects Courses of Action explicitly marked `CBP.Role=Strategy`, validates their weights, and identifies missing or
   invalid maturity and impact properties.
5. If there are eligible missing/invalid maturity or impact inputs, asks whether to use local Ollama. A decline or
   cancelled model selection leaves those inputs unresolved. If there are no eligible gaps, Ollama is not loaded.
6. Calculates the results and writes derived result properties to Capabilities.
7. Preflights and creates or updates the five analytical views.
8. Marks the model-local run record `COMPLETED`, records selected strategy IDs, AI suggestion count, completion time,
   and managed view IDs, and presents a completion summary.

Ollama does not supply targets, actions, project names, weights, or priorities. The continuation continues to
calculation and view generation when AI assistance is declined or fails, with missing inputs visible as unresolved.

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
errors and does not create an action record unless all three are present and valid. Notably, the current calculation
does not set `target.valid=false` solely because one of these action inputs is missing; a target can therefore still
appear as a valid Goal while its action details are reported as unresolved. Reproduction work should preserve this
distinction only if it is intentional; otherwise treat making the goal/action dependency explicit as a separately
reviewed behavior change.

### 4.4 Course of Action strategy properties

These properties belong on potential Course of Action elements. A Course of Action is only counted as a strategy when
its role property is exactly the case-sensitive text `Strategy`.

| Property | Required? | Valid value / meaning |
|---|---:|---|
| `CBP.Role` | For inclusion | Exact text `Strategy` to include as a strategy; otherwise leave unset or use another value. Move 1 does not assign it. |
| `CBP.StrategyWeight` | No | Optional finite number greater than zero; absent means `1`. Relative influence in the strategic-importance weighted mean. |
| `CBP.Impact.<CapabilityCode>` | Yes for every selected strategy/Capability pair | Integer `0`, `1`, or `2`: `0` no contribution, `1` some contribution, `2` strong contribution. Example: `CBP.Impact.CAP-001`. |

The impact property's short code identifies the Capability being rated. Its value describes that Capability's
contribution to the Course of Action. The property is entered on the Course of Action, not on the Capability. Legacy
properties named `CBP.Impact.<fullCapabilityID>` remain a calculation fallback when the new short-code property is
empty. The Move 1 worklist displays the short-code-to-Capability-name mapping.

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
| `CBP.AI.Rationale.<PropertyKey>` | Element receiving a suggestion | Truncated rationale supplied with an accepted suggestion. |
| `CBP.AI.Provisional` | Element receiving a suggestion | Set to `true` when the continuation applies one or more AI suggestions to that element. |

Generated Goals also carry `CBP.SourceCapabilityID` and `CBP.Increment`. Generated project/action Work Packages carry
increment, dimension, start and target levels, project name, priority, and source Capability ID as applicable.

## 5. Calculation rules by move

### Move 1 — Identify and frame the capability map

Move 1 performs scope discovery, Capability code allocation, property preparation, and checkpoint creation. It is not
a quantitative assessment. It requires at least one existing Capability. Value Streams and Resources are displayed as
context; Courses of Action are potential strategy inputs. No business-layer element is converted into a Capability.

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

For one Capability and each Course of Action marked as a strategy, let `I_i` be that strategy's integer impact in
`[0,2]`, and `s_i` its positive `CBP.StrategyWeight` (default `1`).

```text
StrategicImportance = 2 * sum(I_i*s_i) / sum(s_i)
```

Multiplication by two maps the 0–2 impact scale to the 0–4 importance scale. The score is unavailable when no Course
of Action is marked as a strategy, or when any selected strategy's impact for that Capability is missing or invalid.
The engine does not omit incomplete strategies from the weighted mean. The result is stored in
`CBP.Result.StrategicImportance` with two decimal places.

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
| 1 | `CBP - Capability Map and Profiles` | Capability input checklist; Value Stream and Resource context; profile-property display; exact maturity and per-increment property names. |
| 1 | `CBP - Strategy Inputs` | Potential Course of Action concepts, current role, adjacent modeled context, and one impact-key mapping per in-scope Capability. |
| 2 | `CBP - Maturity and Strategic Importance - Maturity Heatmap` | Five maturity bands, Capability cards with exact score, and unresolved maturity/weight messages. |
| 3 | `CBP - Maturity and Strategic Importance - Strategic Importance Heatmap` | Five importance bands, Capability cards with exact score, and unresolved strategy/impact messages. |
| 4–5 | `CBP - ML-SI Matrix and Improvement Goals` | Integer-coordinate Maturity-Level/Strategic-Importance matrix, zone colors, unresolved-input cards, and validated Goals. |
| 6–7 | `CBP - Actions and Change Portfolio` | Validated dimension-level Work Packages grouped into projects, project priority, conflict warnings, and unresolved planning input messages. |
| Overview | `Capability-based Planning View` | Navigational summary of the six work/analysis views plus run and unresolved-input counts. |

Heatmap colors are generated from low to high maturity (red through green) and low to high strategic importance
(green through red). In the ML-SI matrix, `Gap` is red, `Comfort` green, and `Acceptance` yellow.
In the portfolio view, action Work Packages are colored by People, Process, or Technology; Capability diagram objects
use the same Gap/Comfort/Acceptance colors as the matrix, with a legend at the top of the view.

### 6.1 Managed-view safety and generated concepts

Before creating or rebuilding a view, the generator checks the model's view collection (with a fallback query for
diagram views). An existing view with a managed name is reusable only when its `CBP.ManagedBy` and `CBP.ViewKey`
properties match the expected CBP identities. Duplicate names, changed identities, or user-owned name collisions stop
generation instead of overwriting unrelated views.

Generated cards are Business Object concepts. Generated Goals and Work Packages use stable `CBP.GeneratedKey` values
so repeat runs can update owned concepts rather than duplicate them. Relationships are reused by type and endpoint
identity; ambiguous duplicates are errors. Each generated relationship displayed in a view is added with its
relationship and both diagram endpoints, as required by jArchi's `view.add` contract.

## 7. Software architecture and file responsibilities

The suite's ArchiMate planning module is under `BizDiag_Local_AI/Capability_Based_Planning/`. Its optional Ollama
transport worker is in the module's `lib/` directory.

| File | Responsibility |
|---|---|
| `CBP_Move_1_Setup.ajs` | First-stage entry point; preflight, year validation, scope preparation, property creation, Move 1 views, and pending run checkpoint. |
| `CBP_Continue_Moves_2_to_7.ajs` | Second-stage entry point; checkpoint verification, optional AI prompt/suggestion application, calculations, output-view generation, completion record, and UI summary. |
| `lib/CBP_Model_Inputs.js` | Property access, numeric/range parsing, increment parsing, weighted mean, maturity calculation, importance calculation, and impact-key generation. This helper is independent of Archi queries except for the model object's property API. |
| `lib/CBP_Run_State.js` | Archi/jArchi adapters, supported element types, selected-scope discovery, stable Capability input codes, model identity, and model-local run-record persistence. |
| `lib/CBP_Assessment_Engine.js` | Pure assessment orchestration across Moves 2–7: result records, gap/zone, target consistency/progression, Goals, and validated action records. |
| `lib/CBP_View_Generator.js` | View enumeration/preflight, ownership markers, idempotent concepts and relationships, Move 1 worklists, heatmaps, matrix, portfolio, and overview. |
| `lib/CBP_Ollama_Worker.js` | Optional local Ollama HTTP transport, model discovery, asynchronous request wait with SWT event dispatch, timeout/error handling, and response transport validation. |

The helper modules expose APIs on `globalThis`:

- `cbpModelInputs`
- `cbpRunState`
- `cbpAssessmentEngine`
- `cbpViewGenerator`
- optional `cbpOllamaWorker`

The entry scripts load CBP helpers in dependency order. The continuation loads the Ollama worker lazily and only after
the user opts in and selects a local model. The suite does not require an npm package to run inside Archi.

## 8. Optional local AI assistance

### 8.1 Activation and eligible inputs

AI assistance is opt-in. The continuation asks only when one or more of these eligible values is missing or invalid:

- `CBP.Maturity.People`, `CBP.Maturity.Process`, or `CBP.Maturity.Technology` for an in-scope Capability; or
- `CBP.Impact.<CapabilityCode>` for a selected strategy Course of Action and an in-scope Capability.

The worker is not loaded when all eligible values are valid, when the user declines, or when model selection is
cancelled. Ollama does not complete target, action, project, or priority fields.

### 8.2 Request and acceptance flow

When accepted, the continuation loads the worker from `Capability_Based_Planning/lib/`, queries installed models
through `GET http://localhost:11434/api/tags`, and asks the user to select one. It then sends batches of up to eight
requested ratings through `POST /api/generate` using non-streaming JSON mode, temperature `0`, and up to 768
prediction tokens for each request.

Each prompt record can include:

- Archi model element ID, name, and type;
- requested property key, intended rating, and allowed range;
- up to 1,200 characters of element documentation;
- selected CBP profile/candidate properties (truncated per property); and
- up to eight related-element names/types with limited related documentation.

The serialized records are bounded to 2,200 characters of evidence per element. A prompt explicitly instructs the
model to return JSON, use only requested element/property pairs, suggest an integer only when evidence supports it,
omit unsupported suggestions, and not follow instructions embedded in the evidence.

The continuation independently validates the returned structure, exact requested element ID/property key, uniqueness,
integer range, nonempty rationale, and current target property's still-invalid status. A valid manual value is never
replaced. An accepted suggestion writes the value, a truncated rationale, and `CBP.AI.Provisional=true`. Rejected
suggestions are counted and logged. AI suggestions remain provisional and should be reviewed by the architect.

### 8.3 Transport behavior and privacy

The worker calls only the local Ollama endpoint at `http://localhost:11434`. Model discovery has a seven-second
timeout; generation requests have a 120-second timeout and a five-second scheduling allowance. HTTP requests use
Java's asynchronous HTTP client. While waiting, the worker dispatches Archi SWT events and logs a heartbeat every
20 seconds. The future is cancelled if the SWT display becomes unavailable/disposed or the request times out.

“Local” describes the configured endpoint, not a guarantee about the user's entire system. Model data are supplied by
the user-installed Ollama runtime and model. The prompt includes element IDs, names, documentation, selected
properties, and relationship context; users should review the data they choose to process and their local Ollama/model
configuration.

## 9. Run-state schema and lifecycle

The model stores internal properties `CBP.Internal.ModelID` and `CBP.Internal.RunRecord`. The JSON record currently
uses schema version `1` and includes:

| Field | Meaning |
|---|---|
| `schema` | Run-record schema version (`1`). |
| `runId` | Unique run label generated for the setup. |
| `model` | Stable model ID and readable name. |
| `capabilityIds` | Exact Capability IDs used in the run. |
| `capabilityCodes` | Capability ID/code pairs preserved for the run. |
| `valueStreamIds`, `resourceIds` | Context element IDs discovered during Move 1. |
| `potentialStrategyIds` | Model-wide Course of Action IDs shown in Strategy Inputs. |
| `strategyIds` | Potential strategies currently marked `CBP.Role=Strategy` at setup; the continuation refreshes this list when it completes. |
| `increments` | Validated ordered year strings. |
| `status` | Lifecycle state, normally `INPUTS_PENDING`, then `COMPLETED`; explicit replacement can set `ABORTED`. |
| `createdAt`, `completedAt`, `abortedAt` | ISO timestamp fields when applicable. |
| `aiSuggestionsApplied` | Count of suggestions accepted during continuation. |
| `views` | Managed view IDs recorded for reuse and identity checks. |

Move 1 refuses unsupported existing status values. A pending run requires explicit user abort before a new setup.
Continuation refuses absent, corrupt, unsupported, completed, aborted, or model/year-mismatched run state.

## 10. Reproduction plan

This section describes how to recreate the suite from first principles without relying on the current source files.

### 10.1 Establish requirements and method boundaries

1. Read the capability-based planning sources and identify which decisions are intended to be made by an architect.
2. Separate repeatable arithmetic and validation from judgments that require organizational evidence.
3. Adopt the supported element scope: Capability, Value Stream, Course of Action, and Resource.
4. Require actual Capability elements; do not generate Capability hypotheses from unrelated element types.
5. Make strategy selection explicit and prevent the software from treating every Course of Action as a strategy.
6. Record any new interpretation or behavior change as a design decision rather than attributing it to a paper without
   evidence.

### 10.2 Define the two-stage workflow and persistent contract

1. Implement a setup entry point that validates model/increments, discovers supported elements, assigns stable short
   Capability codes, creates editable worklists, and writes a pending model-local checkpoint.
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
2. Make Move 1 display the Capability fields, context elements, and short-code impact mappings in editable worklists.
3. Preflight view names, ownership metadata, and stable IDs before rebuilding views.
4. Generate the maturity and importance heatmaps, matrix/goals view, portfolio, and overview from assessment result
   records.
5. Give generated concepts stable keys, preserve links to source Capabilities, and detect user-owned name collisions.
6. Use the supported `view.add` signature with relationship and both endpoint diagram objects when adding a
   relationship to a view.
7. Test behavior in the supported Archi/jArchi runtime, including save/reopen, blank custom-property behavior, view
   enumeration, and repeat-run idempotency.

### 10.5 Add optional AI only after deterministic behavior is defined

1. Request AI only for explicitly eligible missing/invalid assessment inputs and only after user opt-in.
2. Send bounded and relevant local model evidence; make the selected property and allowed range explicit.
3. Require structured output and validate the response independently of the model's claims.
4. Never overwrite valid manual input; retain rationale and mark accepted values provisional.
5. Leave unsupported values unresolved. Do not ask the model to invent targets, actions, priorities, or strategy
   selections.
6. Make endpoint, model selection, timeouts, failure behavior, and data sent visible to users.

### 10.6 Acceptance criteria for a reproduction

- Move 1 accepts only Capability, Value Stream, Course of Action, and Resource elements.
- No Capability means Move 1 stops before generating the workflow.
- Move 1 persists an exact run scope and creates the two input views once.
- A user can edit properties and save/reopen between Move 1 and continuation.
- The continuation rejects model, scope, and increment mismatches.
- Maturity requires three valid integer dimension ratings and returns the documented weighted mean.
- Strategic importance requires complete 0–2 impacts for every selected Course of Action and uses the documented
  normalization.
- Matrix classification uses unrounded values and the configured tolerance.
- Targets are range-checked, weighted-mean checked, and progression checked; no target is invented.
- Actions require explicit action text, project name, and positive integer priority before an action Work Package is
  generated.
- Portfolio grouping exposes inconsistent priorities rather than hiding or arbitrarily choosing one.
- Managed views/concepts are idempotent and do not overwrite user-owned content.
- AI is optional, local-endpoint-configurable, strictly validated, never overwrites valid manual values, and leaves
  unsupported suggestions unresolved.
- All seven move calculations and rendered views are tested in the supported Archi/jArchi application as well as
  with isolated helper tests.

## 11. Known constraints and implementation observations

- Move 1's scope is determined by current selection when it contains supported elements; otherwise it is model-wide
  for supported types. Potential strategy Courses of Action are discovered model-wide regardless of selected scope.
- Current `findElement` restores recorded IDs only among the four approved types. Deleting or changing the type of a
  scoped element prevents continuation.
- The suite requires a nonempty `CBP.Increments` property with consecutive years. It does not default to the current
  year.
- Move 1 requests all per-year action/project/priority keys on Capabilities, even though the engine only reads them
  when the corresponding dimension target increases.
- The current Move 1 worklists create blank `CBP.Role` and impact properties, but do not initialize optional strategy
  weights. Optional maturity weights default in calculation without being created.
- The current assessment engine's action-input errors do not alone invalidate the corresponding target record; this
  can permit a Goal to be generated while its action is incomplete. See Section 4.3.
- AI applies to maturity and impact integers only, not optional weights or target/action data.
- The currently inspected module tree contains the two entry scripts and four CBP helper files; it does not contain a
  `tests/` directory. Future changes should add or restore automated regression coverage and validate actual
  Archi/jArchi behavior.
- Archi/jArchi runtime behavior, model save/reopen semantics, and rendering should be verified in the target application;
  syntax checks alone do not prove GUI/runtime compatibility.

## 12. Sources and traceability

The workflow's seven-move structure is inspired by the cited capability-based planning publications. The software
mapping is:

| Planning concern | Implemented subsystem behavior |
|---|---|
| Identify/model capabilities | Capability-only assessment subjects; Value Streams/Resources as context; no inferred map generation. |
| Assess maturity | Weighted People/Process/Technology score. |
| Assess strategic importance | Explicit Course of Action role and Capability-impact ratings, strategy-weighted and normalized. |
| Analyze the landscape | Strategic-importance-minus-maturity gap, tolerance-based zone, ML-SI matrix. |
| Set goals | Explicit per-year overall and dimension targets, consistency and progression checks. |
| Define actions | Explicit improvement descriptions, project names, and priorities as traceable Work Packages. |
| Design portfolio | Increment/project grouping and priority ordering with conflict reporting. |

This mapping is an implementation interpretation, not a claim that the publications specify the exact property schema,
mathematical normalization, ArchiMate relationship types, or generated-view design used by BizDiag.
