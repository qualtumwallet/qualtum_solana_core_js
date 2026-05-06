// app/api/vault/route.js

import { ethers } from "ethers";

const RPC_URL = "https://mainnet.infura.io/v3/_KEY";
const CONTRACT_ADDRESS = "ContractAddress";
import ABI from "./abi.json"

function getSigner(secretKey) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    return new ethers.Wallet(secretKey, provider);
  } catch (err) {
    throw new Error("Invalid private key");
  }
}

function getContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

function validateInputs(body) {
  if (!body.action) throw new Error("Missing action");
  if (!body.secretKey) throw new Error("Missing secretKey");

  if (body.action === "initVault" && !body.commitment)
    throw new Error("Missing commitment");

  if (["deposit", "withdraw"].includes(body.action) && !body.amount)
    throw new Error("Missing amount");

  if (body.action === "withdraw" && !body.secret)
    throw new Error("Missing secret");
}

// 🔒 Ensure proper bytes32 formatting
function toBytes32(hex) {
  if (!hex.startsWith("0x")) hex = "0x" + hex;
  if (hex.length !== 66) {
    throw new Error("Must be 32-byte hex (64 chars)");
  }
  return hex;
}

export async function POST(request) {
  try {
    const body = await request.json();
    validateInputs(body);

    const { action, secretKey, commitment, amount, secret } = body;

    const signer = getSigner(secretKey);
    const contract = getContract(signer);

    let tx;

    switch (action) {
      case "initVault": {
        try {
          const commitmentBytes = toBytes32(commitment);

          tx = await contract.initVault(commitmentBytes);
          const receipt = await tx.wait();

          return Response.json({
            success: true,
            tx: receipt.hash,
            vaultPda: signer.address, 
          });
        } catch (err) {
          throw new Error("initVault failed: " + (err.reason || err.message));
        }
      }

      case "deposit": {
        try {
          const value = ethers.parseEther(amount.toString());

          tx = await contract.deposit({ value });
          const receipt = await tx.wait();

          return Response.json({
            success: true,
            tx: receipt.hash,
          });
        } catch (err) {
          throw new Error("Deposit failed: " + (err.reason || err.message));
        }
      }

      case "withdraw": {
        try {
          const value = ethers.parseEther(amount.toString());
          const secretBytes32 = toBytes32(secret);

          tx = await contract.withdraw(value, secretBytes32);
          const receipt = await tx.wait();

          return Response.json({
            success: true,
            tx: receipt.hash,
          });
        } catch (err) {
          throw new Error("Withdraw failed: " + (err.reason || err.message));
        }
      }

      default:
        return Response.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Vault API error:", err);

    return Response.json(
      {
        success: false,
        error: err.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
