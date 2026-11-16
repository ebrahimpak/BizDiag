# Business–IT Alignment and Misalignment Detection

## 1. Introduction to Digital Strategy & Alignment

Digital strategy is not simply a technology plan. It connects business
direction with the information systems and technology choices, organizational
changes, and capabilities needed to execute that direction and create value.
Because markets and technologies change, alignment is an ongoing process of
mutual adjustment—not a one-time state to achieve. Peppard and Ward discuss
this relationship through Henderson and Venkatraman's Strategic Alignment
Model (SAM) and the evolution toward a broader, adaptive digital capability.
[1, 2].

### 1.1 Henderson and Venkatraman's Strategic Alignment Model

SAM examines the coherence of four domains: **business strategy** and
**digital/IT strategy** (external choices), and **organizational
infrastructure and processes** and **IT infrastructure and processes**
(internal arrangements). It emphasizes both strategic fit—whether internal
organization and technology can realize strategic choices—and functional
integration—whether business and IT choices reinforce one another [1].

This SAM domain map shows how the four domains relate. Vertical links
connect external strategy with internal organization in each domain; horizontal
links show functional integration between the business and IT domains:

```text
                         BUSINESS DOMAIN                 IT DOMAIN

EXTERNAL choices    [Business strategy] <----------> [Digital strategy]
                            |                               |
                            | strategic                     | strategic
                            | integration                   | integration
                            v                               v
INTERNAL execution  [Organizational infrastructure] <--> [IT infrastructure]
                    [and processes]                       [and processes]

                    Across domains: functional integration
```

The following complementary concept sketch emphasizes the ongoing movement
from strategic choices through implementation to outcomes:

```text
Business strategy -----> Organizational change and processes -----> Outcomes
       ^                            ^                                  |
       |                            |                                  |
       +---- learning/feedback -----+                                  |
       |                                                               |
Digital/IT strategy --> IT capabilities and effective use -------------+

Business and IT choices inform each other and adapt as conditions change.
```

In practice, IT can both support a business strategy and enable new strategic
options. Alignment, therefore, includes internal fit and the ability to respond
to external change.

### 1.2 Luftman's Alignment Dimensions

Luftman's alignment components are organized around four domains. The domain
and component names are as follows [3]:

**I. Business Strategy**

1. **Business Scope** — Defines the organization's markets, offerings, and
   business boundaries.
2. **Distinctive Competencies** — Identifies the capabilities that
   differentiate the business and support its strategic position.
3. **Business Governance** — Describes how business authority, decisions, and
   key relationships are directed.

**II. Organizational Infrastructure and Processes**

4. **Administrative Structure** — Describes the organization of roles,
   responsibilities, reporting, and decision-making.
5. **Processes** — Covers the workflows through which the organization
   performs and coordinates its work.
6. **Skills** — Captures the people, knowledge, and competencies needed to
   carry out business activities.

**III. Digital strategy**

7. **Technology scope** — Sets the information technologies and digital
   opportunities relevant to the organization's strategy.
8. **Systemic Competences** — Describes the IT capabilities that enable and
   differentiate the organization's use of technology.
9. **IT Governance** — Defines how IT decisions, investments, and
   responsibilities are overseen.

**IV. IT Infrastructure and Processes**

10. **Architecture** — Describes the design and organization of the
    technology, applications, and infrastructure.
11. **Processes** — Covers the processes used to develop, deliver, operate,
    and maintain IT services and systems.
12. **Skills** — Captures the IT workforce's knowledge and technical and
    managerial competencies.

These are organizational and managerial conditions as well as technical ones:
senior support, leadership, trust, communication, and understanding of both
business and technical environments all affect whether alignment can be
sustained [3].

#### 1.2.1 Connection to `BusinessITAlignment_EN.ajs` and `BusinessITAlignment_FA.ajs`

The script turns part of this strategic discussion into a model-based
diagnostic. It checks modeled strategy, business processes, data, applications,
technology, and cross-layer relationships, plus operational and semantic
checks, using 112 catalogued symptoms. Examples include traceability from
goals to outcomes or capabilities, business-process support by applications,
application and technology relationships, ownership, and governance metadata.
Findings are attached to model elements and presented in a report; related
sections below describe the rule families and their research mappings in more
detail. Luftman's 12 components provide the conceptual framework for relating
the diagnostic's rule families to business–IT alignment. The checks translate
selected parts of those organizational dimensions into evidence that can be
examined in an ArchiMate model; the table below explains that translation and
where a component is not yet operationalized by an automated check [3].

##### 1.2.1.1 How the Checks Operationalize Luftman's Components

Luftman's “Assessing Business-IT Alignment Maturity” [3] supplies the
**framework-level design basis** for this crosswalk: its components identify
the organizational dimensions the diagnostic is intended to examine. The
paper defines alignment in terms of business and IT being in harmony, presents
the 12 components of the strategic alignment model, and describes a maturity
assessment based on six criteria and five maturity levels. Its assessment
process also calls for analyzing the gap between the organization's current
and desired maturity [3]. It, therefore, grounds the diagnostic's alignment dimensions
and gap-oriented purpose. Those tests are BizDiag's rule-based operationalization
of model-observable misalignment symptoms, organized against Luftman's components.
Where another research framework is the documented source of a specific symptom
family (such as`ABF.S.*`), that source gives the symptom its rule-level 
provenance within the Luftman-based diagnostic.

In another words, The 19 symptoms were **mapped retrospectively and deliberately** 
to Luftman’s 12 alignment components by comparing each rule’s defined condition 
with the organizational dimension described in his framework. This creates a 
conceptual operationalization: for example, checks for strategic traceability, 
process support, governance documentation, and skills representation test whether 
corresponding concerns are represented coherently in the ArchiMate model. The 
mapping is, therefore, reasoned, not incidental, but it is this study’s analytical 
interpretation—not a set of symptoms proposed or validated by Luftman. A triggered
check identifies its specified condition in the model; it does not, by itself, 
assess the full organizational construct or assign a Luftman maturity level
[3].

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Luftman component</th>
      <th style="border: 1px solid;">Checks operationalizing aspects of the component</th>
      <th style="border: 1px solid;">What the rules examine as model evidence</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">Business Scope</td>
      <td style="border: 1px solid;"><code>S.03</code>, <code>S.05</code>, <code>S.06</code>, <code>STR.64</code></td>
      <td style="border: 1px solid;">Connects modeled goals to capabilities and value streams, applications to goals/outcomes/capabilities, and capabilities back to goals/objectives/initiatives. This operationalizes strategic-to-operational traceability; it does not judge market or offering choices.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Distinctive Competencies</td>
      <td style="border: 1px solid;">No direct automated check</td>
      <td style="border: 1px solid;">The capability links above provide context about strategic capability coverage, but the model does not establish that a capability differentiates the organization or is difficult to imitate.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Business Governance</td>
      <td style="border: 1px solid;"><code>S.10</code>, <code>B.11</code></td>
      <td style="border: 1px solid;">Checks whether goals and business processes declare accountable owners or related responsibility metadata. This operationalizes the documentation of accountability, not the effectiveness of governance or decision-making.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Administrative Structure</td>
      <td style="border: 1px solid;"><code>ABF.S.04</code>, <code>ABF.S.05</code></td>
      <td style="border: 1px solid;">Checks process-to-role/actor or responsibility evidence and modeled reporting/hierarchy consistency or presence. These operationalize structural representation in the model; the specific <code>ABF.S.*</code> rules also retain their documented artifact-framework basis.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Processes (Organizational Infrastructure and Processes)</td>
      <td style="border: 1px solid;"><code>B.11</code>–<code>B.19</code>; executable <code>B.20</code></td>
      <td style="border: 1px solid;">Checks process ownership, data and application support, duplicates, inputs/outputs, outcome or requirement links, deprecated-technology dependencies, controls/constraints, capability links, and cadence metadata. These operationalize process-architecture completeness, not actual process performance. <code>B.20</code> is executable but absent from the 112-entry catalogue; some checks in this family are marked non-analyzable.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Skills (Organizational Infrastructure and Processes)</td>
      <td style="border: 1px solid;"><code>ABF.S.12</code></td>
      <td style="border: 1px solid;">Compares skills declared as required for product development with skills declared for modeled roles, actors, or resources. This operationalizes skills traceability for that scenario, not workforce competence generally; the rule also has its documented artifact-framework basis.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Technology Scope</td>
      <td style="border: 1px solid;">No direct automated check</td>
      <td style="border: 1px solid;">The current rules document technology choices, standards, lifecycle, and dependencies, but do not determine whether the technologies or digital opportunities are strategically relevant.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Systemic Competences</td>
      <td style="border: 1px solid;">No direct automated check</td>
      <td style="border: 1px solid;">The model may contain IT capabilities and systems, but the current rules do not measure the organization's ability to develop or use technology as a distinctive strategic competence.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">IT Governance</td>
      <td style="border: 1px solid;"><code>A.38</code>, <code>A.39</code>, <code>T.45</code></td>
      <td style="border: 1px solid;">Checks application ownership, cost/licensing records, and technology links to standards, policies, constraints, requirements, or guidelines. These operationalize governance-related accountability and documentation, not the quality of investment decisions or governance in practice.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Architecture (IT Infrastructure and Processes)</td>
      <td style="border: 1px solid;"><code>A.33</code>, <code>A.36</code>, <code>T.48</code></td>
      <td style="border: 1px solid;">Checks hosting links for applications marked critical, interface/flow links for integrated applications, and technology links to applications, services, or processes. These operationalize selected architecture relationships, not overall architectural quality or strategic fit.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Processes (IT Infrastructure and Processes)</td>
      <td style="border: 1px solid;">No dedicated automated check</td>
      <td style="border: 1px solid;">The current business-process rules (<code>B.11</code>–<code>B.20</code>) do not assess IT service-management, systems development, delivery, or operations processes.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Skills (IT Infrastructure and Processes)</td>
      <td style="border: 1px solid;"><code>ABF.S.11</code></td>
      <td style="border: 1px solid;">Checks whether modeled IT-related roles/actors declare skills or competencies. This operationalizes IT-skills documentation, not actual staff capability or workforce sufficiency; the rule also has its documented artifact-framework basis.</td>
    </tr>
  </tbody>
</table>

The 12 components are the **organizing alignment framework**; the table shows
how the implemented rules operationalize model-observable aspects of each
component and where automated coverage is absent. BizDiag therefore performs
rule-based detection of its catalogued misalignment symptoms in an ArchiMate
model. When an executable rule triggers, it detects that rule's defined
symptom in the model; this is a finding, not merely a possible concern or a
prompt to conduct a separate model check. Catalogue entries marked
non-analyzable require manual review; and this is another sign of BizDiag's
human-in-the-loop maxim.

The boundary is the conclusion that can be drawn from that detection. A
triggered rule establishes the symptom in the model as represented; it does
not, on its own, establish that the model is complete or that the represented
condition accurately describes organizational practice. Nor does BizDiag
assign Luftman's five maturity levels by assessing all six criteria through
the stakeholder evaluation described in Luftman's paper. The model cannot by
itself establish the quality of strategy, trust, communication, leadership,
partnership, realized benefits, or whether people use systems effectively.
Validate findings against organizational evidence when drawing conclusions
about business–IT misalignment beyond the model.

The broader digital-strategy context also matters: technology can reshape
products, services, processes, and competitive possibilities, while value
depends on complementary business capabilities, skills, implementation, and
effective use—not merely on acquiring IT. The script can expose some
architecture-level gaps relevant to those choices, but it does not assess an
organization's ability to sense opportunities, adapt its strategy, or
successfully realize benefits. Those questions require business analysis and
ongoing management beyond static model checks [18, pp. 38–43].

## 2. Purpose and Scope

`BusinessITAlignment_EN.ajs` and its Persian-language counterpart,
`BusinessITAlignment_FA.ajs`, are jArchi scripts for examining an ArchiMate
model for business–IT alignment symptoms. They combine a research-grounded
catalogue of symptoms with model checks, record findings against model
elements, and present findings in an interactive table and export files.
It is a model-based diagnostic aid: a finding is evidence that the modeled
architecture meets a rule's trigger, not conclusive proof that the same
condition exists in organizational practice or in a running system [4].

The scripts (both the English and the Persian-localized script) contain **112 symptom catalogue entries**:

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Aspect (<code>aspect</code> value in the script)</th>
      <th style="border: 1px solid;">Entries</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">Strategy</td>
      <td style="border: 1px solid;">18</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">CrossLayer</td>
      <td style="border: 1px solid;">24</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Business</td>
      <td style="border: 1px solid;">18</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Operational</td>
      <td style="border: 1px solid;">1</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Data</td>
      <td style="border: 1px solid;">14</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Application</td>
      <td style="border: 1px solid;">17</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Technology</td>
      <td style="border: 1px solid;">17</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Semantic</td>
      <td style="border: 1px solid;">3</td>
    </tr>
    <tr>
      <td style="border: 1px solid;"><strong>Total</strong></td>
      <td style="border: 1px solid;"><strong>112</strong></td>
    </tr>
  </tbody>
</table>

This total comprises 21 explicitly catalogued symptoms from the foundational
paper, two additional symptoms labeled **Implicit** that operationalize other
parts of its framework, and 89 supplementary entries. Two of four
framework-derived concepts reuse supplementary checks rather than creating
duplicate catalogue entries; their mappings are explained below. The aspect
names and descriptions in the inventory tables are the values in the English
script's catalogue, not a retrospective reclassification [5].

## 3. Research Basis and Conceptual Derivation

### 3.1 Strategic Alignment Model (SAM)

The foundational paper (An Artifact-Based Framework for Business-IT Misalignment 
Symptom Detection, by Dóra Őri) [5] structures its analysis around the Strategic 
Alignment Model (SAM) associated with Henderson and Venkatraman [1]. SAM treats
alignment as a relationship between business and IT across external strategy
and internal organization/infrastructure [1, 5]:

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">SAM domain in the script's framework</th>
      <th style="border: 1px solid;">Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">Business Strategy</td>
      <td style="border: 1px solid;">The organization's external business direction and choices.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">Business Structure</td>
      <td style="border: 1px solid;">The internal organization and processes through which business strategy is carried out.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">IT Strategy</td>
      <td style="border: 1px solid;">The external direction and choices for information systems and technology.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">IT Structure</td>
      <td style="border: 1px solid;">The internal IT infrastructure, systems, and processes.</td>
    </tr>
  </tbody>
</table>

SAM distinguishes **strategic fit**—consistency between external strategy and
internal structure—from **functional integration**—consistency between the
business and IT domains. The aforementioned foundational paper uses four alignment
perspectives to make these relationships assessable. Its 'Decomposition of alignment
perspectives Table' decomposes each perspective into the domain matches (components)
relevant to that perspective:

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Perspective code</th>
      <th style="border: 1px solid;">Alignment perspective</th>
      <th style="border: 1px solid;">Components in 'Decomposition of alignment perspectives Table'</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">P.01</td>
      <td style="border: 1px solid;">Strategy execution</td>
      <td style="border: 1px solid;">C.01, C.02</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">P.02</td>
      <td style="border: 1px solid;">Technology transformation</td>
      <td style="border: 1px solid;">C.03, C.04</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">P.03</td>
      <td style="border: 1px solid;">Competitive potential</td>
      <td style="border: 1px solid;">C.01, C.03</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">P.04</td>
      <td style="border: 1px solid;">Service level</td>
      <td style="border: 1px solid;">C.02, C.04</td>
    </tr>
  </tbody>
</table>

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Component code</th>
      <th style="border: 1px solid;">Domain match</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">C.01</td>
      <td style="border: 1px solid;">Business strategy and business structure</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">C.02</td>
      <td style="border: 1px solid;">Business structure and IT structure</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">C.03</td>
      <td style="border: 1px solid;">Business strategy and IT strategy</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">C.04</td>
      <td style="border: 1px solid;">IT strategy and IT structure</td>
    </tr>
  </tbody>
</table>

These are analytical viewpoints, not four separate model layers. A symptom
may therefore be relevant to more than one perspective, and an individual
ArchiMate element is not itself a complete measure of alignment.

### 3.2 The Foundational Artifact-Based Framework

Őri's foundational paper, *An Artifact-Based Framework for Business-IT
Misalignment Symptom Detection* [5], addresses the gap between identifying a
misalignment conceptually and finding evidence for it in an enterprise
architecture. Figure 1 describes the framework's construction; Figure 2 and
Section 4 describe its operation. Its framework has five connected parts:

Figure 1. Framework construction

```text
+------------------------+       +---------------------------------------+
| Meta-methodology       |------>| Artifact-Based Misalignment           |
| concept                |       | Detection                             |
+------------------------+       |                                       |
+------------------------+       |  +---------------------------------+  |
| Alignment perspective  |------>|  | Alignment perspectives          |  |
| decomposition          |       |  |                                 |  |
+------------------------+       |  |  +---------------------------+  |  |
+------------------------+       |  |  | Misalignment symptoms     |  |  |
| Misalignment symptom   |------>|  |  +-------------+-------------+  |  |
| catalogue              |       |  |                |                |  |
+------------------------+       |  |  +-------------v-------------+  |  |
+------------------------+       |  |  | Artifacts                  | |  |
| Artifact catalogue     |------>|  |  +-------------+-------------+  |  |
+------------------------+       |  |                |                |  |
+------------------------+       |  |  +-------------v-------------+  |  |
| EA analysis catalogue  |------>|  |  | EA analysis types          | |  |
+------------------------+       |  |  +---------------------------+  |  |
                                 |  +---------------------------------+  |
                                 +---------------------------------------+
```

1. **Meta-methodology:** an adaptation of Noran's meta-methodology [6] provides
   a systematic way to transform existing knowledge into a constructed
   research framework. It links concepts, models, and empirical data
   collections rather than supplying a business–IT symptom on its own.
2. **Alignment perspectives and components:** SAM perspectives organize the
   inquiry, and 'Decomposition of alignment perspectives Table' decomposes
   each perspective into the domain matches through which alignment or
   misalignment can be examined.
3. **Misalignment symptom catalogue:** Őri's 'Misalignment symptom catalogue'
   collects 21 symptoms from earlier misalignment literature. The foundational
   paper cites Carvalho and Sousa's BISMAM work [7], Pereira and Sousa's
   enterprise-architecture and business–IT alignment work [8], and Sousa, Pereira,
   and Marques's alignment heuristics [9].
4. **Artifact catalogue:** The foundational paper's 'Artifact catalogue' selects
   25 TOGAF-based architecture artifacts [10]. These are potential places in which
   evidence for a symptom may be represented; they are not 25 more symptoms.
5. **EA analysis catalogue:** The foundational paper's 'EA analysis catalogue'
   identifies eight analysis types from related EA-analysis literature [11–13].
   They describe analytical approaches that can reveal evidence in artifacts;
   the catalog itself is not a set of executable detection rules.



Figure 2. artifact-based misalignment detection framework operation

```text
+--------------------------------+
| Alignment perspectives         |
| P.01 Strategy execution        |
| P.02 Technology transformation |
| P.03 Competitive potential     |
| P.04 Service level             |
+----------------+---------------+
                 |
                 v
+--------------------------------+
| SAM component matches          |
| C.01-C.04                      |
+----------------+---------------+
                 |
                 v
+--------------------------------+
| Misalignment symptoms          |
| S.01-S.21                      |
+----------------+---------------+
                 |
                 v
+--------------------------------+
| Containing EA artifacts        |
| AF.01-AF.25                    |
+----------------+---------------+
                 |
                 v
+--------------------------------+
| Suitable EA analysis types     |
| A.01-A.08                      |
+--------------------------------+
```
In Figure 2, C.01–C.04 are the paper’s SAM domain matches (alignment components). 
They connect pairs of business/IT strategy and structure domains. The C catalogue 
is associated with the alignment perspectives.

A.01–A.08 are the paper’s EA analysis types. In the paper, it was mentioned as EA
analysis catalogue. The script stores their names and references them in symptom 
metadata to describe relevant analytical approaches.

The script’s own rule identifiers include ABF.S.01–ABF.S.21; entries can separately
reference relevant P.*, C.*, AF.*, and A.* framework codes.

The paper's operation is a traceability chain: perspective → SAM component
(domain match) → symptom → potentially containing artifact → suitable EA
analysis. There are three other tables in the foundational paper that show an
excerpt of the resulting mappings for the four perspectives. The case study 
demonstrates this logic with dependency analysis between process tasks and 
applications: a task supported by multiple applications can be examined as 
S.07 in the Strategy Execution perspective, using the application/function 
artifact and dependency analysis. This is a research framework for organizing
detection, not a complete specification of every model query or property-value test [5].

### 3.3 Translating the Framework into This Script

**Five Phases**


**“Business–IT Alignment” research methodology** — The following five phases
describe how this module organizes its Enterprise Architecture (EA) assessment.
They are a project-level summary, not a phase structure attributed to a
particular paper. The script uses BizDiag's own rules and jArchi implementation.

- **Phase 1**: Preliminary Review — The assessment is organized around six core EA domains: 
Strategy (existing checks: S.01–S.10; strategic-planning checks associated with
“How Enterprise Architecture Management Can Support Strategic IS Planning”:
STR.61–STR.67) [14],
Business Process (B.11–B.20), Data Governance (D.21–D.30), Application Portfolio (A.31–A.40), 
Technology Infrastructure (T.41–T.48), and Cross-Layer Alignment (X.49–X.60). The script 
inspects modeled elements and relationships in these domains. Additional Operational and 
Semantic checks and artifact-framework checks extend the core code families.


- **Phase 2**: Malfunctioning-Area Analysis — The script applies rules to the model’s elements, 
relationships, and—where needed—declared properties to identify potential alignment gaps. 
Findings use several code patterns, including S.01, STR.61, SEM.03, and ABF.S.12; the prefix
identifies a rule family, and the number identifies the check.


- **Phase 3**: Symptom Categorization — Each finding is associated with catalogue metadata: its EA
aspect, severity (CRITICAL, HIGH, MEDIUM, or LOW), description, and analyzability classification.
Some framework-related catalogue entries also include research mappings.


- **Phase 4**: Analyzability and Severity Filtering — The catalogue distinguishes checks marked 
analyzable from those marked non-analyzable, such as checks that may depend on metadata or 
modeling context. This flag is a classification, not a guarantee that every analyzable check 
is determined by relationships alone. In the English script, non-analyzable findings are 
included by default, and the minimum severity is LOW; the report controls allow filtering.


- **Phase 5**: Assessment and Reporting — Findings are summarized by severity and aspect, shown in
the interactive report, and exported to CSV and Excel. The script also records finding codes 
and notes on affected model elements and applies severity-based visual colors.

Therefore, each finding is represented by a JSON object describing the identified misalignment:

```json
{
"elementId": "arch-123",
"elementName": "Strategic Goal",
"elementType": "Goal",
"code": "S.01",
"severity": "CRITICAL",
"desc": "Goal without Outcome/KPI",
"documentation": "",
"analyzable": true,
"aspect": "Strategy"
}
```

**Internal Finding Records**

The internal finding record contains these fields:

The script keeps the research identifiers and the executable rule identifiers
distinct. The foundational paper's 'Misalignment symptom catalogue' codes are
`S.01`–`S.21`; those codes already have different meanings elsewhere in this 
script. The 'Misalignment symptom catalogue' rules therefore use 
`ABF.S.01`–`ABF.S.21`, with the paper's original code stored in each entry's 
`sourceCode` field. The `ABF` prefix means the entry is associated with the 
artifact-based framework; it avoids collisions and does not imply a different
symptom. The `ABF.S.*` prefix distinguishes that paper’s symptom codes from 
BizDiag’s existing `S.*` codes [5].

The code translates the paper's qualitative descriptions into model-level
criteria using ArchiMate element types, relationships, and—where the
condition cannot be established from structure alone—explicit custom
properties. It then anchors each finding to a relevant element (or to a
model-level anchor when a required construct is absent), and appends the
observed evidence and available research mappings to the finding notes. This
is a rule-based operationalization of the paper's symptom-and-artifact
approach, not an implementation of every general EA analysis named in the 
foundational paper's 'EA analysis catalogue' [5].

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
applied to model checks [5].

### 3.4 Foundational Symptom Catalogue: All 21 Symptoms of 'Misalignment Symptom Catalogue'

The symptom wording below reproduces the English script's `desc` fields.
“Paper code” is the original 'Misalignment symptom catalogue' identifier; 
“Script code” is the unique catalogue identifier. Perspective, artifact, and
analysis references use the foundational paper's identifiers [5]. An asterisk 
(`*`) marks an implicit mapping stored in an `implicitArtifacts` or `implicitAnalyses`
field, not a direct mapping from Tables 5–8.

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Script code</th>
      <th style="border: 1px solid;">Paper code</th>
      <th style="border: 1px solid;">Catalogue symptom</th>
      <th style="border: 1px solid;">Aspect / severity</th>
      <th style="border: 1px solid;">Perspective(s)</th>
      <th style="border: 1px solid;">Artifact(s)</th>
      <th style="border: 1px solid;">EA analysis/analyses</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">ABF.S.01</td>
      <td style="border: 1px solid;">S.01</td>
      <td style="border: 1px solid;">Undefined organizational mission, strategy and goals</td>
      <td style="border: 1px solid;">Strategy / HIGH</td>
      <td style="border: 1px solid;">P.01</td>
      <td style="border: 1px solid;">AF.01, AF.06</td>
      <td style="border: 1px solid;">A.01, A.03</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.02</td>
      <td style="border: 1px solid;">S.02</td>
      <td style="border: 1px solid;">Undefined business process goals, business process owners</td>
      <td style="border: 1px solid;">Business / HIGH</td>
      <td style="border: 1px solid;">—</td>
      <td style="border: 1px solid;">AF.01*, AF.06*, AF.11*</td>
      <td style="border: 1px solid;">A.01*, A.03*</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.03</td>
      <td style="border: 1px solid;">S.03</td>
      <td style="border: 1px solid;">Lack of relation between process goals and organizational goals</td>
      <td style="border: 1px solid;">CrossLayer / HIGH</td>
      <td style="border: 1px solid;">P.01, P.03</td>
      <td style="border: 1px solid;">AF.06, AF.15</td>
      <td style="border: 1px solid;">A.01</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.04</td>
      <td style="border: 1px solid;">S.04</td>
      <td style="border: 1px solid;">Undefined business roles or responsibilities</td>
      <td style="border: 1px solid;">Business / MEDIUM</td>
      <td style="border: 1px solid;">—</td>
      <td style="border: 1px solid;">AF.02*, AF.05*, AF.10*</td>
      <td style="border: 1px solid;">A.03*</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.05</td>
      <td style="border: 1px solid;">S.05</td>
      <td style="border: 1px solid;">Undefined or multiple organizational hierarchies or reporting lines</td>
      <td style="border: 1px solid;">Business / MEDIUM</td>
      <td style="border: 1px solid;">P.03</td>
      <td style="border: 1px solid;">AF.02, AF.08, AF.09, AF.10</td>
      <td style="border: 1px solid;">—</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.06</td>
      <td style="border: 1px solid;">S.06</td>
      <td style="border: 1px solid;">Application functionality does not support at least one business process task</td>
      <td style="border: 1px solid;">CrossLayer / HIGH</td>
      <td style="border: 1px solid;">P.01</td>
      <td style="border: 1px solid;">AF.08, AF.16</td>
      <td style="border: 1px solid;">A.01</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.07</td>
      <td style="border: 1px solid;">S.07</td>
      <td style="border: 1px solid;">A business process task is supported by more than one application</td>
      <td style="border: 1px solid;">CrossLayer / MEDIUM</td>
      <td style="border: 1px solid;">P.01</td>
      <td style="border: 1px solid;">AF.15, AF.16</td>
      <td style="border: 1px solid;">A.03</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.08</td>
      <td style="border: 1px solid;">S.08</td>
      <td style="border: 1px solid;">Critical business process does not depend on scalable and available applications</td>
      <td style="border: 1px solid;">CrossLayer / CRITICAL</td>
      <td style="border: 1px solid;">—</td>
      <td style="border: 1px solid;">AF.04*, AF.20*, AF.23*, AF.24*</td>
      <td style="border: 1px solid;">A.02*, A.07*</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.09</td>
      <td style="border: 1px solid;">S.09</td>
      <td style="border: 1px solid;">Inappropriate application functionality</td>
      <td style="border: 1px solid;">Application / HIGH</td>
      <td style="border: 1px solid;">P.01</td>
      <td style="border: 1px solid;">AF.15, AF.16, AF.19, AF.20</td>
      <td style="border: 1px solid;">A.01</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.10</td>
      <td style="border: 1px solid;">S.10</td>
      <td style="border: 1px solid;">Insufficient IT resources</td>
      <td style="border: 1px solid;">Technology / HIGH</td>
      <td style="border: 1px solid;">P.02</td>
      <td style="border: 1px solid;">AF.07</td>
      <td style="border: 1px solid;">A.05</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.11</td>
      <td style="border: 1px solid;">S.11</td>
      <td style="border: 1px solid;">Lack of IT skills and competencies</td>
      <td style="border: 1px solid;">Technology / MEDIUM</td>
      <td style="border: 1px solid;">P.02, P.03</td>
      <td style="border: 1px solid;">AF.02, AF.03, AF.10</td>
      <td style="border: 1px solid;">A.03</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.12</td>
      <td style="border: 1px solid;">S.12</td>
      <td style="border: 1px solid;">Lack of skills to develop or innovate certain types of products</td>
      <td style="border: 1px solid;">Business / MEDIUM</td>
      <td style="border: 1px solid;">P.03</td>
      <td style="border: 1px solid;">AF.03, AF.07</td>
      <td style="border: 1px solid;">A.03</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.13</td>
      <td style="border: 1px solid;">S.13</td>
      <td style="border: 1px solid;">Poor IT planning and portfolio management</td>
      <td style="border: 1px solid;">Application / HIGH</td>
      <td style="border: 1px solid;">P.02, P.03</td>
      <td style="border: 1px solid;">AF.07</td>
      <td style="border: 1px solid;">A.01, A.03, A.06</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.14</td>
      <td style="border: 1px solid;">S.14</td>
      <td style="border: 1px solid;">Under-capacity infrastructure</td>
      <td style="border: 1px solid;">Technology / HIGH</td>
      <td style="border: 1px solid;">P.04</td>
      <td style="border: 1px solid;">AF.24</td>
      <td style="border: 1px solid;">A.02</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.15</td>
      <td style="border: 1px solid;">S.15</td>
      <td style="border: 1px solid;">Lack or poor systems performance monitoring</td>
      <td style="border: 1px solid;">Technology / HIGH</td>
      <td style="border: 1px solid;">P.02</td>
      <td style="border: 1px solid;">AF.15, AF.21, AF.24, AF.25</td>
      <td style="border: 1px solid;">A.03, A.05, A.07</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.16</td>
      <td style="border: 1px solid;">S.16</td>
      <td style="border: 1px solid;">Out-of-date technological infrastructure</td>
      <td style="border: 1px solid;">Technology / HIGH</td>
      <td style="border: 1px solid;">—</td>
      <td style="border: 1px solid;">AF.22*, AF.24*, AF.25*</td>
      <td style="border: 1px solid;">A.03*, A.08*</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.17</td>
      <td style="border: 1px solid;">S.17</td>
      <td style="border: 1px solid;">Technological heterogeneity</td>
      <td style="border: 1px solid;">Technology / MEDIUM</td>
      <td style="border: 1px solid;">P.04</td>
      <td style="border: 1px solid;">AF.22, AF.23, AF.24</td>
      <td style="border: 1px solid;">A.08</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.18</td>
      <td style="border: 1px solid;">S.18</td>
      <td style="border: 1px solid;">Incompatible platforms or technologies</td>
      <td style="border: 1px solid;">Technology / HIGH</td>
      <td style="border: 1px solid;">—</td>
      <td style="border: 1px solid;">AF.17*, AF.23*, AF.24*</td>
      <td style="border: 1px solid;">A.04*, A.06*, A.08*</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.19</td>
      <td style="border: 1px solid;">S.19</td>
      <td style="border: 1px solid;">Frequent periods while applications are unavailable</td>
      <td style="border: 1px solid;">Technology / CRITICAL</td>
      <td style="border: 1px solid;">P.04</td>
      <td style="border: 1px solid;">AF.18</td>
      <td style="border: 1px solid;">A.07</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.20</td>
      <td style="border: 1px solid;">S.20</td>
      <td style="border: 1px solid;">Information consistency or integrity problems</td>
      <td style="border: 1px solid;">Data / HIGH</td>
      <td style="border: 1px solid;">P.04</td>
      <td style="border: 1px solid;">AF.12, AF.13, AF.25</td>
      <td style="border: 1px solid;">A.07</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.21</td>
      <td style="border: 1px solid;">S.21</td>
      <td style="border: 1px solid;">Undefined business service levels</td>
      <td style="border: 1px solid;">Business / HIGH</td>
      <td style="border: 1px solid;">P.04</td>
      <td style="border: 1px solid;">AF.04</td>
      <td style="border: 1px solid;">A.03</td>
    </tr>
  </tbody>
</table>

The table deliberately reproduces the script's catalogue text rather than
silently replacing it with quotations from the paper. The wording is
semantically aligned but not verbatim in every row: for example, the script's
S.05 says “organizational hierarchies or reporting lines” where Őri's 
'Misalignment symptom catalogue' says “hierarchy or lines of reporting”;
S.07 adds an article, and S.14 hyphenates “under-capacity.” The original 
'Misalignment symptom catalogue' identifier is retained in the adjacent Paper
code column.

#### 3.4.1 What the 'Misalignment Symptom Catalogue' Checks Examine

The paper names symptoms at a conceptual level. The following summarizes how
the current script seeks model evidence for them [5]:

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Script codes</th>
      <th style="border: 1px solid;">Model evidence used by the rule</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">ABF.S.01</td>
      <td style="border: 1px solid;">Checks for Goal elements and modeled mission and strategy evidence, which may be represented by element types, names, documentation, or mission/strategy properties. When a required construct is absent, the finding is attached to a model element as an anchor.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.02–ABF.S.05</td>
      <td style="border: 1px solid;">Examines process-goal links, declared ownership, role/responsibility links or properties, and organizational hierarchy/reporting relationships. A standalone organizational root is allowed; absence of hierarchy evidence is flagged only for a multi-element organizational structure.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.06–ABF.S.07</td>
      <td style="border: 1px solid;">Examines application links from modeled process tasks. Where task-level elements are unavailable, leaf process elements are used as the model's task-granularity proxy. The rules distinguish no supporting application from multiple supporting applications.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.08</td>
      <td style="border: 1px solid;">Applies to a process explicitly identified as critical. It checks for a linked application and modeled evidence of both scalability/capacity and availability/resilience; either property by itself is insufficient.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.09–ABF.S.10</td>
      <td style="border: 1px solid;">Uses an explicit negative application-fit status, or declared resource capacity/demand values or adequacy status.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.11–ABF.S.13</td>
      <td style="border: 1px solid;">Checks whether IT roles/resources declare skills, whether declared product-development skills are represented among modeled roles/resources, and whether an application has a negative planning/portfolio/governance status.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.14–ABF.S.18</td>
      <td style="border: 1px solid;">Examines infrastructure capacity and lifecycle/support status, monitoring declarations or modeled monitoring services, technology heterogeneity/coherence declarations, and explicit platform/interoperability compatibility evidence.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.S.19–ABF.S.21</td>
      <td style="border: 1px solid;">Checks explicit application availability status, data integrity/consistency evidence, and business service-level declarations or related measures/contracts/requirements.</td>
    </tr>
  </tbody>
</table>

Not every real-world condition can be inferred from an ArchiMate relationship
graph. Several checks intentionally rely on declared properties or explicit
status values. For example, a missing monitoring link is a model
documentation/coverage gap, not proof that operational monitoring does not
exist. Likewise, a missing deployment relationship is not proof that an
application is not hosted, and a model that does not declare a role
assignment does not establish that no person performs that role.

### 3.5 Implicit Symptoms Derived from the Foundational Framework

The foundational paper's artifact and analysis catalogues add detection
structure beyond 'Misalignment symptom catalogue', but they are not themselves
additional symptom lists. Applying that structure makes further traceability and
consistency checks possible [5]. The script documents four such concepts as IF.01–IF.04:

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Framework concept</th>
      <th style="border: 1px solid;">Mapping in the script</th>
      <th style="border: 1px solid;">How it avoids duplicate symptoms</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">IF.01 — driver/goal traceability</td>
      <td style="border: 1px solid;"><code>STR.62</code> and <code>STR.65</code></td>
      <td style="border: 1px solid;">Existing checks cover goals without associated drivers and drivers not addressed by strategy. No additional catalogue entry is created.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">IF.02 — business function/service to application realization</td>
      <td style="border: 1px solid;"><code>OB.68</code> and <code>SEM.01</code></td>
      <td style="border: 1px solid;">Existing checks cover business-function implementation coverage and business-service realization. No additional catalogue entry is created.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">IF.03 — application-to-technology deployment traceability</td>
      <td style="border: 1px solid;"><code>A.33</code> for business-critical applications; <code>ABF.I.01</code> for other application components</td>
      <td style="border: 1px solid;">The critical-app check is reused. <code>ABF.I.01</code> adds the complementary noncritical application-component coverage, avoiding overlap for critical applications.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">IF.04 — actor/role mapping consistency</td>
      <td style="border: 1px solid;"><code>ABF.I.02</code></td>
      <td style="border: 1px solid;">Adds a check for explicitly declared actor/role references that cannot be resolved to a model element or relationship. It does not treat an unspecified assignment as a missing assignment.</td>
    </tr>
  </tbody>
</table>

The two additional standalone catalogue entries are:

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Script code</th>
      <th style="border: 1px solid;">Exact catalogue description</th>
      <th style="border: 1px solid;">Aspect / severity</th>
      <th style="border: 1px solid;">Encoded framework mapping</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">ABF.I.01</td>
      <td style="border: 1px solid;">Implicit: application component has no modeled link to its deployment technology</td>
      <td style="border: 1px solid;">Technology / HIGH</td>
      <td style="border: 1px solid;">C.04; P.02, P.04; AF.21, AF.23, AF.24; A.01, A.03, A.07</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">ABF.I.02</td>
      <td style="border: 1px solid;">Implicit: explicitly declared actor-role assignments are unresolved or not modeled</td>
      <td style="border: 1px solid;">Business / MEDIUM</td>
      <td style="border: 1px solid;">C.01; P.03; AF.02, AF.05, AF.09, AF.10; A.03</td>
    </tr>
  </tbody>
</table>

“Implicit” describes the framework derivation: these two concepts are not
separately enumerated among the foundational paper's 21 symptoms, mentioned
in the 'Misalignment symptom catalogue' [5]. Their findings also state the limits
of the model evidence. The checks do not claim that the underlying runtime 
deployment or human assignment is absent when only the model relationship is 
missing.

### 3.6 Foundational Paper's Artifact Catalogue

The following are the 25 artifact identifiers and names in the script's
`ABF_ARTIFACT_CATALOGUE`, corresponding to the 'Artifact catalogue' of the 
foundational paper. The short purpose descriptions summarize the content in 
that table. They identify model/documentation contexts that can contain evidence; 
they are not additional symptom codes [5].

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Artifact name in script</th>
      <th style="border: 1px solid;">Role in the framework</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">AF.01</td>
      <td style="border: 1px solid;">Driver/goal/objective catalogue</td>
      <td style="border: 1px solid;">Cross-organizational reference for drivers, goals, objectives, and driver fulfilment.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.02</td>
      <td style="border: 1px solid;">Role catalogue</td>
      <td style="border: 1px solid;">Organization's roles and authorization levels.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.03</td>
      <td style="border: 1px solid;">Business service/function catalogue</td>
      <td style="border: 1px solid;">Business functions and services, including functional decomposition.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.04</td>
      <td style="border: 1px solid;">Contract/measure catalogue</td>
      <td style="border: 1px solid;">Agreed service contracts and their measures.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.05</td>
      <td style="border: 1px solid;">Actor/role matrix</td>
      <td style="border: 1px solid;">Mapping of actors to roles.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.06</td>
      <td style="border: 1px solid;">Business footprint diagram</td>
      <td style="border: 1px solid;">Relationships among goals, units, functions, services, and delivering technical components.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.07</td>
      <td style="border: 1px solid;">Functional decomposition diagram</td>
      <td style="border: 1px solid;">Capabilities and functions within the organization.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.08</td>
      <td style="border: 1px solid;">Goal/objective/service diagram</td>
      <td style="border: 1px solid;">Contribution of services to business goals and strategy.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.09</td>
      <td style="border: 1px solid;">Business use-case diagram</td>
      <td style="border: 1px solid;">Consumers and providers of business services.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.10</td>
      <td style="border: 1px solid;">Organizational decomposition diagram</td>
      <td style="border: 1px solid;">Organizational actors, roles, and locations in an organizational structure.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.11</td>
      <td style="border: 1px solid;">Process flow diagram</td>
      <td style="border: 1px solid;">Task sequence and relationships within a business process.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.12</td>
      <td style="border: 1px solid;">Data entity/data component catalogue</td>
      <td style="border: 1px solid;">Enterprise data entities and components.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.13</td>
      <td style="border: 1px solid;">Data entity/business function matrix</td>
      <td style="border: 1px solid;">Links between data entities and business functions.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.14</td>
      <td style="border: 1px solid;">Data migration diagram</td>
      <td style="border: 1px solid;">Data movement from source to target applications.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.15</td>
      <td style="border: 1px solid;">Application portfolio catalogue</td>
      <td style="border: 1px solid;">Applications maintained across the organization.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.16</td>
      <td style="border: 1px solid;">Application/function matrix</td>
      <td style="border: 1px solid;">Links between applications and business functions.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.17</td>
      <td style="border: 1px solid;">Application interaction matrix</td>
      <td style="border: 1px solid;">Communications relationships between applications.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.18</td>
      <td style="border: 1px solid;">Application and user location diagram</td>
      <td style="border: 1px solid;">Geographic distribution of applications and users.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.19</td>
      <td style="border: 1px solid;">Application use-case diagram</td>
      <td style="border: 1px solid;">Consumers and providers of application services.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.20</td>
      <td style="border: 1px solid;">Process/application realization diagram</td>
      <td style="border: 1px solid;">Application sequence involved in realizing business processes.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.21</td>
      <td style="border: 1px solid;">Software distribution diagram</td>
      <td style="border: 1px solid;">Deployment of physical applications across technology and locations.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.22</td>
      <td style="border: 1px solid;">Technology portfolio catalogue</td>
      <td style="border: 1px solid;">Technology assets maintained across the organization.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.23</td>
      <td style="border: 1px solid;">Application/technology matrix</td>
      <td style="border: 1px solid;">Mapping from applications to technology platforms.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.24</td>
      <td style="border: 1px solid;">Platform decomposition diagram</td>
      <td style="border: 1px solid;">Infrastructure and technology-platform structure.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">AF.25</td>
      <td style="border: 1px solid;">Processing diagram</td>
      <td style="border: 1px solid;">Deployable code/configuration units and their deployment to technology platforms.</td>
    </tr>
  </tbody>
</table>

### 3.7 Foundational Paper's EA Analysis Catalogue

The script's `ABF_ANALYSIS_CATALOGUE` preserves the foundational paper's 
'EA analysis catalogue' eight analysis identifiers. The descriptions below
follow the catalogue names in the script; the purpose column condenses the
paper's accompanying definitions [5].

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Analysis name in script</th>
      <th style="border: 1px solid;">Purpose in the paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">A.01</td>
      <td style="border: 1px solid;">Dependency analysis</td>
      <td style="border: 1px solid;">Analyze direct/indirect relationships and dependencies; can support impact analysis.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.02</td>
      <td style="border: 1px solid;">Network analysis</td>
      <td style="border: 1px solid;">Examine the architecture as a network of connected entities.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.03</td>
      <td style="border: 1px solid;">Coverage analysis</td>
      <td style="border: 1px solid;">Examine domain networks/elements and whether business structures are covered by supporting applications.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.04</td>
      <td style="border: 1px solid;">Interface analysis</td>
      <td style="border: 1px solid;">Examine interfaces between application systems.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.05</td>
      <td style="border: 1px solid;">Complexity analysis</td>
      <td style="border: 1px solid;">Examine architecture complexity through components and relationships.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.06</td>
      <td style="border: 1px solid;">Enterprise interoperability assessment</td>
      <td style="border: 1px solid;">Assess interoperability among architecture entities and domains.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.07</td>
      <td style="border: 1px solid;">Enterprise coherence assessment</td>
      <td style="border: 1px solid;">Examine coherence among architecture entities and domains.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.08</td>
      <td style="border: 1px solid;">Heterogeneity analysis</td>
      <td style="border: 1px solid;">Examine heterogeneity in IT assets.</td>
    </tr>
  </tbody>
</table>

These identifiers are provenance and method metadata in this implementation.
They do **not** mean that the script invokes a general-purpose dependency,
network, interoperability, or coherence-analysis engine. The executable
checks are the specific rules described in this document; the analysis names
explain the analytical lens associated with a symptom in the paper's
framework.

### 3.8 Supplementary Symptom Catalogue

The following 89 entries supplement the 21 foundational symptoms of 
'Misalignment symptom catalogue' and the two standalone implicit entries. 
Their descriptions and groupings reproduce the English script catalogue. 
The supplementary checks include business, application, technology, data,
cross-layer, operational, and semantic concerns. Many are plausible 
business–IT alignment indicators, but the catalogue is broader than a direct
reproduction of the foundational paper's 'Misalignment symptom catalogue'. 
A model finding indicates that the encoded condition was detected; it does 
not by itself establish the cause, organizational impact, or real-world state.

The supplementary entries were developed by synthesizing the additional
research listed in “Supplementary literature and provenance.” Since these
works address overlapping subjects—strategic planning, operational
alignment, architecture analysis, and model quality—the relationship is
described by code family and research theme rather than implying that every
rule is a verbatim symptom from a single publication [2, 14–17]. The tables below retain
the exact code and catalogue wording from the English script.

#### 3.8.1 Strategy (17 Supplementary Entries)

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Severity</th>
      <th style="border: 1px solid;">Catalogue description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">S.01</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Goal without Outcome/KPI</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.02</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Outcome without measurable status</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.03</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Goal without Capability support</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.04</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Goal mentions scale but no capacity/resource</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.05</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Strategy not mapped to value streams</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.06</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Applications not linked to strategy/outcomes</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.07</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Missing risk mappings</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.08</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Duplicate/conflicting strategic items</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.09</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Strategy missing timeframe/priority</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">S.10</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Strategy elements lacking owner/stakeholder</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">STR.61</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Vision exists but lacks supporting mission mapping</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">STR.62</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Strategic goal missing associated driver/motivation</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">STR.63</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Goal lacks assessment/outcome analysis of driver</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">STR.64</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Organizational capability not supporting any strategic goal</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">STR.65</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">External factor/driver not addressed by any strategy</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">STR.66</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Resource or capability unused by any strategic goal/initiative</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">STR.67</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Competitive advantage not supported by mapped capabilities</td>
    </tr>
  </tbody>
</table>

#### 3.8.2 CrossLayer (20 Supplementary Entries)

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Severity</th>
      <th style="border: 1px solid;">Catalogue description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">X.61</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Pattern declared but not realized/implemented in model</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.62</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Shared service declared but single consumer</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.49</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">End-to-end traceability broken (Goal -&gt; Capability -&gt; Process -&gt; App)</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.50</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Value streams not supported by processes or IT</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">P.81</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Pattern declared but missing configuration/params</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">P.82</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Pattern variant mismatch detection (multiple variants declared for the same pattern without explicit product/variant mapping)</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">P.83</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Declared pattern element without expected child types</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.51</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Capability supports goals but not supported by IT</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.52</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Capability supports goals but not supported by IT</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.53</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Business functions using data that no application provides</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.54</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Operational activities missing KPIs</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.55</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Services lacking SLA or owner</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.56</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Missing change impact mapping</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.57</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Third-party/vendor risks not linked to usage</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.58</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Service dependencies not documented</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.59</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Missing business continuity mapping</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">X.60</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Critical capability lacks measurable outcome</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.74</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Business Process missing functional link to Application layer (cross-layer consistency violation)</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.75</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Data Object lacks cross-layer mapping between Business and IT layers</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.79</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Business Function has multiple conflicting Application implementations (duplicate implementations)</td>
    </tr>
  </tbody>
</table>

#### 3.8.3 Business (12 Supplementary Entries)

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Severity</th>
      <th style="border: 1px solid;">Catalogue description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">B.11</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Process without owner</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">B.12</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Process not using any data entities</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">B.13</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Process without application support</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">B.14</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Process redundancy</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">B.15</td>
      <td style="border: 1px solid;">LOW</td>
      <td style="border: 1px solid;">Process with no inputs or outputs</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">B.16</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Process lacking SLA/KPI</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">B.17</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Process depends on deprecated tech</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">B.18</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Process missing controls/constraints</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">B.19</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Process not mapped to capability</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.68</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Business Function has no corresponding Application implementation (coverage gap)</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.70</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Business Function implemented by multiple unrelated Application functions (overimplementation)</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.77</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Business Function operates in isolation without cross-functional integration (functional silo)</td>
    </tr>
  </tbody>
</table>

#### 3.8.4 Operational (1 Supplementary Entry)

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Severity</th>
      <th style="border: 1px solid;">Catalogue description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">OB.80</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Product Line architecture lacks feature/guard mapping</td>
    </tr>
  </tbody>
</table>

#### 3.8.5 Data (13 Supplementary Entries)

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Severity</th>
      <th style="border: 1px solid;">Catalogue description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">D.21</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Data entity not used by any process</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.22</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Duplicate/overlapping data entities</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.23</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Data missing CRUD mapping</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.24</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Sensitive data without security controls</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.25</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Data not stored by any application</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.26</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Data used by Application has no business owner</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.27</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Data lineage incomplete</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.28</td>
      <td style="border: 1px solid;">LOW</td>
      <td style="border: 1px solid;">Data retention not defined</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.29</td>
      <td style="border: 1px solid;">LOW</td>
      <td style="border: 1px solid;">No data classification present</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">D.30</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">No data classification present</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.72</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">IT Data Concept lacks mapping to Business data entity</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.73</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Business Data Entity lacks corresponding IT persistence/storage</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">SEC.85</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Sensitive data without explicit security mapping to controls, access control or security components</td>
    </tr>
  </tbody>
</table>

#### 3.8.6 Application (15 Supplementary Entries)

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Severity</th>
      <th style="border: 1px solid;">Catalogue description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">A.31</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Application not supporting any business need</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.32</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Application duplication</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.33</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Business-critical app missing hosting technology</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.34</td>
      <td style="border: 1px solid;">LOW</td>
      <td style="border: 1px solid;">Application missing lifecycle metadata</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.35</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Shadow IT heuristic</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.36</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Application missing interface mapping</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.37</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Application depends on deprecated tech</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.38</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Application missing owner/steward</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.39</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Application missing licensing/run-cost info</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">A.40</td>
      <td style="border: 1px solid;">LOW</td>
      <td style="border: 1px solid;">Application naming inconsistent</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">EV.90</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">async=true but no relation to MessageBroker/EventBus/Queue found</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.69</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Application Function not linked to any Business Process (orphaned IT functionality)</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.71</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Application Function used by too many Business Processes (monolithic reuse)</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.76</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Application developed for technical reasons without direct Business justification (pure technical integration)</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">OB.78</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Single Application implements too many Business Functions (monolithic architecture)</td>
    </tr>
  </tbody>
</table>

#### 3.8.7 Technology (8 Supplementary Entries)

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Severity</th>
      <th style="border: 1px solid;">Catalogue description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">T.41</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Deprecated technology still in use</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">T.42</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Single point of failure</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">T.43</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Technology missing redundancy/backup mapping</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">T.44</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Application uses unsupported platform</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">T.45</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Technology missing standards/governance constraints</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">T.46</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Technology asset missing lifecycle metadata</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">T.47</td>
      <td style="border: 1px solid;">HIGH</td>
      <td style="border: 1px solid;">Sensitive tech deployed without required controls</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">T.48</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Infrastructure missing service mapping</td>
    </tr>
  </tbody>
</table>

#### 3.8.8 Semantic (3 Supplementary Entries)

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Code</th>
      <th style="border: 1px solid;">Severity</th>
      <th style="border: 1px solid;">Catalogue description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;">SEM.01</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Business Service not realized by Application Service</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">SEM.02</td>
      <td style="border: 1px solid;">MEDIUM</td>
      <td style="border: 1px solid;">Orphaned Application Service not providing Business Service</td>
    </tr>
    <tr>
      <td style="border: 1px solid;">SEM.03</td>
      <td style="border: 1px solid;">CRITICAL</td>
      <td style="border: 1px solid;">Critical Business Service lacks complete IT support chain</td>
    </tr>
  </tbody>
</table>

**Catalogue wording note:** these tables reproduce the `desc` field, not
necessarily the detector's section heading or instance-specific evidence.
Accordingly, duplicate description strings in the script are retained as
written: D.29 and D.30 both say “No data classification present,” and X.51
and X.52 both say “Capability supports goals but not supported by IT.” The
codes remain distinct catalogue entries.

## 4. Supplementary Literature and Provenance

Luftman's 12 components provide the alignment diagnostic's **top-level
conceptual design framework**; the supplementary rules operationalize
model-observable aspects of that framework where feasible. This framework-level
basis is distinct from the **rule-level provenance** of an individual symptom.
The code does not attribute every supplementary check to a particular
publication or establish that a rule reproduces an author's instrument. The
`STR.61`–`STR.67` comments name Zoltán Szabó and Dóra Őri's
“How Enterprise Architecture Management Can Support Strategic IS Planning” [14].
The `OB.68`–`OB.79` comments name Pascal André et al.'s “Assessing Operational
Business-IT Alignment for Architecture Improvement” [16]; this association reflects
the project's existing bibliography and topic, but cannot be independently
verified against a source copy because no companion `papers` directory or paper
PDFs are present in this checkout. These comments identify the research
references, not proof that every rule is a verbatim or validated reproduction.
Other literature associations below are conceptual context, not verified
rule-level provenance [3].

<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid;">Exact code identifiers checked in the English script</th>
      <th style="border: 1px solid;">Evidence and appropriate provenance claim</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid;"><code>STR.61</code>–<code>STR.67</code></td>
      <td style="border: 1px solid;">The code comments identify Zoltán Szabó and Dóra Őri's “How Enterprise Architecture Management Can Support Strategic IS Planning” [14] and describe strategic-planning completeness and driver-response alignment. <code>STR.61</code>–<code>STR.66</code> have executable checks. <code>STR.67</code> is explicitly a non-analyzable manual-review placeholder, not an automatic detection rule.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;"><code>OB.68</code>–<code>OB.79</code></td>
      <td style="border: 1px solid;">The code comments identify Pascal André et al.'s “Assessing Operational Business-IT Alignment for Architecture Improvement” [16] and describe checks of operational alignment between business processes and application implementations. The project associates this title with the block based on its bibliography and topic; the mapping cannot be independently verified against a source copy in this checkout. The comment is not evidence that each check duplicates that paper's method or findings.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;"><code>ABF.S.01</code>–<code>ABF.S.21</code></td>
      <td style="border: 1px solid;">These are the 21 symptoms attributed in the code to Dóra Őri's “An Artifact-Based Framework for Business-IT Misalignment Symptom Detection” [5]. The script uses the distinct <code>ABF.S.*</code> prefix to preserve the paper's source codes without colliding with its pre-existing <code>S.*</code> checks. The script's severity labels and executable model tests are its own implementation choices.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;"><code>ABF.I.01</code>–<code>ABF.I.02</code></td>
      <td style="border: 1px solid;">These are two additional checks derived from relationships in “An Artifact-Based Framework for Business-IT Misalignment Symptom Detection” [5], not two more symptoms in its 21-item symptom catalogue. The code labels their mappings as implicit applications of that framework.</td>
    </tr>
    <tr>
      <td style="border: 1px solid;"><code>S.01</code>–<code>S.10</code>; <code>B.11</code>–<code>B.19</code>; <code>D.21</code>–<code>D.30</code>; <code>A.31</code>–<code>A.40</code>; <code>T.41</code>–<code>T.48</code>; <code>X.49</code>–<code>X.62</code>; <code>OB.80</code>; <code>SEM.01</code>–<code>SEM.03</code>; <code>P.81</code>–<code>P.83</code>; <code>EV.90</code>; <code>SEC.85</code></td>
      <td style="border: 1px solid;">These remaining supplementary catalogue entries have executable checks. Luftman's 12 components provide the diagnostic's top-level alignment framework, and these rules operationalize model-observable aspects of relevant components; the code does not cite Luftman as the verbatim or separately validated source of each individual rule [3]. “Strategic Alignment: Leveraging Information Technology for Transforming Organizations” (Henderson and Venkatraman) [1], “Exploring Business Strategy Modelling with ArchiMate: A Case Study Approach” (Kitsios et al.) [15], “Testing Enterprise Application Architecture Patterns” (Choudhry) [17], and <em>The Strategic Management of Information Systems: Building a Digital Strategy</em> (Peppard and Ward) [2] inform the broader conceptual discussion. Other cited EA and research-method works likewise provide context, not a code-level provenance mapping [6, 11–13, 18].</td>
    </tr>
    <tr>
      <td style="border: 1px solid;"><code>B.20</code> (execution/catalogue discrepancy)</td>
      <td style="border: 1px solid;">The English script has an executable <code>B.20</code> check, but <code>B.20</code> is absent from <code>SYMPTOM_CATALOGUE</code>; it is therefore not one of the 112 catalogue entries and has no catalogue-defined severity or description. It is not attributed to a cited source in the code.</td>
    </tr>
  </tbody>
</table>

The Luftman crosswalk in the Introduction describes the **framework-level
design basis** and how its components are operationalized as model-level
symptom checks [3]. Rule-level attributions to other research frameworks are 
recorded separately above. The catalogue contains 112 entries (21 foundational 
symptoms, two implicit framework checks, and 89 supplementary entries); the 
separate executable-but-uncatalogued <code>B.20</code> check is the exception 
noted in the table.

## 5. Running the Script and Interpreting Results

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

### 5.1 Reading a Finding Responsibly

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
explicit 'Misalignment symptom catalogue'. Catalogue presence means the script
contains a corresponding rule definition; it does not mean every rule will produce
a finding in every model, or that every model element is expected to satisfy every
rule.

## 6. References

[1] J. C. Henderson and N. Venkatraman, “Strategic Alignment: Leveraging
    Information Technology for Transforming Organizations,” *IBM Systems
    Journal*, vol. 32, no. 1, pp. 4–16, 1993.

[2] J. Peppard and J. Ward, *The Strategic Management of Information Systems:
     Building a Digital Strategy*, 4th ed. Wiley, 2016.

[3] J. Luftman, “Assessing Business-IT Alignment Maturity,” *Communications
     of the Association for Information Systems*, vol. 4, Art. no. 14, 2000,
     doi: 10.17705/1CAIS.00414.

[4] D. Őri, “Misalignment Symptom Detection with XML-Based Enterprise
     Architecture Model Analysis,” *Novel Directions Talk*, pp. 153–157.
     The bibliographic venue and year are not identified in the supplied
     paper copy.

[5] D. Őri, “An Artifact-Based Framework for Business-IT Misalignment Symptom
    Detection,” in *Perspectives in Business Informatics Research (PoEM
    2016)*, Lecture Notes in Business Information Processing, vol. 267,
    pp. 148–163. Springer, 2016, doi: 10.1007/978-3-319-48393-1_11.

[6] O. Noran, “A Decision Support Framework for Collaborative Networks,”
    *International Journal of Production Research*, vol. 47, no. 17,
    pp. 4813–4832, 2009.

[7] G. Carvalho and P. Sousa, “Business and Information Systems MisAlignment
    Model (BISMAM): An Holistic Model Leveraged on Misalignment and Medical
    Sciences Approaches,” in *Proc. 3rd Int. Workshop on Business/IT Alignment
    and Interoperability (BUSITAL ’08)*, CEUR Workshop Proceedings, vol. 336,
    pp. 104–119, 2008.

[8] C. M. Pereira and P. Sousa, “Enterprise Architecture: Business and IT
    Alignment,” in *Proc. 2005 ACM Symp. Applied Computing*, pp. 1344–1345,
    2005.

[9] P. Sousa, C. M. Pereira, and J. A. Marques, “Enterprise Architecture
    Alignment Heuristics,” *Microsoft Architects Journal*, vol. 4,
    pp. 34–39, 2005.

[10] The Open Group, *TOGAF® Version 9.1*, “Architecture Content Framework,”
    The Open Group, 2011.

[11] S. Buckl, F. Matthes, and C. M. Schweda, “Classifying Enterprise
    Architecture Analysis Approaches,” in *Proc. Int. Workshop on Enterprise
    Interoperability*, 2009.

[12] K. D. Niemann, *From Enterprise Architecture to IT Governance*. Springer,
    2006.

[13] R. Wagter, H. A. Proper, and D. Witte, “A Practice-Based Framework for
     Enterprise Coherence,” in *PRET 2013*, Lecture Notes in Business
     Information Processing, vol. 151, pp. 77–95. Springer, 2012.

[14] Z. Szabó and D. Őri, “How Enterprise Architecture Management Can Support
     Strategic IS Planning,” in *Information Strategy Challenges in the
     Digital Era*, 11th Int. Conf. Software, Knowledge, Information
     Management and Applications (SKIMA), 2017.

[15] F. Kitsios, G. Kyriakopoulou, and M. Kamariotou, “Exploring Business
     Strategy Modelling with ArchiMate: A Case Study Approach,” *Information*,
     vol. 13, no. 1, Art. no. 31, 2022, doi: 10.3390/info13010031.

[16] P. André, A. Benjilany, H. Bruneliere, and D. Tamzalit, “Assessing
     Operational Business-IT Alignment for Architecture Improvement,” in
     *Advances in Information Systems Development: Exploring New Horizons and
     Opportunities*, Lecture Notes in Information Systems and Organisation,
     vol. 77, pp. 231–253. Springer, 2025, doi: 10.1007/978-3-031-87880-0_12.

[17] A. A. Choudhry, *Testing Enterprise Application Architecture Patterns*,
     M.Sc. dissertation, University of Liverpool, 2006.

[18] A. R. Hevner, S. T. March, J. Park, and S. Ram, “Design Science in
     Information Systems Research,” *MIS Quarterly*, vol. 28, no. 1,
     pp. 75–105, 2004.

## 7. Author and Copyright

**Author:** Ebrahim Pak

**Copyright:** © 2026 Ebrahim Pak.
