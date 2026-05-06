import {
  cryptoSignKeypair,
  cryptoSign,
  cryptoSignOpen,
  CryptoPublicKeyBytes,
  CryptoSecretKeyBytes,
} from '@theqrl/dilithium5';


export function GenerateCDPair() {


    const pk = new Uint8Array(CryptoPublicKeyBytes);  
    const sk = new Uint8Array(CryptoSecretKeyBytes);
    cryptoSignKeypair(null,pk, sk); 

    return {
        pk:pk,
        sk:sk
    }

}


export function SignviaCD(msg,sk) {

    const message = new TextEncoder().encode(msg);
    const signedMessage = cryptoSign(message, sk, false);

    return signedMessage

}

