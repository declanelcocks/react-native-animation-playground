import { useCallback, useState } from 'react';

export function useVolumeChartState() {
  const [showVolumeChart, setShowVolumeChart] = useState(false);

  const toggleShowVolumeChartCallback = useCallback(() => {
    const nextState = !showVolumeChart;
    setShowVolumeChart(nextState);
  }, [showVolumeChart]);

  return {
    showVolumeChart,
    toggleShowVolumeChart: toggleShowVolumeChartCallback,
  };
}
