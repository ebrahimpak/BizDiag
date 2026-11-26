# UML-Inspired View Module

## 1. Purpose

The UML module provides `Application_View_to_UML.ajs`, a jArchi script that creates a UML-inspired view from a
user-selected ArchiMate view. It is intended to make application architecture easier to inspect through a
component-diagram-style visual presentation, while retaining the source concepts and relationships in the ArchiMate
model.

## 2. Research basis

Kruchten's 4+1 model motivates describing software architecture through multiple views that address different
stakeholder concerns [1]. The Open Group's guidance on using ArchiMate with UML discusses how the languages can be
combined, including the use of UML diagrams to elaborate ArchiMate views [2]. These sources inform the module's
view-oriented presentation and cross-notation context; the script does **not** implement the complete 4+1 model or a
formal ArchiMate-to-UML transformation [1, 2].

The script instead creates a derivative UML-style representation within Archi: it classifies selected ArchiMate
concepts by semantic family and presents them with UML-inspired boxes, labels, and relationship styling. Its output
is still an ArchiMate view, not a native UML model or a standards-conformant UML component diagram [2], [3].

## 3. Implementing the combination of ArchiMate + UML

By combining UML, ArchiMate, and BPMN one can achieve enterprise architecture and technical architecture in one 
federated view. For instance, ArchiMate could be utilized for process maps, while BPMN could be utilized for 
detailed BPM, and UML utilized for data modeling, e.g., on conceptual, logical, or physical level of data modeling.
Moreover, one can begin with legacy models and move to higher level of abstraction representation by means of such 
an amalgamation of standards. In addition to this, the architect will be able to perform Use ***Case Modeling***, 
for modeling detailed business collaborations or application components, and ***State Machine Modeling*** for 
modeling the different states of business objects [3].

According to Desfray [3], combining ArchiMate with UML and BPMN provides a broad modeling scope, full coverage of IT and 
EA, total traceability and impact analysis support, combined documentation generation, and comprehensive coherent EA 
repository which enables enterprise continuum. Because Modelio stores requirements, business processes (BPMN), 
enterprise architecture (ArchiMate), and system/software designs (UML/SysML) inside a single unified repository, 
Impact Analysis works across modeling domains rather than being limited to a single diagram. UML provides great level of
detail, and additional modeling techniques, which tremendously empower software architects working with UML, in the 
context of enterprise architecture. Therefore, the architects can accomplish detailed UML modeling using each of the 14 
types of UML diagram modeling. They can also perform data modeling, on conceptual, logical or physical levels. Such 
architects can benefit from mapping exploitation and combined documentation generation.

Moreover, Desfray [3] demonstrates, the juxtaposition of UML and ArchiMate in a view opens up the possibility of 
refining any model element by any other model element of any metamodel, e.g., an ArchiMate business object could be 
mapped to a UML business class, or mapping business collaboration to use case. 

Modelio’s UML Profiles provide a UML/ArchiMate lightweight, flexible, and dynamic shared mechanism for extending UML 
meta-classes through stereotypes and tagged values. By utilizing this mechanism, a UML developer can apply the profile 
on an existing model, even if the developer is in the middle of a project, the developer can use the other extension, 
ArchiMate  [3]. This Profile mechanism in Modelio has encouraged the creator and architect of BizDiag, Pak, to provide 
Archi with such a similar mechanism. However, there has been some limitation to materializing this great feature, 
in Archi/jArchi environment. Compared with Modelio, Archi does not natively support UML, and is not designed to provide 
UML modeling through its plug-in ecosystem.

The ultimate goal of development of the “UML” module for Archi is to evolve it into a comprehensive solution that 
enables seamless interaction between ArchiMate and UML, bringing their coordinated use closer to that offered by 
integrated commercial modeling tools. However, the “UML” module of BizDiag, as of the time of writing this paper, is 
already in its early version, and can only convert an ArchiMate view into a UML-like view, which can coexist with other 
ArchiMate views and elements in the model. That being said, unlike other BizDiag modules, this early version of 
BizDiag's UML module is an interim, but fully-working, implementation of the module. The definitive version, 
incorporating further enhancements and planned capabilities, up to the standards of Modelio and other multi-metamodel 
modeling tools is yet to be released, in UML module's early future updates.

## 4. Workflow and output

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

## 5. Requirements

Run the script in Archi with jArchi and an open model. `sendToAI.js` is the optional local-AI integration helper; Ollama
is not required for heuristic-only generation. However, if you want to use the local Ollama AI for enriching the UML 
view with suggested stereotypes and documentation, you need to have it installed and running on your machine. The script 
will attempt to connect to Ollama if it is available. You also have to install some at least one LLM in Ollama, e.g., 
LLaMA 2, to be able to use the local AI integration feature of the script.

## 6. Author and Copyright

**Author:** Ebrahim Pak

**Copyright:** © October 2026 Ebrahim Pak.

## 7. References

[1] P. Kruchten, “Architectural Blueprints—The ‘4+1’ View Model of Software Architecture,” *IEEE Software*, vol. 12,
no. 6, pp. 42–50, Nov. 1995.

[2] C. Armstrong, J. D. Baker, I. Band, S. Courtney, H. Jonkers, V. Muchandi, and M. Owen, “How to Use the
ArchiMate® Language with UML®,” The Open Group, Sep. 2013. [Online]. Available: https://publications.opengroup.org/w134.

[3] The Open Group, “The Advantages of Combining the ArchiMate®, UML®, and BPMN™ Modeling Standards,” video,
Modeliosoft, 2016. [Online]. Available: https://publications.opengroup.org/webinars/d182.
