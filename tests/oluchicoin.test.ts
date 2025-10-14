import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const contractName = "oluchicoin";

describe("Oluchicoin Token Tests", () => {
  beforeEach(() => {
    // Reset blockchain state before each test if needed
  });

  describe("Contract Initialization", () => {
    it("should have correct initial token metadata", () => {
      const name = simnet.callReadOnlyFn(contractName, "get-name", [], deployer);
      expect(name.result).toBeOk(Cl.stringAscii("Oluchicoin"));

      const symbol = simnet.callReadOnlyFn(contractName, "get-symbol", [], deployer);
      expect(symbol.result).toBeOk(Cl.stringAscii("OLUC"));

      const decimals = simnet.callReadOnlyFn(contractName, "get-decimals", [], deployer);
      expect(decimals.result).toBeOk(Cl.uint(8));
    });

    it("should have correct initial supply", () => {
      const totalSupply = simnet.callReadOnlyFn(contractName, "get-total-supply", [], deployer);
      expect(totalSupply.result).toBeOk(Cl.uint(1000000000000000)); // 10M with 8 decimals
    });

    it("should assign initial supply to deployer", () => {
      const balance = simnet.callReadOnlyFn(contractName, "get-balance", [Cl.principal(deployer)], deployer);
      expect(balance.result).toBeOk(Cl.uint(1000000000000000));
    });

    it("should set correct contract owner", () => {
      const owner = simnet.callReadOnlyFn(contractName, "get-contract-owner", [], deployer);
      expect(owner.result).toBeOk(Cl.principal(deployer));
    });

    it("should start unpaused", () => {
      const paused = simnet.callReadOnlyFn(contractName, "is-contract-paused", [], deployer);
      expect(paused.result).toBeOk(Cl.bool(false));
    });
  });

  describe("Token Transfers", () => {
    it("should transfer tokens successfully", () => {
      const transferAmount = 100000000; // 1 OLUC with 8 decimals

      const transfer = simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(transferAmount), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );
      expect(transfer.result).toBeOk(Cl.bool(true));

      // Check balances after transfer
      const deployerBalance = simnet.callReadOnlyFn(contractName, "get-balance", [Cl.principal(deployer)], deployer);
      expect(deployerBalance.result).toBeOk(Cl.uint(1000000000000000 - transferAmount));

      const wallet1Balance = simnet.callReadOnlyFn(contractName, "get-balance", [Cl.principal(wallet1)], deployer);
      expect(wallet1Balance.result).toBeOk(Cl.uint(transferAmount));
    });

    it("should fail transfer with insufficient balance", () => {
      const largeAmount = 2000000000000000; // More than total supply

      const transfer = simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(largeAmount), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );
      expect(transfer.result).toBeErr(Cl.uint(1)); // Insufficient balance error
    });

    it("should fail transfer of zero amount", () => {
      const transfer = simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(0), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );
      expect(transfer.result).toBeErr(Cl.uint(103)); // Invalid amount error
    });

    it("should fail transfer from unauthorized sender", () => {
      const transferAmount = 100000000;

      const transfer = simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(transferAmount), Cl.principal(deployer), Cl.principal(wallet2), Cl.none()],
        wallet1 // wallet1 trying to transfer from deployer
      );
      expect(transfer.result).toBeErr(Cl.uint(101)); // Not token owner error
    });
  });

  describe("Minting Functionality", () => {
    it("should allow owner to mint tokens", () => {
      const mintAmount = 50000000000; // 500 OLUC
      const initialSupply = 1000000000000000;

      const mint = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(mintAmount), Cl.principal(wallet1)],
        deployer
      );
      expect(mint.result).toBeOk(Cl.bool(true));

      // Check new total supply
      const totalSupply = simnet.callReadOnlyFn(contractName, "get-total-supply", [], deployer);
      expect(totalSupply.result).toBeOk(Cl.uint(initialSupply + mintAmount));

      // Check recipient balance
      const balance = simnet.callReadOnlyFn(contractName, "get-balance", [Cl.principal(wallet1)], deployer);
      expect(balance.result).toBeOk(Cl.uint(mintAmount));
    });

    it("should fail mint from non-owner", () => {
      const mintAmount = 50000000000;

      const mint = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(mintAmount), Cl.principal(wallet1)],
        wallet2 // Non-owner trying to mint
      );
      expect(mint.result).toBeErr(Cl.uint(100)); // Owner only error
    });

    it("should fail mint zero amount", () => {
      const mint = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(0), Cl.principal(wallet1)],
        deployer
      );
      expect(mint.result).toBeErr(Cl.uint(103)); // Invalid amount error
    });
  });

  describe("Burning Functionality", () => {
    it("should allow token holder to burn their tokens", () => {
      const burnAmount = 50000000000; // 500 OLUC
      const initialSupply = 1000000000000000;

      // First mint some tokens to wallet1
      simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(burnAmount), Cl.principal(wallet1)],
        deployer
      );

      // Then burn them
      const burn = simnet.callPublicFn(
        contractName,
        "burn",
        [Cl.uint(burnAmount), Cl.principal(wallet1)],
        wallet1
      );
      expect(burn.result).toBeOk(Cl.bool(true));

      // Check balance is zero
      const balance = simnet.callReadOnlyFn(contractName, "get-balance", [Cl.principal(wallet1)], deployer);
      expect(balance.result).toBeOk(Cl.uint(0));

      // Check total supply reduced
      const totalSupply = simnet.callReadOnlyFn(contractName, "get-total-supply", [], deployer);
      expect(totalSupply.result).toBeOk(Cl.uint(initialSupply));
    });

    it("should allow owner to burn any tokens", () => {
      const burnAmount = 100000000000; // 1000 OLUC

      const burn = simnet.callPublicFn(
        contractName,
        "burn",
        [Cl.uint(burnAmount), Cl.principal(deployer)],
        deployer
      );
      expect(burn.result).toBeOk(Cl.bool(true));
    });

    it("should fail burn from unauthorized user", () => {
      const burnAmount = 50000000000;

      const burn = simnet.callPublicFn(
        contractName,
        "burn",
        [Cl.uint(burnAmount), Cl.principal(deployer)],
        wallet1 // wallet1 trying to burn deployer's tokens
      );
      expect(burn.result).toBeErr(Cl.uint(101)); // Not token owner error
    });
  });

  describe("Pause Functionality", () => {
    it("should allow owner to pause contract", () => {
      const pause = simnet.callPublicFn(contractName, "pause-contract", [], deployer);
      expect(pause.result).toBeOk(Cl.bool(true));

      const paused = simnet.callReadOnlyFn(contractName, "is-contract-paused", [], deployer);
      expect(paused.result).toBeOk(Cl.bool(true));
    });

    it("should prevent transfers when paused", () => {
      // First pause the contract
      simnet.callPublicFn(contractName, "pause-contract", [], deployer);

      // Try to transfer
      const transfer = simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(100000000), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );
      expect(transfer.result).toBeErr(Cl.uint(105)); // Contract paused error
    });

    it("should prevent minting when paused", () => {
      // First pause the contract
      simnet.callPublicFn(contractName, "pause-contract", [], deployer);

      // Try to mint
      const mint = simnet.callPublicFn(
        contractName,
        "mint",
        [Cl.uint(100000000), Cl.principal(wallet1)],
        deployer
      );
      expect(mint.result).toBeErr(Cl.uint(105)); // Contract paused error
    });

    it("should allow owner to unpause contract", () => {
      // First pause
      simnet.callPublicFn(contractName, "pause-contract", [], deployer);
      
      // Then unpause
      const unpause = simnet.callPublicFn(contractName, "unpause-contract", [], deployer);
      expect(unpause.result).toBeOk(Cl.bool(true));

      const paused = simnet.callReadOnlyFn(contractName, "is-contract-paused", [], deployer);
      expect(paused.result).toBeOk(Cl.bool(false));
    });

    it("should fail pause from non-owner", () => {
      const pause = simnet.callPublicFn(contractName, "pause-contract", [], wallet1);
      expect(pause.result).toBeErr(Cl.uint(100)); // Owner only error
    });
  });

  describe("Contract Approval System", () => {
    it("should allow owner to approve contracts", () => {
      const approve = simnet.callPublicFn(
        contractName,
        "approve-contract",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(approve.result).toBeOk(Cl.bool(true));

      const isApproved = simnet.callReadOnlyFn(
        contractName,
        "is-approved-contract",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(isApproved.result).toBeBool(true);
    });

    it("should allow owner to revoke contract approval", () => {
      // First approve
      simnet.callPublicFn(
        contractName,
        "approve-contract",
        [Cl.principal(wallet1)],
        deployer
      );

      // Then revoke
      const revoke = simnet.callPublicFn(
        contractName,
        "revoke-contract",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(revoke.result).toBeOk(Cl.bool(true));

      const isApproved = simnet.callReadOnlyFn(
        contractName,
        "is-approved-contract",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(isApproved.result).toBeBool(false);
    });
  });

  describe("Utility Functions", () => {
    it("should return comprehensive contract info", () => {
      const info = simnet.callReadOnlyFn(contractName, "get-contract-info", [], deployer);
      expect(info.result).toBeOk(Cl.tuple({
        name: Cl.stringAscii("Oluchicoin"),
        symbol: Cl.stringAscii("OLUC"),
        decimals: Cl.uint(8),
        "total-supply": Cl.uint(1000000000000000),
        "contract-owner": Cl.principal(deployer),
        paused: Cl.bool(false),
        "token-uri": Cl.none()
      }));
    });

    it("should handle token URI setting", () => {
      const uri = "https://api.oluchiverse.com/metadata/oluc";
      
      const setUri = simnet.callPublicFn(
        contractName,
        "set-token-uri",
        [Cl.some(Cl.stringUtf8(uri))],
        deployer
      );
      expect(setUri.result).toBeOk(Cl.bool(true));

      const tokenUri = simnet.callReadOnlyFn(contractName, "get-token-uri", [], deployer);
      expect(tokenUri.result).toBeOk(Cl.some(Cl.stringUtf8(uri)));
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle large transfer amounts correctly", () => {
      const largeAmount = 999999999999999; // Just under total supply

      const transfer = simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(largeAmount), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );
      expect(transfer.result).toBeOk(Cl.bool(true));
    });

    it("should maintain accurate balances across multiple operations", () => {
      const amount1 = 100000000; // 1 OLUC
      const amount2 = 200000000; // 2 OLUC
      const amount3 = 50000000;  // 0.5 OLUC

      // Transfer to wallet1
      simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(amount1), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
        deployer
      );

      // Transfer to wallet2
      simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(amount2), Cl.principal(deployer), Cl.principal(wallet2), Cl.none()],
        deployer
      );

      // Transfer from wallet1 to wallet2
      simnet.callPublicFn(
        contractName,
        "transfer",
        [Cl.uint(amount3), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );

      // Check final balances
      const wallet1Balance = simnet.callReadOnlyFn(
        contractName,
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(wallet1Balance.result).toBeOk(Cl.uint(amount1 - amount3));

      const wallet2Balance = simnet.callReadOnlyFn(
        contractName,
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(wallet2Balance.result).toBeOk(Cl.uint(amount2 + amount3));
    });
  });
});
