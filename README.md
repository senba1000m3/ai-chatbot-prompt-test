[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ritmo-v0/project-tau)

# Project τ (read as Project Tau)
Project τ is an experimental AI chat app for code-based template development, a side project branched off (but a totally different, brand new approach) from our previous platform, Project TAI (**T**eaching assistant **AI**).

## Developers
- [Ritmo](https://github.com/ritmo-v0) - Overall code structure
- [UNO](https://github.com/UN-O) - AI SDK related stuff and tools

## Features
[Jump to "Getting Started" Section](#getting-started)

- The Basics: LLM switching, auth & sync, modern interface
- Markdown & Syntax Highlighting Support (including LaTeX!)
- Modularized Tools (code-level): Easy to create your own tool and let LLM call them
	- Block Tool: Shows results in an additional right panel, e.g. steps
	- Inline Tool: Shows results in the chat, e.g. stickers
- Response Character Presets: Choose a (character) respond style you like
- Web Search
- Chat Sharing

What we **DON'T** have now:
- :x: Attachment Support
- :x: Image Generation
- :x: Chat Branching
- :x: BYOK

## Getting Started
### Auth & Database
For database and auth to run properly, you'll need a [Neon Database](https://neon.com/). Create a new project with the Free Plan and copy the `DATABASE_URL` value from the "Connect to your database" section.
### Google OAuth
You'll also need to create a Google auth client at the [Google Auth Platform](https://console.cloud.google.com/auth/overview). To do that, first create a new Google Cloud Project.
Set "Authorized JavaScript origins" to your production domain and dev domain (note that it uses HTTPS), and "Authorized redirect URIs" to `{domain}/api/auth/callback/google`. Also remember to copy the client ID and client secret.
### Upstash Redis (Optional)
We store some of our prompts (character prompts specifically) in an Upstash Redis database, in case you don't need it, you can remove the functionality in `src\lib\chat\actions.ts`.
If you do want to test out, the default character ID is `tai-chan`. Create a key value pair with it as the key name, or even further, change the character ID by your preference.
### AI Providers
This project uses only a subset of OpenAI models and Google Gemini models (without OpenRouter), so remember to grab API keys respectively.
### Next Steps
1. Create a `.env` file and prepare the following environment variables:

	```bash
	DATABASE_URL={NEON_DATABASE_URL}

	# Generate a secret with `npx auth secret`, `openssl rand -base64 32`, or methods you prefer
	BETTER_AUTH_SECRET={GENERATED_SECRET}
	BETTER_AUTH_GOOGLE_ID={YOUR_GOOGLE_CLIENT_ID}
	BETTER_AUTH_GOOGLE_SECRET={YOUR_GOOGLE_CLIENT_SECRET}

	OPENAI_API_KEY={YOUR_OPENAI_API_KEY}
	GOOGLE_GENERATIVE_AI_API_KEY={YOUR_GOOGLE_API_KEY}

	# Omit if not used
	UPSTASH_REDIS_REST_URL={}
	UPSTASH_REDIS_REST_TOKEN={}
	```
2. Run `pnpm install`.
3. Run the development server using `pnpm dev`.
4. After logging in with Google OAuth ("Get Started" button in the hompage) and automatically navigated to the `/chat` page, try asking the AI a question.

## Developers' Murmur
### Ritmo
**TL;DR**:

It is crazy about how fast one could create a great website with all these modern libraries in year 2024. Project TAI (V2) was a complete mess with a bunch of bad customed stuff, and we were planning for a V3. But since I (the main structure decider) had to serve substitue miltary service, it was postponed until I got out of ~~that hell~~. It was 2025/05/28.

Then later, you know, T3 Chat Cloneathon started. We took the opportunity, and the rest is what you see. We call it "Project TAI V3.5" internally since we have an abandoned V3 branch-off. ~~And play fun of GPT-3.5~~


> Why abandoned? B/c frameworks and libraries update fxxking fast:
> - Next.js 13 => Next.js 15
> - Tailwind V3 => Tailwind V4
> - `shadcn/ui` had new versions, mostly because of Tailwind V4 but also rewritten as React components (by the time writing, Radix UI had a new mono package)
> - Migrated from never-ending beta `auth.js` to `better-auth`

Future versions would probably be very different from this, since we chose to build with what we know best ~~a.k.a. the fanboy stack~~, but not the best option for an AI chatbot like this.

## License
This repository is published under the MIT license.