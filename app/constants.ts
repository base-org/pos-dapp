export const EXAMPLE_EIP_712_PAYLOAD = {
  "payloadType": "eip712",
  "chainId": "8453",
  "rpcProxySubmissionParams": {
      "submissionUrl": "https://nfc-relayer.vercel.app/api/submitPaymentTx",
      "typedData": {
          "types": {
                "EIP712Domain": [
                  {
                      "name": "name",
                      "type": "string"
                  },
                  {
                      "name": "version",
                      "type": "string"
                  },
                  {
                      "name": "chainId",
                      "type": "uint256"
                  },
                  {
                      "name": "verifyingContract",
                      "type": "address"
                  }
                  ],
                  "TransferWithAuthorization": [
                  {
                      "name": "from",
                      "type": "address"
                  },
                  {
                      "name": "to",
                      "type": "address"
                  },
                  {
                      "name": "value",
                      "type": "uint256"
                  },
                  {
                      "name": "validAfter",
                      "type": "uint256"
                  },
                  {
                      "name": "validBefore",
                      "type": "uint256"
                  },
                  {
                      "name": "nonce",
                      "type": "bytes32"
                  }
                  ]
          },
          "primaryType": "TransferWithAuthorization",
          "domain":  {
              "name": "USD Coin",
              "version": "2",
              "chainId": 8453,
              "verifyingContract": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
          },
          "message": {
              "from": "0x2ddCff55e281687263D7D2441cDB3C39a9F861B5",
              "to": "0xb9d5b99d5d0fa04dd7eb2b0cd7753317c2ea1a84",
              "value": "10000",
              "validAfter": "0",
              "validBefore": "1727129319",
              "nonce": "0x7c6c78df20f598ec8b8bd20fa76608e42d2bec99b22e6130550df4c883ff1252"
          }
      }
  },
  "dappName": "Test Dapp",
  "dappUrl": "https://test-dapp.com",
  "additionalPayload": {
      "test": 123
  }
}