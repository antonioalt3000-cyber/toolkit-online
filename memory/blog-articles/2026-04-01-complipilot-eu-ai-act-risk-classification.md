# How to Classify Your AI Product Under the EU AI Act (2026 Guide)

**Business**: F1 CompliPilot (complipilot.dev)
**Published**: 2026-04-01
**Platform**: Hashnode
**URL**: https://devtoolsmith.hashnode.dev/how-to-classify-your-ai-product-under-the-eu-ai-act-2026-guide
**Post ID**: 69cce7ea013afe99da229550
**Words**: ~1100
**Tags**: AI, Compliance, Regulation, Europe, SaaS, Legal
**Keyword target**: EU AI Act risk classification, AI Act compliance
**Cross-posting**: Available for Dev.to, Medium

---

The EU AI Act is now in force -- and if you build, sell, or deploy AI systems in Europe, you need to know exactly where your product sits in the risk hierarchy. The wrong classification can mean anything from minor documentation requirements to a complete market ban.

This guide walks through the four risk categories, gives concrete examples for each, and shows you the practical steps to classify your own AI system.

## The Four Risk Levels at a Glance

The EU AI Act sorts AI systems into four categories based on the potential harm they could cause:

- **Unacceptable risk** -- Prohibited entirely
- **High risk** -- Allowed but with strict compliance requirements
- **Limited risk** -- Transparency obligations only
- **Minimal risk** -- No specific obligations

Most commercial SaaS products fall into the limited or minimal risk categories. But getting this wrong -- especially if you are in the high-risk zone and do not know it -- creates serious legal exposure.

## Unacceptable Risk: Systems That Are Banned

These AI systems are prohibited in the EU with no exceptions:

- Social scoring by governments (assigning scores to citizens based on behavior)
- Real-time biometric surveillance in public spaces by law enforcement (with narrow exceptions)
- AI that exploits psychological vulnerabilities to manipulate decisions
- Systems that infer emotions in workplace or educational settings (with limited exceptions)
- AI that categorizes people by race, political opinion, religion, or sexual orientation from biometric data

If your product falls here, it cannot legally operate in the EU. The ban applied from February 2, 2025.

## High Risk: Allowed, But With Significant Requirements

High-risk AI systems are permitted but must meet a long list of requirements before deployment. This is where compliance costs concentrate.

### Which categories are high-risk?

High-risk systems are defined by the sector they operate in and the function they perform:

**Safety components of critical infrastructure**: AI controlling power grids, water systems, or traffic.

**Education**: AI that determines access to or evaluates students -- automated scoring systems or tools that decide admissions.

**Employment and HR**: Any AI used in recruitment, promotion, termination, or task allocation. If your product automatically screens CVs, ranks candidates, or makes hiring recommendations, you are in high-risk territory.

**Access to essential services**: Credit scoring, insurance risk assessment, social benefits determination.

**Law enforcement**: Polygraphs, crime prediction, deepfake detection for investigations.

**Migration and border control**: Visa risk assessment, asylum evaluation.

**Administration of justice**: AI assisting in judicial decisions.

### What high-risk compliance requires

If you fall here, you need:

1. **Risk management system** -- Documented processes for identifying, analyzing, and mitigating risks throughout the lifecycle
2. **Data governance** -- Training data must be relevant, representative, and free of errors
3. **Technical documentation** -- Detailed records of system design, capabilities, and limitations
4. **Logging and record-keeping** -- Systems must log operations automatically to enable post-incident review
5. **Transparency to users** -- Clear information about what the system does and its limitations
6. **Human oversight** -- Mechanisms allowing humans to monitor, override, and stop the system
7. **Accuracy, robustness, and cybersecurity** -- Verifiable performance metrics

You must also register your system in the EU AI Act database before placing it on the market.

[CompliPilot](https://complipilot.dev) automates the documentation and audit trail requirements for high-risk AI systems -- generating the technical documentation, risk assessment reports, and compliance checklists the Act requires.

## Limited Risk: Transparency Obligations

Most AI products with a user-facing component fall here. The core obligation is transparency: users must know they are interacting with AI.

Specific obligations:

**Chatbots and conversational agents**: Must disclose that the user is talking to an AI (unless obvious from context).

**Deepfakes and synthetic media**: AI-generated images, audio, or video must be labeled as artificial -- with narrow exceptions for art and satire.

**Emotion recognition systems** (outside prohibited contexts): Must inform people when their emotions are being detected.

For most SaaS products -- customer support chatbots, AI writing assistants, image generation tools -- this is where you sit. The compliance burden is light: add appropriate disclosures in your UI and terms of service.

## Minimal Risk: No Specific Obligations

AI spam filters, AI-powered search within your own product, recommendation systems in entertainment apps, and most AI features embedded in internal B2B tooling fall here. The Act imposes no specific obligations.

Examples:
- AI content recommendation in streaming services
- AI-powered search within your own product
- Fraud detection for internal operations
- AI writing assistance with human review before output is used

## How to Classify Your System: A Decision Framework

Work through these questions in order:

**Step 1: Is it prohibited?**
Does your system do real-time biometric surveillance, social scoring, subliminal manipulation, or emotion recognition in workplaces or schools? If yes, it cannot operate in the EU.

**Step 2: Is it a safety component of a regulated product?**
Does your AI control or make safety-relevant decisions in machinery, medical devices, vehicles, or critical infrastructure? If yes, likely high-risk.

**Step 3: Does it operate in a high-risk sector?**
Is it used in HR, education, law enforcement, credit, insurance, migration, or justice? Evaluate whether it makes or significantly influences decisions about people.

**Step 4: Does it interact with users in ways that require transparency?**
Is it a chatbot? Does it generate synthetic content? If yes, limited risk -- add disclosures.

**Step 5: Otherwise**
Minimal risk. No specific obligations, but consider voluntary disclosure best practices.

## The General Purpose AI (GPAI) Model Rules

If you develop a general purpose AI model (not deploy one), additional rules apply. GPAI model providers must:

- Maintain technical documentation
- Comply with EU copyright law
- Publish a summary of training data
- For high-capability models (above 10^25 FLOPs): additional systemic risk assessments and adversarial testing

This primarily affects foundation model developers, not companies building products on top of APIs from providers like OpenAI or Anthropic.

## Common Classification Mistakes

**We use AI for HR but it is just a suggestion**: If your AI output significantly influences a human decision about employment, you may still be high-risk. The Act focuses on function and impact, not whether there is nominal human review.

**We are a startup, this does not apply to us**: Size does not matter. The AI Act applies to any organization placing AI systems on the EU market or affecting EU residents, regardless of company location or size.

**Our AI just analyzes documents, it is minimal risk**: Depends entirely on what it analyzes and what decisions follow. AI that analyzes documents to make credit decisions is high-risk. AI that summarizes your own internal documents for your team is minimal risk.

**We do not train the model, we just use the API**: As a deployer, you still carry obligations -- especially for high-risk systems. The provider compliance does not substitute for yours.

## Practical Next Steps

1. **Inventory your AI systems** -- list every AI feature in your product, including those using third-party APIs
2. **Apply the decision framework** to each one
3. **For high-risk systems**: start building the required documentation and risk management processes now -- [CompliPilot](https://complipilot.dev) generates compliant technical documentation automatically
4. **For limited-risk systems**: audit your UI and legal documents for required disclosures
5. **Document your classification rationale** -- regulators may ask you to justify your assessment

The EU AI Act enforcement timeline is phased: prohibitions applied in February 2025, high-risk requirements apply from August 2026. High-risk compliance documentation takes months to prepare properly -- start now.

Run a [free AI compliance check on CompliPilot](https://complipilot.dev) to see where your product stands today.

---

## FAQ

**Q: Does the EU AI Act apply to US companies with EU customers?**
A: Yes. Like GDPR, the EU AI Act applies to any organization whose AI systems are used in the EU or affect EU residents, regardless of where the company is based.

**Q: When do high-risk AI requirements become mandatory?**
A: August 2, 2026 for most high-risk AI systems. Some categories covered under existing EU regulations like medical devices have earlier or different timelines.

**Q: What are the fines for non-compliance?**
A: Up to 35 million EUR or 7% of global annual turnover for using prohibited AI systems. Up to 15 million EUR or 3% for other violations. Up to 7.5 million EUR or 1.5% for providing incorrect information to authorities.

**Q: Can I use third-party AI APIs and still be compliant?**
A: Yes, but as a deployer you carry your own compliance obligations. Your provider AI Act compliance documentation helps but does not replace your own risk assessment, transparency notices, and the full compliance framework for high-risk systems.
