import { USDC_DECIMALS } from './constants/index';
import { EXAMPLE_EIP_712_PAYLOAD } from './constants/eip712';
import { parseUnits } from 'ethers';

export function generateEip712Payload({ to, value }: { to: string; value: string }) {
  const nonceParams = generateNonceParams();
  const eip712Payload = generatePayload(to, parseUnits(value, USDC_DECIMALS).toString());
  eip712Payload.rpcProxySubmissionParams.typedData.message.nonce = nonceParams.nonce;
  eip712Payload.rpcProxySubmissionParams.typedData.message.validBefore = String(nonceParams.validBefore);
  
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
  payload.rpcProxySubmissionParams.typedData.message.to = to;
  payload.rpcProxySubmissionParams.typedData.message.value = value;
  console.log({ payload });
  return payload;
}