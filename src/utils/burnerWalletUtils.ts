import "viem/window";
import {
  createWalletClient,
  custom,
  parseEther,
  encodePacked,
  encodeFunctionData,
} from "viem";
import {
  ENTRYPOINT_ADDRESS_V07,
  createSmartAccountClient,
} from "permissionless";
import { signerToSafeSmartAccount } from "permissionless/accounts";
import {
  createPimlicoBundlerClient,
  //   createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { walletClientToSmartAccountSigner } from "permissionless/utils";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { installModule, erc7579Actions } from "permissionless/actions/erc7579";

export const publicClient = createPublicClient({
  transport: http("https://sepolia.base.org"),
});

export const pimlicoBundlerClient = createPimlicoBundlerClient({
  transport: http(
    "https://api.pimlico.io/v2/base-sepolia/rpc?apikey=f40d6602-b57e-49d7-a10f-03fbf71f9732"
  ),
  entryPoint: ENTRYPOINT_ADDRESS_V07,
});

export async function run() {
  const [address] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  console.log("address", address);

  const client = createWalletClient({
    account: address, // Type assertion to match the expected format
    chain: baseSepolia,
    transport: custom(window.ethereum),
  });
  console.log("client", client);

  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    signer: walletClientToSmartAccountSigner(client),
    safeVersion: "1.4.1",
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });
  console.log("safeAccount", safeAccount);

  // Transfer 0.01 ETH to the address
  const hash = await client.sendTransaction({
    to: safeAccount.address,
    value: parseEther("0.00001"),
  });
  console.log("hash", hash);

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: baseSepolia,
    bundlerTransport: http(
      "https://api.pimlico.io/v2/base-sepolia/rpc?apikey=f40d6602-b57e-49d7-a10f-03fbf71f9732"
    ),
    middleware: {
      gasPrice: async () =>
        (await pimlicoBundlerClient.getUserOperationGasPrice()).fast, // if using pimlico bundler
    },
  });
  console.log("smartAccountClient", smartAccountClient);

  const txHash = await smartAccountClient.sendTransaction({
    to: address,
    value: parseEther("0.00001"),
  });
  console.log("txHash", txHash);
}

export async function install() {
  const [address] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  console.log("address", address);

  const client = createWalletClient({
    account: address, // Type assertion to match the expected format
    chain: baseSepolia,
    transport: custom(window.ethereum),
  });
  console.log("client", client);

  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    signer: walletClientToSmartAccountSigner(client),
    safeVersion: "1.4.1",
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });
  console.log("safeAccount", safeAccount);

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: baseSepolia,
    bundlerTransport: http(
      "https://api.pimlico.io/v2/base-sepolia/rpc?apikey=f40d6602-b57e-49d7-a10f-03fbf71f9732"
    ),
    middleware: {
      gasPrice: async () =>
        (await pimlicoBundlerClient.getUserOperationGasPrice()).fast, // if using pimlico bundler
    },
  }).extend(erc7579Actions({ entryPoint: ENTRYPOINT_ADDRESS_V07 }));
  console.log("smartAccountClient", smartAccountClient);

  const msaFactory = "0x5Df31f86aa76F32a33Ade0B928fb46580C662669";

  const accountSalt =
    "0x025cbb99abccc229a9674d24238ce5c448d5113a091762836e2b6edb87b88dfa";

  const _initCode =
    "0x00000000000000000000000036d0f209506c72ce91182a10dd2c462a3fd74cb800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000404642219af00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000038000000000000000000000000000000000000000000000000000000000000003e000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000ba79f35864f3e6600903a2a39ca0eaedd1cada5100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000181fba2ec6b84e6e82478bfe4dc8fb4455ff6073000000000000000000000000f89e0133e2c79bb259a8d76bf75d85e04824572d00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f89e0133e2c79bb259a8d76bf75d85e04824572d00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000180000000000000000000000000ba79f35864f3e6600903a2a39ca0eaedd1cada510000000000000000000000000000000000000000000000000000000000000100a6f9dae100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000001275000000000000000000000000000000000000000000000000000000000000000001300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e1bfd5793db329c3b9d6adec8789d70091b6df4b00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

  const initCode = encodePacked(
    ["address", "bytes"],
    [
      msaFactory,
      encodeFunctionData({
        abi: [
          {
            inputs: [
              {
                internalType: "bytes32",
                name: "salt",
                type: "bytes32",
              },
              {
                internalType: "bytes",
                name: "initCode",
                type: "bytes",
              },
            ],
            name: "createAccount",
            outputs: [
              {
                internalType: "address",
                name: "",
                type: "address",
              },
            ],
            stateMutability: "payable",
            type: "function",
          },
        ],
        functionName: "createAccount",
        args: [accountSalt, _initCode],
      }),
    ]
  );

  const opHash = await smartAccountClient.installModule({
    type: "executor",
    address: "0x1cC05c62B1E3c710f6fF334379c4081d5ee7Ab83",
    context: initCode,
  });
  console.log("opHash", opHash);
}
