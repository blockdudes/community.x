module myaddr::governance {
    use std::signer;
    use std::string::String;
    use std::vector;
    use std::string;
    use std::debug;
    use aptos_framework::aptos_coin::AptosCoin;


    // use aptos_framework::coin;
    // use aptos_framework::aptos_coin::AptosCoin;
    use myaddr::fungible;

    use aptos_framework::timestamp;

    // Error codes
    const E_ONLY_ADMIN: u64 = 11;
    const E_CONTRACT_NOT_INITIALIZED: u64 = 20;
    const E_PROPOSER_MISMATCH: u64 = 1;
    const E_PROPOSAL_NOT_FOUND: u64 = 5;
    const E_NOT_ENOUGH_UPVOTES: u64 = 3;
    const E_INSUFFICIENT_CONTRACT_BALANCE: u64 = 4;


    struct Image  has store, drop, copy {
        url: String,
        alt: String,
    }

    struct Proposal has store, drop, copy {
        proposal_id: String,
        message: String,
        resource: String,
        type: String,
        proposer: address,
        up_votes: u64,
        down_votes: u64,
        created_at: u64,
        executed: bool
    }


     struct ContractStore has key {
        owner: address,
        proposals: vector<Proposal>,
    }

    fun init_module(owner: &signer) {
        let owner_address = signer::address_of(owner);
        if (!exists<ContractStore>(owner_address)) {
            move_to(owner, ContractStore { owner: owner_address, proposals: vector::empty() });
        } else {
            return;
        }
    }

    public entry fun admin_init_module(owner: &signer) {
        init_module(owner);
    }

    public entry fun create_proposal(admin: &signer, proposal_id: String, message: String, resource: String, type: String) acquires ContractStore {
        // Assuming proposals is a vector in ContractStore
        let store = borrow_global_mut<ContractStore>(signer::address_of(admin));
        vector::push_back(&mut store.proposals, Proposal {
            proposal_id,
            message,
            resource,
            type,
            proposer: signer::address_of(admin),
            up_votes: 0,
            down_votes: 0,
            created_at: timestamp::now_microseconds(),
            executed: false,
        });
        debug::print(&store.proposals); // Debug output to verify proposal addition
    }

    public entry fun vote_proposal(account: &signer, proposal_id: String, vote: bool) acquires ContractStore {
        let store = borrow_global_mut<ContractStore>(signer::address_of(account));
        let index = find_proposal(&store.proposals, &proposal_id); // Ensure this function or logic is correct
        if (index == vector::length(&store.proposals)) {
            abort E_PROPOSAL_NOT_FOUND;
        };
        let proposal = vector::borrow_mut(&mut store.proposals, index);
        if (vote) {
            proposal.up_votes = proposal.up_votes + 1;
        } else {
            proposal.down_votes = proposal.down_votes + 1;
        };
    }

    fun find_proposal(proposals: &vector<Proposal>, proposal_id: &String): u64 {
        let len = vector::length(proposals);
        let i = 0;
        while (i < len) {
            if (vector::borrow(proposals, i).proposal_id == *proposal_id) {
                return i
            };
            i = i + 1;
        };
        return i
    }

    #[view]
    public fun get_proposals(owner_address: address): vector<Proposal> acquires ContractStore {
        let store = borrow_global<ContractStore>(owner_address);
        store.proposals // Return the proposals vector
    }

     #[test_only]
    fun setup(aptos: &signer, core_resources: &signer) {
        use aptos_framework::coin;
        use aptos_framework::aptos_coin;
        use aptos_framework::aptos_account;
        // init the aptos_coin and give counter_root the mint ability.
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos);
        
        aptos_account::create_account(signer::address_of(core_resources));
        aptos_account::create_account(@0x123);

        let coins = coin::mint<AptosCoin>(
            18446744073709551615,
            &mint_cap,
        );
        
        coin::deposit<AptosCoin>(signer::address_of(core_resources), coins);

         if (!coin::is_account_registered<AptosCoin>(signer::address_of(core_resources))) {
            coin::register<AptosCoin>(core_resources);
        };

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

   #[test(aptos_framework = @aptos_framework, admin = @myaddr)]
    public fun test_proposal_create_get_vote(aptos_framework: &signer, admin: signer) acquires ContractStore { // Change admin to non-reference
        use aptos_framework::account;
        use aptos_framework::timestamp;  // Add this import

        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Initialize the module
        admin_init_module(&admin); // Pass reference of admin

        // Create a proposal
        let proposal_id = string::utf8(b"test_proposal");
        let message = string::utf8(b"Test proposal message");
        let proposer = signer::address_of(&admin); // Correctly pass reference
        let resource = string::utf8(b"Test resource");
        let type = string::utf8(b"Test type");

        // coin::register<AptosCoin>(aptos_framework);
        // aptos_coin::mint(aptos_framework, proposer, 10000);

        setup(aptos_framework, &admin); // Pass reference of admin

        let voting_user = account::create_signer_for_test(@0x456);

        account::create_account_for_test(signer::address_of(&voting_user));

        create_proposal(&admin, proposal_id, message, resource, type); // Pass admin directly

        // Get proposals and verify
        let proposals = get_proposals(signer::address_of(&admin));
        debug::print(&proposals);
        
        assert!(vector::length(&proposals) == 1, 0);

        let proposal = vector::borrow(&proposals, 0);
        assert!(proposal.proposal_id == proposal_id, 1);
        assert!(proposal.message == message, 2);
        assert!(proposal.proposer == proposer, 3);
        assert!(proposal.up_votes == 0, 6);
        assert!(proposal.down_votes == 0, 7);

        // Create a new signer for voting (in a real scenario, this would be a different user)

        vote_proposal(&voting_user, proposal_id, true);

        // Get proposals again and verify the vote
        let proposals_after_vote = get_proposals(signer::address_of(&admin));
        let voted_proposal = vector::borrow(&proposals_after_vote, 0);
        assert!(voted_proposal.up_votes == 1, 8);
        assert!(voted_proposal.down_votes == 0, 9);

        let proposals = get_proposals(signer::address_of(&admin));
        debug::print(&proposals);

    }
   
}