module owner_addr::governance {
    use std::signer;
    use std::string::String;
    use std::vector;
    use std::string;
    use std::debug;

    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use owner_addr::fungible;

    use aptos_framework::timestamp; 
    
    struct Proposal has store, drop, copy {
        proposal_id: String,
        message: String,
        proposer: address,
        receipient: address,
        amount: u64,
        up_votes: u64,
        down_votes: u64,
        created_at: u64,
        executed: bool
    }

    struct ContractStore has key {
        proposals: vector<Proposal>,
    }

    fun init_module(account: &signer) {
        move_to(account, ContractStore { proposals: vector::empty() });
    }

    public entry fun create_proposal(account: signer, proposal_id: String, message: String, proposer: address, receipient: address, amount: u64) acquires ContractStore {
        assert!(proposer == signer::address_of(&account), 1);
        let proposer_balance = fungible::balance(proposer);
        assert!(proposer_balance >= 10, 2);
        let proposal = Proposal {
            proposal_id: proposal_id,
            message: message,
            proposer: proposer,
            receipient: receipient,
            amount: amount,
            up_votes: 0,
            down_votes: 0,
            created_at: timestamp::now_microseconds(),
            executed: false
        };
        let store = borrow_global_mut<ContractStore>(@owner_addr);
        vector::push_back(&mut store.proposals, proposal);
    }

    public entry fun vote_proposal(account: signer, proposal_id: String, vote: bool) acquires ContractStore {
        let voter_balance = fungible::balance(signer::address_of(&account));
        assert!(voter_balance >= 10, 2);

        debug::print(&voter_balance);
        let store = borrow_global_mut<ContractStore>(@owner_addr);
        let proposals = &mut store.proposals;
        let len = vector::length(proposals);

        for (i in 0..len) {
            let proposal = vector::borrow_mut(proposals, i);
            if (proposal.proposal_id == proposal_id) {
                if (vote) {
                    proposal.up_votes = proposal.up_votes + 1;
                } else {
                    proposal.down_votes = proposal.down_votes + 1;
                };
                return
            };
        };

        abort 1
    }

    public entry fun execute_proposal(account: signer, proposal_id: String) acquires ContractStore {
        let store = borrow_global_mut<ContractStore>(@owner_addr);
        let proposals = &mut store.proposals;
        let len = vector::length(proposals);

        for (i in 0..len) {
            let proposal = vector::borrow_mut(proposals, i);
            if (proposal.proposal_id == proposal_id) {
                // Check if upvotes are greater than 1
                assert!(proposal.up_votes >= 1, 3); // Error code 3: Not enough upvotes

                // Transfer the proposed amount to the recipient
                let amount = proposal.amount;
                let recipient = proposal.receipient;
                
                // Ensure the contract has enough balance
                assert!(coin::balance<AptosCoin>(@owner_addr) >= amount, 4); // Error code 4: Insufficient contract balance

                // Transfer the coins
                coin::transfer<AptosCoin>(&account, recipient, amount);

                proposal.executed = true;

                return
            };
        };

        // If we've reached here, the proposal wasn't found
        abort 5 // Error code 5: Proposal not found
    }


    #[view]
    public fun get_proposals(): vector<Proposal> acquires ContractStore {
        let store = borrow_global<ContractStore>(@owner_addr);
        store.proposals
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

        // let i = 0;
        // while (i < vector::length(&addresses)) {
        //     aptos_account::transfer(core_resources, *vector::borrow(&addresses, i), 100000000000);
        //     i = i + 1;
        // };

        // gracefully shutdown
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @aptos_framework, admin = @owner_addr)]
    public fun test_proposal_create_get_vote(aptos_framework: &signer, admin: signer) acquires ContractStore {
        use aptos_framework::account;
        use aptos_framework::aptos_coin;
        use aptos_framework::coin;
        use aptos_framework::timestamp;  // Add this import

    // Initialize timestamp for testing
    timestamp::set_time_has_started_for_testing(aptos_framework);

        // Initialize the module
        init_module(&admin);

        // let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        // debug::print(signer::address_of(admin));
        // debug::print(signer::address_of(aptos_framework));

        // Create a proposal
        let proposal_id = string::utf8(b"test_proposal");
        let message = string::utf8(b"Test proposal message");
        let proposer = signer::address_of(&admin);
        let recipient = @0x123;
        let amount = 1000;

        // coin::register<AptosCoin>(aptos_framework);
        // aptos_coin::mint(aptos_framework, proposer, 10000);

        setup(aptos_framework, &admin);

        //
        fungible::initialize_for_test(&admin);
        account::create_account_for_test(@owner_addr);
        let metadata = fungible::get_metadata(@owner_addr);
        fungible::mint(&admin, signer::address_of(&admin), 1000000);

        let voting_user = account::create_signer_for_test(@0x456);

        account::create_account_for_test(signer::address_of(&voting_user));
        let metadata = fungible::get_metadata(@owner_addr);
        fungible::mint(&admin, signer::address_of(&voting_user), 1000000);
        //

        create_proposal(admin, proposal_id, message, proposer, recipient, amount);

        // Get proposals and verify
        let proposals = get_proposals();
        debug::print(&proposals);
        
        assert!(vector::length(&proposals) == 1, 0);

        let proposal = vector::borrow(&proposals, 0);
        assert!(proposal.proposal_id == proposal_id, 1);
        assert!(proposal.message == message, 2);
        assert!(proposal.proposer == proposer, 3);
        assert!(proposal.receipient == recipient, 4);
        assert!(proposal.amount == amount, 5);
        assert!(proposal.up_votes == 0, 6);
        assert!(proposal.down_votes == 0, 7);

        // Create a new signer for voting (in a real scenario, this would be a different user)

        

        vote_proposal(voting_user, proposal_id, true);

        // Get proposals again and verify the vote
        let proposals_after_vote = get_proposals();
        let voted_proposal = vector::borrow(&proposals_after_vote, 0);
        assert!(voted_proposal.up_votes == 1, 8);
        assert!(voted_proposal.down_votes == 0, 9);

        let proposals = get_proposals();
        debug::print(&proposals);

        let exe_user = account::create_signer_for_test(@owner_addr);
        execute_proposal(exe_user, proposal_id);

        let proposals = get_proposals();
        debug::print(&proposals);

        // // Verify recipient balance
        let recipient_balance = coin::balance<AptosCoin>(recipient);
        assert!(recipient_balance == amount, 10);
    }
}