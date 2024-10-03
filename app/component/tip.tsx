import { useState } from "react";

type Props = {
  baseAmount: number;
  onTipChanged: (tipAmount: number) => void;
}
export default function Tip({ baseAmount, onTipChanged } : Props) {
  const [tipAmount, setTipAmount] = useState(0);
  const [isCustomTip, setIsCustomTip] = useState(false);

  const fixedTipType = baseAmount > 10 ? 'percent' : 'currency';
  const fixedTips = fixedTipType === 'percent' ? [.1, .15, .2] : [1, 3, 5];
  const isSelectedFixedTip = (i: number) => {
    if (fixedTipType === 'percent') {
      return tipAmount === baseAmount * fixedTips[i];
    }
    return tipAmount === fixedTips[i];
  }

  const handleTipChange = (amount: number) => {
    if (fixedTipType === 'percent') {
      amount = baseAmount * amount;
    }
    if (amount === tipAmount) {
      amount = 0;
    }
    setTipAmount(amount);
    onTipChanged(amount);
  };

  return (
    <>
      <div className={`grid grid-cols-2 place-content-center w-full gap-6 ${isCustomTip ? 'mb-2' : 'mb-4'}`}>
        {fixedTips.map((tip, i) => (
          <button
            key={tip}
            className={`btn w-full ${isSelectedFixedTip(i) ? "btn-primary" : ""}`}
            onClick={() => {
              handleTipChange(tip);
              setIsCustomTip(false);
            }}
          >
            {tip.toLocaleString([], {
              style: fixedTipType,
              currency: "usd",
              maximumFractionDigits: 0,
            })}
          </button>
        ))}
        <button
          className={`btn w-full ${isCustomTip ? "btn-primary" : ""}`}
          onClick={() => {
            if (!isCustomTip) {
              handleTipChange(0);
            }
            setIsCustomTip(!isCustomTip)
          }}
        >
          Custom
        </button>
      </div>
      {isCustomTip && (
        <label className="form-control w-full mb-4">
          <div className="label">
            <span className="label-text">Custom tip</span>
          </div>
          <input 
            type="text" 
            placeholder="" 
            value={tipAmount}
            className="input input-bordered input-lg w-full text-center" 
            onChange={(e) => {
              const { value } = e.target;
              handleTipChange(isNaN(Number(value)) ? 0 : Number(value));
            }}
          />
        </label>
      )}
    </>
  )
}