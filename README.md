# Oluchicoin (OLUC) 🪙

*A SIP-010 compliant fungible token powering the Oluchiverse ecosystem on Stacks blockchain.*

## Overview

Oluchicoin (OLUC) is a fungible token built on the Stacks blockchain, designed to facilitate transactions and governance within the Oluchiverse ecosystem. The token follows the SIP-010 standard, ensuring compatibility with the broader Stacks DeFi ecosystem.

## Features

- ✅ **SIP-010 Compliant**: Full compliance with Stacks fungible token standard
- ✅ **Mintable & Burnable**: Controlled token supply management
- ✅ **Pausable**: Emergency pause functionality for security
- ✅ **Governance Ready**: Built-in contract approval system
- ✅ **Comprehensive Testing**: Full test suite included
- ✅ **Well Documented**: Detailed code documentation and examples

## Token Specifications

| Property | Value |
|----------|-------|
| **Name** | Oluchicoin |
| **Symbol** | OLUC |
| **Decimals** | 8 |
| **Initial Supply** | 10,000,000 OLUC |
| **Max Supply** | Controlled by contract owner |
| **Blockchain** | Stacks |

## Smart Contract Functions

### Core SIP-010 Functions

- `transfer(amount, from, to, memo)` - Transfer tokens between addresses
- `get-balance(who)` - Get token balance for an address
- `get-total-supply()` - Get total token supply
- `get-name()` - Get token name
- `get-symbol()` - Get token symbol
- `get-decimals()` - Get token decimals
- `get-token-uri()` - Get token metadata URI

### Administrative Functions

- `mint(amount, to)` - Mint new tokens (owner only)
- `burn(amount, from)` - Burn tokens 
- `pause-contract()` - Pause all token operations (owner only)
- `unpause-contract()` - Resume token operations (owner only)
- `set-token-uri(uri)` - Set metadata URI (owner only)
- `approve-contract(contract)` - Approve contract for special operations (owner only)
- `revoke-contract(contract)` - Revoke contract approval (owner only)

### Utility Functions

- `get-contract-info()` - Get comprehensive contract information
- `get-contract-owner()` - Get contract owner address
- `is-contract-paused()` - Check if contract is paused
- `is-approved-contract(contract)` - Check if contract is approved

## Getting Started

### Prerequisites

- [Clarinet](https://docs.hiro.so/clarinet) - Stacks smart contract development toolkit
- [Node.js](https://nodejs.org/) - For running tests
- [Stacks Wallet](https://www.hiro.so/wallet) - For interacting with the contract

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/oluchicoin.git
   cd oluchicoin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Check contract syntax**
   ```bash
   clarinet check
   ```

4. **Run tests**
   ```bash
   npm test
   ```

### Development

#### Running Local Devnet

```bash
# Start local Stacks devnet
clarinet integrate
```

#### Contract Deployment

```bash
# Deploy to devnet
clarinet deploy --devnet

# Deploy to testnet (requires configuration)
clarinet deploy --testnet
```

#### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/oluchicoin.test.ts

# Watch mode for development
npm test -- --watch
```

## Usage Examples

### Basic Token Transfer

```clarity
;; Transfer 1000 OLUC (with 8 decimals = 100000000)
(contract-call? .oluchicoin transfer u100000000 tx-sender 'SP1234567890ABCDEF recipient-address none)
```

### Check Balance

```clarity
;; Get balance for an address
(contract-call? .oluchicoin get-balance 'SP1234567890ABCDEF)
```

### Minting (Owner Only)

```clarity
;; Mint 500 OLUC to recipient
(contract-call? .oluchicoin mint u50000000000 'SP1234567890ABCDEF)
```

## Testing

The project includes comprehensive tests covering:

- ✅ Token transfers and balances
- ✅ Minting and burning functionality
- ✅ Access control and permissions
- ✅ Pause/unpause functionality
- ✅ Error handling and edge cases
- ✅ SIP-010 compliance

Run the test suite:

```bash
npm test
```

## Security Considerations

- **Owner Controls**: The contract owner has significant privileges (minting, pausing, etc.)
- **Pause Mechanism**: Emergency pause functionality for security incidents
- **Access Control**: Proper permission checks for sensitive operations
- **Input Validation**: All functions validate inputs and handle errors gracefully

## Contract Architecture

```
oluchicoin.clar
├── SIP-010 Implementation
│   ├── Core transfer functions
│   ├── Balance queries
│   └── Metadata functions
├── Administrative Functions
│   ├── Minting/Burning
│   ├── Pause controls
│   └── Contract approvals
└── Utility Functions
    ├── Contract info
    └── Status queries
```

## Roadmap

- [x] **Phase 1**: Core SIP-010 implementation
- [x] **Phase 2**: Administrative controls and security features
- [ ] **Phase 3**: DeFi integration (staking, liquidity pools)
- [ ] **Phase 4**: Governance features (voting, proposals)
- [ ] **Phase 5**: Cross-chain bridge integration

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add comprehensive tests for new features
- Update documentation for any changes
- Ensure contract passes `clarinet check`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/oluchicoin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/oluchicoin/discussions)
- **Email**: support@oluchiverse.com

## Acknowledgments

- [Stacks Foundation](https://stacks.org) for the blockchain infrastructure
- [Hiro](https://hiro.so) for Clarinet development tools
- The Stacks community for SIP-010 standard

---

**Disclaimer**: This is experimental software. Use at your own risk. Always audit smart contracts before using them with real funds.
 
