# Chart refactor: further suggestions

Follow-ups for making the chart reusable in other projects. The reusable code now lives in `src/components/Chart`; `src/screens/Chart` keeps only the playground (`ChartScreen`, `data.ts`). They build on the refactor that:

- renamed `TimeSlice` to `DataSet` (`{ label, data }`)
- replaced `Quote` with per-chart point types: `DataPoint = { value, label? }` for line and bar charts, and `CandlestickDataPoint = { open, high, low, close, label? }`
- typed `<Chart>` props as a discriminated union on `type`

Decisions made during that refactor:

- Points are placed by index. `label` is a pre-formatted string shown in the readout, so date formatting is the consumer's job.
- One `<Chart>` component, not separate components per chart type.
- Bar charts keep the padded min/max domain (see #10).

| #   | Change                                                                                                                                                  | Priority | Notes                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Rename finance wording: `currentPrice` → `activePoint`, `CurrentPriceData` → `ActivePointLabel`                                                         | High     | "Price" appears in about 60 places. It's the last finance coupling.                                                                                                                                                                                            |
| 2   | Pass colours and sizes in via a `theme`/`config` prop instead of `@/theme` and module constants                                                         | High     | `@/theme` is the only import from outside the folder, so it blocks moving the folder to another project. The constants in question: `X_MARGIN`, `Y_MARGIN`, `Y_AXIS_LABELS_WIDTH`, max candle width 30, `CURSOR_SIZE`, label fontSize 9, the 150ms transition. |
| 3   | Make number formatting configurable: a `formatValue` prop (the y-axis uses `'1.2-2'`, the readout uses `round(…, 2)`), or a render-prop for the readout | High     | Both are fixed at 2 decimals today.                                                                                                                                                                                                                            |
| 4   | Rename the default export `Example` to `Chart`, rename the internal `Chart` interface to `BuiltChart`, and fix `index.ts`                               | High     | `export *` skips default exports, so the barrel currently exports nothing. Needed for a clean public entry point.                                                                                                                                              |
| 5   | Move the reusable parts (Chart, `_components`, utils, types, formatters) to `src/components/Chart`; keep `ChartScreen` and `data.ts` as the demo        | Medium   | Separates the library from the playground.                                                                                                                                                                                                                     |
| 6   | Break the circular import between `utils.ts` and `YAxisLabels.tsx` (`Y_AXIS_LABELS_WIDTH`) by moving the constants to a `constants.ts`                  | Medium   |                                                                                                                                                                                                                                                                |
| 7   | Remove duplicated code (listed below this table)                                                                                                        | Medium   | Duplicated copies tend to drift apart.                                                                                                                                                                                                                         |
| 8   | Unique gradient IDs per chart instance                                                                                                                  | Medium   | Today the IDs `positive`/`negative` are global, so two charts on one screen would collide.                                                                                                                                                                     |
| 9   | Make trend colours (green/red) optional or configurable. Rename `CandlestickChartCursor` → `CrosshairCursor`                                            | Medium   | Green/red is finance-specific. Bar charts use the same cursor.                                                                                                                                                                                                 |
| 10  | Zero-based domain option for bar charts                                                                                                                 | Medium   | Bars currently use a padded min/max, so bar heights aren't proportional to the values. Offer zero-based as an opt-in.                                                                                                                                          |
| 11  | Delete unused `formatPrice`, `pct`, `hiddenValueConstant` from `formatters.ts`                                                                          | Low      | Dead code.                                                                                                                                                                                                                                                     |
| 12  | `ScrollableBarChart` baseline maths treats an `undefined` `labelsPosition` as not-left                                                                  | Low      | Small layout bug.                                                                                                                                                                                                                                              |
| 13  | After switching data set, snap the bar/candle cursor to a step centre                                                                                   | Low      | The data set switch uses line-chart logic for every chart type. Small UX bug.                                                                                                                                                                                  |
| 14  | Unused dependencies `d3-interpolate-path` and `dayjs`                                                                                                   | Low      | Outside the chart folder; flag only.                                                                                                                                                                                                                           |

Duplication to remove (#7):

- `CandlestickChart` and `BarChart` are near copies of each other. Both contain an unused `useAnimatedReaction`/`useState` re-render hack.
- `YAxisLabels` and `YAxisLines` both draw the grid lines, so the lines are drawn twice.
- `LineChart` has three near-identical `interpolatePath` blocks.
- `Chart.tsx` repeats the step/clamp maths four times.

## Status

Done: #1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #11, #12, #13.

- #3: `<Chart formatValue={…}>` formats both the y-axis labels and the readout. The default is two decimals, grouped by the device's locale. Values are formatted on the JS thread when the charts are built (each point has a `formattedValue`), because the readout reads the active point on the UI thread, where a consumer's formatter couldn't be called. Keep `formatValue` referentially stable, and give longer labels a wider `theme.layout.yAxisWidth`. `round` was unused after this, so it is gone.

- #1: `currentPoint` is now `activePoint` and `CurrentDataPoint` is `ActivePointLabel`. `currentChartIndex` keeps its name; it's the selected data set, not the point under the cursor.
- #2: colours and sizes come from `ChartTheme` (`theme.ts`). `<Chart theme={…}>` takes a partial override on top of `DEFAULT_CHART_THEME`. Keep the `theme` object referentially stable. `ChartScreen` maps the app's colours into it.
- #7: `selectDataSet` keeps its own line-chart cursor code, because it animates `translation.y`.
- #13: after a data set switch, line charts keep that code. Bar and candlestick charts call `moveSteppedCursor`, so the cursor sits at the centre of the last step, like after mount.
- #11: also removed the `hidden` option of `formatNumber`, which only used `hiddenValueConstant`.

Open:

- #14: `d3-interpolate-path`, `@types/d3-interpolate-path` and `dayjs` are not imported anywhere in `src/`. Left in `package.json` for now.
