# UML-Inspired View Module

## 1. Purpose

The UML module provides `Application_View_to_UML.ajs`, a jArchi script that creates a UML-inspired view from a
user-selected ArchiMate view. It is intended to make application architecture easier to inspect through a
component-diagram-style visual presentation, while retaining the source concepts and relationships in the ArchiMate
model.

##2.  Research basis

Kruchten's 4+1 model motivates describing software architecture through multiple views that address different
stakeholder concerns [1]. The Open Group's guidance on using ArchiMate with UML discusses how the languages can be
combined, including the use of UML diagrams to elaborate ArchiMate views [2]. These sources inform the module's
view-oriented presentation and cross-notation context; the script does **not** implement the complete 4+1 model or a
formal ArchiMate-to-UML transformation [1, 2].

The script instead creates a derivative UML-style representation within Archi: it classifies selected ArchiMate
concepts by semantic family and presents them with UML-inspired boxes, labels, and relationship styling. Its output
is still an ArchiMate view, not a native UML model or a standards-conformant UML component diagram [2], [3].

## 3. Workflow and output

1. In Archi, select the source view to transform, typically an application-architecture view.
2. Run `Application_View_to_UML.ajs`. The script reads visual objects from the selected view and includes supported
   application, data, and business concepts.
3. The script creates a new model view named `<Source View> (UML)`, lays out the selected concepts, and recreates
   supported relationships when both endpoints are present.
4. If local Ollama is available, it can enrich concepts with suggested stereotypes and documentation. If it is
   unavailable or fails, the script can continue with heuristic classifications.

Concepts and relationships outside the script's supported set are omitted or logged. The script does not verify that
the selected view is semantically appropriate, nor does AI output establish a concept's UML meaning; review the
generated view and annotations before relying on them.

## 4. Requirements

Run the script in Archi with jArchi and an open model. `sendToAI.js` is the optional local-AI integration helper; Ollama
is not required for heuristic-only generation.

## 5. Author and Copyright

**Author:** Ebrahim Pak

**Copyright:** © October 2026 Ebrahim Pak.

## 6. References

[1] P. Kruchten, “Architectural Blueprints—The ‘4+1’ View Model of Software Architecture,” *IEEE Software*, vol. 12,
no. 6, pp. 42–50, Nov. 1995.

[2] C. Armstrong, J. D. Baker, I. Band, S. Courtney, H. Jonkers, V. Muchandi, and M. Owen, “How to Use the
ArchiMate® Language with UML®,” The Open Group, Sep. 2013. [Online]. Available:
https://publications.opengroup.org/w134.

[3] The Open Group, “The Advantages of Combining the ArchiMate®, UML®, and BPMN™ Modeling Standards,” video,
Modeliosoft, 2016.
