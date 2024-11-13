export const calculateMetrics = (reports) => {
    if (!reports || reports.length === 0) return null;
    
    const allWeights = reports.map(report => parseFloat(report.Weight));
    const allHeights = reports.map(report => parseFloat(report.Height));
    const originalWeight = parseFloat(reports[0].OriginalWeight);
    const originalHeight = parseFloat(reports[0].OriginalHeight);
    
    // Include original measurements in calculations
    allWeights.push(originalWeight);
    allHeights.push(originalHeight);
    
    // Latest measurements
    const latestWeight = parseFloat(reports[reports.length - 1].Weight);
    const latestHeight = parseFloat(reports[reports.length - 1].Height);
    
    return {
      weightAverage: (allWeights.reduce((sum, weight) => sum + weight, 0) / allWeights.length).toFixed(2),
      heightAverage: (allHeights.reduce((sum, height) => sum + height, 0) / allHeights.length).toFixed(2),
      originalWeight: originalWeight.toFixed(2),
      originalHeight: originalHeight.toFixed(2),
      
      // Growth calculations
      totalWeightGain: (latestWeight - originalWeight).toFixed(2),
      totalHeightGain: (latestHeight - originalHeight).toFixed(2),
      weightGrowthPercent: ((latestWeight - originalWeight) / originalWeight * 100).toFixed(1),
      heightGrowthPercent: ((latestHeight - originalHeight) / originalHeight * 100).toFixed(1),
      
      // Rate calculations
      dailyWeightGrowth: calculateDailyGrowth(reports, 'Weight'),
      dailyHeightGrowth: calculateDailyGrowth(reports, 'Height'),
      
      // Min/Max values
      maxWeight: Math.max(...allWeights).toFixed(2),
      minWeight: Math.min(...allWeights).toFixed(2),
      maxHeight: Math.max(...allHeights).toFixed(2),
      minHeight: Math.min(...allHeights).toFixed(2),
      
      // Health trends
      weightTrend: calculateTrend(allWeights),
      heightTrend: calculateTrend(allHeights),
      
      // Report statistics
      totalReports: reports.length,
      reportingPeriod: calculateReportingPeriod(reports),
      averageReportInterval: calculateAverageReportInterval(reports)
    };
  };
  
  export const calculateDailyGrowth = (reports, metric) => {
    const firstDate = new Date(reports[0].Report_Date);
    const lastDate = new Date(reports[reports.length - 1].Report_Date);
    const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    const totalGrowth = parseFloat(reports[reports.length - 1][metric]) - parseFloat(reports[0]['Original' + metric]);
    
    return (totalGrowth / daysDiff).toFixed(3);
  };
  
  export const calculateTrend = (values) => {
    if (values.length < 2) return 'Not enough data';
    
    const recent = values.slice(-3); // Last 3 measurements
    if (recent.every((val, i) => i === 0 || val > recent[i - 1])) {
      return 'Increasing';
    } else if (recent.every((val, i) => i === 0 || val < recent[i - 1])) {
      return 'Decreasing';
    }
    return 'Stable';
  };
  
  export const calculateReportingPeriod = (reports) => {
    const firstDate = new Date(reports[0].Report_Date);
    const lastDate = new Date(reports[reports.length - 1].Report_Date);
    return `${Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24))} days`;
  };
  
  export const calculateAverageReportInterval = (reports) => {
    if (reports.length < 2) return 'N/A';
    const dates = reports.map(r => new Date(r.Report_Date));
    let totalDays = 0;
    
    for (let i = 1; i < dates.length; i++) {
      totalDays += (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
    }
    
    return `${Math.round(totalDays / (dates.length - 1))} days`;
  };