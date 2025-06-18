[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ritmo-v0/project-tau)

# Project τ (read as Project Tau)
Project τ is an experimental AI chat app for code-oriented template development, a side project branched off (but a totally different, brand new approach) from our previous platform, Project TAI (**T**eaching assistant **AI**). Our main focus is on a flexible, extensible system for building all kinds of generative UI tools — whether inline, block-based, or streaming.

You can find more information about Project TAI from a Facebook post authored by NTHU (National Tsing Hua University) [here](https://www.facebook.com/share/p/1MUugtN2nW/).

(For a translated version, check out the [shared chat](https://project-tau.ritmo.dev/chat/share/iiYx9dm) we created using Project τ itself!)

## Developers
- [Ritmo](https://github.com/ritmo-v0) - Overall code structure
- [UNO](https://github.com/UN-O) - AI SDK related stuff and tools

## Features
[Jump to "Getting Started" Section](#getting-started)
### The Basics
- LLM switching, auth & sync, modern interface
- Markdown & Syntax Highlighting support (including LaTeX!)
- Modularized Tools (code-level): Easy to create your own tool and let LLM call them
	- Block Tool: Shows results in an additional right panel, e.g. steps
	- Inline Tool: Shows results in the chat, e.g. stickers
- Web Search
- Chat Sharing
- Style Your Own Interface
	- Theme Changer, including a T3 Chat theme lol (code and theme parsed from [shadcn/studio](https://github.com/themeselection/shadcn-studio) partially, themes from [tweakcn](https://github.com/jnsahaj/tweakcn) additionally)
	- i18n (powered by [next-intl](https://github.com/amannn/next-intl))
- Install as a PWA (currently supports desktop only)

  ![螢幕擷取畫面 2025-06-19 074919](https://github.com/user-attachments/assets/92d1759c-a849-4c37-b6c1-f8a96403e3ca)


### Entertainments (Don't Take Them Too Serious)
- BYOC (Bring You Our Characters): Choose a respond character (style) you like
- Made all of our loaders [spin faster thus loading things faster](https://x.com/jordienr/status/1932036673644232794)
- Chat input follows the Liquid Glass trend (but it's a frosted glass)!
- Our NanoID length defaults to 16 so we could store chats and messages more than ever (YouTube videos only use 11)
- Source code is shittier than [the one billionth repo](https://github.com/AasishPokhrel/shit)

### What We **DON'T** Have Now
- :x: Attachment Support
- :x: Image Generation
- :x: Chat Branching
- :x: BYOK (Bring Your Own Keys)

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
3. Run `pnpm drizzle:mgr` to apply schema migrations to your Neon database for the first time (shorthand for `drizzle-kit migrate --config drizzle.config.ts`).
4. Run the development server using `pnpm dev`.
5. In case the default language doesn't appear to be en-US, you could always change it at the homepage or in the chat sidebar footer.
6. After logging in with Google OAuth ("Get Started" button in the hompage) and automatically navigated to the `/chat` page, try asking the AI a question.

> [!WARNING]
> The website is not fully debugged. Though things may work under the hood, some states might not update immediately. If something behaves strangely, try refreshing the page.

## Developers' Murmur
### Ritmo
**TL;DR**: We joined the T3 Chat Cloneathon to fix our procrastination (of creating stuff)

It is crazy about how fast one could create a great website with all these modern libraries in year 2024. Project TAI (V2) was a complete mess with a bunch of bad customed stuff, and we were planning for a V3. But since I (the main structure decider) had to serve substitue miltary service, it was postponed until I got out of ~~that hell~~. It was 2025/05/28.

Then later, you know, T3 Chat Cloneathon started. We took the opportunity, and the rest is what you see. We call it "Project TAI V3.5" internally since we have an abandoned V3 branch-off. ~~And play fun of GPT-3.5~~


> Why abandoned? B/c frameworks and libraries update fxxking fast:
> - Next.js 13 => Next.js 15 with the breaking [async request APIs](https://nextjs.org/docs/app/guides/upgrading/version-15#async-request-apis-breaking-change) that literally breaks all of my page[.js,.tsx]
> - Tailwind V3 => Tailwind V4 with the new CSS based approach
> - AI SDK 2.0 => AI SDK 5.0 Alpha
> - `shadcn/ui` had new versions, mostly because of Tailwind V4 but also rewritten as React components (and by the time writing, Radix UI had a new mono package)
> - Migrated from never-ending beta `auth.js` to `better-auth`

Future versions would probably be very different from this since we chose to build with what we know best ~~a.k.a. the fanboy stack~~, but not the best option for an AI chatbot like this.

### UNO
I just can't figure out why the FPS drops when receiving streams.

## License
This repository is published under the MIT license.
