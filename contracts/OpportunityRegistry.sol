// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/// @title OpportunityRegistry
/// @notice Append-only evidence registry for decisions made by BountyProof Agent.
contract OpportunityRegistry {
    struct Proof {
        bytes32 opportunityKey;
        bytes32 sourceHash;
        bytes32 previousProofId;
        address recorder;
        uint64 recordedAt;
        uint8 score;
    }

    address public immutable owner;
    mapping(address executor => bool allowed) public executors;
    mapping(bytes32 opportunityKey => bytes32 proofId) public latestProofId;
    mapping(bytes32 proofId => Proof proof) private proofs;

    error EmptyValue();
    error InvalidScore(uint8 score);
    error NotExecutor(address caller);
    error NotOwner(address caller);
    error DuplicateProof(bytes32 proofId);

    event ExecutorUpdated(address indexed executor, bool allowed);
    event OpportunityRecorded(
        bytes32 indexed opportunityKey,
        bytes32 indexed proofId,
        bytes32 indexed sourceHash,
        bytes32 previousProofId,
        uint8 score,
        address recorder
    );

    constructor(address initialExecutor) {
        if (initialExecutor == address(0)) revert EmptyValue();
        owner = msg.sender;
        executors[initialExecutor] = true;
        emit ExecutorUpdated(initialExecutor, true);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    modifier onlyExecutor() {
        if (!executors[msg.sender]) revert NotExecutor(msg.sender);
        _;
    }

    function setExecutor(address executor, bool allowed) external onlyOwner {
        if (executor == address(0)) revert EmptyValue();
        executors[executor] = allowed;
        emit ExecutorUpdated(executor, allowed);
    }

    function record(bytes32 opportunityKey, bytes32 sourceHash, uint8 score)
        external
        onlyExecutor
        returns (bytes32 proofId)
    {
        if (opportunityKey == bytes32(0) || sourceHash == bytes32(0)) revert EmptyValue();
        if (score > 100) revert InvalidScore(score);

        bytes32 previousProofId = latestProofId[opportunityKey];
        proofId = keccak256(abi.encode(opportunityKey, sourceHash, score, previousProofId));
        if (proofs[proofId].recordedAt != 0) revert DuplicateProof(proofId);

        proofs[proofId] = Proof({
            opportunityKey: opportunityKey,
            sourceHash: sourceHash,
            previousProofId: previousProofId,
            recorder: msg.sender,
            recordedAt: uint64(block.timestamp),
            score: score
        });
        latestProofId[opportunityKey] = proofId;

        emit OpportunityRecorded(opportunityKey, proofId, sourceHash, previousProofId, score, msg.sender);
    }

    function getProof(bytes32 proofId) external view returns (Proof memory) {
        return proofs[proofId];
    }

    function getLatestProof(bytes32 opportunityKey) external view returns (Proof memory) {
        return proofs[latestProofId[opportunityKey]];
    }
}
