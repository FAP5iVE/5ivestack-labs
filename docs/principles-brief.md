# Principles section: what is wanted, in full

Written 18 Nov 2026 for the owner. Nothing in this file is published on the site. It explains
what the "Principles" section is, why it exists, and exactly what to send so it can be built
without inventing anything.

## 1. What the section is

A short block on the home page (planned after "Selected work") titled **Principles** or
**How we build**. It shows four to six engineering rules. Each rule is opinionated, and each
is backed by one short true story from a real project.

Why it exists: every company says "we care about quality and security". Visitors (school
heads, business owners, enterprise buyers, partners) cannot tell who means it. A rule such as
"We never ship a feature that has no way to be switched off" followed by a true story about
the day that mattered is evidence. It shows how you think and what you will and will not do
for a client. It also makes the site unmistakably yours, because nobody else has your stories.

## 2. The five parts of each principle

Every principle has the same five parts. Send them in this order.

1. **The rule.** One sentence, imperative, 15 words or fewer. It must be something a
   competitor could disagree with. It must be testable: a client could check whether you kept
   it.
2. **The layer.** Which of the five layers it belongs to: L1 Precision (hardware, sensors),
   L2 Reliability (firmware, device networks, hardware setup), L3 Security (networks, CCTV),
   L4 Scalability (software, backend), L5 Usability (Android, interfaces). A principle can
   also be about the whole job (consultation).
3. **The story.** 60 to 120 words about one real project. Say: the project (or "a client
   project" if the name cannot be shown), the situation, what could have gone wrong or what
   was tempting, what you decided, and what happened. Plain words, first person plural
   ("we"). A bad outcome that taught you something is worth more than a flattering one.
4. **The cost.** One sentence: what the rule costs you (time, money, a lost sale, an argument
   with a client) or when you would break it. A rule with no cost is a slogan.
5. **Permission.** One line: may the project and any named person or organisation be shown?
   If not, the story is written without names.

## 3. What makes a good rule, and a bad one

Good (the shape, not real content): a rule that takes a side and has a price.
- "We test on the cheapest phone the client's users own."
- "We write down what we did not build, and give it to the client."
- "We never put a default password on a device we install."

Bad:
- "We put the customer first." (nobody disagrees, nobody can check it)
- "We deliver innovative, scalable solutions." (buzzwords; you asked for none)
- Any rule whose story you do not have. Delete it. Four true principles beat six padded ones.

## 4. Hard rules for the content

- **True only.** Every fact in a story must have happened. I will not invent a story, a
  number, a client, a quote or an outcome, and I will not "improve" one. If you are unsure of
  a figure, say "about" or leave the figure out.
- **No numbers you cannot defend.** "Cut load time from 8 s to 2 s" only if you measured it.
- **No other people's words.** No testimonials unless the person has agreed in writing.
- **No private data.** No pupils', staff or customers' details. Business names only with
  permission (see the Work section note about SMS Malawi's school name).
- **Plain English**, short sentences, no jargon a school head would not know.
- **No dashes as punctuation breaks, no emoji, no arrows** (site rules; I handle these).

## 5. Questions that help you find stories

Answer in a sentence or two each. Skip any that do not apply. Each answer may become a
principle.

L1 Precision
- Did a sensor reading or a measurement ever turn out to be wrong, noisy or misread? What did
  you do about it?
- Did you ever have to choose between a cheaper part and a better one?

L2 Reliability
- Did a device, network or installation ever fail at a bad moment? What did you change so it
  would not happen again?
- What do you always test before you hand over an installation?

L3 Security
- Did you ever spot a weak setup (passwords, open ports, exposed camera, shared accounts) at
  a client? What did you do?
- Where have you refused a shortcut because it would have been insecure?

L4 Scalability
- On SMS Malawi or another project, which decision about the data, roles or structure did
  you make early that saved you later (or that you wish you had made)?
- What did you build in a way that would still work with ten times the users?

L5 Usability
- Did a real user (a teacher, an administrator, a customer on a cheap phone) ever struggle
  with something you built? What did you change?
- What do you always check on a small phone screen?

Whole job
- What do you tell a client when they ask for something that will not work?
- What do you hand over at the end of a project that others usually skip (documentation,
  passwords, training, a list of what was not built)?

## 6. What to send me

Copy this template once per principle (four to six), fill it in, and send it in one message.
Plain text is fine.

```
Principle 1
Rule:
Layer:
Project (and may the name be shown? yes or no):
Story (60 to 120 words):
Cost, or when we break it:
```

You may also send a rough voice-style note ("what happened was...") for any one of them and I
will shape it into the five parts and show you the result before anything goes on the site.
You approve every sentence.

## 7. What I will do with it

1. Put the approved text in a new content file (`src/content/principles.ts`) and add a
   Principles section to the home page, styled like the rest of the site (hairline rows, no
   cards), with a link in the menu.
2. Keep each story short on screen: the rule large, the story below it, the layer as a small
   label.
3. Update this brief, `docs/DECISIONS.md` and `docs/HANDOFF.md`.

Until you send at least four complete principles, the section stays unbuilt and nothing
placeholder appears on the site.

## 8. A format example (NOT real, never published)

Shown only so the shape is clear. Every detail below is invented for this example.

```
Principle (EXAMPLE ONLY)
Rule: We write down what we did not build and give it to the client.
Layer: Whole job
Project: a client project (name not shown)
Story: At handover we listed three features the client had asked about early but that we
had not built, and why. Months later the client came back to add one of them. The list
meant the quote took a day instead of a week of rediscovery. (EXAMPLE TEXT)
Cost: It takes an hour at the end of every project and sometimes reminds a client of
something they wanted.
```
