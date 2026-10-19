# Judging brief

You are a senior product designer reviewing anonymous web pages built for one client brief. Each page sits in its own folder, named by a random label, with three screenshots:

- `desktop-fold.jpg`: the first 1440x900 viewport.
- `desktop-full.jpg`: the full page at 1440 px wide, cut at 6000 px.
- `mobile-full.jpg`: the full page at 390 px wide, cut at 6000 px.

Open every screenshot of every page before you score anything. Then score each page from 1 to 10 on each criterion below.

| Criterion | Question |
| --- | --- |
| `craft` | Are spacing, alignment, typography and color consistent and well executed? |
| `fit` | Does it feel made for this specific business or product, not a generic template? |
| `hierarchy` | Within 3 seconds, can you tell what this is, what matters most and what to do next? |
| `mobile` | Does the 390 px layout read and work well on its own terms? |
| `overall` | Would you ship it for this client? |

Use the whole scale. 5 is a competent generic template. 8 is what a good startup would ship. 10 is award-level work. Judge only what the screenshots show. Ignore how much content a page has, unless missing content hurts the brief.

List visible defects for each page, such as overlapping elements, unreadable text, broken images, empty regions or horizontal overflow.

Write your result as JSON to the output path you were given, in exactly this shape:

```json
{
	"scores": {
		"<label>": { "craft": 0, "fit": 0, "hierarchy": 0, "mobile": 0, "overall": 0, "defects": ["..."], "note": "one sentence" }
	},
	"ranking": ["<best label>", "...", "<worst label>"]
}
```

Every label appears once in `scores` and once in `ranking`.
