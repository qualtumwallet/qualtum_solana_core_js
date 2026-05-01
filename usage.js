import { getProgram ,initVault,deposit,withdraw} from "./implementation.js";
import { GenerateCDPair,SignviaCD} from "./crystal_dilithium.js";
import * as crypto from "crypto"



export async  function InitPQvault(keypair,signingmessage) {
     
    if (!keypair || !keypair.publicKey) {
        throw new Error("Validation Error: A valid Keypair is required");
    }

    if (signinmessage==="" ) { 
        throw new Error("Validation Error: Signing Message cannot be empty string ");
    }
  
    try {
    let {pk,sk}=GenerateCDPair()
    let signature=SignviaCD(signingmessage,sk)

    const sigHash = crypto.createHash("sha256").update(signature).digest(); // 32 bytes
    const commitmentBuf = crypto.createHash("sha256").update(sigHash).digest(); // 32 bytes
    const commitment = Array.from(commitmentBuf);
    await initVault(keypair,commitment)
    return {

            "success":true,
            "status":"vault initialized",
             "sk":sk
        }



    }catch(e){

        return {
            "success":false,
            "status":String(e),
            "sk":""
        }

    }
}


export async function  Deposit(keypair,lamports){



       if (!keypair || !keypair.publicKey) {
        throw new Error("Validation Error: A valid Keypair is required");
        }


      if (!lamports || lamports <= 0) {
        throw new Error("Deposit amount must be greater than 0 lamports.");
    }


        try {

            await deposit(keypair,lamports)
            return {
                "success":true,
                "status":"Funds deposited"
            }

         } catch(e){
           
            return {
                "success":false,
                "status":String(e)
            }

        }
}


export async  function Withdraw(keypair,lamports,secret) {


    if (!keypair || !keypair.publicKey) {
        throw new Error("Validation Error: A valid Keypair is required.");
    }
    if (!secret || !(secret instanceof Uint8Array || Array.isArray(secret))) {
        throw new Error("A valid secret (Uint8Array or Array) is required for withdrawal.");
    }
    if (!lamports || lamports <= 0) {
        throw new Error("Withdraw amount must be greater than 0 lamports.");
    }

    try {

        await withdraw(keypair,lamports,secret)
        return {
                "success":true,
                "status":"Funds withdrawn"
            }

    } catch(e){
       return {
                "success":false,
                "status":String(e)
            }

    }

}
