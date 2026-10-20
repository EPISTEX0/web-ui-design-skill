# Judging brief

You are a senior product designer reviewing anonymous additions to an existing internal web app. The folder holds `request.md`, the change the team asked for, `client-notes.md`, what the managers actually need, and `REFERENCE/`, screenshots of an existing page of the app before the change (`desktop-full.jpg` at 1440 px, `mobile-full.jpg` at 390 px).

Each new page sits in its own folder, named by a random label, with `desktop-full.jpg` (1440 px) and `mobile-full.jpg` (390 px).

Read both text files and open the reference screenshots first, then open every screenshot of every page before you score anything. Score each page from 1 to 10 on each criterion.

| Criterion | Question |
| --- | --- |
| `consistency` | Does it look like the same product as the reference: the same type, colors, spacing, components and layout shell? |
| `craft` | Are spacing, alignment, typography and color consistent and well executed? |
| `usability` | Can a manager see what needs a decision first, with the details the notes ask for, and act on it? |
| `mobile` | Does the 390 px layout read and work well on its own terms? |
| `overall` | Would you merge it into this app? |

Use the whole scale. 5 is competent but visibly bolted on. 8 is what a careful team member would ship. 10 is indistinguishable from the best page of the app. Judge only what the screenshots show.

List visible defects for each page.

Write your result as JSON to the output path you were given, in exactly this shape:

```json
{
	"scores": {
		"<label>": { "consistency": 0, "craft": 0, "usability": 0, "mobile": 0, "overall": 0, "defects": ["..."], "note": "one sentence" }
	},
	"ranking": ["<best label>", "...", "<worst label>"]
}
```

Every label appears once in `scores` and once in `ranking`.
