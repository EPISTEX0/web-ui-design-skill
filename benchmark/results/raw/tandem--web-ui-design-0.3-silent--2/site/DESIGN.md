# Tandem design notes

**Brief (all assumed; the user asked me to decide)**
- Subject: cargo bike shop, Utrecht. Page type: local business. Mode: Persuade. Family: Soft and friendly.
- Primary action: book a test ride. Audience: families on phones. Languages: EN with NL toggle (data-nl attributes, JS swap, saved in localStorage).
- No proof section: no real testimonials or stats were supplied.

**Tokens (in `:root` of index.html)**
- Canal blue-greys (ground, ink): the Utrecht canals. Accent `--path-600`: red bike-path asphalt, used for actions only.
- Type: system rounded stack (no web fonts). Radius 8/16/24/pill. Depth: 1px ring plus soft shadow.
- Signature: the "What will you carry?" chooser, which maps a load to a bike type and pre-selects the form.

**To fill before launch** (top of the `<script>`): `SHOP.email`, `SHOP.address`, `SHOP.hours` (currently sample).
Prices, photos and a phone number are not on the page because none were supplied.
