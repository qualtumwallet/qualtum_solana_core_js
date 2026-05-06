import { ethers } from "ethers";
import ABI from "./abi.json"

const CONTRACT_ADDRESS = "AddressHere";



export function getContract(signer) {
    if (!signer) {
        throw new Error("Validation Error: A valid signer is required.");
    }
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

export async function initVault(signer, commitment) {
  
    if (!commitment || !commitment.startsWith("0x")) {
        throw new Error("Commitment must be a hex string (0x...)");
    }

    const contract = getContract(signer);

    try {
        const tx = await contract.initVault(commitment);
        console.log("Transaction sent:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("Vault Initialized. Block:", receipt.blockNumber);
        return receipt;
    } catch (err) {
        console.error("Error in initVault:", err);
        throw err;
    }
}


export async function deposit(signer, amountEth) {
  
    const contract = getContract(signer);

    try {
        const tx = await contract.deposit({
            value: ethers.parseEther(amountEth) 
        });

        const receipt = await tx.wait();
        console.log("Deposit TX:", receipt.hash);
    } catch (err) {
        console.error("Error in deposit:", err);
        throw err;
    }
}


export async function withdraw(signer, amountEth, secret) {
    const contract = getContract(signer);

    try {
      
        const amountWei = ethers.parseEther(amountEth);  
        const tx = await contract.withdraw(amountWei, secret);
        
        const receipt = await tx.wait();
        console.log("Withdraw TX:", receipt.hash);
    } catch (err) {
        console.error("Error in withdraw:", err);
        throw err;
    }
}
