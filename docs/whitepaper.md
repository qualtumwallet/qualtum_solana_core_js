# QUALTUM: Post-Quantum Fund Security




**QUALTUM** is a cryptographic protocol designed to secure blockchain assets against quantum-scale adversaries. By abandoning asymmetric cryptography in favor of **Hash-Based Commitments** and **Program Derived Addresses (PDAs)**, it removes the "single point of failure" inherent in traditional private key management.

---

## 📖 Abstract

Instead of relying on asymmetric cryptography, which is vulnerable to quantum attacks (e.g., Shor’s Algorithm), **QUALTUM** uses hash-based commitments and deterministic program-controlled accounts to secure funds. The system is designed from first principles to minimize attack surface and remain secure in a post-quantum world.

---

## 1. First Principles Analysis
All blockchain security reduces to one question: **Who has the authority to move funds?**

Traditionally, authority is tied to the possession of a private key. QUALTUM challenges this assumption based on three pillars:
*   **Non-Derivability:** Authority must not depend on secrets that can be mathematically derived.
*   **Zero Exposure:** Public exposure of account data must not weaken security.
*   **Future-Proofing:** Systems must remain secure under future computational models (Quantum).

## 2. Threat Model
### Adversary Capabilities
*   Full access to blockchain history and transaction data.
*   Infinite storage for "Harvest Now, Decrypt Later" attacks.
*   Access to high-qubit quantum computing for key derivation.

### QUALTUM Mitigations
*   **Removes Private Keys:** No key to derive via Shor's algorithm.
*   **Avoids Signatures:** Eliminates signature leakage and public key exposure.
*   **Primitive Isolation:** Uses hash preimage resistance as the sole security primitive.

## 3. Core Construction
The system is built using:
1.  **Program Derived Addresses (PDAs):** Deterministic accounts controlled by code logic.
2.  **Crystals Dilithium Hash Commitments:** Post-quantum hash-based security.
3.  **Deterministic Verification Logic:** On-chain validation of state transitions.

### The Commitment Chain
The system generates a secret $(S)$ and computes a hash chain:
$$H_1 = \text{hash}(S)$$
$$H_2 = \text{hash}(H_1)$$

> **Security Note:** Only $H_2$ is stored on-chain. The original secret $(S)$ is never revealed to the network.

## 4. Protocol Flow

### Initialization
- User computes $H_2$ locally.
- $H_2$ is stored in the on-chain vault.

### Deposit
- Funds are transferred to the PDA (Program Derived Address).

### Withdrawal
- User submits $H_1$.
- Contract computes `hash(H1)`.
- If `hash(H1) == H2`, the funds are released.

## 5. Security Properties
*   **Preimage Resistance:** An attacker cannot compute $S$ from $H_1$ or $H_2$.
*   **Second Preimage Resistance:** An attacker cannot find a different $H_1'$ that produces the same $H_2$.
*   **No Key Extraction:** Since there is no "key pair," there is no cryptographic material to extract from public ledger data.

## 6. Advantages Over Traditional Wallets
*   ✅ **Post-Quantum Secure:** Built to withstand future computational threats.
*   ✅ **No Signature Vulnerabilities:** Removes the risk of signature-related nonce reuse or leakage.
*   ✅ **Cryptographic Bedrock:** Security anchored entirely in the battle-tested resistance of the underlying hash function — nothing more, nothing less.

---
