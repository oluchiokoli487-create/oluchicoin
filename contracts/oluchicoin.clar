;; title: Oluchicoin (OLUC)
;; version: 1.0.0
;; summary: A SIP-010 compliant fungible token for the Oluchiverse ecosystem
;; description: Oluchicoin is a fungible token built on Stacks blockchain, 
;;              designed to power transactions and governance within the Oluchiverse.

;; traits
;; SIP-010 trait implementation (commented out for now - can be enabled when deploying to mainnet with proper trait reference)
;; (impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; token definitions
(define-fungible-token oluchicoin)

;; constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))
(define-constant err-transfer-failed (err u104))

;; Token configuration
(define-constant token-name "Oluchicoin")
(define-constant token-symbol "OLUC")
(define-constant token-decimals u8)
(define-constant initial-supply u1000000000000000) ;; 10 million tokens with 8 decimals

;; data vars
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var contract-paused bool false)

;; data maps
(define-map approved-contracts principal bool)
(define-map token-balances principal uint)

;; Initialize the contract with initial supply to contract owner
(begin
  (try! (ft-mint? oluchicoin initial-supply contract-owner))
)

;; public functions

;; SIP-010 Standard Functions

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (not (var-get contract-paused)) (err u105))
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (or (is-eq tx-sender from) (is-eq contract-caller from)) err-not-token-owner)
    (try! (ft-transfer? oluchicoin amount from to))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-public (mint (amount uint) (to principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (var-get contract-paused)) (err u105))
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-mint? oluchicoin amount to))
    (ok true)
  )
)

(define-public (burn (amount uint) (from principal))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner) (is-eq tx-sender from)) err-not-token-owner)
    (asserts! (not (var-get contract-paused)) (err u105))
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-burn? oluchicoin amount from))
    (ok true)
  )
)

;; Governance and Admin Functions

(define-public (set-token-uri (value (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set token-uri value)
    (ok true)
  )
)

(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set contract-paused true)
    (ok true)
  )
)

(define-public (unpause-contract)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set contract-paused false)
    (ok true)
  )
)

(define-public (approve-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set approved-contracts contract true)
    (ok true)
  )
)

(define-public (revoke-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-delete approved-contracts contract)
    (ok true)
  )
)

;; read only functions

;; SIP-010 Required Read-Only Functions

(define-read-only (get-name)
  (ok token-name)
)

(define-read-only (get-symbol)
  (ok token-symbol)
)

(define-read-only (get-decimals)
  (ok token-decimals)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance oluchicoin who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply oluchicoin))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Additional Read-Only Functions

(define-read-only (get-contract-owner)
  (ok contract-owner)
)

(define-read-only (is-contract-paused)
  (ok (var-get contract-paused))
)

(define-read-only (is-approved-contract (contract principal))
  (default-to false (map-get? approved-contracts contract))
)

;; Utility Functions

(define-read-only (get-contract-info)
  (ok {
    name: token-name,
    symbol: token-symbol,
    decimals: token-decimals,
    total-supply: (ft-get-supply oluchicoin),
    contract-owner: contract-owner,
    paused: (var-get contract-paused),
    token-uri: (var-get token-uri)
  })
)

;; private functions
;; (None currently needed)

;; Events (using print for logging)
(define-private (log-transfer (amount uint) (from principal) (to principal))
  (print {
    event: "transfer",
    amount: amount,
    from: from,
    to: to,
    timestamp: stacks-block-height
  })
)

