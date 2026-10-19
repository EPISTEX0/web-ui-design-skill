# Results

27 builds, judges: gemini-4-argon, gpt-6-1-sol, opus-5-5, panel.

| Arm | n | Mean cost | Median time | Arm skill used | Rendered itself | Axe serious+critical | Mobile overflow |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | 9 | $0.21 | 74s | n/a | 3/9 | 5.1 | 1/9 |
| frontend-design | 9 | $0.24 | 73s | 6/9 | 2/9 | 8.6 | 3/9 |
| web-ui-design | 9 | $0.32 | 87s | 8/9 | 7/9 | 11.4 | 1/9 |

## Judge: gemini-4-argon

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.22 | 5.56 | 6.00 | 5.11 | 4.89 | 0.19 |
| frontend-design | 7.22 | 8.00 | 7.78 | 5.78 | 6.89 | 0.60 |
| web-ui-design | 7.78 | 8.11 | 8.11 | 6.89 | 7.33 | 0.71 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design vs none | 0.89 | 0.008 |
| web-ui-design vs frontend-design | 0.63 | 0.453 |
| frontend-design vs none | 0.87 | 0.017 |

| Brief | none | frontend-design | web-ui-design |
| --- | --- | --- | --- |
| backoff-kit | 6.00 | 7.00 | 7.33 |
| roastline | 4.33 | 7.33 | 6.67 |
| slow-clay | 4.33 | 6.33 | 8.00 |

## Judge: gpt-6-1-sol

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 6.11 | 6.44 | 7.33 | 5.89 | 6.00 | 0.31 |
| frontend-design | 8.11 | 8.56 | 8.11 | 6.33 | 7.56 | 0.69 |
| web-ui-design | 7.44 | 8.00 | 7.89 | 6.11 | 6.89 | 0.50 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design vs none | 0.72 | 0.171 |
| web-ui-design vs frontend-design | 0.31 | 0.270 |
| frontend-design vs none | 0.76 | 0.038 |

| Brief | none | frontend-design | web-ui-design |
| --- | --- | --- | --- |
| backoff-kit | 6.00 | 6.67 | 6.00 |
| roastline | 6.67 | 7.33 | 7.00 |
| slow-clay | 5.33 | 8.67 | 7.67 |

## Judge: opus-5-5

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.56 | 4.89 | 6.44 | 5.33 | 5.00 | 0.24 |
| frontend-design | 7.22 | 7.67 | 7.78 | 5.44 | 6.67 | 0.63 |
| web-ui-design | 7.22 | 7.11 | 7.67 | 6.22 | 6.89 | 0.64 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design vs none | 0.85 | 0.009 |
| web-ui-design vs frontend-design | 0.57 | 0.596 |
| frontend-design vs none | 0.87 | 0.015 |

| Brief | none | frontend-design | web-ui-design |
| --- | --- | --- | --- |
| backoff-kit | 5.33 | 6.00 | 5.67 |
| roastline | 5.00 | 7.00 | 7.67 |
| slow-clay | 4.67 | 7.00 | 7.33 |

## Judge: panel

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.63 | 5.63 | 6.59 | 5.44 | 5.30 | 0.25 |
| frontend-design | 7.52 | 8.07 | 7.89 | 5.85 | 7.04 | 0.64 |
| web-ui-design | 7.48 | 7.74 | 7.89 | 6.41 | 7.04 | 0.62 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design vs none | 0.83 | 0.019 |
| web-ui-design vs frontend-design | 0.52 | 0.860 |
| frontend-design vs none | 0.89 | 0.022 |

| Brief | none | frontend-design | web-ui-design |
| --- | --- | --- | --- |
| backoff-kit | 5.78 | 6.56 | 6.33 |
| roastline | 5.33 | 7.22 | 7.11 |
| slow-clay | 4.78 | 7.33 | 7.67 |

Judge agreement on overall scores (Spearman rank correlation):

- gemini-4-argon ~ gpt-6-1-sol: 0.65
- gemini-4-argon ~ opus-5-5: 0.76
- gpt-6-1-sol ~ opus-5-5: 0.80
