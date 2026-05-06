import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import idl from "./idl.json";
import base58 from "bs58";

const PROGRAM_ID = new PublicKey("PID");

async function getProgram(keypair) {
  try {
    const connection = new Connection(
      "https://mainnet.helius-rpc.com/?api-key=API_KEY",
      "confirmed"
    );

    const wallet = {
      publicKey: keypair.publicKey,
      signTransaction: async (tx) => {
        tx.partialSign(keypair);
        return tx;
      },
      signAllTransactions: async (txs) => {
        return txs.map((t) => {
          t.partialSign(keypair);
          return t;
        });
      },
    };

    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    anchor.setProvider(provider);

    return new anchor.Program(idl, PROGRAM_ID, provider);
  } catch (err) {
    throw new Error("Failed to initialize program: " + err.message);
  }
}

async function getVaultPda(userPubkey) {
  try {
    return await PublicKey.findProgramAddress(
      [Buffer.from("pqvault"), userPubkey.toBuffer()],
      PROGRAM_ID
    );
  } catch (err) {
    throw new Error("Failed to derive PDA: " + err.message);
  }
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

export async function POST(request) {
  try {
    const body = await request.json();

    // ✅ Input validation
    validateInputs(body);

    const { action, secretKey, commitment, amount, secret } = body;

    // ✅ Decode secret key safely
    let keypair;
    try {
      const decoded = base58.decode(secretKey);
      keypair = Keypair.fromSecretKey(decoded);
    } catch (err) {
      throw new Error("Invalid secretKey format");
    }

    const program = await getProgram(keypair);
    if (!program) throw new Error("Program initialization failed");

    const [vaultPda] = await getVaultPda(keypair.publicKey);

    let tx;

    switch (action) {
      case "initVault": {
        try {
          const commitmentBuffer = Buffer.from(commitment, "hex");
          const neededCommitment = Array.from(commitmentBuffer);

          tx = await program.methods
            .initVault(neededCommitment)
            .accounts({
              vault: vaultPda,
              user: keypair.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .rpc();

          return Response.json({
            success: true,
            tx,
            vaultPda: vaultPda.toBase58(),
          });
        } catch (err) {
          throw new Error("initVault failed: " + err.message);
        }
      }

      case "deposit": {
        try {
          const lamports = amount * LAMPORTS_PER_SOL;

          tx = await program.methods
            .deposit(new anchor.BN(lamports.toString()))
            .accounts({
              vault: vaultPda,
              user: keypair.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .rpc();

          return Response.json({ success: true, tx });
        } catch (err) {
          throw new Error("Deposit failed: " + err.message);
        }
      }

      case "withdraw": {
        try {
          const secretBuffer = Buffer.from(secret, "hex");
          const neededSecret = Array.from(secretBuffer);

          const lamports = amount * LAMPORTS_PER_SOL;

          tx = await program.methods
            .withdraw(new anchor.BN(lamports), neededSecret)
            .accounts({
              vault: vaultPda,
              userWallet: keypair.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .rpc();

          return Response.json({ success: true, tx });
        } catch (err) {
          throw new Error("Withdraw failed: " + err.message);
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
