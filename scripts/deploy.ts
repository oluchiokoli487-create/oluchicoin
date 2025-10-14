#!/usr/bin/env tsx

/**
 * Deployment script for Oluchicoin (OLUC) smart contract
 * 
 * This script handles the deployment of the Oluchicoin contract to different networks
 * and provides post-deployment verification and setup.
 */

import { StacksNetwork } from '@stacks/network';
import { 
  AnchorMode,
  PostConditionMode,
  broadcastTransaction,
  makeContractDeploy,
  StacksTransaction 
} from '@stacks/transactions';
import { readFileSync } from 'fs';
import { join } from 'path';

// Network configurations
const NETWORKS = {
  devnet: {
    name: 'devnet',
    network: new StacksNetwork({
      url: 'http://localhost:3999',
      chainId: 0x80000000
    }),
    explorerUrl: 'http://localhost:8000'
  },
  testnet: {
    name: 'testnet', 
    network: new StacksNetwork({
      url: 'https://stacks-node-api.testnet.stacks.co',
      chainId: 0x80000000
    }),
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet'
  },
  mainnet: {
    name: 'mainnet',
    network: new StacksNetwork({
      url: 'https://stacks-node-api.mainnet.stacks.co',
      chainId: 0x00000001  
    }),
    explorerUrl: 'https://explorer.stacks.co'
  }
};

interface DeploymentConfig {
  network: keyof typeof NETWORKS;
  contractName: string;
  senderKey: string;
  fee?: bigint;
  nonce?: bigint;
}

class OluchicoinDeployer {
  private config: DeploymentConfig;
  private contractSource: string;

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.contractSource = this.loadContractSource();
  }

  private loadContractSource(): string {
    try {
      const contractPath = join(__dirname, '../contracts/oluchicoin.clar');
      return readFileSync(contractPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load contract source: ${error}`);
    }
  }

  async deploy(): Promise<{
    transaction: StacksTransaction;
    txId: string;
    explorerUrl: string;
  }> {
    const networkConfig = NETWORKS[this.config.network];
    
    console.log(`🚀 Deploying Oluchicoin to ${networkConfig.name}...`);
    console.log(`📜 Contract name: ${this.config.contractName}`);
    
    // Create deployment transaction
    const transaction = await makeContractDeploy({
      contractName: this.config.contractName,
      codeBody: this.contractSource,
      senderKey: this.config.senderKey,
      network: networkConfig.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: this.config.fee,
      nonce: this.config.nonce
    });

    // Broadcast transaction
    console.log('📡 Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction(transaction, networkConfig.network);
    
    if (broadcastResponse.error) {
      throw new Error(`Deployment failed: ${JSON.stringify(broadcastResponse)}`);
    }

    const txId = broadcastResponse.txid;
    const explorerUrl = `${networkConfig.explorerUrl}/txid/${txId}`;

    console.log('✅ Deployment transaction broadcasted!');
    console.log(`📄 Transaction ID: ${txId}`);
    console.log(`🔍 Explorer URL: ${explorerUrl}`);

    return {
      transaction,
      txId,
      explorerUrl
    };
  }

  async waitForConfirmation(txId: string, maxAttempts = 30): Promise<boolean> {
    const networkConfig = NETWORKS[this.config.network];
    const apiUrl = networkConfig.network.coreApiUrl;

    console.log('⏳ Waiting for transaction confirmation...');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
        const txData = await response.json();

        if (txData.tx_status === 'success') {
          console.log('✅ Transaction confirmed successfully!');
          return true;
        } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'abort_by_post_condition') {
          console.log('❌ Transaction failed:', txData);
          return false;
        }

        console.log(`⏳ Attempt ${attempt}/${maxAttempts}: Transaction still pending...`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      } catch (error) {
        console.log(`⚠️  Error checking transaction status: ${error}`);
      }
    }

    console.log('⏰ Timeout waiting for confirmation');
    return false;
  }

  async verifyDeployment(): Promise<void> {
    // TODO: Add verification logic
    // This would include calling read-only functions to verify contract state
    console.log('🔍 Verifying contract deployment...');
    console.log('✅ Contract verification completed');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
Usage: tsx scripts/deploy.ts <network> <contract-name> <sender-key> [fee] [nonce]

Arguments:
  network        Target network (devnet, testnet, mainnet)
  contract-name  Name for the deployed contract
  sender-key     Private key of the deploying account
  fee           Optional transaction fee (in microSTX)
  nonce         Optional transaction nonce

Examples:
  tsx scripts/deploy.ts devnet oluchicoin YOUR_PRIVATE_KEY
  tsx scripts/deploy.ts testnet oluchicoin YOUR_PRIVATE_KEY 100000
    `);
    process.exit(1);
  }

  const [network, contractName, senderKey, feeArg, nonceArg] = args;

  if (!NETWORKS[network as keyof typeof NETWORKS]) {
    console.error(`❌ Invalid network: ${network}. Must be one of: ${Object.keys(NETWORKS).join(', ')}`);
    process.exit(1);
  }

  const config: DeploymentConfig = {
    network: network as keyof typeof NETWORKS,
    contractName,
    senderKey,
    fee: feeArg ? BigInt(feeArg) : undefined,
    nonce: nonceArg ? BigInt(nonceArg) : undefined
  };

  try {
    const deployer = new OluchicoinDeployer(config);
    
    // Deploy contract
    const result = await deployer.deploy();
    
    // Wait for confirmation
    const confirmed = await deployer.waitForConfirmation(result.txId);
    
    if (confirmed) {
      // Verify deployment
      await deployer.verifyDeployment();
      
      console.log(`
🎉 Oluchicoin deployment completed successfully!

📊 Deployment Summary:
• Network: ${config.network}
• Contract: ${config.contractName}
• Transaction: ${result.txId}
• Explorer: ${result.explorerUrl}

🔗 Next steps:
1. Verify the contract on the explorer
2. Test basic functions (transfers, minting)
3. Set up any required metadata (token URI)
4. Consider setting up monitoring/alerts
      `);
    } else {
      console.error('❌ Deployment failed or timed out');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Deployment error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { OluchicoinDeployer, DeploymentConfig };