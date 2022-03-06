const { expect } = require("chai");

describe("Token contract", function () {
  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatToken = await Token.deploy();

    await hardhatToken.deployed();
  });

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should add the owner to holders array and mapping", async function () {
      const holder0 = await hardhatToken.holders(0);
      expect(holder0).to.equal(owner.address);
      const holder0idx = await hardhatToken.holdersToIndices(owner.address)
      expect(holder0idx).to.equal(0)
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts and update holders array", async function () {
      await hardhatToken.transfer(addr1.address, 50);
      const addr1Balance = await hardhatToken.balanceOf(
        addr1.address
      );
      expect(addr1Balance).to.equal(50);

      const holder1 = await hardhatToken.holders(1);
      expect(holder1).to.equal(addr1.address);
      const holder1idx = await hardhatToken.holdersToIndices(addr1.address)
      expect(holder1idx).to.equal(1)

      await hardhatToken.connect(addr1).transfer(addr2.address, 40);
      const addr2Balance = await hardhatToken.balanceOf(
        addr2.address
      );
      expect(addr2Balance).to.equal(40);

      const holder2 = await hardhatToken.holders(2);
      expect(holder2).to.equal(addr2.address);
      const holder2idx = await hardhatToken.holdersToIndices(addr2.address)
      expect(holder2idx).to.equal(2)
    });

    it("Should remove holder from holders array if they run out of tokens", async function () {
      await hardhatToken.transfer(addr1.address, 50);
      await hardhatToken.transfer(addr2.address, 50);

      // transfer all tokens from addr 1 back to owner
      await hardhatToken.connect(addr1).transfer(owner.address, 50);

      // check if addr 1 has been removed
      const addr1Balance = await hardhatToken.balanceOf(
        addr1.address
      );
      expect(addr1Balance).to.equal(0);

      expect(await hardhatToken.holdersLength()).to.equal(2)

      const holder1 = await hardhatToken.holders(1);
      expect(holder1).to.equal(addr2.address);
      const holder1idx = await hardhatToken.holdersToIndices(addr2.address)
      expect(holder1idx).to.equal(1)

      const holder0 = await hardhatToken.holders(0);
      expect(holder0).to.equal(owner.address);
      const holder0idx = await hardhatToken.holdersToIndices(owner.address)
      expect(holder0idx).to.equal(0)

    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(
        owner.address
      );

      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted

      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(
        owner.address
      );

      await hardhatToken.transfer(addr1.address, 100);

      await hardhatToken.transfer(addr2.address, 50);

      const finalOwnerBalance = await hardhatToken.balanceOf(
        owner.address
      );
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(ethers.BigNumber.from(150)));

      const addr1Balance = await hardhatToken.balanceOf(
        addr1.address
      );
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await hardhatToken.balanceOf(
        addr2.address
      );
      expect(addr2Balance).to.equal(50);
    });
  });
});
