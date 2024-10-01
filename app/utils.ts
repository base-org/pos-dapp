import { EXAMPLE_EIP_712_PAYLOAD } from "./constants";

export function generateEip712Payload() {
  const nonceParams = generateNonceParams();
  const eip712Payload = { ...EXAMPLE_EIP_712_PAYLOAD };
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