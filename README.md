## Inspiration

As a team, we have all been there: startup pitches where follow-ups slip through the cracks, classroom lectures with too much to absorb, meeting discussions where action items get lost before they ever reach a to-do list. In the heat of the moment, **conversations vanish**. Whether you are networking, brainstorming, or learning, too many crucial tasks, insights, and meetings are scheduled too late or omitted entirely.

So this weekend, we asked ourselves one simple question: **What if your conversations could do the work for you?**

That is how goAction was born. It's a second brain that listens, captures, and transforms your spoken moments into structured, actionable outcomes. No more forgotten promises, no more missed deadlines, no more scrambling to remember what was said.

## What It Does

1. **Captures and structures your conversations in real time.** goAction listens through advanced speech-to-text, transcribes every word, and uses AI to transform messy recordings into clean, formatted documents, summaries, and visual flowcharts.

2. **Turns spoken words into scheduled actions.** Action items detected in your conversations automatically flow into your calendar and task systems through Gumloop automation. No manual entry, no forgotten follow-ups.

**Entirely hands-free.** goAction pairs with **Meta Glasses** or any mobile device for seamless, always-on microphone input. Just speak naturally and the app handles everything.

## How We Built It

### Tech Stack

goAction runs on **Next.js 16** with **Tauri 2** wrapping it as a native desktop app. The frontend uses **React 19**, **TailwindCSS 4**, and **Framer Motion**. Document editing is powered by **PlateJS**, a Slate-based editor, while flowcharts use **React Flow** with **Dagre** for automatic layout.

All AI features run through **Google Gemini 2.5 Flash** with custom prompts engineered to output valid JSON for each feature. **ElevenLabs Scribe** handles real-time transcription with echo cancellation and noise suppression. **ElevenLabs Conversational AI** powers the voice agent, connecting via WebRTC to expose tools that users trigger through natural speech. **Gumloop** webhooks route detected action items to calendar and task systems.

### Auth0 Integration

**Auth0** is the authentication backbone and central to our Auth0 Sponsor Track implementation. Users authenticate through Auth0 Universal Login, with the `@auth0/nextjs-auth0` SDK handling server-side sessions and client-side user context via the `useUser` hook. The dashboard displays personalized information (avatar, name, email) and the entire route tree requires authentication. Auth0 ensures every conversation and document is tied to a verified identity, essential for privacy-sensitive voice recordings.

## Challenges We Ran Into

Coordinating multiple voice streams in real time was our biggest challenge. Transcription and the voice agent both need continuous audio, and tools must execute without interrupting either. We solved this with separate WebRTC sessions, a pending-segments queue for buffered commits, and mode switching between recording and issuing commands. We had to make sure Gemini's output matches Slate's JSON schema exactly, or the editor would crash. We engineered precise prompts, sanitized responses, and used atomic batch updates.

## Accomplishments That We Are Proud Of

- Built a fully voice-controlled workflow where users go from recording to formatted documents to flowcharts without a single click.
- Integrated real-time transcription, AI formatting, and visual storyboarding into one seamless, hands-free experience.
- Shipped calendar integration through Gumloop so action items actually get scheduled, not forgotten.

## What We Learned

- Making conversations actionable is as hard as the work itself; solving that problem meaningfully took more thought and iteration than we expected.
- Gained deep understanding of the ElevenLabs ecosystem: real-time Scribe transcription alongside Conversational AI tool-calling.
- Learned prompt engineering for structured output with temperature tuning LLMs into valid JSON for specific library schemas.
- Understood Auth0's NextJS SDK patterns for secure session management and client-side hooks.

## What Is Next for goAction

- Cloud sync with Auth0 user metadata for seamless multi-device access.
- Team collaboration with real-time shared editing.
- Advanced speaker analytics with sentiment analysis.
- Launch our go-to-market strategy starting with university clubs, the corporate environment, and founder communities.
