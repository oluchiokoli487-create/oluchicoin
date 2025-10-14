# Oluchicoin (OLUC) Smart Contract API Documentation

This document provides comprehensive documentation for all functions available in the Oluchicoin smart contract.

## Table of Contents

- [Overview](#overview)
- [Constants](#constants)
- [Error Codes](#error-codes)
- [SIP-010 Functions](#sip-010-functions)
- [Administrative Functions](#administrative-functions)
- [Utility Functions](#utility-functions)
- [Usage Examples](#usage-examples)

## Overview

Oluchicoin (OLUC) is a SIP-010 compliant fungible token on the Stacks blockchain. The contract provides standard token functionality along with administrative controls for minting, burning, and pausing operations.

### Contract Information

| Property | Value |
|----------|-------|
| **Token Name** | Oluchicoin |
| **Symbol** | OLUC |
| **Decimals** | 8 |
| **Initial Supply** | 10,000,000 OLUC (1,000,000,000,000,000 units) |

## Constants

### Token Configuration
```clarity
(define-constant token-name "Oluchicoin")
(define-constant token-symbol "OLUC")
(define-constant token-decimals u8)
(define-constant initial-supply u1000000000000000)
```

### Access Control
```clarity
(define-constant contract-owner tx-sender)
```

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| `u100` | `err-owner-only` | Only contract owner can perform this action |
| `u101` | `err-not-token-owner` | Sender is not authorized to transfer from this address |
| `u102` | `err-insufficient-balance` | Insufficient token balance for operation |
| `u103` | `err-invalid-amount` | Amount must be greater than zero |
| `u104` | `err-transfer-failed` | Token transfer operation failed |
| `u105` | Contract paused | Contract is currently paused |

## SIP-010 Functions

These functions implement the SIP-010 standard for fungible tokens on Stacks.

### `transfer`

Transfers tokens from one address to another.

**Signature:**
```clarity
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34)))))
```

**Parameters:**
- `amount` (uint): Number of token units to transfer
- `from` (principal): Address sending the tokens
- `to` (principal): Address receiving the tokens  
- `memo` (optional buff 34): Optional memo data

**Returns:** `(response bool uint)`

**Requirements:**
- Contract must not be paused
- Amount must be greater than zero
- Sender must be `from` address or contract caller must be `from`
- Sufficient balance in `from` address

**Example:**
```clarity
;; Transfer 1 OLUC (100,000,000 units with 8 decimals)
(contract-call? .oluchicoin transfer u100000000 tx-sender 'SP1234...ABCD none)
```

### `get-name`

Returns the token name.

**Signature:**
```clarity
(define-read-only (get-name))
```

**Returns:** `(response (string-ascii 9) uint)` - "Oluchicoin"

### `get-symbol`

Returns the token symbol.

**Signature:**
```clarity
(define-read-only (get-symbol))
```

**Returns:** `(response (string-ascii 4) uint)` - "OLUC"

### `get-decimals`

Returns the number of decimals used by the token.

**Signature:**
```clarity
(define-read-only (get-decimals))
```

**Returns:** `(response uint uint)` - `u8`

### `get-balance`

Returns the token balance for a given address.

**Signature:**
```clarity
(define-read-only (get-balance (who principal)))
```

**Parameters:**
- `who` (principal): Address to check balance for

**Returns:** `(response uint uint)` - Token balance in base units

**Example:**
```clarity
;; Check balance for an address
(contract-call? .oluchicoin get-balance 'SP1234...ABCD)
```

### `get-total-supply`

Returns the total supply of tokens.

**Signature:**
```clarity
(define-read-only (get-total-supply))
```

**Returns:** `(response uint uint)` - Total token supply in base units

### `get-token-uri`

Returns the optional token metadata URI.

**Signature:**
```clarity
(define-read-only (get-token-uri))
```

**Returns:** `(response (optional (string-utf8 256)) uint)` - Token metadata URI or none

## Administrative Functions

These functions are restricted to the contract owner or specific authorized addresses.

### `mint`

Creates new tokens and assigns them to a recipient address.

**Signature:**
```clarity
(define-public (mint (amount uint) (to principal)))
```

**Parameters:**
- `amount` (uint): Number of tokens to mint (in base units)
- `to` (principal): Recipient address

**Returns:** `(response bool uint)`

**Requirements:**
- Only contract owner can call
- Contract must not be paused
- Amount must be greater than zero

**Example:**
```clarity
;; Mint 1000 OLUC to recipient
(contract-call? .oluchicoin mint u100000000000 'SP1234...ABCD)
```

### `burn`

Destroys tokens from a specified address.

**Signature:**
```clarity
(define-public (burn (amount uint) (from principal)))
```

**Parameters:**
- `amount` (uint): Number of tokens to burn (in base units)
- `from` (principal): Address to burn tokens from

**Returns:** `(response bool uint)`

**Requirements:**
- Caller must be contract owner OR the `from` address
- Contract must not be paused
- Amount must be greater than zero
- Sufficient balance in `from` address

**Example:**
```clarity
;; Burn 500 OLUC from address
(contract-call? .oluchicoin burn u50000000000 'SP1234...ABCD)
```

### `pause-contract`

Pauses all token operations (transfers, minting, burning).

**Signature:**
```clarity
(define-public (pause-contract))
```

**Returns:** `(response bool uint)`

**Requirements:**
- Only contract owner can call

**Example:**
```clarity
(contract-call? .oluchicoin pause-contract)
```

### `unpause-contract`

Resumes all token operations.

**Signature:**
```clarity
(define-public (unpause-contract))
```

**Returns:** `(response bool uint)`

**Requirements:**
- Only contract owner can call

**Example:**
```clarity
(contract-call? .oluchicoin unpause-contract)
```

### `set-token-uri`

Sets the token metadata URI.

**Signature:**
```clarity
(define-public (set-token-uri (value (optional (string-utf8 256)))))
```

**Parameters:**
- `value` (optional string-utf8 256): New token URI or none to clear

**Returns:** `(response bool uint)`

**Requirements:**
- Only contract owner can call

**Example:**
```clarity
;; Set token metadata URI
(contract-call? .oluchicoin set-token-uri (some u"https://api.oluchiverse.com/metadata"))

;; Clear token URI
(contract-call? .oluchicoin set-token-uri none)
```

### `approve-contract`

Approves a contract address for special operations.

**Signature:**
```clarity
(define-public (approve-contract (contract principal)))
```

**Parameters:**
- `contract` (principal): Contract address to approve

**Returns:** `(response bool uint)`

**Requirements:**
- Only contract owner can call

**Example:**
```clarity
(contract-call? .oluchicoin approve-contract 'SP1234...ABCD.defi-protocol)
```

### `revoke-contract`

Revokes approval for a contract address.

**Signature:**
```clarity
(define-public (revoke-contract (contract principal)))
```

**Parameters:**
- `contract` (principal): Contract address to revoke

**Returns:** `(response bool uint)`

**Requirements:**
- Only contract owner can call

**Example:**
```clarity
(contract-call? .oluchicoin revoke-contract 'SP1234...ABCD.defi-protocol)
```

## Utility Functions

### `get-contract-owner`

Returns the contract owner address.

**Signature:**
```clarity
(define-read-only (get-contract-owner))
```

**Returns:** `(response principal uint)` - Contract owner address

### `is-contract-paused`

Checks if the contract is currently paused.

**Signature:**
```clarity
(define-read-only (is-contract-paused))
```

**Returns:** `(response bool uint)` - True if paused, false otherwise

### `is-approved-contract`

Checks if a contract address is approved for special operations.

**Signature:**
```clarity
(define-read-only (is-approved-contract (contract principal)))
```

**Parameters:**
- `contract` (principal): Contract address to check

**Returns:** `bool` - True if approved, false otherwise

### `get-contract-info`

Returns comprehensive contract information in a single call.

**Signature:**
```clarity
(define-read-only (get-contract-info))
```

**Returns:** `(response tuple uint)` - Tuple containing:
- `name`: Token name
- `symbol`: Token symbol  
- `decimals`: Token decimals
- `total-supply`: Current total supply
- `contract-owner`: Owner address
- `paused`: Pause status
- `token-uri`: Metadata URI

**Example:**
```clarity
(contract-call? .oluchicoin get-contract-info)
;; Returns:
;; {
;;   name: "Oluchicoin",
;;   symbol: "OLUC", 
;;   decimals: u8,
;;   total-supply: u1000000000000000,
;;   contract-owner: 'SP1234...OWNER,
;;   paused: false,
;;   token-uri: none
;; }
```

## Usage Examples

### Basic Token Operations

#### Check Token Information
```clarity
;; Get token metadata
(contract-call? .oluchicoin get-name)      ;; "Oluchicoin"
(contract-call? .oluchicoin get-symbol)    ;; "OLUC"
(contract-call? .oluchicoin get-decimals)  ;; u8

;; Get supply information
(contract-call? .oluchicoin get-total-supply)  ;; u1000000000000000
```

#### Transfer Tokens
```clarity
;; Transfer 10 OLUC (1,000,000,000 units) from alice to bob
(contract-call? .oluchicoin transfer u1000000000 'SP...alice 'SP...bob none)

;; Transfer with memo
(contract-call? .oluchicoin transfer 
  u1000000000 
  tx-sender 
  'SP...recipient 
  (some 0x48656c6c6f20576f726c64)) ;; "Hello World" in hex
```

#### Check Balances
```clarity
;; Check balance for specific address
(contract-call? .oluchicoin get-balance 'SP...address)

;; Check own balance
(contract-call? .oluchicoin get-balance tx-sender)
```

### Administrative Operations

#### Minting New Tokens
```clarity
;; Mint 1000 OLUC to treasury address (owner only)
(contract-call? .oluchicoin mint u100000000000 'SP...treasury)
```

#### Emergency Pause
```clarity
;; Pause contract in emergency (owner only)
(contract-call? .oluchicoin pause-contract)

;; Check pause status
(contract-call? .oluchicoin is-contract-paused)  ;; true

;; Resume operations (owner only)
(contract-call? .oluchicoin unpause-contract)
```

#### Token Burning
```clarity
;; Burn tokens from own address
(contract-call? .oluchicoin burn u50000000000 tx-sender)

;; Owner burning tokens from any address
(contract-call? .oluchicoin burn u50000000000 'SP...address)
```

### Integration Examples

#### DeFi Protocol Integration
```clarity
;; Approve DeFi protocol for special operations (owner only)
(contract-call? .oluchicoin approve-contract 'SP...defi-protocol)

;; Check if protocol is approved
(contract-call? .oluchicoin is-approved-contract 'SP...defi-protocol)  ;; true

;; Revoke approval (owner only)
(contract-call? .oluchicoin revoke-contract 'SP...defi-protocol)
```

#### Batch Operations Pattern
```clarity
;; Example function for batch transfers
(define-public (batch-transfer (recipients (list 10 {to: principal, amount: uint})))
  (begin
    (asserts! (is-some recipients) (err u404))
    (fold batch-transfer-iter recipients (ok true))
  )
)

(define-private (batch-transfer-iter (recipient {to: principal, amount: uint}) (acc (response bool uint)))
  (match acc
    success (contract-call? .oluchicoin transfer (get amount recipient) tx-sender (get to recipient) none)
    error error
  )
)
```

## Best Practices

### Security Considerations

1. **Owner Privileges**: Be aware that the contract owner has significant control (minting, pausing, etc.)
2. **Pause Mechanism**: Use the pause functionality for emergency situations
3. **Input Validation**: All amounts are validated to be greater than zero
4. **Authorization Checks**: Transfer functions verify sender authorization

### Integration Guidelines

1. **Error Handling**: Always handle potential error responses from contract calls
2. **Amount Calculations**: Remember the token uses 8 decimal places
3. **Gas Optimization**: Batch operations when possible to save on transaction fees
4. **Event Monitoring**: Monitor blockchain events for token transfers and administrative actions

### Testing Recommendations

1. Test all functions with various input combinations
2. Verify error conditions are handled properly
3. Test pause/unpause functionality
4. Validate balance calculations across multiple operations
5. Test edge cases like maximum supply transfers

## Migration and Upgrades

The Oluchicoin contract is immutable once deployed. Any upgrades would require:

1. Deploying a new contract version
2. Implementing migration functions
3. Community governance for approval
4. Coordinated migration of user balances

## Support and Resources

- **Documentation**: [GitHub Repository](https://github.com/yourusername/oluchicoin)
- **Issues**: [GitHub Issues](https://github.com/yourusername/oluchicoin/issues)
- **Community**: [Discussions](https://github.com/yourusername/oluchicoin/discussions)

---

*This documentation is for Oluchicoin v1.0.0. Always verify function signatures and behavior against the deployed contract.*