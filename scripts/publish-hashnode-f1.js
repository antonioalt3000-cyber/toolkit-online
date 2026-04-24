const https = require('https');
const HASHNODE_API_KEY = '4df35ca0-83d0-48c0-88fc-6be573f848dd';
const PUBLICATION_ID = '69c5558810e664c5daf05d9f';

const articleContent = `The EU AI Act is the world's first comprehensive AI regulation. Since August 2025, general-purpose AI providers must meet transparency, documentation, and copyright compliance obligations. High-risk AI systems face even stricter requirements.

If your company builds or deploys AI in the EU, here's what you need to know — and how to check your compliance status automatically.

## EU AI Act Timeline

- **February 2025**: Prohibited AI practices banned (social scoring, emotion recognition in workplaces)
- **August 2025**: General-purpose AI (GPAI) obligations active
- **August 2026**: Full enforcement for high-risk AI systems

## Risk Classification

The AI Act classifies AI systems into four risk levels:

### Unacceptable Risk (Banned)
- Social credit scoring
- Real-time biometric surveillance (with exceptions)
- Emotion recognition in workplaces/schools
- AI that exploits vulnerabilities

### High Risk
- AI in hiring and recruitment
- Credit scoring and insurance
- Law enforcement
- Critical infrastructure management
- Medical devices with AI components

### Limited Risk
- Chatbots (must disclose they're AI)
- Deepfake generators (must label output)
- Emotion recognition systems (with consent)

### Minimal Risk
- Spam filters, video game AI, inventory management
- No specific obligations, but voluntary codes encouraged

## GPAI Provider Obligations

If you build foundation models or general-purpose AI:

1. **Technical documentation** — model architecture, training data, evaluation
2. **Transparency** — downstream deployers must know capabilities and limitations
3. **Copyright compliance** — respect opt-outs, maintain training data summaries
4. **Safety testing** — for models with systemic risk (>10^25 FLOPs)

## How to Check Your AI Act Compliance

Manual compliance assessment takes weeks and costs thousands. [CompliPilot](https://complipilot.dev) automates the first pass with **200+ regulatory checks**:

- **Risk classification** — determines which tier your AI system falls into
- **Documentation gaps** — identifies missing technical documentation
- **Transparency check** — verifies disclosure requirements are met
- **GDPR alignment** — ensures data protection compliance alongside AI Act
- **Action plan** — prioritized list of what to fix

### Quick Start
1. Go to [complipilot.dev](https://complipilot.dev)
2. Describe your AI system
3. Get a compliance report with specific action items

Free plan: 3 scans per month.

## Who Needs This?

- **AI companies** — Mistral, DeepL, Aleph Alpha and every AI startup
- **SaaS with AI features** — if you use ML in your product
- **Consulting firms** — accelerate client assessments
- **Law firms** — automate the compliance checklist before legal review
- **Enterprise IT** — any department deploying AI tools

## Common Mistakes

1. **Assuming you're minimal risk** — many AI features are actually high-risk
2. **Ignoring GPAI obligations** — even fine-tuning a foundation model triggers requirements
3. **Waiting for enforcement** — August 2026 is closer than you think
4. **Treating it as a one-time check** — compliance is ongoing

## The Penalty Structure

- Up to **35 million euros** or 7% of global turnover for prohibited practices
- Up to **15 million euros** or 3% for high-risk violations
- Up to **7.5 million euros** or 1.5% for providing incorrect information

## Take Action Now

Run a free compliance scan at [CompliPilot](https://complipilot.dev). Know your risk classification and compliance gaps before auditors do.

For accessibility compliance alongside AI Act, check [AccessiScan](https://fixmyweb.dev).

---

*How is your team preparing for the AI Act? Share in the comments.*`;

const mutation = JSON.stringify({
  query: `mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { id title url slug } } }`,
  variables: { input: { title: 'EU AI Act 2025: Complete Guide for Developers and AI Companies', publicationId: PUBLICATION_ID, contentMarkdown: articleContent, tags: [{slug:'ai',name:'AI'},{slug:'compliance',name:'Compliance'},{slug:'eu',name:'EU'},{slug:'regulation',name:'Regulation'},{slug:'machine-learning',name:'Machine Learning'}], subtitle: 'Risk classification, GPAI obligations, penalties, and how to check compliance automatically' } }
});

const req = https.request({hostname:'gql.hashnode.com',port:443,path:'/',method:'POST',headers:{'Content-Type':'application/json','Authorization':HASHNODE_API_KEY,'Content-Length':Buffer.byteLength(mutation)}}, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try { const r=JSON.parse(d); if(r.data&&r.data.publishPost){const p=r.data.publishPost.post;console.log('SUCCESS');console.log('Title:',p.title);console.log('URL:',p.url);}else{console.log('ERROR:',JSON.stringify(r));}} catch(e){console.log('PARSE:',d);} }); });
req.on('error',e=>console.log('ERR:',e.message));
req.write(mutation);
req.end();
