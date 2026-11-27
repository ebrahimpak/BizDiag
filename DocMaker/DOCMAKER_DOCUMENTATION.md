# DocMaker Module

## 1. Purpose

DocMaker provides AI-infused documentation generation for selected ArchiMate elements and views. It combines jArchi 
scripts running inside Archi with a JavaScript REST communication layer and a local Ollama runtime, while Java NIO.2 
operations support Markdown and persistent JSON output.

The module separates enterprise-architecture model extraction, local AI processing, response persistence, and document 
formatting so each responsibility can be maintained or replaced independently.

### Implementation and technical rationale

DocMaker treats the ArchiMate model as the evidence source and the language model as a bounded documentation engine 
[1, 2]. `AI_Element_DocMaker_EN.ajs` reads a jArchi element proxy and combines its stable identifier, name, metaclass 
type, specialization, existing documentation, custom properties, and Markdown context exported from the containing view. 
`AI_View_DocMaker_EN.ajs` performs a higher-level extraction by sending the view name, view type, and existing 
documentation [2]. Neither script grants the model write access to the repository: inference occurs only after this 
explicit context has been serialized into a prompt.

The prompt design deliberately separates evidence from interpretation [3]. Element prompts identify values supplied by 
the model, existing documentation, and properties, and then require the response to discuss architectural role, 
dependencies, risks, opportunities, KPIs, implementation constraints, and future-state evolution while distinguishing 
assumptions from facts. The view prompt similarly directs the model to explain purpose and scope, business and technical 
context, critical relationships, and key assumptions or constraints [1]. These instructions improve consistency, but 
they do not make probabilistic output authoritative; the generated text remains a draft that an Enterprise Architect 
must validate against the modeled and real-world architecture.

Both entry scripts execute as application-oriented jArchi/SWT clients [2, 4, 5]. They discover local models by launching 
`ollama list` through `ProcessBuilder`, present a read-only model selector, and provide modal confirmation and 
batch-selection dialogs [4, 5]. Multiple elements or views are processed sequentially rather than concurrently. This 
serial orchestration avoids overlapping inference jobs, preserves deterministic update ordering, and keeps each model 
mutation or saved artifact attributable to one clearly identified source concept or view.

Element processing exposes three distinct update semantics [1]: replacement sets the source element's documentation to 
the response, append concatenates the response to the existing documentation, and “Create Assessment” creates a separate 
ArchiMate `assessment` element containing the generated analysis and an association relationship to the source element. 
The assessment branch preserves separation of concerns: the source element remains a description of the architecture 
concept, while the assessment represents an analytical judgment derived from that concept. This is an important 
provenance pattern for controlled EA repositories.

The network boundary is implemented in `AI_REST_JSON.js` using `java.net.HttpURLConnection` [6]. The transport sends a 
non-streaming JSON `POST` to `http://localhost:11434/api/generate`, with explicit UTF-8 request and response encoding 
and connect/read timeouts of 20 seconds and 120 seconds [6, 7]. The selected model is resolved from the UI parameter or 
the `AI_MODEL` environment variable; if neither supplies a model, the Ollama server's configured default behavior is 
used rather than inventing a hard-coded model name.

Response handling distinguishes transport failures from server validation [6, 7]. Successful `/api/generate` replies are 
parsed for the `response` field, while non-200 HTTP responses are classified and returned with the server error text. 
issing-model responses receive an additional deployment hint identifying the unavailable model and the `AI_MODEL` 
configuration option. The exported wrapper uses a retry loop with at most three attempts and a six-second blocking delay 
for timeout-like errors [5]; other exceptions fail immediately. This provides bounded recovery without disguising 
persistent configuration or inference failures.

Persistence is a modeled provenance mechanism rather than only a convenience format [4, 8]. The REST client determines 
the current view name, sanitizes it for use as a directory name, creates 
`documentation/<view-name>/ai_documentation.json`, and writes one entry per element. Each entry records 
`elementId`, `elementName`, `elementType`, timezone-aware ISO-8601 `timestamp`, `content`, `viewName`, `isRTL`, and 
`version`. Replacement removes all prior entries with the same element ID before insertion; append mode retains prior 
entries. Entries are sorted newest first and force-synchronized to disk through `FileChannel` and `StandardOpenOption` 
settings [8].

Markdown export exists at two levels [1, 2]. `Ollama_Olalla.ajs` reads the per-view JSON history and renders element 
sections with element ID and timestamp metadata. `Mark_it_Down.ajs` provides a more complete view exporter: it resolves 
view proxies from several jArchi collection forms, traverses contained elements, extracts view-point and diagram-note 
context, groups concepts into ArchiMate layers, records visible relationships or optionally hidden relationships, 
generates headings and anchors, and writes Markdown [2, 8]. Both formats should be treated as derived views, not 
replacements for the live repository, because they intentionally preserve source identity and timestamps while making 
content more readable for stakeholders.

Finally, deployment and governance remain local and human-controlled [3, 7]. Ollama runs as a local process, no external 
API key is required, and the prompt and generated text can remain on the user's machine [7]. Nevertheless, model 
configuration, context quality, hallucinated assumptions, sensitive EA data, and output interpretation remain 
operational concerns [3]. Software engineers should configure model availability and UTF-8 paths carefully [5, 8]; 
Enterprise Architects should review generated recommendations for cross-layer consistency, governance constraints, KPI 
measurability, and alignment with the real current and target states before publication or decision use [1, 3].

## 2. Architectural Overview

```
================================================================================
                 DocMaker Module: Architectural Overview
================================================================================

ArchiMate model and selected element or view
                    |
                    v
AI_Element_DocMaker_EN.ajs / AI_View_DocMaker_EN.ajs
                    |
                    v
Prompt construction and SWT model-selection workflow
                    |
                    v
AI_REST_JSON.js
                    |
                    v
Ollama POST /api/generate at localhost:11434
                    |
                    v
AI response text
                    |
                    v
NIO.2 JSON persistence under documentation/<view-name>/
                    |
                    v
Ollama_Olalla.ajs JSON-to-Markdown export
                    |
                    v
Mark_it_Down.ajs view or layered Markdown export
```

## 3. Data Flow Summary


```
================================================================================
                                DATA FLOW SUMMARY
================================================================================
```
```
User Input
│
├─→ Selects Element/View in Archi
│
├─→ Triggers the DocMaker Script
│
├─→ Extracts Element/View Metadata
│
├─→ Calls AI_REST_JSON.js with (prompt, element, isReplacement)
│
├─→ AI_REST_JSON.js Prepares JSON Payload
│
├─→ AI_REST_JSON.js Sends HTTP Request to Ollama
│
├─→ Ollama Processes with Local LLM
│
├─→ Ollama Returns AI-Generated Documentation (HTTP Response)
│
├─→ AI_REST_JSON.js Parses Response & Persists to documentation/ folder
│
├─→ AI_REST_JSON.js Tracks element context (ID, name, type, timestamp, content, viewName)
│
├─→ Formats as Markdown (Mark_it_Down.ajs) — optional post-processing
│
└─→ Documentation stored in documentation/{viewName}/ai_documentation.json
```

## 4. Component Responsibilities

### 4.1 jArchi Scripts

| Component | Responsibility |
|---|---|
| `AI_Element_DocMaker_EN.ajs` | Extracts selected elements, builds element context, offers replacement or append operations, and can create a linked ArchiMate Assessment. |
| `AI_View_DocMaker_EN.ajs` | Processes selected views, constructs view-level context, updates view documentation, and regenerates persisted Markdown. |
| `Ollama_Olalla.ajs` | Exports persisted JSON entries into Markdown grouped by source view and element metadata. |
| `Mark_it_Down.ajs` | Produces structural Markdown exports of ArchiMate views, including layers, diagram notes, elements, and relationships. |

### 4.2 JavaScript and Java Integration

```
┌────────────────────────────────────────────────────────────────────────┐
│ JavaScript Libraries (Communication & Utility)                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ AI_REST_JSON.js                                                        │
│   • Serializes EA data to JSON (conforming to request payload format)  │
│   • Establishes HTTP connection to Ollama and sends POST requests      │
│   • Handles timeouts and retry logic with configurable retry attempts  │
│   • Deserializes Ollama responses from JSON                            │
│   • Persists AI-generated documentation to JSON files via Java NIO.2   │
│   • Tracks element context (ID, name, type, view name, timestamps)     │
│   • Bridges jArchi data structures ↔ REST API contract                 │
│   • Used by: AI_Element_DocMaker_EN.ajs and AI_View_DocMaker_EN.ajs    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

`AI_REST_JSON.js` is the transport and persistence layer. It sends JSON over Java HTTP connections, parses Ollama 
responses, maintains versioned JSON history, and uses Java NIO.2 FileChannel operations for durable output.

### 4.3 External Runtime

Ollama runs on the user's machine and exposes the local `/api/generate` endpoint. It provides model discovery and 
inference without requiring an external API key. No cloud dependency, no API keys, and no external service calls have 
been used. Ollama can host one or more LLMs. it processes each request in context window and returns model-generated 
text in JSON response.

## 5. Key Architectural Characteristics

1. **Local AI and offline operation** - All inference can remain on the user's machine.
2. **Modularity** - Model extraction, inference, persistence, and export have separate responsibilities.
3. **Separation of concerns** - jArchi handles the repository, JavaScript handles transport and formatting, and Ollama performs inference.
4. **Human review** - Generated text is a draft and must be validated before it becomes approved EA documentation.
5. **Serial execution** - Batch elements and views are processed sequentially to limit inference load and preserve clear update order.

## 6. Typical Interaction Sequence

```text
User in Archi
  -> Right-click or select an element or view
  -> Choose Replace, Append, Create Assessment, or view documentation
  -> Select an installed Ollama model
  -> Wait for the local inference request
  -> Review the generated narrative
  -> Update the live model or assessment where applicable
  -> Inspect documentation/<view-name>/ai_documentation.json
  -> Export or review the generated Markdown
```

**Example result:** `documentation/<view-name>/documentation.md`

- Element or view provenance is preserved.
- JSON history retains timestamps and stable element IDs.
- Markdown output is available for sharing or publication.

## 7. Requirements

Run the DocMaker scripts inside Archi with jArchi and an open ArchiMate model. Ollama must be reachable at `localhost:11434`, and at least one compatible local model must be installed.

The module requires Java interop in the jArchi/GraalJS environment for SWT dialogs, HTTP connections, JSON processing, and Java NIO.2 file operations. Generated documentation is draft material and must be verified against the model and real-world architecture before architectural decisions or publication.

## 8. Author and Copyright

**Author:** Ebrahim Pak

**Copyright:** © October 2026 Ebrahim Pak.

## 9. References

[1] The Open Group, *ArchiMate® 3.2 Specification*, Berkshire, U.K., 2022.

[2] P. Beauvoir and J.-B. Sarrodie, “Archi and jArchi,” Archi. [Online]. Available:
    https://www.archimatetool.com/.

[3] A. S. Bueno, M. Eisele, and N. Vinto, *Applied AI for Enterprise Java Development:
    Leveraging Generative AI, LLMs, and Machine Learning in the Java Enterprise*,
    S. Calin, M. Potter, and G. Hyman, Eds. O’Reilly Media, 2026.

[4] Eclipse Foundation, “org.eclipse.swt.widgets Package,” SWT API documentation.
    [Online]. Available:
    https://help.eclipse.org/latest/topic/org.eclipse.platform.doc.isv/reference/api/org/eclipse/swt/widgets/package-summary.html.

[5] Oracle, “Class ProcessBuilder,” Java SE API documentation.
    [Online]. Available:
    https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ProcessBuilder.html.

[6] Oracle, “Interface HttpURLConnection,” Java SE API documentation.
    [Online]. Available:
    https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/net/HttpURLConnection.html.

[7] Ollama, “Generate a response,” Ollama API documentation. [Online]. Available:
    https://docs.ollama.com/api/generate.

[8] Oracle, “Package java.nio.file,” Java SE API documentation.
    [Online]. Available:
    https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/package-summary.html.
