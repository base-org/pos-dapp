export const EXAMPLE_CONTRACT_CALL_PAYLOAD = {
  "payloadType": "contractCall",
  "chainId": "8453",
  "paymentTx": {
    "data": "",
    "to": "",
    "value": undefined,
  },
  "rpcProxySubmissionParams": {
    "submissionUrl": "https://nfc-relayer.vercel.app/api/submitPaymentTx",
  },
  "dappName": "Test Dapp",
  "dappUrl": "https://test-dapp.com",
  "additionalPayload": {
      "test": 123
  }
}