import json
out=["""-- Xarmoured v5 architecture seed. ADDITIVE ONLY.
-- Every insert uses ON CONFLICT (module, slug) DO NOTHING, so existing production records are never modified.
-- Back up public.records first. Review the content, then run in the Supabase SQL editor.
-- To unpublish any record later: update public.records set status='draft', published_at=null where module='<m>' and slug='<s>';
begin;"""]
def ins(module,title,slug,data,status='published'):
    d=json.dumps(data,ensure_ascii=False)
    assert '$xj$' not in d
    out.append(f"insert into public.records (module, title, slug, status, data, published_at)\nvalues ({json.dumps(module)[1:-1].join(chr(39)*2)}, $xt${title}$xt$, '{slug}', '{status}', $xj${d}$xj$::jsonb, now())\non conflict (module, slug) do nothing;")
# categories
for i,(t,sl,sm) in enumerate([
 ('Offensive Security','offensive-security','Manual testing of the systems attackers target.'),
 ('Application Security Engineering','application-security-engineering','Design review and remediation engineering for development teams.'),
 ('AI Security','ai-security','Emerging, research-stage assessment of LLM applications, RAG and agents.'),
 ('Security Automation','security-automation','Repeatable security checks that run without a manual engagement.')],1):
    ins('service_categories',t,sl,{'summary':sm,'order':i})
PROCESS="**1. Scoping call.** An engineer reviews your system and goals and confirms whether this service fits.\n\n**2. Written scope.** Assets, access, exclusions, timing and rules of engagement are agreed before any work starts.\n\n**3. Delivery.** Work proceeds with a named point of contact and agreed channels for urgent issues.\n\n**4. Readout.** Findings and recommendations are walked through with your engineers.\n\n**5. Verification.** Fixes can be retested against the original finding."
RETEST="Fixes can be verified against the original finding. The result is recorded as resolved, partially resolved or still reproducible."
def svc(title,slug,cat,grp,icon,order,summary,problem,audience,paths,method,scope,deliver,features,areas,status_note,seo):
    desc=summary+("\n\n**Status:** "+status_note if status_note else "")
    ins('services',title,slug,{'summary':summary,'description':desc,'category':cat,'capability_group':grp,'icon':icon,'order':order,'problem':problem,'audience':audience,'attack_paths':paths,'methodology':method,'example_scope':scope,'process':PROCESS,'retesting':RETEST,'deliverables':deliver,'timeline':'Defined during scoping.','features':'\n'.join(features),'testing_areas':'\n'.join(areas),'seo_title':seo[0],'seo_description':seo[1],'canonical_path':f'/services/{slug}','featured':False})
svc('Secure Architecture Review','secure-architecture-review','Application Security Engineering','Engineering','shield',10,
 'Review how an application is designed to fail: trust boundaries, identity, data flow and tenant isolation.',
 'Design-level flaws survive code review and scanning. A missing authorization layer or an over-trusted internal service is expensive to fix after release.',
 'Engineering teams designing or scaling a SaaS product, API platform or web application.',
 '- A service trusts another internal service without verifying the caller\n- Tenant identifiers are accepted from the client\n- Secrets and tokens share one trust boundary\n- Administrative functions reachable from user-facing paths',
 '1. Collect architecture diagrams, authentication flows and data-store inventory.\n2. Model trust boundaries and the data that crosses them.\n3. Identify abuse paths from the perspective of each role.\n4. Rate each issue by exploitability and impact in your context.\n5. Recommend design changes your team can implement.',
 'Architecture documents, authentication and authorization flows, data stores, third-party integrations and deployment boundaries.',
 '- Written architecture review\n- Findings with rationale and severity\n- Prioritized design recommendations\n- Readout session with your engineers',
 ['Trust boundary analysis','Authorization model review','Tenant isolation review','Data flow review'],['Identity and session design','Multi-tenant boundaries','Service-to-service trust','Secrets handling'],
 'Scoped per engagement. We confirm fit during the scoping call.',('Secure Architecture Review for SaaS and APIs','Review trust boundaries, identity, authorization and tenant isolation in your application design before attackers do.'))
svc('Vulnerability Remediation Engineering','vulnerability-remediation-engineering','Application Security Engineering','Engineering','code',11,
 'Fix the root cause of validated findings, with guidance written for the engineers who ship the change.',
 'Findings are often patched at the symptom. The same flaw returns in the next endpoint or release.',
 'Teams holding validated findings from any assessment who want durable fixes.',
 '- A fix blocks one parameter while the flaw remains reachable another way\n- Authorization checked in the interface but not the backend\n- A patch that introduces a regression in access control',
 '1. Review each finding and its reproduction.\n2. Trace the root cause in your design or code path.\n3. Propose a fix and the regression tests that protect it.\n4. Review the implemented change with your engineers.\n5. Retest the original attack path.',
 'Validated findings and the relevant application components, supplied by your team.',
 '- Root-cause analysis per finding\n- Remediation guidance and test suggestions\n- Review of the implemented fix\n- Retest result',
 ['Root-cause analysis','Fix review','Regression test guidance','Retest verification'],['Access control fixes','Input handling fixes','Session and token fixes'],
 'Xarmoured advises and verifies. Implementation stays with your team unless agreed in writing.',('Vulnerability Remediation Engineering','Root-cause remediation guidance and verification for validated security findings.'))
svc('LLM Application Security Assessment','llm-application-security-assessment','AI Security','Emerging Technology','shield',20,
 'Assess applications built on large language models for prompt injection, data exposure and excessive agency.',
 'LLM features add inputs and behaviors that conventional testing does not cover: untrusted text can steer the model, and model output can reach sensitive actions.',
 'Teams shipping chat, copilot, summarization or content features backed by an LLM.',
 '- Direct and indirect prompt injection\n- Model output passed to a database, browser or tool without validation\n- Sensitive data included in prompts or responses\n- Excessive permissions granted to the model',
 '1. Map the application, model, data sources and tools.\n2. Test prompt injection against each input path.\n3. Test how model output is used downstream.\n4. Test data exposure across users and tenants.\n5. Report with reproducible prompts and recommended controls.\nThe OWASP Top 10 for LLM Applications is used as a reference framework.',
 'The LLM-backed feature, its system prompt where shared, data sources, connected tools and the surrounding API.',
 '- Findings with reproducible prompts\n- Impact in your application context\n- Recommended controls\n- Retest result',
 ['Prompt injection testing','Output handling review','Data exposure testing','Agency and permission review'],['Direct prompt injection','Indirect prompt injection','Insecure output handling','Excessive agency'],
 'Emerging and research-stage. Engagements are scoped carefully and the limits of current methods are stated in the report.',('LLM Application Security Assessment (Emerging)','Research-stage security assessment of LLM applications: prompt injection, output handling, data exposure and agency.'))
svc('AI Agent and RAG Security Assessment','ai-agent-rag-security-assessment','AI Security','Emerging Technology','network',21,
 'Assess retrieval-augmented generation and tool-using agents for leakage, poisoning and permission abuse.',
 'Retrieval and tool use connect a model to your data and systems. Weak boundaries there turn a text-based attack into data access or action.',
 'Teams building RAG search, knowledge assistants or agents that call tools and APIs.',
 '- Retrieval returns another tenant’s documents\n- Poisoned content changes agent behavior\n- An agent tool runs with broader permissions than the user\n- Instructions hidden in retrieved content',
 '1. Map data sources, retrieval path, tools and permissions.\n2. Test authorization at retrieval and at each tool call.\n3. Test poisoned and hidden-instruction content.\n4. Test whether actions can be triggered across trust boundaries.\n5. Report with reproducible evidence and controls.',
 'Retrieval pipeline, indexed data sources, agent tools, the permissions each runs with and the connected APIs.',
 '- Findings with reproducible evidence\n- Authorization gaps at retrieval and tool boundaries\n- Recommended controls\n- Retest result',
 ['Retrieval authorization testing','Content poisoning tests','Tool permission review','Cross-tenant leakage tests'],['RAG pipelines','Agent tool use','Retrieval authorization'],
 'Emerging and research-stage. Scoped per engagement with stated limits.',('AI Agent and RAG Security Assessment (Emerging)','Research-stage assessment of RAG pipelines and AI agents: retrieval authorization, poisoning and tool permission abuse.'))
svc('Security Automation Engineering','security-automation-engineering','Security Automation','Engineering','code',30,
 'Turn manual security checks into repeatable automation your team can run on every release.',
 'Manual retests do not scale with release speed. Access-control and regression checks drift when nobody re-runs them.',
 'Engineering teams that want repeatable security checks in their delivery pipeline.',
 '- An access-control fix regresses two releases later\n- Retest evidence exists only as screenshots\n- Security checks run only before a yearly assessment',
 '1. Identify the checks worth repeating, usually from validated findings.\n2. Implement them as automated tests against a defined environment.\n3. Define pass and fail criteria with your team.\n4. Document how to run and maintain them.\n5. Review results after the first runs.',
 'Chosen findings or security requirements, a test environment, test accounts and your delivery pipeline.',
 '- Automated checks in your repository\n- Run and maintenance documentation\n- Pass and fail criteria\n- Review of first results',
 ['Access-control regression checks','Retest automation','Pipeline integration','Result reporting'],['Authorization regression','Token and session checks','Release gating'],
 'Scoped per engagement. We confirm feasibility during the scoping call.',('Security Automation Engineering','Repeatable security regression checks and retest automation for engineering teams.'))
def page(slug,title,headline,summary,content,seo):
    ins('pages',title,slug,{'headline':headline,'summary':summary,'content':content,'seo_title':seo[0],'seo_description':seo[1],'canonical_path':f'/{slug}','content_type':'landing'})
page('platform','ExploitLedger','ExploitLedger','An AI-assisted vulnerability assessment and remediation management platform, in development at Xarmoured.',
"## What it is\n\nExploitLedger helps security teams run assessments and track findings through to verified remediation. It is built from our own assessment work.\n\n## Availability\n\nIn development. There is no public release, pricing or launch date. Demo and early-access conversations are handled by [enquiry](/assessment).\n\n## What is published\n\nThe features, workflow and conceptual architecture pages separate what the product does today from what is planned. No customer, integration or performance claims are made.",
('ExploitLedger — vulnerability assessment and remediation platform | Xarmoured','ExploitLedger is an AI-assisted vulnerability assessment and remediation management platform in development from Xarmoured.'))
CAPS=['Engagement management','Asset management','Vulnerability tracking','OWASP-based assessment workflows','Evidence management and integrity','CWE classification','CVSS scoring','Remediation tracking','Retesting workflows','Organizational separation and access control']
page('exploitledger-features','ExploitLedger features','ExploitLedger features','What the platform manages today, and what is only planned.',
"## Existing functionality\n\n"+'\n'.join('- '+c for c in CAPS)+"\n\n## Planned or not yet specified\n\n- AI assistance: part of the product direction. Specific AI features are not yet published and are not claimed here.\n- Integrations, reporting exports and deployment options: not yet published.\n\n## Screenshots\n\nProduct screenshots are not yet published. They will be added here when they are available.\n\n[Request a demo](/assessment)",
('ExploitLedger features | Xarmoured','Engagement and asset management, vulnerability tracking, evidence integrity, CWE and CVSS, remediation tracking and retesting in ExploitLedger.'))
page('exploitledger-workflow','ExploitLedger workflow','ExploitLedger workflow','From engagement to verified remediation.',
"## The workflow\n\n**Engagement.** Create the engagement and define scope.\n\n**Assets.** Register the assets in scope.\n\n**Assessment.** Work through an OWASP-based assessment workflow.\n\n**Findings.** Record each vulnerability with CWE classification and CVSS scoring.\n\n**Evidence.** Attach evidence and keep its integrity.\n\n**Remediation.** Track each fix to completion.\n\n**Retest.** Retest and record whether the issue is closed.\n\nWork is separated by organization with access control throughout.\n\nThis page describes the workflow supported by the listed capabilities. See [features](/exploitledger-features) for what is planned.",
('ExploitLedger workflow | Xarmoured','How ExploitLedger carries an assessment from engagement and evidence to remediation tracking and retesting.'))
page('exploitledger-architecture','ExploitLedger architecture','ExploitLedger architecture','The conceptual model behind the platform.',
"## Conceptual model\n\nThis is a domain overview, not a deployment diagram.\n\n- **Organization:** the boundary for data and access control.\n- **Engagement:** a scoped assessment inside an organization.\n- **Asset:** a system in scope for an engagement.\n- **Vulnerability:** a finding on an asset, with CWE and CVSS.\n- **Evidence:** material that supports a finding, with integrity protection.\n- **Remediation and retest:** the fix and its verification.\n\n## Not yet published\n\nHosting, data handling, integrations and security controls of the platform itself are not yet published. We will add them when they are final.",
('ExploitLedger architecture overview | Xarmoured','The conceptual data model of ExploitLedger: organizations, engagements, assets, vulnerabilities, evidence and remediation.'))
page('engineering-philosophy','Engineering philosophy','Engineering philosophy','How offensive testing, research and software work together.',
"## Depth over checklists\n\nWe explore business logic, authorization boundaries and the interaction between components.\n\n## Evidence over assumptions\n\nWe validate behavior, document the conditions and state the limits of every assessment.\n\n## Resolution over volume\n\nA finding is useful when engineers can fix its cause. We then test the fix.\n\n## One loop\n\nAttack research informs testing. Testing informs remediation. Remediation informs the software we build.\n\nXarmoured is independent and founder-led.",
('Engineering philosophy | Xarmoured','Depth over checklists, evidence over assumptions, resolution over volume: how Xarmoured approaches security engineering.'))
page('research-approach','Research approach','Research approach','How we research, disclose and publish.',
"## What we research\n\nVulnerability research, CVE disclosures, security advisories, AI security research, technical publications and open source tools.\n\n## Disclosure\n\nResearch is published only after disclosure is public. Affected vendors are given the chance to fix first. See [responsible disclosure](/security).\n\n## Attribution\n\nEvery entry names the researcher and links to official sources such as advisories and CVE records.\n\n## Where to read it\n\nBrowse the [research listing](/research).",
('Research approach | Xarmoured','How Xarmoured researches vulnerabilities, coordinates disclosure and attributes published work.'))
page('partnerships','Partnerships','Partnerships','Working with other security and technology teams.',
"## Where collaboration makes sense\n\n- Research collaboration on attack techniques and disclosures\n- Technology partners whose products complement assessment and remediation work\n- Security firms that need specialist application testing capacity\n\n## Current partners\n\nNone are listed. We will name a partner here only with their agreement.\n\n## Start a conversation\n\nUse the [contact form](/contact) and select the partnership enquiry topic.",
('Partnerships | Xarmoured','Research, technology and services partnerships with Xarmoured. No partners are listed until agreed.'))
NAV={'platform':[('ExploitLedger overview','/platform'),('Features','/exploitledger-features'),('Workflow','/exploitledger-workflow'),('Architecture','/exploitledger-architecture'),('Request a demo','/assessment')],
'resources':[('Guides and articles','/resources'),('Research','/research'),('Methodology','/methodology'),('Sample report','/sample-report'),('FAQ','/faq')],
'company':[('About Xarmoured','/about'),('Engineering philosophy','/engineering-philosophy'),('Research approach','/research-approach'),('Partnerships','/partnerships'),('Contact','/contact')]}
for pl,items in NAV.items():
    for i,(t,d) in enumerate(items,1):
        ins('navigation',t,f"nav-{pl}-{d.strip('/').replace('/','-') or 'home'}",{'destination':d,'placement':pl,'external':False,'order':i})
out.append("commit;\n-- Verify: select module, slug, status from public.records where slug like 'nav-%' or slug in ('platform','exploitledger-features','secure-architecture-review') order by module, slug;")
open('xarmoured_v5_architecture_seed.sql','w').write('\n'.join(out)+'\n')
