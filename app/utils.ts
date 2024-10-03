import { USDC_ADDRESS, USDC_DECIMALS } from './constants';
import { EXAMPLE_CONTRACT_CALL_PAYLOAD } from './constants/contractCall';
import { EXAMPLE_EIP_712_PAYLOAD } from './constants/eip712';
import { ethers, parseUnits } from 'ethers';

export function generateContractCallPayload({ to, amount }: { to: string; amount: string }) {
  const abi = [
    "function transfer(address to, uint256 value)"
  ];
  const iface = new ethers.Interface(abi);
  const data = iface.encodeFunctionData("transfer", [
    to,
    parseUnits(amount, USDC_DECIMALS).toString()
  ]);
  const contractCallPayload = JSON.parse(JSON.stringify(EXAMPLE_CONTRACT_CALL_PAYLOAD));
  contractCallPayload.paymentTx.to = USDC_ADDRESS;
  contractCallPayload.paymentTx.data = data;
  
  return contractCallPayload;
}

export function generateEip712Payload({ to, amount }: { to: string; amount: string }) {
  const nonceParams = generateNonceParams();
  const eip712Payload = generatePayload(to, parseUnits(amount, USDC_DECIMALS).toString());
  eip712Payload.rpcProxySubmissionParams.message.message.nonce = nonceParams.nonce;
  eip712Payload.rpcProxySubmissionParams.message.message.validBefore = String(nonceParams.validBefore);
  
  return eip712Payload;
}

/** Helper function that generates randomized params required for EIP712 signature */
export function generateNonceParams() {
  // random buffer
  const nonceBuffer = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
  const metaTxNonce = `0x${nonceBuffer.toString('hex')}`;

  // validBefore
  const nowAsEpoch = Math.round(new Date().getTime() / 1000);
  const validBeforeAsEpoch = nowAsEpoch + 300; // 5 mins from now

  return {
    nonce: metaTxNonce,
    validAfter: 0,
    validBefore: validBeforeAsEpoch,
  };
}

function generatePayload(to: string, value: string) {
  const payload = JSON.parse(JSON.stringify(EXAMPLE_EIP_712_PAYLOAD));
  payload.rpcProxySubmissionParams.message.message.to = to;
  payload.rpcProxySubmissionParams.message.message.value = value;
  return payload;
}