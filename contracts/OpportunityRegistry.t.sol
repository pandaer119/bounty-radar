// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {OpportunityRegistry} from "./OpportunityRegistry.sol";

contract RegistryCaller {
    function record(
        OpportunityRegistry registry,
        bytes32 opportunityKey,
        bytes32 sourceHash,
        uint8 score
    ) external returns (bytes32) {
        return registry.record(opportunityKey, sourceHash, score);
    }
}

contract OpportunityRegistryTest {
    OpportunityRegistry private registry;

    bytes32 private constant OPPORTUNITY_KEY = keccak256("keeperhub-agents-onchain-2026");
    bytes32 private constant SOURCE_HASH_V1 = keccak256("official-source-v1");
    bytes32 private constant SOURCE_HASH_V2 = keccak256("official-source-v2");

    function setUp() public {
        registry = new OpportunityRegistry(address(this));
    }

    function testRecordAndReadProof() public {
        bytes32 proofId = registry.record(OPPORTUNITY_KEY, SOURCE_HASH_V1, 94);
        OpportunityRegistry.Proof memory proof = registry.getProof(proofId);

        require(proof.opportunityKey == OPPORTUNITY_KEY, "opportunity key mismatch");
        require(proof.sourceHash == SOURCE_HASH_V1, "source hash mismatch");
        require(proof.score == 94, "score mismatch");
        require(proof.recorder == address(this), "recorder mismatch");
        require(proof.previousProofId == bytes32(0), "first proof must not have parent");
        require(registry.latestProofId(OPPORTUNITY_KEY) == proofId, "latest proof mismatch");
    }

    function testCreatesRevisionChain() public {
        bytes32 firstProofId = registry.record(OPPORTUNITY_KEY, SOURCE_HASH_V1, 92);
        bytes32 secondProofId = registry.record(OPPORTUNITY_KEY, SOURCE_HASH_V2, 94);
        OpportunityRegistry.Proof memory latest = registry.getLatestProof(OPPORTUNITY_KEY);

        require(secondProofId != firstProofId, "revision must create a new proof");
        require(latest.previousProofId == firstProofId, "revision must reference previous proof");
        require(latest.sourceHash == SOURCE_HASH_V2, "latest source mismatch");
    }

    function testRejectsInvalidScore() public {
        (bool success,) = address(registry).call(
            abi.encodeCall(registry.record, (OPPORTUNITY_KEY, SOURCE_HASH_V1, 101))
        );
        require(!success, "score above 100 must revert");
    }

    function testRejectsUnauthorizedRecorder() public {
        RegistryCaller caller = new RegistryCaller();
        (bool success,) = address(caller).call(
            abi.encodeCall(caller.record, (registry, OPPORTUNITY_KEY, SOURCE_HASH_V1, 90))
        );
        require(!success, "unauthorized recorder must revert");
    }

    function testOwnerCanAuthorizeKeeperExecutor() public {
        RegistryCaller keeperExecutor = new RegistryCaller();
        registry.setExecutor(address(keeperExecutor), true);

        bytes32 proofId = keeperExecutor.record(registry, OPPORTUNITY_KEY, SOURCE_HASH_V1, 93);
        OpportunityRegistry.Proof memory proof = registry.getProof(proofId);
        require(proof.recorder == address(keeperExecutor), "authorized executor mismatch");
    }
}
