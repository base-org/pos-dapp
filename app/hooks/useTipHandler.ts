import { useState } from 'react';

export const useTipHandler = (enableTips:boolean, initialTips: number[], initialPercentageTips: number[], initialPctMode: boolean) => {
  const [tippingEnabled, setTippingEnabled] = useState(enableTips);
  const [tipAmounts, setTipAmounts] = useState(initialTips);
  const [percentageMode, setPercentageMode] = useState(initialPctMode);
  const [percentageTips, setPercentageTips] = useState(initialPercentageTips);

  const handleTipChange = (index: number, value: string) => {
    if (percentageMode) {
      const newPercentageTips = [...percentageTips];
      newPercentageTips[index] = parseFloat(value) || 0;
      setPercentageTips(newPercentageTips);
    } else {
      const newTipAmounts = [...tipAmounts];
      newTipAmounts[index] = parseFloat(value) || 0;
      setTipAmounts(newTipAmounts);
    }
  };

  const handleTippingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTippingEnabled(e.target.checked);
    if (!e.target.checked) {
      setTipAmounts(initialTips);
      setPercentageTips(initialPercentageTips);
    }
  };

  const handlePercentageToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentageMode(e.target.checked);
  };

  return {
    tippingEnabled,
    tipAmounts,
    percentageMode,
    percentageTips,
    handleTipChange,
    handleTippingToggle,
    handlePercentageToggle,
  };
};
