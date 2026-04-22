import { useCallback, useState } from 'react';

export function useCandleChartState() {
  const [showCandleChart, setShowCandleChart] = useState(false);

  const toggleShowCandleChartCallback = useCallback(() => {
    const nextState = !showCandleChart;
    setShowCandleChart(nextState);
  }, [showCandleChart]);

  return {
    showCandleChart,
    toggleShowCandleChart: toggleShowCandleChartCallback,
  };
}
