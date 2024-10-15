module myaddr::fungible {
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::option;

    /// Only fungible asset metadata owner can make changes.
    const ENOT_OWNER: u64 = 1;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Hold refs to control the minting, transfer, and burning of fungible assets.
    struct ManagedFungibleAsset has key {
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef
    }


    /// Public function to create a new token with dynamic parameters.
    public entry fun create_token(
        admin: &signer,
        name: vector<u8>,  // Token name
        symbol: vector<u8>,  // Token symbol
        decimals: u8,  // Number of decimals
        icon: vector<u8>,  // URL for the token's icon
        project_url: vector<u8>  // URL for the token's project or documentation
    ) {

        let constructor_ref = &object::create_named_object(admin, symbol);
        
        // Convert vector<u8> to std::string::String
        let name_str = string::utf8(name);
        let symbol_str = string::utf8(symbol);
        let icon_str = string::utf8(icon);
        let project_url_str = string::utf8(project_url);

        // Create the fungible asset dynamically based on input parameters
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            name_str,        /* Token name provided by the user */
            symbol_str,      /* Token symbol provided by the user */
            decimals,        /* Number of decimals provided by the user */
            icon_str,        /* Token icon URL */
            project_url_str  /* Project URL */
        );
        

        // Create mint/burn/transfer refs to allow the creator to manage the fungible asset.
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);
        let metadata_object_signer = object::generate_signer(constructor_ref);

        // Move the ManagedFungibleAsset to admin's account
        move_to(
            &metadata_object_signer,
            ManagedFungibleAsset { mint_ref, transfer_ref, burn_ref }
        );
    }

    #[view]
    public fun get_metadata(issuer: address, symbol: vector<u8>): Object<Metadata> {
        let asset_address = object::create_object_address(&issuer, symbol);
        object::address_to_object<Metadata>(asset_address)
    }

    #[view]
    public fun balance(owner: address, issuer: address, symbol: vector<u8>): u64 {
        let asset = get_metadata(issuer, symbol);
        fungible_asset::balance(primary_fungible_store::primary_store(owner, asset))
    }


    public entry fun mint_p(user: &signer, admin: &signer, symbol: vector<u8>, amount: u64) acquires ManagedFungibleAsset {
        mint(admin, signer::address_of(user), symbol, amount);
    }

    /// Mint as the owner of the metadata object.
    public entry fun mint(admin: &signer, to: address, symbol: vector<u8>, amount: u64) acquires ManagedFungibleAsset {
        let asset = get_metadata(signer::address_of(admin), symbol);
        let managed_fungible_asset = authorized_borrow_refs(admin, asset);
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, amount);
        fungible_asset::deposit_with_ref(
            &managed_fungible_asset.transfer_ref, to_wallet, fa
        );
    }

    public entry fun transfer(
        from: &signer,
        admin_address: address,
        symbol: vector<u8>,
        to: address,
        amount: u64
    ) {
        let asset = get_metadata(admin_address, symbol);
        let from_address = signer::address_of(from);
        let from_wallet = primary_fungible_store::primary_store(from_address, asset);
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        fungible_asset::transfer(from, from_wallet, to_wallet, amount);
    }

    /// Borrow the immutable reference of the refs of `metadata`.
    /// This validates that the signer is the metadata object's owner.
    inline fun authorized_borrow_refs(
        owner: &signer, asset: Object<Metadata>
    ): &ManagedFungibleAsset acquires ManagedFungibleAsset {
        assert!(
            object::is_owner(asset, signer::address_of(owner)),
            error::permission_denied(ENOT_OWNER)
        );
        borrow_global<ManagedFungibleAsset>(object::object_address(&asset))
    }

    #[test_only]
    public fun initialize_for_test(admin: &signer) {
        // Use byte literals directly for 'vector<u8>' parameters
        let name = b"Test Token";  // vector<u8>
        let symbol = b"TTK";       // vector<u8>
        let decimals = 6;
        let icon = b"http://example.com/favicon.ico";  // vector<u8>
        let project_url = b"http://example.com";       // vector<u8>

        // Call 'create_token' with vector<u8> parameters
        create_token(admin, name, symbol, decimals, icon, project_url);
    }


}
