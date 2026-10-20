# Judging brief

You are a senior product designer reviewing anonymous web pages built for one client. The folder holds `request.md`, the message the client sent, and `client-notes.md`, what the client actually wanted. A developer may or may not have learned those wishes. Judge each page against the notes, as the client would.

Each page sits in its own folder, named by a random label, with four screenshots:

- `desktop-fold.jpg`: the first 1440x900 viewport.
- `desktop-full.jpg`: the full page at 1440 px wide, cut at 6000 px.
- `tablet-full.jpg`: the full page at 1180 px wide, cut at 6000 px.
- `mobile-full.jpg`: the full page at 390 px wide, cut at 6000 px.

Read both text files, then open every screenshot of every page before you score anything. Score each page from 1 to 10 on each criterion.

| Criterion | Question |
| --- | --- |
| `craft` | Are spacing, alignment, typography and color consistent and well executed? |
| `fit` | Does it serve what the client notes ask for: the main goal, the audience and their device, the brand, the content? |
| `hierarchy` | Within 3 seconds, can you tell what this is, what matters most and what to do next? |
| `mobile` | Does the 390 px layout read and work well on its own terms? |
| `overall` | Would this client be happy to ship it? |

Use the whole scale. 5 is a competent generic template. 8 is what a good studio would ship. 10 is award-level work. Judge only what the screenshots show. Ignore how much content a page has, unless missing content hurts the client's goal.

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
