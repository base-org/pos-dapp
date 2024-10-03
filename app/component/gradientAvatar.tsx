import { useMemo } from "react";

const gradients = [
  ["#fca5a5", "#b91c1c"],
  ["#fdba74", "#c2410c"],
  ["#fcd34d", "#b45309"],
  ["#fde047", "#a16207"],
  ["#a3e635", "#4d7c0f"],
  ["#86efac", "#15803d"],
  ["#67e8f9", "#0e7490"],
  ["#7dd3fc", "#0369a1"],
  ["#93c5fd", "#1d4ed8"],
  ["#a5b4fc", "#4338ca"],
  ["#c4b5fd", "#6d28d9"],
  ["#d8b4fe", "#7e22ce"],
  ["#f0abfc", "#a21caf"],
  ["#f9a8d4", "#be185d"],
  ["#fda4af", "#be123c"],
];

function getGradientForString(str: string) {
  const number = Math.abs(
    str.split("").reduce((acc, b, i) => acc + b.charCodeAt(0) * (i + 1), 0),
  );
  const index = number % gradients.length;
  return gradients[index];
}

export function GradientAvatar({
  address, className
}: {
  address: string,
  className: string,
}) {
  const gradient = useMemo(() => {
    if (!address) {
      return undefined;
    }
    return getGradientForString(address);
  }, [address]);

  if (!gradient) {
    return (
      <div
        style={{
          background: "#f3f4f6",
        }}
        className={className}
      />
    );
  }

  return (
    <div
      style={{
        background: `linear-gradient(45deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      }}
      className={className}
    />
  );
}