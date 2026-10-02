# Flock Built Performance — website demo

A shareable static presentation for the proposed Flock Built Performance website. This is a demo, not the final business website.

Quote requests are simulated entirely in the browser. Nothing is sent, booked or charged. Use sample details. Photos stay in the tab. Real call/text/map/Instagram links open only when chosen.

Missing business facts remain explicit fill-ins. Prices and reviews are omitted. The wordmark is temporary. Client-supplied shop/Civic photos are used for this authorized presentation; final business content and public-use approval remain client review items.

Built with Astro, GSAP and Lenis. Font and component license notices are included in `public/licenses/`. No credentials, private client worksheet, internal project history or audit records are included.

Node.js 22.12+ is needed only to rebuild:

```sh
npm ci
npm run build
```

The static output is committed in `docs/`. GitHub Pages publishes the main branch's `/docs` folder with `.nojekyll`. Every internal link and asset uses the `/flockbuilt-demo/` project path. No server-side integration or paid service is required.
