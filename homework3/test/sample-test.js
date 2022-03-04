const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomiclabs/hardhat-waffle");


describe("Voting", function () {
  let admin, wallet1, wallet2;
  let Voting;
  it("Should deploy contract", async function () {
    const ProposalFactory = await ethers.getContractFactory("Proposal");
    const Proposal = await ProposalFactory.deploy();
    await Proposal.deployed();
    const VotingFactory = await ethers.getContractFactory("Voting");
    Voting = await VotingFactory.deploy(Proposal.address);
    await Voting.deployed();
    [admin, wallet1, wallet2] = await ethers.getSigners();
  });
  it("Should create a proposal", async function () {
    tx = await Voting.createProposal("First proposal");
    await tx.wait();
    //expect(Id1).to.equal(0);
  });
  it("Should vote", async function () {
    tx = await Voting.vote(0, true);
    await tx.wait();
    expect(Voting.vote(0, true)).to.be.reverted;
    tx = await Voting.connect(wallet1).vote(0, true);
    await tx.wait();
    expect(Voting.connect(wallet1).vote(0, true)).to.be.reverted;
  });
  it("Should close proposal", async function () {
    expect(Voting.connect(wallet1).closeProposal(0)).to.be.reverted;
    tx = await Voting.closeProposal(0);
    await tx.wait();
    expect(Voting.closeProposal(0)).to.be.reverted;
  });
});
