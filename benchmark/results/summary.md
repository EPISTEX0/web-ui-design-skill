# Results

36 builds, judges: gemini-4-argon, gpt-6-1-sol, opus-5-5, panel.

| Arm | n | Mean cost | Median time | Arm skill used | Rendered itself | Ran check.mjs | DESIGN.md | Axe serious+critical, median | Builds with contrast failures | Mobile overflow |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | 9 | $0.21 | 74s | n/a | 3/9 | 0/9 | 0/9 | 3.0 | 5/9 | 1/9 |
| frontend-design | 9 | $0.24 | 73s | 6/9 | 2/9 | 0/9 | 0/9 | 1.0 | 5/9 | 3/9 |
| web-ui-design | 9 | $0.32 | 87s | 8/9 | 7/9 | 0/9 | 0/9 | 2.0 | 6/9 | 1/9 |
| web-ui-design-0.2 | 9 | $0.34 | 103s | 9/9 | 9/9 | 9/9 | 7/9 | 0.0 | 0/9 | 0/9 |

## Judge: gemini-4-argon

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.11 | 5.11 | 5.89 | 4.67 | 4.78 | 0.15 |
| frontend-design | 6.78 | 7.44 | 7.11 | 5.00 | 6.44 | 0.52 |
| web-ui-design | 7.22 | 7.56 | 7.67 | 6.33 | 6.89 | 0.67 |
| web-ui-design-0.2 | 7.22 | 7.33 | 7.56 | 6.56 | 6.89 | 0.67 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design vs none | 0.85 | 0.006 |
| web-ui-design vs frontend-design | 0.65 | 0.354 |
| frontend-design vs none | 0.89 | 0.009 |
| web-ui-design-0.2 vs none | 0.94 | 0.004 |
| web-ui-design-0.2 vs frontend-design | 0.63 | 0.453 |
| web-ui-design-0.2 vs web-ui-design | 0.43 | 0.825 |

| Brief | none | frontend-design | web-ui-design | web-ui-design-0.2 |
| --- | --- | --- | --- | --- |
| backoff-kit | 5.33 | 6.33 | 6.33 | 7.67 |
| roastline | 4.33 | 7.00 | 6.67 | 6.33 |
| slow-clay | 4.67 | 6.00 | 7.67 | 6.67 |

## Judge: gpt-6-1-sol

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 6.44 | 6.33 | 7.22 | 5.56 | 5.89 | 0.17 |
| frontend-design | 7.89 | 8.22 | 8.11 | 5.89 | 7.22 | 0.54 |
| web-ui-design | 7.78 | 8.22 | 7.89 | 6.67 | 7.11 | 0.61 |
| web-ui-design-0.2 | 7.89 | 8.22 | 8.33 | 7.11 | 7.67 | 0.69 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design vs none | 0.80 | 0.038 |
| web-ui-design vs frontend-design | 0.54 | 0.965 |
| frontend-design vs none | 0.83 | 0.042 |
| web-ui-design-0.2 vs none | 0.94 | 0.001 |
| web-ui-design-0.2 vs frontend-design | 0.57 | 0.596 |
| web-ui-design-0.2 vs web-ui-design | 0.54 | 0.791 |

| Brief | none | frontend-design | web-ui-design | web-ui-design-0.2 |
| --- | --- | --- | --- | --- |
| backoff-kit | 5.67 | 7.00 | 6.67 | 7.67 |
| roastline | 6.33 | 7.33 | 6.67 | 7.67 |
| slow-clay | 5.67 | 7.33 | 8.00 | 7.67 |

## Judge: opus-5-5

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.78 | 5.00 | 6.22 | 5.22 | 5.11 | 0.16 |
| frontend-design | 7.33 | 7.67 | 7.89 | 5.67 | 7.00 | 0.60 |
| web-ui-design | 7.33 | 7.11 | 7.44 | 6.22 | 6.89 | 0.59 |
| web-ui-design-0.2 | 7.33 | 7.44 | 7.56 | 6.44 | 7.11 | 0.66 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design vs none | 0.85 | 0.010 |
| web-ui-design vs frontend-design | 0.54 | 0.825 |
| frontend-design vs none | 0.91 | 0.006 |
| web-ui-design-0.2 vs none | 0.93 | 0.002 |
| web-ui-design-0.2 vs frontend-design | 0.46 | 1.000 |
| web-ui-design-0.2 vs web-ui-design | 0.56 | 0.757 |

| Brief | none | frontend-design | web-ui-design | web-ui-design-0.2 |
| --- | --- | --- | --- | --- |
| backoff-kit | 5.33 | 7.00 | 6.33 | 7.00 |
| roastline | 5.00 | 7.00 | 6.67 | 7.67 |
| slow-clay | 5.00 | 7.00 | 7.67 | 6.67 |

## Judge: panel

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.78 | 5.48 | 6.44 | 5.15 | 5.26 | 0.16 |
| frontend-design | 7.33 | 7.78 | 7.70 | 5.52 | 6.89 | 0.55 |
| web-ui-design | 7.44 | 7.63 | 7.67 | 6.41 | 6.96 | 0.62 |
| web-ui-design-0.2 | 7.48 | 7.67 | 7.81 | 6.70 | 7.22 | 0.67 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design vs none | 0.89 | 0.009 |
| web-ui-design vs frontend-design | 0.63 | 0.691 |
| frontend-design vs none | 0.93 | 0.012 |
| web-ui-design-0.2 vs none | 0.96 | 0.001 |
| web-ui-design-0.2 vs frontend-design | 0.65 | 0.402 |
| web-ui-design-0.2 vs web-ui-design | 0.48 | 1.000 |

| Brief | none | frontend-design | web-ui-design | web-ui-design-0.2 |
| --- | --- | --- | --- | --- |
| backoff-kit | 5.44 | 6.78 | 6.44 | 7.44 |
| roastline | 5.22 | 7.11 | 6.67 | 7.22 |
| slow-clay | 5.11 | 6.78 | 7.78 | 7.00 |

Judge agreement on overall scores (Spearman rank correlation):

- gemini-4-argon ~ gpt-6-1-sol: 0.74
- gemini-4-argon ~ opus-5-5: 0.71
- gpt-6-1-sol ~ opus-5-5: 0.70
