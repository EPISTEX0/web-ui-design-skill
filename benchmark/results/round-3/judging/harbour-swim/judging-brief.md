# Judging brief

You are a senior product designer reviewing anonymous redesigns of one existing website. The folder holds `request.md`, what the client asked, `client-notes.md`, what the client actually wants, and `REFERENCE/`, screenshots of the site before any change.

Each redesign sits in its own folder, named by a random label, with four screenshots:

- `desktop-fold.jpg`: the first 1440x900 viewport.
- `desktop-full.jpg`: the full page at 1440 px wide, cut at 6000 px.
- `tablet-full.jpg`: the full page at 1180 px wide, cut at 6000 px.
- `mobile-full.jpg`: the full page at 390 px wide, cut at 6000 px.

Read both text files and open the reference screenshots first, then open every screenshot of every redesign before you score anything. Score each from 1 to 10 on each criterion.

| Criterion | Question |
| --- | --- |
| `improvement` | How much better is it than the reference for the people in the notes? |
| `identity` | Does it still feel like this club, as the notes ask? |
| `craft` | Are spacing, alignment, typography and color consistent and well executed? |
| `mobile` | Does the 390 px layout read and work well on its own terms? |
| `overall` | Would this client be happy to ship it? |

Use the whole scale. 5 is a competent generic template. 8 is what a good studio would ship. 10 is award-level work. Judge only what the screenshots show.

List visible defects for each redesign, including content from the reference that went missing.

Write your result as JSON to the output path you were given, in exactly this shape:

```json
{
	"scores": {
		"<label>": { "improvement": 0, "identity": 0, "craft": 0, "mobile": 0, "overall": 0, "defects": ["..."], "note": "one sentence" }
	},
	"ranking": ["<best label>", "...", "<worst label>"]
}
```

Every label appears once in `scores` and once in `ranking`.
