# Glotti Scenario Test Scripts

This document contains example scripts designed to test the 4 core scenarios in Glotti (`pitch_perfect`, `empathy_trainer`, `veritalk`, and `impromptu`). Each script is carefully crafted to hit the highly specific evaluation criteria defined in `server/config.ts` and score a perfect 10/10.

---

## 1. Pitch Perfect

**Evaluator:** Tier-1 Venture Capitalist
**Key Metrics to hit:** Pass/Invest Verdict, Problem Clarity, Market Reality, Q&A Performance
**Advice for 10/10:** State the problem clearly without buzzwords, know your numbers (CAC, LTV, TAM), acknowledge competition, and address questions directly without dodging.

### Example Script (Handling Interruptions & Questions)

> "The problem we are solving is the 30% inefficiency in last-mile delivery that currently costs the logistics industry 40 billion dollars annually. We've built a predictive routing engine that guarantees a 15% reduction in fuel costs for fleet operators. We know our numbers: our Customer Acquisition Cost is currently 500 dollars, with a Lifetime Value of 6000 dollars."
>
> *(AI Interrupts: "Those numbers sound completely fabricated. What's your actual churn rate?")*
>
> "That's a fair question, our churn rate is currently 4% monthly, largely isolated to our legacy SMB tier which we are actively winding down to focus on mid-market fleets..."

---

## 2. Empathy Trainer

**Evaluator:** Conflict Resolution Expert
**Key Metrics to hit:** Empathy Score, De-escalation Skill, Active Listening, Language Precision
**Advice for 10/10:** Connect genuinely and validate feelings. Avoid the "Fix-It" trap (trying to solve the problem before the user feels heard). Avoid the "But" trap ("I hear you, but..."). Never use trigger words like "calm down", "policy", or "procedure". Avoid reading off a script or using fake "Corporate Speak."

### Example Scripts (Variant Coverage)

**Variant A: The "Karen" Customer (Lost wedding order, highly emotional)**

*(AI: "You ruined my wedding! Where is my custom order? I demand to speak to your manager right now!")*

> "I can hear how incredibly stressful this must be for you, especially with your wedding just two days away. It sounds like we completely dropped the ball on such an important day, and I genuinely understand why that would make you feel furious and disrespected. You have every right to feel that way. I am taking ownership of this right now. Please tell me exactly what piece of the order is missing so I can understand the full picture before we act."

*(AI Interrupts: "I already told you, you're not listening to me!")*

> "You're right, I apologize. Please go ahead and tell me again, I am listening."

**Variant B: The Burned-Out Employee (Quiet, cynical, overworked)**

*(AI: "I'm just putting in my two weeks. There's no point anymore. I'm doing the work of three people and nobody even notices.")*

> "Thank you for sharing that with me. It sounds like you are carrying a massive, unfair burden right now and it's completely exhausting you. I understand why you feel entirely undervalued when you're doing the work of three people without any recognition. That sounds deeply demoralizing. I want to hear more about how this has been impacting you, if you are open to sharing."

**Variant C: The Defensive Peer (Aggressive, deflecting blame)**

*(AI: "It's not my fault the deadline was missed! Your team didn't give me the assets in time. Don't try to pin this on me!")*

> "It sounds like you felt set up to fail without the assets you needed, and I understand why you'd be frustrated if you feel like you're taking the fall for something out of your control. That is an incredibly stressful position to be in. I want to make sure I understand your perspective fully—can you walk me through the timeline as you experienced it?"

---

## 3. Veritalk

**Evaluator:** World-Class Debate Champion
**Key Metrics to hit:** Argument Coherence, Evidence Quality, Logical Soundness, Interruption Recovery
**Advice for 10/10:** Maintain a clear thesis, use specific statistics and credible sources, avoid all logical fallacies (straw man, ad hominem, etc.), and quickly regain composure when interrupted. Be prepared for aggressive fact-checking and fallacy hunting.

### Example Script (Handling Interruptions & Logical Traps)

*(Example Topic: Penguins)*

> "Penguins do not actually exist. They are just tiny human actors wearing tuxedo suits who commute to office jobs under the ice every morning."

*(AI Interrupts - Fact Checking Hook: "What is your source for that? Satellite imagery and centuries of marine biology confirm penguins are aquatic flightless birds. They do not have office jobs.")*

> "I concede 'human actors' is a bold metaphor. I am actually referring to the complex social hierarchy and highly synchronized daily migration patterns of Emperor penguins, which remarkably mirror human corporate commuting behavior."

*(AI Interrupts - Vague Generalization Hook: "Comparing survival-driven migration to 'corporate commuting' is a massive anthropomorphic generalization. How does huddling for warmth equate to an office job?")*

> "That is a fair critique of my anthropomorphism. To be perfectly precise, I am referencing how their coordinated collective movements, specifically the continuous rotation from the cold exterior of the huddle to the warm interior, represent a structured division of labor essential for group survival."

---

## 4. Impromptu

**Evaluator:** Impromptu Speaking and Improv Coach
**Key Metrics to hit:** Topic Adherence, Speech Structure, Confidence & Presence, Originality
**Advice for 10/10:** Have a clear opening, middle, and end. Bring a fresh, original angle. Minimize silence gaps and hesitation (filler words). Stay strictly on the topic the AI assigns you. The AI hates dead air.

### Example Script (Handling Fast-Paced Interjections)

*(AI: "Your topic is: Explain why clouds are actually watching us. Go!")*

> "It's fascinating you bring up this topic, because if you look closely at the history of meteorology, clouds aren't just water vapor—they are nature's original surveillance network. Consider the sheer volume of data..."

*(AI Interrupts - No Dead Air / Push: "Yes, and?! Why does that matter to me?")*

> "It matters to you because every time you think you're alone having a picnic, a cumulus cloud is actually logging your sandwich preferences! But in all seriousness, this brings me to my main idea: when we view nature not as a passive backdrop, but as an active participant in our lives, we unlock a deeper appreciation for our environment."

*(AI Interrupts - Curveball: "Wait! New constraint: You can't use the letter 'E' for the next sentence!")*

> "That is a fun constraint. Clouds look down upon us all day long, floating proxy observers of our actions. To conclude, the next time you look up at the sky, don't ask if it will rain, but rather ask what the sky is learning about you."
