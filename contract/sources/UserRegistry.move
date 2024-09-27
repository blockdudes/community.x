module myaddr::NewUserRegistry {
    use std::vector;
    use std::string;
    use std::coin;
    use std::signer;
    use std::debug;
    use aptos_std::account;
    use aptos_std::table::{Table, add, borrow, contains, new};
    use aptos_std::coin::{transfer, Coin, MintCapability, BurnCapability, destroy_mint_cap, destroy_burn_cap, CoinStore};
    use aptos_std::aptos_coin::AptosCoin;

    // Struct to store user details
    struct User has store, drop {
        username: string::String,
        profile_picture: string::String,
        description: string::String,
        user_address: address,
    }

    struct UserRegistry has key, store {
        users: Table<address, User>,
    }

    // Initialize the UserRegistry resource in the central account
    public entry fun initialize(account: &signer)  {
        let central_address = @myaddr;
        assert!(signer::address_of(account) == central_address, E_NOT_AUTHORIZED);

        if (exists<UserRegistry>(central_address)) {
            abort E_ALREADY_INITIALIZED;
        };

        let registry = UserRegistry {
            users: new<address, User>(),
        };
        move_to(account, registry);
    }

    // Register a new user
    public entry fun register_user(account: &signer, username: string::String, profile_picture: string::String, description: string::String) acquires UserRegistry {
        let user_address = signer::address_of(account);
        let central_address = @myaddr;

        let registry = borrow_global_mut<UserRegistry>(central_address);

        if (contains<address, User>(&registry.users, user_address)) {
            abort E_USERNAME_TAKEN;
        };

        let user = User {
            username, 
            profile_picture,
            description,
            user_address
        };
        add<address, User>(&mut registry.users, user_address, user);

        let fee_amount = 1;
        let balance: u64 = coin::balance<AptosCoin>(user_address);
        if (balance < fee_amount) {
            abort E_INSUFFICIENT_BALANCE;
        };

        coin::transfer<AptosCoin>(account, central_address, fee_amount);
    }
    
    // Update user profile
    public entry fun update_profile(account: &signer, new_username: string::String, profile_picture_url: string::String, description: string::String) acquires UserRegistry {
        let user_address = signer::address_of(account);
        let central_address = @myaddr;

        let registry = borrow_global_mut<UserRegistry>(central_address);

        if (!contains<address, User>(&registry.users, user_address)) {
            abort E_USER_NOT_FOUND;
        };

        let user = aptos_std::table::borrow_mut<address, User>(&mut registry.users, user_address);
        user.username = new_username;
        user.profile_picture = profile_picture_url;
        user.description = description;
    }

    // View user profile
    #[view]
    public fun view_profile(user_address: address): User acquires UserRegistry {
        let central_address = @myaddr;
        let registry = borrow_global<UserRegistry>(central_address);

        if (!contains<address, User>(&registry.users, user_address)) {
            abort E_USER_NOT_FOUND;
        };

        let user_ref = borrow<address, User>(&registry.users, user_address);
        User {
            username: user_ref.username,
            profile_picture: user_ref.profile_picture,
            description: user_ref.description,
            user_address: user_ref.user_address,
        }
    }

    // Error codes
    const E_USERNAME_TAKEN: u64 = 1;
    const E_USER_NOT_FOUND: u64 = 2;
    const E_USER_NOT_FOUND_VIEW: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_COIN_STORE_NOT_PUBLISHED: u64 = 6;
    const E_NOT_AUTHORIZED: u64 = 7;
    const E_ALREADY_INITIALIZED: u64 = 8;

    #[test_only]
    fun setup(aptos: &signer, core_resources: &signer) {
        use aptos_framework::coin;
        use aptos_framework::aptos_coin;
        use aptos_framework::aptos_account;
        // init the aptos_coin and give counter_root the mint ability.
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos);
        aptos_account::create_account(signer::address_of(core_resources));
        aptos_account::create_account(@0x43a83959e6fe5a22f2262cfaed75830c34be8c2091be5c01476c89180af7a211);

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

    #[test(aptos_framework = @aptos_framework, arg = @myaddr)]
    public fun test_view_profile(aptos_framework: &signer, arg: &signer) acquires UserRegistry {
        setup(aptos_framework, arg);
        initialize(arg);

        // Register a user
        register_user(arg, string::utf8(b"user1"), string::utf8(b"pic1"), string::utf8(b"desc1"));

        // Check the balance after registration
        let balance = coin::balance<AptosCoin>(signer::address_of(arg));
        debug::print<u64>(&balance);  // This should now show the balance after registration

        // View the user profile
        let user = view_profile(signer::address_of(arg));
        assert!(user.username == string::utf8(b"user1"), 6);
        assert!(user.profile_picture == string::utf8(b"pic1"), 7);
        assert!(user.description == string::utf8(b"desc1"), 8);
        assert!(user.user_address == signer::address_of(arg), 9);  // New check for user_address

        // Ensure the user is consumed
        let _ = user;
    }

    #[test(aptos_framework = @aptos_framework, arg = @myaddr)]
    #[expected_failure(abort_code = 0x1, location = myaddr::NewUserRegistry)]
    public fun test_register_duplicate_username(aptos_framework: &signer, arg: &signer) acquires UserRegistry {
        setup(aptos_framework, arg);
        initialize(arg);

        // Register the first user
        register_user(arg, string::utf8(b"user3"), string::utf8(b"pic3"), string::utf8(b"desc3"));

        // Attempt to register the same username
        register_user(arg, string::utf8(b"user3"), string::utf8(b"pic4"), string::utf8(b"desc4"));
    }

    #[test(aptos_framework = @aptos_framework, arg = @myaddr)]
    #[expected_failure(abort_code = E_USERNAME_TAKEN, location = myaddr::NewUserRegistry)]
    public fun test_update_profile_with_existing_username(aptos_framework: &signer, arg: &signer) acquires UserRegistry {
        setup(aptos_framework, arg);
        initialize(arg);

        // Register two users
        register_user(arg, string::utf8(b"user5"), string::utf8(b"pic5"), string::utf8(b"desc5"));
        register_user(arg, string::utf8(b"user6"), string::utf8(b"pic6"), string::utf8(b"desc6"));

        // Attempt to update user5 to use user6's username, which should fail
        update_profile(arg, string::utf8(b"user6"), string::utf8(b"new_pic5"), string::utf8(b"new_desc5"));
    }

    #[test(aptos_framework = @aptos_framework, arg = @myaddr)]
    public fun test_update_user_profile(aptos_framework: &signer, arg: &signer) acquires UserRegistry {
        setup(aptos_framework, arg);
        initialize(arg);

        // Register the user
        register_user(arg, string::utf8(b"user4"), string::utf8(b"pic4"), string::utf8(b"desc4"));

        // Update the user's profile
        update_profile(arg, string::utf8(b"user4_new"), string::utf8(b"new_pic4"), string::utf8(b"new_desc4"));

        // View the user profile
        let user = view_profile(signer::address_of(arg));
        assert!(user.username == string::utf8(b"user4_new"), 6);
        assert!(user.profile_picture == string::utf8(b"new_pic4"), 7);
        assert!(user.description == string::utf8(b"new_desc4"), 8);
        assert!(user.user_address == signer::address_of(arg), 9);  // New check for user_address

        // Ensure the user is consumed
        let _ = user;
    }
}