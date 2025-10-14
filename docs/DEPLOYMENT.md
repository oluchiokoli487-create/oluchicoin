# Oluchicoin Deployment Guide

This guide walks you through deploying the Oluchicoin smart contract to different Stacks networks.

## Prerequisites

Before deploying, ensure you have:

- ✅ Clarinet installed (`clarinet --version`)
- ✅ Node.js and npm installed
- ✅ STX tokens for transaction fees
- ✅ A Stacks wallet with private key

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify Contract

```bash
clarinet check
```

### 3. Run Tests

```bash
npm test
```

## Deployment Networks

### Devnet (Local Development)

**Setup:**
```bash
# Start local devnet
clarinet integrate
```

**Deploy:**
```bash
# Using Clarinet CLI
clarinet deploy --devnet

# Or using custom script
tsx scripts/deploy.ts devnet oluchicoin YOUR_PRIVATE_KEY
```

**Network Details:**
- API URL: `http://localhost:3999`
- Explorer: `http://localhost:8000`
- Faucet: Built-in with pre-funded accounts

### Testnet

**Prerequisites:**
- Get testnet STX from [faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
- Have testnet-compatible private key

**Deploy:**
```bash
# Configure testnet settings
clarinet settings set testnet.network "testnet"

# Deploy to testnet
clarinet deploy --testnet

# Or using custom script
tsx scripts/deploy.ts testnet oluchicoin YOUR_TESTNET_PRIVATE_KEY
```

**Network Details:**
- API URL: `https://stacks-node-api.testnet.stacks.co`
- Explorer: `https://explorer.stacks.co/?chain=testnet`
- Faucet: `https://explorer.stacks.co/sandbox/faucet?chain=testnet`

### Mainnet

⚠️ **Warning**: Mainnet deployment uses real STX and is permanent.

**Prerequisites:**
- Sufficient STX for deployment fees (~0.1-1 STX)
- Mainnet-compatible wallet/private key
- Thorough testing on testnet

**Deploy:**
```bash
# Configure mainnet settings
clarinet settings set mainnet.network "mainnet"

# Deploy to mainnet (be very careful!)
clarinet deploy --mainnet

# Or using custom script
tsx scripts/deploy.ts mainnet oluchicoin YOUR_MAINNET_PRIVATE_KEY
```

**Network Details:**
- API URL: `https://stacks-node-api.mainnet.stacks.co`
- Explorer: `https://explorer.stacks.co`
- Real economic value ⚠️

## Deployment Process

### Step 1: Pre-deployment Checklist

- [ ] Contract passes `clarinet check`
- [ ] All tests pass (`npm test`)
- [ ] Code review completed
- [ ] Security audit (for mainnet)
- [ ] Deployment script tested on devnet/testnet

### Step 2: Deploy Contract

Choose your deployment method:

#### Option A: Using Clarinet CLI

```bash
# Check deployment plan
clarinet deployment plan --devnet

# Execute deployment
clarinet deployment apply --devnet
```

#### Option B: Using Custom Script

```bash
# Deploy with automatic confirmation waiting
tsx scripts/deploy.ts <network> oluchicoin <private-key>
```

#### Option C: Manual Deployment

```bash
# Create transaction
stx deploy_contract oluchicoin contracts/oluchicoin.clar --private-key <key>
```

### Step 3: Post-deployment Verification

1. **Verify Deployment:**
   ```bash
   # Check contract exists
   curl https://stacks-node-api.mainnet.stacks.co/extended/v1/contract/<address>.oluchicoin
   ```

2. **Test Basic Functions:**
   ```bash
   # Get token info
   stx call_read_only_contract_func <address> oluchicoin get-name
   stx call_read_only_contract_func <address> oluchicoin get-total-supply
   ```

3. **Verify on Explorer:**
   - Visit Stacks Explorer
   - Search for your contract address
   - Verify contract code and transactions

## Configuration Options

### Contract Settings

You can customize the contract before deployment by modifying:

```clarity
;; In contracts/oluchicoin.clar
(define-constant initial-supply u1000000000000000) ;; Adjust initial supply
(define-constant token-name "Oluchicoin")          ;; Customize name
(define-constant token-symbol "OLUC")              ;; Customize symbol
```

### Network Configuration

Update `settings/Devnet.toml`, `settings/Testnet.toml`, or `settings/Mainnet.toml`:

```toml
[network]
name = "testnet"
deployment_fee = 180000

[accounts.deployer]
mnemonic = "your mnemonic words here..."
balance = 100000000
```

## Troubleshooting

### Common Issues

1. **"Insufficient funds" error:**
   ```bash
   # Check balance
   stx balance <address>
   
   # Get testnet STX from faucet
   curl -X POST https://stacks-node-api.testnet.stacks.co/extended/v1/faucets/stx
   ```

2. **"Transaction not found" error:**
   - Wait for transaction confirmation (can take 10+ minutes)
   - Check transaction status on explorer
   - Verify network connectivity

3. **"Contract already exists" error:**
   - Choose a different contract name
   - Check if contract was previously deployed

4. **Node.js version warnings:**
   ```bash
   # Update to Node.js 20+ for best compatibility
   nvm install 20
   nvm use 20
   ```

### Debug Commands

```bash
# Check Clarinet version
clarinet --version

# Validate contract syntax
clarinet check --verbose

# Test specific function
clarinet console
>> (contract-call? .oluchicoin get-name)

# Check deployment status
curl -s https://stacks-node-api.testnet.stacks.co/extended/v1/tx/<tx-id>
```

## Security Considerations

### Before Mainnet Deployment

1. **Code Audit:**
   - Review all contract functions
   - Check access controls
   - Verify mathematical operations
   - Test edge cases

2. **Testing Strategy:**
   - Comprehensive unit tests
   - Integration testing
   - Load testing on testnet
   - Security testing

3. **Key Management:**
   - Use hardware wallet for mainnet
   - Never commit private keys
   - Use environment variables for secrets

4. **Emergency Procedures:**
   - Document pause contract procedure
   - Have emergency contact plan
   - Monitor contract activity

## Post-deployment Tasks

### Immediate Tasks

1. **Verify Deployment:**
   - Test all functions work correctly
   - Verify initial supply and owner
   - Check contract state

2. **Set Metadata:**
   ```clarity
   ;; Set token metadata URI
   (contract-call? .oluchicoin set-token-uri 
     (some u"https://api.oluchiverse.com/metadata/oluc"))
   ```

3. **Document Contract:**
   - Record contract address
   - Update documentation
   - Notify stakeholders

### Long-term Tasks

1. **Monitoring:**
   - Set up transaction monitoring
   - Monitor contract events
   - Track token metrics

2. **Integration:**
   - Submit to token lists
   - Integrate with wallets
   - Add to DeFi protocols

3. **Governance:**
   - Establish governance processes
   - Plan upgrade procedures
   - Community engagement

## Resources

- **Stacks Documentation:** [https://docs.stacks.co](https://docs.stacks.co)
- **Clarinet Guide:** [https://docs.hiro.so/clarinet](https://docs.hiro.so/clarinet)
- **SIP-010 Standard:** [https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)

---

**Important:** Always test thoroughly on devnet and testnet before mainnet deployment. Smart contracts are immutable once deployed!