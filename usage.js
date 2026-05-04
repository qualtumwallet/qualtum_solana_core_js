


/* 
 * PDA Vault Management Module
 * Handles initialization, deposits, and post-quantum secured withdrawals.
 */


import { getDB } from "./getdb";
import { SignviaCD } from "./crystal";
import * as crypto from "crypto"


const  db =await getDB()

async function initPDAVault(password)  {


  let sk=await db.get("keyval","crystalls_sk")
  let signature=SignviaCD(password,sk)
  let hash_1=crypto.createHash("sha256").update(signature).digest()
  let hash_2=crypto.createHash("sha256").update(hash_1).digest()
  let hash_2_to_send=hash_2.toString("hex");

  let request=await fetch("/api/pda",{
      method:"post",
      mode:"cors",
      body:JSON.stringify({

          action:"initVault",
          secretKey:await db.get('keyval',"cwallet"),
          commitment:hash_2_to_send
      }),
      headers:{
          "content-type":"application/json"
      }
    })

  let response=await request.json()
  if(response.success==true){
    alert("vault created")
  }
  else {
    alert("vault creation failed")
  }



async function deposit(dpamount) {
     
  if(dpamount==""){
    alert("amount cant be empty")
  }

   let request=await fetch("/api/pda",{
      method:"post",
      mode:"cors",
      body:JSON.stringify({

          action:"deposit",
          secretKey:await db.get('keyval',"cwallet"),
          amount:dpamount
      }),
      headers:{
          "content-type":"application/json"
      }
    })

  let response=await request.json()
  if(response.success==true){
    alert("deposit  success")
  }
  else {
    alert("deposit failed")
  }
  
}


async function Withdraw(password)  {


  let sk=await db.get("keyval","crystalls_sk")
  let signature=SignviaCD(password,sk)
  let hash_1=crypto.createHash("sha256").update(signature).digest()
  let hash_1_to_send=hash_1.toString("hex")

  let request=await fetch("/api/pda",{
      method:"post",
      mode:"cors",
      body:JSON.stringify({

          action:"withdraw",
          secretKey:await db.get('keyval',"cwallet"),
          amount:amount,
          secret:hash_1_to_send

      }),
      headers:{
          "content-type":"application/json"
      }
    })

  let response=await request.json()
  if(response.success==true){
    alert("funds withdrawn and send ")
  }
  else {
    alert("operation failed ")
  }

}
