# Results

36 builds, judges: gemini-4-argon, gpt-6-1-sol, opus-5-5, panel.

## new: dean-fungi, gannet, le-goff

| Arm | n | Mean cost | Median time | Asked the client | Delivered | Arm skill used | Ran check.mjs | DESIGN.md | Contrast failures | Mobile overflow | Targets under 24px, median | Tab stops without focus style, median |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | 9 | $0.30 | 107s | 0/9 | 9/9 | 0/9 | 0/9 | 0/9 | 5/9 | 0/9 | 0 | 0 |
| web-ui-design-0.3 | 9 | $0.98 | 399s | 6/9 | 9/9 | 9/9 | 9/9 | 7/9 | 0/9 | 0/9 | 0 | 0 |
| web-ui-design-0.4 | 9 | $0.95 | 314s | 9/9 | 9/9 | 9/9 | 9/9 | 8/9 | 0/9 | 0/9 | 0 | 0 |
| web-ui-design-0.4-silent | 9 | $0.82 | 311s | 9/9 | 9/9 | 9/9 | 9/9 | 6/9 | 0/9 | 0/9 | 0 | 0 |

### new, judge: gemini-4-argon

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 4.78 | 2.44 | 5.33 | 4.44 | 3.00 | 0.27 |
| web-ui-design-0.3 | 6.00 | 5.00 | 6.44 | 5.67 | 5.22 | 0.61 |
| web-ui-design-0.4 | 6.78 | 6.67 | 7.44 | 6.78 | 6.56 | 0.78 |
| web-ui-design-0.4-silent | 5.56 | 2.56 | 5.89 | 5.22 | 3.56 | 0.34 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.3 vs none | 0.81 | 0.012 |
| web-ui-design-0.4 vs none | 0.87 | 0.002 |
| web-ui-design-0.4 vs web-ui-design-0.3 | 0.76 | 0.114 |
| web-ui-design-0.4-silent vs none | 0.65 | 0.243 |
| web-ui-design-0.4-silent vs web-ui-design-0.3 | 0.13 | 0.006 |
| web-ui-design-0.4-silent vs web-ui-design-0.4 | 0.11 | 0.002 |

| Brief | none | web-ui-design-0.3 | web-ui-design-0.4 | web-ui-design-0.4-silent |
| --- | --- | --- | --- | --- |
| dean-fungi | 4.00 | 3.67 | 5.00 | 3.33 |
| gannet | 3.33 | 6.00 | 7.67 | 4.00 |
| le-goff | 1.67 | 6.00 | 7.00 | 3.33 |

### new, judge: gpt-6-1-sol

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 6.00 | 3.00 | 6.44 | 5.78 | 3.56 | 0.37 |
| web-ui-design-0.3 | 6.89 | 4.44 | 7.11 | 6.33 | 5.00 | 0.60 |
| web-ui-design-0.4 | 7.00 | 6.44 | 7.67 | 6.67 | 6.22 | 0.72 |
| web-ui-design-0.4-silent | 6.33 | 2.11 | 6.78 | 5.78 | 3.22 | 0.31 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.3 vs none | 0.67 | 0.307 |
| web-ui-design-0.4 vs none | 0.80 | 0.014 |
| web-ui-design-0.4 vs web-ui-design-0.3 | 0.63 | 0.399 |
| web-ui-design-0.4-silent vs none | 0.54 | 0.930 |
| web-ui-design-0.4-silent vs web-ui-design-0.3 | 0.22 | 0.245 |
| web-ui-design-0.4-silent vs web-ui-design-0.4 | 0.09 | 0.002 |

| Brief | none | web-ui-design-0.3 | web-ui-design-0.4 | web-ui-design-0.4-silent |
| --- | --- | --- | --- | --- |
| dean-fungi | 3.33 | 4.33 | 5.00 | 3.00 |
| gannet | 4.33 | 3.33 | 6.67 | 2.67 |
| le-goff | 3.00 | 7.33 | 7.00 | 4.00 |

### new, judge: opus-5-5

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 4.89 | 2.22 | 5.33 | 4.11 | 2.11 | 0.26 |
| web-ui-design-0.3 | 6.89 | 4.78 | 6.67 | 6.44 | 4.56 | 0.58 |
| web-ui-design-0.4 | 7.22 | 7.11 | 7.56 | 6.67 | 6.44 | 0.86 |
| web-ui-design-0.4-silent | 6.56 | 2.56 | 6.33 | 5.56 | 2.67 | 0.30 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.3 vs none | 0.81 | 0.005 |
| web-ui-design-0.4 vs none | 0.96 | 0.000 |
| web-ui-design-0.4 vs web-ui-design-0.3 | 0.89 | 0.028 |
| web-ui-design-0.4-silent vs none | 0.69 | 0.176 |
| web-ui-design-0.4-silent vs web-ui-design-0.3 | 0.15 | 0.017 |
| web-ui-design-0.4-silent vs web-ui-design-0.4 | 0.02 | 0.000 |

| Brief | none | web-ui-design-0.3 | web-ui-design-0.4 | web-ui-design-0.4-silent |
| --- | --- | --- | --- | --- |
| dean-fungi | 2.67 | 3.33 | 5.33 | 2.33 |
| gannet | 2.00 | 4.33 | 6.67 | 2.67 |
| le-goff | 1.67 | 6.00 | 7.33 | 3.00 |

### new, judge: panel

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.22 | 2.56 | 5.70 | 4.78 | 2.89 | 0.30 |
| web-ui-design-0.3 | 6.59 | 4.74 | 6.74 | 6.15 | 4.93 | 0.59 |
| web-ui-design-0.4 | 7.00 | 6.74 | 7.56 | 6.70 | 6.41 | 0.78 |
| web-ui-design-0.4-silent | 6.15 | 2.41 | 6.33 | 5.52 | 3.15 | 0.32 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.3 vs none | 0.76 | 0.015 |
| web-ui-design-0.4 vs none | 0.89 | 0.001 |
| web-ui-design-0.4 vs web-ui-design-0.3 | 0.80 | 0.107 |
| web-ui-design-0.4-silent vs none | 0.54 | 0.586 |
| web-ui-design-0.4-silent vs web-ui-design-0.3 | 0.15 | 0.022 |
| web-ui-design-0.4-silent vs web-ui-design-0.4 | 0.11 | 0.003 |

| Brief | none | web-ui-design-0.3 | web-ui-design-0.4 | web-ui-design-0.4-silent |
| --- | --- | --- | --- | --- |
| dean-fungi | 3.33 | 3.78 | 5.11 | 2.89 |
| gannet | 3.22 | 4.56 | 7.00 | 3.11 |
| le-goff | 2.11 | 6.44 | 7.11 | 3.44 |

Judge agreement on overall scores (Spearman rank correlation):

- gemini-4-argon ~ gpt-6-1-sol: 0.68
- gemini-4-argon ~ opus-5-5: 0.88
- gpt-6-1-sol ~ opus-5-5: 0.73
