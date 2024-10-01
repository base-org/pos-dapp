import React from 'react';

interface TipInputProps {
  tippingEnabled: boolean;
  tipAmounts: number[];
  percentageMode: boolean;
  percentageTips: number[];
  handleTipChange: (index: number, value: string) => void;
  handleTippingToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePercentageToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TipInput: React.FC<TipInputProps> = ({
  tippingEnabled,
  tipAmounts,
  percentageMode,
  percentageTips,
  handleTipChange,
  handleTippingToggle,
  handlePercentageToggle,
}) => {
  return (
    <div>
      <input
        type="checkbox"
        className="mb-4 p-2 mr-2"
        checked={tippingEnabled}
        onChange={handleTippingToggle}
      />
      <label>Enable Tipping</label>
      {tippingEnabled && (
        <div className="mb-4 w-full">
          <input
            type="checkbox"
            className="mb-4 p-2 mr-2"
            checked={percentageMode}
            onChange={handlePercentageToggle}
          />
          <label>Use Percentage Tips</label>
          {percentageMode ? (
            <>
              <input
                type="number"
                className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
                value={percentageTips[0]}
                onChange={(e) => handleTipChange(0, e.target.value)}
                placeholder="Enter tip percentage 1"
              />
              <input
                type="number"
                className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
                value={percentageTips[1]}
                onChange={(e) => handleTipChange(1, e.target.value)}
                placeholder="Enter tip percentage 2"
              />
              <input
                type="number"
                className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
                value={percentageTips[2]}
                onChange={(e) => handleTipChange(2, e.target.value)}
                placeholder="Enter tip percentage 3"
              />
            </>
          ) : (
            <>
              <input
                type="number"
                className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
                value={tipAmounts[0]}
                onChange={(e) => handleTipChange(0, e.target.value)}
                placeholder="Enter tip amount 1"
              />
              <input
                type="number"
                className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
                value={tipAmounts[1]}
                onChange={(e) => handleTipChange(1, e.target.value)}
                placeholder="Enter tip amount 2"
              />
              <input
                type="number"
                className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
                value={tipAmounts[2]}
                onChange={(e) => handleTipChange(2, e.target.value)}
                placeholder="Enter tip amount 3"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TipInput;
