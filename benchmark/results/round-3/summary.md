# Results

69 builds, judges: gemini-4-argon, gpt-6-1-sol, opus-5-5, panel.

## new: kestrel, salt-and-iron, tandem

| Arm | n | Mean cost | Median time | Asked the client | Delivered | Arm skill used | Ran check.mjs | DESIGN.md | Contrast failures | Mobile overflow | Targets under 24px, median | Tab stops without focus style, median |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | 9 | $0.16 | 50s | 0/9 | 9/9 | 0/9 | 0/9 | 0/9 | 7/9 | 2/9 | 0 | 0 |
| frontend-design | 9 | $0.23 | 70s | 0/9 | 9/9 | 6/9 | 0/9 | 0/9 | 5/9 | 3/9 | 0 | 0 |
| web-ui-design-0.2 | 9 | $0.35 | 92s | 0/9 | 9/9 | 9/9 | 9/9 | 9/9 | 0/9 | 0/9 | 0 | 0 |
| web-ui-design-0.3 | 9 | $0.51 | 178s | 6/9 | 9/9 | 9/9 | 9/9 | 8/9 | 0/9 | 0/9 | 0 | 0 |
| web-ui-design-0.3-silent | 9 | $0.51 | 140s | 6/9 | 9/9 | 9/9 | 9/9 | 8/9 | 0/9 | 0/9 | 0 | 0 |

### new, judge: gemini-4-argon

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.67 | 4.22 | 5.78 | 5.67 | 4.44 | 0.47 |
| frontend-design | 5.33 | 3.22 | 5.22 | 5.11 | 3.67 | 0.29 |
| web-ui-design-0.2 | 5.78 | 4.33 | 6.33 | 5.56 | 4.67 | 0.50 |
| web-ui-design-0.3 | 7.11 | 7.78 | 7.89 | 7.11 | 7.11 | 0.84 |
| web-ui-design-0.3-silent | 5.56 | 3.67 | 6.22 | 4.67 | 4.22 | 0.40 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| frontend-design vs none | 0.37 | 0.295 |
| web-ui-design-0.2 vs none | 0.52 | 0.760 |
| web-ui-design-0.2 vs frontend-design | 0.72 | 0.100 |
| web-ui-design-0.3 vs none | 0.81 | 0.007 |
| web-ui-design-0.3 vs frontend-design | 0.94 | 0.001 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.80 | 0.008 |
| web-ui-design-0.3-silent vs none | 0.52 | 0.820 |
| web-ui-design-0.3-silent vs frontend-design | 0.61 | 0.427 |
| web-ui-design-0.3-silent vs web-ui-design-0.2 | 0.41 | 0.547 |
| web-ui-design-0.3-silent vs web-ui-design-0.3 | 0.07 | 0.004 |

| Brief | none | frontend-design | web-ui-design-0.2 | web-ui-design-0.3 | web-ui-design-0.3-silent |
| --- | --- | --- | --- | --- | --- |
| kestrel | 5.67 | 3.33 | 5.67 | 5.33 | 4.00 |
| salt-and-iron | 3.00 | 4.00 | 4.00 | 7.67 | 3.00 |
| tandem | 4.67 | 3.67 | 4.33 | 8.33 | 5.67 |

### new, judge: gpt-6-1-sol

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.78 | 3.89 | 5.78 | 5.33 | 4.33 | 0.52 |
| frontend-design | 5.11 | 3.22 | 5.44 | 4.67 | 3.56 | 0.33 |
| web-ui-design-0.2 | 6.00 | 3.67 | 6.22 | 5.67 | 4.33 | 0.50 |
| web-ui-design-0.3 | 6.89 | 6.89 | 7.56 | 7.00 | 6.56 | 0.77 |
| web-ui-design-0.3-silent | 6.11 | 3.56 | 6.11 | 5.44 | 4.00 | 0.39 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| frontend-design vs none | 0.31 | 0.185 |
| web-ui-design-0.2 vs none | 0.46 | 1.000 |
| web-ui-design-0.2 vs frontend-design | 0.70 | 0.226 |
| web-ui-design-0.3 vs none | 0.85 | 0.020 |
| web-ui-design-0.3 vs frontend-design | 0.85 | 0.001 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.74 | 0.026 |
| web-ui-design-0.3-silent vs none | 0.31 | 0.617 |
| web-ui-design-0.3-silent vs frontend-design | 0.56 | 0.510 |
| web-ui-design-0.3-silent vs web-ui-design-0.2 | 0.33 | 0.477 |
| web-ui-design-0.3-silent vs web-ui-design-0.3 | 0.15 | 0.005 |

| Brief | none | frontend-design | web-ui-design-0.2 | web-ui-design-0.3 | web-ui-design-0.3-silent |
| --- | --- | --- | --- | --- | --- |
| kestrel | 4.67 | 4.33 | 5.33 | 4.67 | 5.00 |
| salt-and-iron | 3.00 | 3.00 | 2.67 | 7.00 | 2.33 |
| tandem | 5.33 | 3.33 | 5.00 | 8.00 | 4.67 |

### new, judge: opus-5-5

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.56 | 4.33 | 6.11 | 5.00 | 4.33 | 0.52 |
| frontend-design | 5.56 | 2.89 | 5.44 | 5.00 | 3.56 | 0.25 |
| web-ui-design-0.2 | 6.33 | 3.44 | 6.67 | 5.78 | 4.22 | 0.46 |
| web-ui-design-0.3 | 6.89 | 7.22 | 8.00 | 7.33 | 6.89 | 0.76 |
| web-ui-design-0.3-silent | 6.33 | 3.89 | 6.78 | 5.56 | 4.22 | 0.52 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| frontend-design vs none | 0.33 | 0.363 |
| web-ui-design-0.2 vs none | 0.46 | 0.945 |
| web-ui-design-0.2 vs frontend-design | 0.70 | 0.260 |
| web-ui-design-0.3 vs none | 0.76 | 0.008 |
| web-ui-design-0.3 vs frontend-design | 0.93 | 0.000 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.78 | 0.006 |
| web-ui-design-0.3-silent vs none | 0.43 | 0.895 |
| web-ui-design-0.3-silent vs frontend-design | 0.72 | 0.239 |
| web-ui-design-0.3-silent vs web-ui-design-0.2 | 0.50 | 0.970 |
| web-ui-design-0.3-silent vs web-ui-design-0.3 | 0.24 | 0.006 |

| Brief | none | frontend-design | web-ui-design-0.2 | web-ui-design-0.3 | web-ui-design-0.3-silent |
| --- | --- | --- | --- | --- | --- |
| kestrel | 6.00 | 4.33 | 5.67 | 5.33 | 6.00 |
| salt-and-iron | 2.33 | 3.33 | 2.67 | 7.00 | 2.33 |
| tandem | 4.67 | 3.00 | 4.33 | 8.33 | 4.33 |

### new, judge: panel

| Arm | craft | fit | hierarchy | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.67 | 4.15 | 5.89 | 5.33 | 4.37 | 0.50 |
| frontend-design | 5.33 | 3.11 | 5.37 | 4.93 | 3.59 | 0.29 |
| web-ui-design-0.2 | 6.04 | 3.81 | 6.41 | 5.67 | 4.41 | 0.49 |
| web-ui-design-0.3 | 6.96 | 7.30 | 7.81 | 7.15 | 6.85 | 0.79 |
| web-ui-design-0.3-silent | 6.00 | 3.70 | 6.37 | 5.22 | 4.15 | 0.43 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| frontend-design vs none | 0.35 | 0.194 |
| web-ui-design-0.2 vs none | 0.54 | 0.807 |
| web-ui-design-0.2 vs frontend-design | 0.80 | 0.089 |
| web-ui-design-0.3 vs none | 0.81 | 0.005 |
| web-ui-design-0.3 vs frontend-design | 0.94 | 0.000 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.76 | 0.008 |
| web-ui-design-0.3-silent vs none | 0.44 | 0.847 |
| web-ui-design-0.3-silent vs frontend-design | 0.65 | 0.209 |
| web-ui-design-0.3-silent vs web-ui-design-0.2 | 0.41 | 0.712 |
| web-ui-design-0.3-silent vs web-ui-design-0.3 | 0.15 | 0.004 |

| Brief | none | frontend-design | web-ui-design-0.2 | web-ui-design-0.3 | web-ui-design-0.3-silent |
| --- | --- | --- | --- | --- | --- |
| kestrel | 5.44 | 4.00 | 5.56 | 5.11 | 5.00 |
| salt-and-iron | 2.78 | 3.44 | 3.11 | 7.22 | 2.56 |
| tandem | 4.89 | 3.33 | 4.56 | 8.22 | 4.89 |

## extend: shiftboard

| Arm | n | Mean cost | Median time | Asked the client | Delivered | Arm skill used | Ran check.mjs | DESIGN.md | Mobile overflow | App builds | New color literals, median | Reuses components | Changed existing pages | Flow works | Actions reachable at 390 px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | 3 | $0.17 | 35s | 0/3 | 3/3 | 0/3 | 0/3 | 0/3 | 2/3 | 3/3 | 0 | 3/3 | 0/3 | 3/3 | 0/3 |
| web-ui-design-0.2 | 3 | $0.17 | 34s | 0/3 | 3/3 | 0/3 | 0/3 | 0/3 | 3/3 | 3/3 | 0 | 3/3 | 0/3 | 3/3 | 0/3 |
| web-ui-design-0.3 | 3 | $0.16 | 32s | 0/3 | 3/3 | 0/3 | 0/3 | 0/3 | 0/3 | 3/3 | 0 | 3/3 | 0/3 | 3/3 | 0/3 |
| web-ui-design-0.3-wired | 3 | $0.40 | 358s | 0/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 3/3 | 0 | 3/3 | 0/3 | 3/3 | 2/3 |

### extend, judge: gemini-4-argon

| Arm | consistency | craft | usability | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 8.00 | 5.67 | 5.00 | 3.33 | 5.00 | 0.39 |
| web-ui-design-0.2 | 8.67 | 6.00 | 5.67 | 3.00 | 5.67 | 0.61 |
| web-ui-design-0.3 | 7.00 | 5.67 | 4.00 | 3.00 | 4.00 | 0.09 |
| web-ui-design-0.3-wired | 9.00 | 8.00 | 7.33 | 7.00 | 7.67 | 0.91 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.2 vs none | 0.83 | 0.400 |
| web-ui-design-0.3 vs none | 0.00 | 0.100 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.00 | 0.100 |
| web-ui-design-0.3-wired vs none | 1.00 | 0.100 |
| web-ui-design-0.3-wired vs web-ui-design-0.2 | 0.89 | 0.300 |
| web-ui-design-0.3-wired vs web-ui-design-0.3 | 1.00 | 0.100 |

### extend, judge: gpt-6-1-sol

| Arm | consistency | craft | usability | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 9.00 | 6.00 | 5.33 | 2.33 | 5.33 | 0.52 |
| web-ui-design-0.2 | 9.00 | 6.67 | 5.00 | 2.00 | 5.00 | 0.58 |
| web-ui-design-0.3 | 9.00 | 5.67 | 3.67 | 1.67 | 3.67 | 0.09 |
| web-ui-design-0.3-wired | 9.33 | 7.67 | 6.33 | 6.33 | 7.00 | 0.82 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.2 vs none | 0.33 | 1.000 |
| web-ui-design-0.3 vs none | 0.00 | 0.100 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.00 | 0.100 |
| web-ui-design-0.3-wired vs none | 0.78 | 0.400 |
| web-ui-design-0.3-wired vs web-ui-design-0.2 | 0.83 | 0.400 |
| web-ui-design-0.3-wired vs web-ui-design-0.3 | 1.00 | 0.100 |

### extend, judge: opus-5-5

| Arm | consistency | craft | usability | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 9.00 | 7.67 | 6.00 | 2.33 | 5.00 | 0.36 |
| web-ui-design-0.2 | 9.00 | 8.00 | 6.00 | 2.00 | 5.00 | 0.64 |
| web-ui-design-0.3 | 8.00 | 6.67 | 4.00 | 3.00 | 3.67 | 0.09 |
| web-ui-design-0.3-wired | 9.00 | 8.00 | 6.67 | 6.33 | 7.00 | 0.91 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.2 vs none | 0.50 | 1.000 |
| web-ui-design-0.3 vs none | 0.00 | 0.100 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.00 | 0.100 |
| web-ui-design-0.3-wired vs none | 1.00 | 0.100 |
| web-ui-design-0.3-wired vs web-ui-design-0.2 | 1.00 | 0.100 |
| web-ui-design-0.3-wired vs web-ui-design-0.3 | 1.00 | 0.100 |

### extend, judge: panel

| Arm | consistency | craft | usability | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 8.67 | 6.44 | 5.44 | 2.67 | 5.11 | 0.42 |
| web-ui-design-0.2 | 8.89 | 6.89 | 5.56 | 2.33 | 5.22 | 0.61 |
| web-ui-design-0.3 | 8.00 | 6.00 | 3.89 | 2.56 | 3.78 | 0.09 |
| web-ui-design-0.3-wired | 9.11 | 7.89 | 6.78 | 6.56 | 7.22 | 0.88 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.2 vs none | 0.67 | 1.000 |
| web-ui-design-0.3 vs none | 0.00 | 0.100 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.00 | 0.100 |
| web-ui-design-0.3-wired vs none | 1.00 | 0.100 |
| web-ui-design-0.3-wired vs web-ui-design-0.2 | 1.00 | 0.100 |
| web-ui-design-0.3-wired vs web-ui-design-0.3 | 1.00 | 0.100 |

## improve: harbour-swim

| Arm | n | Mean cost | Median time | Asked the client | Delivered | Arm skill used | Ran check.mjs | DESIGN.md | Contrast failures | Mobile overflow | Targets under 24px, median | Tab stops without focus style, median | Defects left, mean | Content and flows kept | Brand kept |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none | 3 | $0.43 | 60s | 1/3 | 3/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 1 | 0 | 2.0 | 3/3 | 3/3 |
| web-ui-design-0.2 | 3 | $0.38 | 93s | 0/3 | 3/3 | 3/3 | 3/3 | 2/3 | 0/3 | 0/3 | 0 | 0 | 0.0 | 3/3 | 3/3 |
| web-ui-design-0.3 | 3 | $0.66 | 194s | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 0/3 | 0 | 0 | 0.0 | 3/3 | 3/3 |
| web-ui-design-0.3-wired | 3 | $0.86 | 211s | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 0/3 | 0 | 0 | 0.0 | 3/3 | 3/3 |

### improve, judge: gemini-4-argon

| Arm | improvement | identity | craft | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 3.33 | 8.00 | 4.00 | 3.33 | 3.33 | 0.09 |
| web-ui-design-0.2 | 7.00 | 8.00 | 7.00 | 6.33 | 6.67 | 0.67 |
| web-ui-design-0.3 | 7.33 | 8.33 | 6.67 | 6.00 | 6.67 | 0.61 |
| web-ui-design-0.3-wired | 7.00 | 8.67 | 7.33 | 6.00 | 7.00 | 0.64 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.2 vs none | 1.00 | 0.100 |
| web-ui-design-0.3 vs none | 1.00 | 0.100 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.50 | 1.000 |
| web-ui-design-0.3-wired vs none | 1.00 | 0.100 |
| web-ui-design-0.3-wired vs web-ui-design-0.2 | 0.56 | 1.000 |
| web-ui-design-0.3-wired vs web-ui-design-0.3 | 0.61 | 0.800 |

### improve, judge: gpt-6-1-sol

| Arm | improvement | identity | craft | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 4.67 | 9.00 | 4.67 | 4.33 | 4.67 | 0.12 |
| web-ui-design-0.2 | 7.00 | 9.00 | 7.00 | 6.67 | 6.67 | 0.82 |
| web-ui-design-0.3 | 6.33 | 9.00 | 6.00 | 5.67 | 6.00 | 0.55 |
| web-ui-design-0.3-wired | 6.33 | 9.00 | 6.33 | 5.67 | 5.67 | 0.52 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.2 vs none | 1.00 | 0.100 |
| web-ui-design-0.3 vs none | 0.78 | 0.600 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.33 | 0.800 |
| web-ui-design-0.3-wired vs none | 0.89 | 0.300 |
| web-ui-design-0.3-wired vs web-ui-design-0.2 | 0.11 | 0.300 |
| web-ui-design-0.3-wired vs web-ui-design-0.3 | 0.56 | 1.000 |

### improve, judge: opus-5-5

| Arm | improvement | identity | craft | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 5.00 | 8.00 | 5.67 | 5.33 | 5.00 | 0.12 |
| web-ui-design-0.2 | 7.67 | 7.67 | 7.00 | 7.00 | 7.00 | 0.67 |
| web-ui-design-0.3 | 7.33 | 7.33 | 6.33 | 6.67 | 6.67 | 0.55 |
| web-ui-design-0.3-wired | 7.33 | 7.33 | 7.33 | 7.00 | 7.33 | 0.67 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.2 vs none | 0.94 | 0.200 |
| web-ui-design-0.3 vs none | 0.83 | 0.300 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.44 | 1.000 |
| web-ui-design-0.3-wired vs none | 1.00 | 0.100 |
| web-ui-design-0.3-wired vs web-ui-design-0.2 | 0.61 | 1.000 |
| web-ui-design-0.3-wired vs web-ui-design-0.3 | 0.61 | 1.000 |

### improve, judge: panel

| Arm | improvement | identity | craft | mobile | overall | rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| none | 4.33 | 8.33 | 4.78 | 4.33 | 4.33 | 0.11 |
| web-ui-design-0.2 | 7.22 | 8.22 | 7.00 | 6.67 | 6.78 | 0.72 |
| web-ui-design-0.3 | 7.00 | 8.22 | 6.33 | 6.11 | 6.44 | 0.57 |
| web-ui-design-0.3-wired | 6.89 | 8.33 | 7.00 | 6.22 | 6.67 | 0.61 |

| Comparison | Win rate (same brief) | Mann-Whitney p |
| --- | --- | --- |
| web-ui-design-0.2 vs none | 1.00 | 0.100 |
| web-ui-design-0.3 vs none | 0.94 | 0.200 |
| web-ui-design-0.3 vs web-ui-design-0.2 | 0.44 | 1.000 |
| web-ui-design-0.3-wired vs none | 1.00 | 0.100 |
| web-ui-design-0.3-wired vs web-ui-design-0.2 | 0.44 | 1.000 |
| web-ui-design-0.3-wired vs web-ui-design-0.3 | 0.61 | 0.800 |

Judge agreement on overall scores (Spearman rank correlation):

- gemini-4-argon ~ gpt-6-1-sol: 0.76
- gemini-4-argon ~ opus-5-5: 0.78
- gpt-6-1-sol ~ opus-5-5: 0.87
