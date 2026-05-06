import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("AEJgjbJf4GW67izumzv7hQotMQMihBaedyNQ9U898zG7");

export function getProgram(keypair) {

    if (!keypair || !keypair.publicKey) {
        throw new Error("Validation Error: A valid Keypair is required to initialize the program.");
    }

    
    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=API_KEY", "confirmed");
    const wallet = new anchor.Wallet(keypair);
  
    
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    anchor.setProvider(provider);
    const idl = require("./idl.json");

    const program = new anchor.Program(idl, PROGRAM_ID, provider);
    return program;
}

async function getVaultPda(userpubkey) {
    
    if (!userpubkey) throw new Error("User public key is required for PDA derivation.");
    
    return await PublicKey.findProgramAddress(
        [Buffer.from("pqvault"), userpubkey.toBuffer()],
        PROGRAM_ID
    );
}

export async function initVault(keypair, commitment) {


    if (!keypair || !keypair.publicKey) {
        throw new Error("Validation Error: A valid Keypair is required for the vault");
    }
    if (!commitment) throw new Error("Commitment buffer is required for initVault.");

    const [vaultPda] = await getVaultPda(keypair.publicKey);
    const program = getProgram(keypair);
    
    if (program == null) {
        throw Error("program error");
    }

    try {
        const tx = await program.methods
            .initVault(commitment)
            .accounts({
                vault: vaultPda,
                user: keypair.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("InitVault TX:", tx);
        return vaultPda;
    } catch (err) {
        console.error("RPC Error in initVault:", err);
        throw err;
    }
}

export async function deposit(keypair,amountLamports) {
    
     if (!keypair || !keypair.publicKey) {
        throw new Error("Validation Error: A valid Keypair is required ");
    }
    if (!amountLamports || amountLamports <= 0) {
        throw new Error("Deposit amount must be greater than 0 lamports.");
    }

    const [vaultPda] = await getVaultPda(keypair.publicKey);
    const program = getProgram(keypair);
    
    if (program == null) {
        throw Error("program error");
    }

    try {
        const tx = await program.methods
            .deposit(new anchor.BN(amountLamports))
            .accounts({
                vault: vaultPda,
                user: keypair.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Deposit TX:", tx);
    } catch (err) {
        console.error("RPC Error in deposit:", err);
        throw err;
    }
}

export async function withdraw(keypair, amountLamports, secret) {

     if (!keypair || !keypair.publicKey) {
        throw new Error("Validation Error: A valid Keypair is requiredW.");
    }
    if (!secret || !(secret instanceof Uint8Array || Array.isArray(secret))) {
        throw new Error("A valid secret (Uint8Array or Array) is required for withdrawal.");
    }
    if (!amountLamports || amountLamports <= 0) {
        throw new Error("Withdraw amount must be greater than 0 lamports.");
    }

    const [vaultPda] = await getVaultPda(keypair.publicKey);
    const program = getProgram(keypair);
    
    if (program == null) {
        throw Error("program error");
    }

    try {
        const tx = await program.methods
            .withdraw(new anchor.BN(amountLamports), Array.from(secret))
            .accounts({
                vault: vaultPda,
                userWallet: keypair.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Withdraw TX:", tx);
    } catch (err) {
        console.error("RPC Error in withdraw:", err);
        throw err;
    }
}
