# Business–IT Alignment and Misalignment Detection

## Purpose and scope

`BusinessITAlignment_EN.ajs` and its Persian-language counterpart,
`BusinessITAlignment_FA.ajs`, are jArchi scripts for examining an ArchiMate
model for business–IT alignment symptoms. They combine a research-grounded
catalogue of symptoms with model checks, record findings against model
elements, and present findings in an interactive table and export files.
It is a model-based diagnostic aid: a finding is evidence that the modeled
architecture meets a rule's trigger, not conclusive proof that the same
condition exists in organizational practice or in a running system.

The scripts (both the English and the Persian-localized script) contain **112 symptom catalogue entries**:

| Aspect (`aspect` value in the script) | Entries |
|---|---:|
| Strategy | 18 |
| CrossLayer | 24 |
| Business | 18 |
| Operational | 1 |
| Data | 14 |
| Application | 17 |
| Technology | 17 |
| Semantic | 3 |
| **Total** | **112** |

This total comprises 21 explicitly catalogued symptoms from the foundational
paper, two additional symptoms labeled **Implicit** that operationalize other
parts of its framework, and 89 supplementary entries. Two of four
framework-derived concepts reuse supplementary checks rather than creating
duplicate catalogue entries; their mappings are explained below. The aspect
names and descriptions in the inventory tables are the values in the English
script's catalogue, not a retrospective reclassification.

## Research basis and conceptual derivation

### Strategic Alignment Model (SAM)

The foundational paper structures its analysis around the Strategic Alignment
Model (SAM) associated with Henderson and Venkatraman [1]. SAM treats
alignment as a relationship between business and IT across external strategy
and internal organization/infrastructure:

| SAM domain in the script's framework | Meaning |
|---|---|
| Business Strategy | The organization's external business direction and choices. |
| Business Structure | The internal organization and processes through which business strategy is carried out. |
| IT Strategy | The external direction and choices for information systems and technology. |
| IT Structure | The internal IT infrastructure, systems, and processes. |

SAM distinguishes **strategic fit**—consistency between external strategy and
internal structure—from **functional integration**—consistency between the
business and IT domains. The foundational paper uses four alignment
perspectives to make these relationships assessable. Its Table 1 decomposes
each perspective into the domain matches (components) relevant to that
perspective:

| Perspective code | Alignment perspective | Components in Table 1 |
|---|---|---|
| P.01 | Strategy execution | C.01, C.02 |
| P.02 | Technology transformation | C.03, C.04 |
| P.03 | Competitive potential | C.01, C.03 |
| P.04 | Service level | C.02, C.04 |

| Component code | Domain match |
|---|---|
| C.01 | Business strategy and business structure |
| C.02 | Business structure and IT structure |
| C.03 | Business strategy and IT strategy |
| C.04 | IT strategy and IT structure |

These are analytical viewpoints, not four separate model layers. A symptom
may therefore be relevant to more than one perspective, and an individual
ArchiMate element is not itself a complete measure of alignment.

### The foundational artifact-based framework

Őri's foundational paper, *An Artifact-Based Framework for Business-IT
Misalignment Symptom Detection* [2], addresses the gap between identifying a
misalignment conceptually and finding evidence for it in an enterprise
architecture. Figure 1 describes the framework's construction; Figure 2 and
Section 4 describe its operation. Its framework has five connected parts:

1. **Meta-methodology:** an adaptation of Noran's meta-methodology [3] provides
   a systematic way to transform existing knowledge into a constructed
   research framework. It links concepts, models, and empirical data
   collections rather than supplying a business–IT symptom on its own.
2. **Alignment perspectives and components:** SAM perspectives organize the
   inquiry, and Table 1 decomposes each perspective into the domain matches
   through which alignment or misalignment can be examined.
3. **Misalignment symptom catalogue:** Table 2 collects 21 symptoms from
   earlier misalignment literature. The foundational paper cites Carvalho and
   Sousa's BISMAM work [4], Pereira and Sousa's enterprise-architecture and
   business–IT alignment work [5], and Sousa, Pereira, and Marques's alignment
   heuristics [6].
4. **Artifact catalogue:** Table 3 selects 25 TOGAF-based architecture
   artifacts [7]. These are potential places in which evidence for a symptom
   may be represented; they are not 25 more symptoms.
5. **EA analysis catalogue:** Table 4 identifies eight analysis types from
   related EA-analysis literature [8–10]. They describe analytical approaches
   that can reveal evidence in artifacts; the catalog itself is not a set of
   executable detection rules.

The paper's operation is a traceability chain: perspective → SAM component
(domain match) → symptom → potentially containing artifact → suitable EA
analysis. Tables 5–8 show an excerpt of the resulting mappings for the four
perspectives. The case study demonstrates this logic with dependency analysis
between process tasks and applications: a task supported by multiple
applications can be examined as S.07 in the Strategy Execution perspective,
using the application/function artifact and dependency analysis. This is a
research framework for organizing detection, not a complete specification of
every model query or property-value test.

### Translating the framework into this script

The script keeps the research identifiers and the executable rule identifiers
distinct. The foundational paper's Table 2 codes are `S.01`–`S.21`; those
codes already have different meanings elsewhere in this script. The Table 2
rules therefore use `ABF.S.01`–`ABF.S.21`, with the paper's original code
stored in each entry's `sourceCode` field. The `ABF` prefix means the
entry is associated with the artifact-based framework; it avoids collisions
and does not imply a different symptom.

The code translates the paper's qualitative descriptions into model-level
criteria using ArchiMate element types, relationships, and—where the
condition cannot be established from structure alone—explicit custom
properties. It then anchors each finding to a relevant element (or to a
model-level anchor when a required construct is absent), and appends the
observed evidence and available research mappings to the finding notes. This
is a rule-based operationalization of the paper's symptom-and-artifact
approach, not an implementation of every general EA analysis named in Table 4.

Two mapping distinctions are important:

* `artifacts` and `analyses` in a symptom entry record the direct mapping
  selected for that entry from the foundational paper's perspective/symptom/
  artifact/analysis tables.
* `implicitArtifacts` and `implicitAnalyses` record the script's explicitly
  labeled implicit mappings where the framework suggests relevant artifacts
  or analyses but the paper's Tables 5–8 do not provide that particular
  symptom-to-artifact or symptom-to-analysis mapping.

The absence of a perspective, artifact, or analysis field is not silently
filled with a guessed paper mapping. The distinction preserves the boundary
between what the paper explicitly tabulates and how its framework can be
applied to model checks.

## Foundational symptom catalogue: all 21 Table 2 symptoms

The symptom wording below reproduces the English script's `desc` fields.
“Paper code” is the original Table 2 identifier; “Script code” is the unique
catalogue identifier. Perspective, artifact, and analysis references use the
foundational paper's identifiers. An asterisk (`*`) marks an implicit mapping
stored in an `implicitArtifacts` or `implicitAnalyses` field, not a direct
mapping from Tables 5–8.

| Script code | Paper code | Catalogue symptom | Aspect / severity | Perspective(s) | Artifact(s) | EA analysis/analyses |
|---|---|---|---|---|---|---|
| ABF.S.01 | S.01 | Undefined organizational mission, strategy and goals | Strategy / HIGH | P.01 | AF.01, AF.06 | A.01, A.03 |
| ABF.S.02 | S.02 | Undefined business process goals, business process owners | Business / HIGH | — | AF.01*, AF.06*, AF.11* | A.01*, A.03* |
| ABF.S.03 | S.03 | Lack of relation between process goals and organizational goals | CrossLayer / HIGH | P.01, P.03 | AF.06, AF.15 | A.01 |
| ABF.S.04 | S.04 | Undefined business roles or responsibilities | Business / MEDIUM | — | AF.02*, AF.05*, AF.10* | A.03* |
| ABF.S.05 | S.05 | Undefined or multiple organizational hierarchies or reporting lines | Business / MEDIUM | P.03 | AF.02, AF.08, AF.09, AF.10 | — |
| ABF.S.06 | S.06 | Application functionality does not support at least one business process task | CrossLayer / HIGH | P.01 | AF.08, AF.16 | A.01 |
| ABF.S.07 | S.07 | A business process task is supported by more than one application | CrossLayer / MEDIUM | P.01 | AF.15, AF.16 | A.03 |
| ABF.S.08 | S.08 | Critical business process does not depend on scalable and available applications | CrossLayer / CRITICAL | — | AF.04*, AF.20*, AF.23*, AF.24* | A.02*, A.07* |
| ABF.S.09 | S.09 | Inappropriate application functionality | Application / HIGH | P.01 | AF.15, AF.16, AF.19, AF.20 | A.01 |
| ABF.S.10 | S.10 | Insufficient IT resources | Technology / HIGH | P.02 | AF.07 | A.05 |
| ABF.S.11 | S.11 | Lack of IT skills and competencies | Technology / MEDIUM | P.02, P.03 | AF.02, AF.03, AF.10 | A.03 |
| ABF.S.12 | S.12 | Lack of skills to develop or innovate certain types of products | Business / MEDIUM | P.03 | AF.03, AF.07 | A.03 |
| ABF.S.13 | S.13 | Poor IT planning and portfolio management | Application / HIGH | P.02, P.03 | AF.07 | A.01, A.03, A.06 |
| ABF.S.14 | S.14 | Under-capacity infrastructure | Technology / HIGH | P.04 | AF.24 | A.02 |
| ABF.S.15 | S.15 | Lack or poor systems performance monitoring | Technology / HIGH | P.02 | AF.15, AF.21, AF.24, AF.25 | A.03, A.05, A.07 |
| ABF.S.16 | S.16 | Out-of-date technological infrastructure | Technology / HIGH | — | AF.22*, AF.24*, AF.25* | A.03*, A.08* |
| ABF.S.17 | S.17 | Technological heterogeneity | Technology / MEDIUM | P.04 | AF.22, AF.23, AF.24 | A.08 |
| ABF.S.18 | S.18 | Incompatible platforms or technologies | Technology / HIGH | — | AF.17*, AF.23*, AF.24* | A.04*, A.06*, A.08* |
| ABF.S.19 | S.19 | Frequent periods while applications are unavailable | Technology / CRITICAL | P.04 | AF.18 | A.07 |
| ABF.S.20 | S.20 | Information consistency or integrity problems | Data / HIGH | P.04 | AF.12, AF.13, AF.25 | A.07 |
| ABF.S.21 | S.21 | Undefined business service levels | Business / HIGH | P.04 | AF.04 | A.03 |

The table deliberately reproduces the script's catalogue text rather than
silently replacing it with quotations from the paper. The wording is
semantically aligned but not verbatim in every row: for example, the script's
S.05 says “organizational hierarchies or reporting lines” where Table 2 says
“hierarchy or lines of reporting”; S.07 adds an article, and S.14
hyphenates “under-capacity.” The original Table 2 identifier is retained in
the adjacent Paper code column.

### What the Table 2 checks examine

The paper names symptoms at a conceptual level. The following summarizes how
the current script seeks model evidence for them:

| Script codes | Model evidence used by the rule |
|---|---|
| ABF.S.01 | Checks for Goal elements and modeled mission and strategy evidence, which may be represented by element types, names, documentation, or mission/strategy properties. When a required construct is absent, the finding is attached to a model element as an anchor. |
| ABF.S.02–ABF.S.05 | Examines process-goal links, declared ownership, role/responsibility links or properties, and organizational hierarchy/reporting relationships. A standalone organizational root is allowed; absence of hierarchy evidence is flagged only for a multi-element organizational structure. |
| ABF.S.06–ABF.S.07 | Examines application links from modeled process tasks. Where task-level elements are unavailable, leaf process elements are used as the model's task-granularity proxy. The rules distinguish no supporting application from multiple supporting applications. |
| ABF.S.08 | Applies to a process explicitly identified as critical. It checks for a linked application and modeled evidence of both scalability/capacity and availability/resilience; either property by itself is insufficient. |
| ABF.S.09–ABF.S.10 | Uses an explicit negative application-fit status, or declared resource capacity/demand values or adequacy status. |
| ABF.S.11–ABF.S.13 | Checks whether IT roles/resources declare skills, whether declared product-development skills are represented among modeled roles/resources, and whether an application has a negative planning/portfolio/governance status. |
| ABF.S.14–ABF.S.18 | Examines infrastructure capacity and lifecycle/support status, monitoring declarations or modeled monitoring services, technology heterogeneity/coherence declarations, and explicit platform/interoperability compatibility evidence. |
| ABF.S.19–ABF.S.21 | Checks explicit application availability status, data integrity/consistency evidence, and business service-level declarations or related measures/contracts/requirements. |

Not every real-world condition can be inferred from an ArchiMate relationship
graph. Several checks intentionally rely on declared properties or explicit
status values. For example, a missing monitoring link is a model
documentation/coverage gap, not proof that operational monitoring does not
exist. Likewise, a missing deployment relationship is not proof that an
application is not hosted, and a model that does not declare a role
assignment does not establish that no person performs that role.

## Implicit symptoms derived from the foundational framework

The foundational paper's artifact and analysis catalogues add detection
structure beyond Table 2, but they are not themselves additional symptom
lists. Applying that structure makes further traceability and consistency
checks possible. The script documents four such concepts as IF.01–IF.04:

| Framework concept | Mapping in the script | How it avoids duplicate symptoms |
|---|---|---|
| IF.01 — driver/goal traceability | `STR.62` and `STR.65` | Existing checks cover goals without associated drivers and drivers not addressed by strategy. No additional catalogue entry is created. |
| IF.02 — business function/service to application realization | `OB.68` and `SEM.01` | Existing checks cover business-function implementation coverage and business-service realization. No additional catalogue entry is created. |
| IF.03 — application-to-technology deployment traceability | `A.33` for business-critical applications; `ABF.I.01` for other application components | The critical-app check is reused. `ABF.I.01` adds the complementary noncritical application-component coverage, avoiding overlap for critical applications. |
| IF.04 — actor/role mapping consistency | `ABF.I.02` | Adds a check for explicitly declared actor/role references that cannot be resolved to a model element or relationship. It does not treat an unspecified assignment as a missing assignment. |

The two additional standalone catalogue entries are:

| Script code | Exact catalogue description | Aspect / severity | Encoded framework mapping |
|---|---|---|---|
| ABF.I.01 | Implicit: application component has no modeled link to its deployment technology | Technology / HIGH | C.04; P.02, P.04; AF.21, AF.23, AF.24; A.01, A.03, A.07 |
| ABF.I.02 | Implicit: explicitly declared actor-role assignments are unresolved or not modeled | Business / MEDIUM | C.01; P.03; AF.02, AF.05, AF.09, AF.10; A.03 |

“Implicit” describes the framework derivation: these two concepts are not
separately enumerated among the foundational paper's 21 Table 2 symptoms.
Their findings also state the limits of the model evidence. The checks do not
claim that the underlying runtime deployment or human assignment is absent
when only the model relationship is missing.

## Foundational paper's artifact catalogue

The following are the 25 artifact identifiers and names in the script's
`ABF_ARTIFACT_CATALOGUE`, corresponding to Table 3 of the foundational paper.
The short purpose descriptions summarize the content in that table. They
identify model/documentation contexts that can contain evidence; they are not
additional symptom codes.

| Code | Artifact name in script | Role in the framework |
|---|---|---|
| AF.01 | Driver/goal/objective catalogue | Cross-organizational reference for drivers, goals, objectives, and driver fulfilment. |
| AF.02 | Role catalogue | Organization's roles and authorization levels. |
| AF.03 | Business service/function catalogue | Business functions and services, including functional decomposition. |
| AF.04 | Contract/measure catalogue | Agreed service contracts and their measures. |
| AF.05 | Actor/role matrix | Mapping of actors to roles. |
| AF.06 | Business footprint diagram | Relationships among goals, units, functions, services, and delivering technical components. |
| AF.07 | Functional decomposition diagram | Capabilities and functions within the organization. |
| AF.08 | Goal/objective/service diagram | Contribution of services to business goals and strategy. |
| AF.09 | Business use-case diagram | Consumers and providers of business services. |
| AF.10 | Organizational decomposition diagram | Organizational actors, roles, and locations in an organizational structure. |
| AF.11 | Process flow diagram | Task sequence and relationships within a business process. |
| AF.12 | Data entity/data component catalogue | Enterprise data entities and components. |
| AF.13 | Data entity/business function matrix | Links between data entities and business functions. |
| AF.14 | Data migration diagram | Data movement from source to target applications. |
| AF.15 | Application portfolio catalogue | Applications maintained across the organization. |
| AF.16 | Application/function matrix | Links between applications and business functions. |
| AF.17 | Application interaction matrix | Communications relationships between applications. |
| AF.18 | Application and user location diagram | Geographic distribution of applications and users. |
| AF.19 | Application use-case diagram | Consumers and providers of application services. |
| AF.20 | Process/application realization diagram | Application sequence involved in realizing business processes. |
| AF.21 | Software distribution diagram | Deployment of physical applications across technology and locations. |
| AF.22 | Technology portfolio catalogue | Technology assets maintained across the organization. |
| AF.23 | Application/technology matrix | Mapping from applications to technology platforms. |
| AF.24 | Platform decomposition diagram | Infrastructure and technology-platform structure. |
| AF.25 | Processing diagram | Deployable code/configuration units and their deployment to technology platforms. |

## Foundational paper's EA analysis catalogue

The script's `ABF_ANALYSIS_CATALOGUE` preserves Table 4's eight analysis
identifiers. The descriptions below follow the catalogue names in the script;
the purpose column condenses the paper's accompanying definitions.

| Code | Analysis name in script | Purpose in the paper |
|---|---|---|
| A.01 | Dependency analysis | Analyze direct/indirect relationships and dependencies; can support impact analysis. |
| A.02 | Network analysis | Examine the architecture as a network of connected entities. |
| A.03 | Coverage analysis | Examine domain networks/elements and whether business structures are covered by supporting applications. |
| A.04 | Interface analysis | Examine interfaces between application systems. |
| A.05 | Complexity analysis | Examine architecture complexity through components and relationships. |
| A.06 | Enterprise interoperability assessment | Assess interoperability among architecture entities and domains. |
| A.07 | Enterprise coherence assessment | Examine coherence among architecture entities and domains. |
| A.08 | Heterogeneity analysis | Examine heterogeneity in IT assets. |

These identifiers are provenance and method metadata in this implementation.
They do **not** mean that the script invokes a general-purpose dependency,
network, interoperability, or coherence-analysis engine. The executable
checks are the specific rules described in this document; the analysis names
explain the analytical lens associated with a symptom in the paper's
framework.

## Supplementary symptom catalogue

The following 89 entries supplement the 21 foundational Table 2 symptoms and
the two standalone implicit entries. Their descriptions and groupings
reproduce the English script catalogue. The supplementary checks include
business, application, technology, data, cross-layer, operational, and
semantic concerns. Many are plausible business–IT alignment indicators, but
the catalogue is broader than a direct reproduction of the foundational
paper's Table 2. A model finding indicates that the encoded condition was
detected; it does not by itself establish the cause, organizational impact,
or real-world state.

The supplementary entries were developed by synthesizing the additional
research listed in “Supplementary literature and provenance.” Since these
works address overlapping subjects—strategic planning, operational
alignment, architecture analysis, and model quality—the relationship is
described by code family and research theme rather than implying that every
rule is a verbatim symptom from a single publication. The tables below retain
the exact code and catalogue wording from the English script.

### Strategy (17 supplementary entries)

| Code | Severity | Catalogue description |
|---|---|---|
| S.01 | CRITICAL | Goal without Outcome/KPI |
| S.02 | HIGH | Outcome without measurable status |
| S.03 | HIGH | Goal without Capability support |
| S.04 | MEDIUM | Goal mentions scale but no capacity/resource |
| S.05 | HIGH | Strategy not mapped to value streams |
| S.06 | HIGH | Applications not linked to strategy/outcomes |
| S.07 | MEDIUM | Missing risk mappings |
| S.08 | MEDIUM | Duplicate/conflicting strategic items |
| S.09 | MEDIUM | Strategy missing timeframe/priority |
| S.10 | MEDIUM | Strategy elements lacking owner/stakeholder |
| STR.61 | HIGH | Vision exists but lacks supporting mission mapping |
| STR.62 | MEDIUM | Strategic goal missing associated driver/motivation |
| STR.63 | MEDIUM | Goal lacks assessment/outcome analysis of driver |
| STR.64 | HIGH | Organizational capability not supporting any strategic goal |
| STR.65 | MEDIUM | External factor/driver not addressed by any strategy |
| STR.66 | MEDIUM | Resource or capability unused by any strategic goal/initiative |
| STR.67 | HIGH | Competitive advantage not supported by mapped capabilities |

### CrossLayer (20 supplementary entries)

| Code | Severity | Catalogue description |
|---|---|---|
| X.61 | HIGH | Pattern declared but not realized/implemented in model |
| X.62 | HIGH | Shared service declared but single consumer |
| X.49 | CRITICAL | End-to-end traceability broken (Goal -> Capability -> Process -> App) |
| X.50 | HIGH | Value streams not supported by processes or IT |
| P.81 | HIGH | Pattern declared but missing configuration/params |
| P.82 | MEDIUM | Pattern variant mismatch detection (multiple variants declared for the same pattern without explicit product/variant mapping) |
| P.83 | MEDIUM | Declared pattern element without expected child types |
| X.51 | HIGH | Capability supports goals but not supported by IT |
| X.52 | HIGH | Capability supports goals but not supported by IT |
| X.53 | MEDIUM | Business functions using data that no application provides |
| X.54 | MEDIUM | Operational activities missing KPIs |
| X.55 | HIGH | Services lacking SLA or owner |
| X.56 | HIGH | Missing change impact mapping |
| X.57 | MEDIUM | Third-party/vendor risks not linked to usage |
| X.58 | MEDIUM | Service dependencies not documented |
| X.59 | HIGH | Missing business continuity mapping |
| X.60 | CRITICAL | Critical capability lacks measurable outcome |
| OB.74 | CRITICAL | Business Process missing functional link to Application layer (cross-layer consistency violation) |
| OB.75 | CRITICAL | Data Object lacks cross-layer mapping between Business and IT layers |
| OB.79 | HIGH | Business Function has multiple conflicting Application implementations (duplicate implementations) |

### Business (12 supplementary entries)

| Code | Severity | Catalogue description |
|---|---|---|
| B.11 | HIGH | Process without owner |
| B.12 | MEDIUM | Process not using any data entities |
| B.13 | HIGH | Process without application support |
| B.14 | MEDIUM | Process redundancy |
| B.15 | LOW | Process with no inputs or outputs |
| B.16 | HIGH | Process lacking SLA/KPI |
| B.17 | CRITICAL | Process depends on deprecated tech |
| B.18 | MEDIUM | Process missing controls/constraints |
| B.19 | MEDIUM | Process not mapped to capability |
| OB.68 | CRITICAL | Business Function has no corresponding Application implementation (coverage gap) |
| OB.70 | MEDIUM | Business Function implemented by multiple unrelated Application functions (overimplementation) |
| OB.77 | HIGH | Business Function operates in isolation without cross-functional integration (functional silo) |

### Operational (1 supplementary entry)

| Code | Severity | Catalogue description |
|---|---|---|
| OB.80 | MEDIUM | Product Line architecture lacks feature/guard mapping |

### Data (13 supplementary entries)

| Code | Severity | Catalogue description |
|---|---|---|
| D.21 | MEDIUM | Data entity not used by any process |
| D.22 | MEDIUM | Duplicate/overlapping data entities |
| D.23 | MEDIUM | Data missing CRUD mapping |
| D.24 | CRITICAL | Sensitive data without security controls |
| D.25 | HIGH | Data not stored by any application |
| D.26 | HIGH | Data used by Application has no business owner |
| D.27 | HIGH | Data lineage incomplete |
| D.28 | LOW | Data retention not defined |
| D.29 | LOW | No data classification present |
| D.30 | MEDIUM | No data classification present |
| OB.72 | HIGH | IT Data Concept lacks mapping to Business data entity |
| OB.73 | HIGH | Business Data Entity lacks corresponding IT persistence/storage |
| SEC.85 | CRITICAL | Sensitive data without explicit security mapping to controls, access control or security components |

### Application (15 supplementary entries)

| Code | Severity | Catalogue description |
|---|---|---|
| A.31 | HIGH | Application not supporting any business need |
| A.32 | MEDIUM | Application duplication |
| A.33 | HIGH | Business-critical app missing hosting technology |
| A.34 | LOW | Application missing lifecycle metadata |
| A.35 | MEDIUM | Shadow IT heuristic |
| A.36 | MEDIUM | Application missing interface mapping |
| A.37 | CRITICAL | Application depends on deprecated tech |
| A.38 | MEDIUM | Application missing owner/steward |
| A.39 | MEDIUM | Application missing licensing/run-cost info |
| A.40 | LOW | Application naming inconsistent |
| EV.90 | HIGH | async=true but no relation to MessageBroker/EventBus/Queue found |
| OB.69 | HIGH | Application Function not linked to any Business Process (orphaned IT functionality) |
| OB.71 | MEDIUM | Application Function used by too many Business Processes (monolithic reuse) |
| OB.76 | MEDIUM | Application developed for technical reasons without direct Business justification (pure technical integration) |
| OB.78 | MEDIUM | Single Application implements too many Business Functions (monolithic architecture) |

### Technology (8 supplementary entries)

| Code | Severity | Catalogue description |
|---|---|---|
| T.41 | CRITICAL | Deprecated technology still in use |
| T.42 | CRITICAL | Single point of failure |
| T.43 | HIGH | Technology missing redundancy/backup mapping |
| T.44 | CRITICAL | Application uses unsupported platform |
| T.45 | MEDIUM | Technology missing standards/governance constraints |
| T.46 | MEDIUM | Technology asset missing lifecycle metadata |
| T.47 | HIGH | Sensitive tech deployed without required controls |
| T.48 | MEDIUM | Infrastructure missing service mapping |

### Semantic (3 supplementary entries)

| Code | Severity | Catalogue description |
|---|---|---|
| SEM.01 | CRITICAL | Business Service not realized by Application Service |
| SEM.02 | MEDIUM | Orphaned Application Service not providing Business Service |
| SEM.03 | CRITICAL | Critical Business Service lacks complete IT support chain |

**Catalogue wording note:** these tables reproduce the `desc` field, not
necessarily the detector's section heading or instance-specific evidence.
Accordingly, duplicate description strings in the script are retained as
written: D.29 and D.30 both say “No data classification present,” and X.51
and X.52 both say “Capability supports goals but not supported by IT.” The
codes remain distinct catalogue entries.

## Supplementary literature and provenance

The foundational paper itself positions Table 2 as a compilation of symptoms
from prior research, and its artifact and analysis catalogues also draw on
related EA sources. The additional symptoms in this script extend that basis
using the supplementary publications in the companion `papers` directory.
The relationship is summarized below by code family. “Derived from” here
means that the source's concepts and assessment approach inform the rule
family; it does not mean that each script description is a quotation from
that source.

| Supplementary code families | Research basis and relevance                                                                                                                                                                                                                                                |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Strategy, goal/driver traceability, capability and value-stream checks (`S.*`, `STR.*`, `X.49`–`X.60`) | Szabó and Őri [11] provide the strategic information-systems planning and EAM context; Kitsios et al. [14] examine business-strategy representation with ArchiMate. Henderson and Venkatraman [1] supply the SAM theoretical basis.                                         |
| Business-process/application realization, operational alignment, service realization and cross-layer consistency (`B.*`, `OB.68`–`OB.79`, `SEM.*`, relevant `X.*`) | André et al. [15] assess operational alignment between business processes and IT applications using metrics, consistency rules, anti-patterns, and explicit model links. Őri [12] contributes an EA-based symptom-analysis and rule-testing approach.                       |
| Architecture-pattern, application interaction, configuration and deployment checks (`P.*`, `EV.90`, and relevant `A.*`/`T.*`) | Choudhry [16] studies specification and testing of enterprise application architecture patterns. The foundational paper's TOGAF artifact and EA-analysis catalogues [2] provide the broader architecture-analysis context.                                                  |
| Data mappings, security and technology governance (`D.*`, `SEC.85`, `OB.72`–`OB.75`, and relevant `T.*`) | André et al. [15] inform operational business/IT model consistency; Luftman [13] provides alignment-maturity context for governance, scope/architecture, and skills. The individual rules are the script's model-based operationalizations, not quotations from these works. |
| Ownership, skills, resources, governance and alignment maturity (including relevant `B.*`, `STR.*`, `A.*`, and `T.*`) | Luftman's maturity framework [13] addresses communication, competence, governance, partnership, scope/architecture, and value measurement; Szabó and Őri [11] relate EAM to strategic IS planning.                                                                          |
| Research-method and architecture/strategy context | Hevner et al. [17] provide design-science research guidance. This is methodological and contextual resources, not standalone symptom catalogue.                                                                                                                             |

These clusters make the supplementary papers and their relevance explicit
without implying unsupported one-to-one provenance. The 21 `ABF.S.*` entries
are the direct Table 2 catalogue; the two `ABF.I.*` entries are explicitly
labeled implicit applications of the foundational framework. The
supplementary entries are additional research-informed checks, with the
specific cited sources and themes above.

## Running the script and interpreting results

Run `BusinessITAlignment_EN.ajs` from Archi with jArchi enabled and the
intended ArchiMate model open. The script evaluates the model's elements and
relationships; it is not limited to a current diagram selection. Its checks
inspect model structure, names/documentation, and supported custom properties
as defined by each rule.

By default, the script:

* includes non-analyzable catalogue entries and findings at LOW severity or
  above;
* tags flagged model elements using the `misalignment`,
  `misalignment_notes`, and `misalignment_severity` properties;
* applies visual element fill coloring for findings;
* displays the results in an interactive SWT table with severity, code,
  element, description, and evidence details; and
* writes/replaces `alignment_report.csv` and `alignment_report.xls` beside the
  script.

The XLS output is an HTML-formatted table intended to open in spreadsheet
software. Report filtering controls can change the visible minimum severity
and inclusion of non-analyzable entries. Those display/report filters do not
change the catalogue or the definition of the checks. The script records and
highlights findings; it does not repair the model or prescribe an
organizational remediation.

### Reading a finding responsibly

1. Treat the code and catalogue description as the rule's category, then read
   its finding notes for the particular modeled evidence.
2. Check the named model element, relationships, and custom properties. A
   missing relationship may indicate incomplete architecture documentation
   rather than a real-world absence.
3. Consider severity a prioritization label assigned by the script, not a
   measured probability, impact estimate, or maturity score.
4. Validate important findings with domain owners and authoritative
   operational evidence before making organizational or technical decisions.

The symptom inventory is intentionally broader than the foundational paper's
explicit Table 2. Catalogue presence means the script contains a corresponding
rule definition; it does not mean every rule will produce a finding in every
model, or that every model element is expected to satisfy every rule.

## References

1. Henderson, J. C., and Venkatraman, N. “Strategic Alignment: Leveraging
   Information Technology for Transforming Organizations.” *IBM Systems
   Journal*, 32(1), 4–16, 1993.
2. Őri, D. “An Artifact-Based Framework for Business-IT Misalignment Symptom
   Detection.” In *Perspectives in Business Informatics Research (PoEM
   2016)*, Lecture Notes in Business Information Processing, vol. 267,
   148–163. Springer, 2016. https://doi.org/10.1007/978-3-319-48393-1_11.
3. Noran, O. “A Decision Support Framework for Collaborative Networks.”
   *International Journal of Production Research*, 47(17), 4813–4832, 2009.
4. Carvalho, G., and Sousa, P. “Business and Information Systems
   MisAlignment Model (BISMAM): An Holistic Model Leveraged on Misalignment
   and Medical Sciences Approaches.” In *Proceedings of the Third
   International Workshop on Business/IT Alignment and Interoperability
   (BUSITAL’08)*, CEUR Workshop Proceedings, vol. 336, 104–119, 2008.
5. Pereira, C. M., and Sousa, P. “Enterprise Architecture: Business and IT
   Alignment.” In *Proceedings of the 2005 ACM Symposium on Applied
   Computing*, 1344–1345, 2005.
6. Sousa, P., Pereira, C. M., and Marques, J. A. “Enterprise Architecture
   Alignment Heuristics.” *Microsoft Architects Journal*, 4, 34–39, 2005.
7. The Open Group. *The Open Group Architecture Framework (TOGAF)*. The
   foundational paper uses TOGAF as the basis for its Table 3 artifact
   catalogue.
8. Buckl, S., Matthes, F., and Schweda, C. M. “Classifying Enterprise
   Architecture Analysis Approaches.” In *Proceedings of the International
   Workshop on Enterprise Interoperability*, 2009.
9. Niemann, K. D. *From Enterprise Architecture to IT Governance*. Springer,
   2006.
10. Wagter, R., Proper, H. A., and Witte, D. “A Practice-Based Framework for
    Enterprise Coherence.” In *PRET 2013*, Lecture Notes in Business
    Information Processing, vol. 151, 77–95. Springer, 2012.
11. Szabó, Z., and Őri, D. “How Enterprise Architecture Management Can
    Support Strategic IS Planning.” In *Information Strategy Challenges in
    the Digital Era*, 11th International Conference on Software, Knowledge,
    Information Management and Applications (SKIMA), 2017.
12. Őri, D. “Misalignment Symptom Detection with XML-Based Enterprise
    Architecture Model Analysis.” *Novel Directions Talk*, pp. 153–157.
    Bibliographic venue and year are not identified in the supplied paper
    copy.
13. Luftman, J. “Assessing Business-IT Alignment Maturity.” *Communications
    of the Association for Information Systems*, 4, Article 14, 2000.
    https://doi.org/10.17705/1CAIS.00414.
14. Kitsios, F., Kyriakopoulou, G., and Kamariotou, M. “Exploring Business
    Strategy Modelling with ArchiMate: A Case Study Approach.” *Information*,
    13(1), Article 31, 2022.
    https://doi.org/10.3390/info13010031.
15. André, P., Benjilany, A., Bruneliere, H., and Tamzalit, D. “Assessing
    Operational Business-IT Alignment for Architecture Improvement.” In
    *Advances in Information Systems Development: Exploring New Horizons and
    Opportunities*, Lecture Notes in Information Systems and Organisation,
    vol. 77, pp. 231–253. Springer, 2025.
    https://doi.org/10.1007/978-3-031-87880-0_12.
16. Choudhry, A. A. *Testing Enterprise Application Architecture Patterns*.
    M.Sc. dissertation, University of Liverpool, 2006.
17. Hevner, A. R., March, S. T., Park, J., and Ram, S. “Design Science in
    Information Systems Research.” *MIS Quarterly*, 28(1), 75–105, 2004.
