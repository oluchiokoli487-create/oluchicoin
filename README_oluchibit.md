# OluchiBit (OLB)

A simple fungible token implemented in Clarity for the Stacks blockchain.

- Name: OluchiBit
- Symbol: OLB
- Decimals: 8
- File: contracts/oluchibit.clar

Commands
- clarinet check — compile and type-check contracts
- clarinet console — open REPL to interact with contracts

Example
```clarity
;; Mint 1,000 OLB to the owner (owner only)
(contract-call? .oluchibit mint u100000000000 tx-sender)

;; Transfer 100 OLB from Alice to Bob
(contract-call? .oluchibit transfer u100000000 'ST3J...ALICE 'ST3K...BOB)

(get-balance 'ST3K...BOB)
```
