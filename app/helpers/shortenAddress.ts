export default function shortenAddress (address: string, startingChars = 6, endingChars = 4) {
  return `${address.slice(0, startingChars)}...${address.slice(-endingChars)}`;
}