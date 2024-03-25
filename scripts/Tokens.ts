import { viem } from "hardhat";
import { parseEther } from "viem";
import { formatEther } from "viem";

async function main() {
    const publicClient = await viem.getPublicClient();
    const [deployer, account1, account2] = await viem.getWalletClients();
    

    //Deploying with hardhat helper functions
    const tokenContract = await viem.deployContract("MyToken");
    console.log(`Contract deployed at ${tokenContract.address}`);

    //Fetching total supply
    const totalSupply = await tokenContract.read.totalSupply();
    console.log({ totalSupply });

    // Fetching the role code
    const code = await tokenContract.read.MINTER_ROLE();

    // Giving role
    const roleTx = await tokenContract.write.grantRole([
        code,
        account2.account.address,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: roleTx });

    //Minting tokens without role fails
    const mintTx = await tokenContract.write.mint(
        [deployer.account.address, parseEther("10")],
        { account: account2.account }
    );
    await publicClient.waitForTransactionReceipt({ hash: mintTx });

    //Fetching token data with Promise.all()
    const [name, symbol, decimals, totalSupplyAfter] = await Promise.all([
        tokenContract.read.name(),
        tokenContract.read.symbol(),
        tokenContract.read.decimals(),
        tokenContract.read.totalSupply(),
    ]);
    console.log({ name, symbol, decimals, totalSupplyAfter });

    // Sending a transaction
    const tx = await tokenContract.write.transfer([
        account1.account.address,
        parseEther("2"),
    ]);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    //Viewing balances converted using 'formatEther'
    const myBalance = await tokenContract.read.balanceOf([deployer.account.address]);
    console.log(`My Balance is ${formatEther(myBalance)} ${symbol}`);
    const otherBalance = await tokenContract.read.balanceOf([account1.account.address]);
    console.log(
      `The Balance of Acc1 is ${formatEther(otherBalance)} ${symbol}`
    );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});