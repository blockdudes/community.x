aptos move run --function-id 0x4bd606f80f5a812abfd7d8311098c435ff2a1d7de8531f8abb8240856e2f74a2::governance::create_proposal \
    --args string:"proposal123" string:"Fund project X" address:0x4bd606f80f5a812abfd7d8311098c435ff2a1d7de8531f8abb8240856e2f74a2 address:0x4bd606f80f5a812abfd7d8311098c435ff2a1d7de8531f8abb8240856e2f74a2 u64:1000 \
    --private-key $${PRIVATE_KEY_1} \
    --url https://fullnode.devnet.aptoslabs.com


 aptos move run --function-id 0x4bd606f80f5a812abfd7d8311098c435ff2a1d7de8531f8abb8240856e2f74a2::governance::admin_init_module \
    --private-key $${PRIVATE_KEY_1} \   
    --url https://fullnode.devnet.aptoslabs.com 


aptos move publish --named-addresses myaddr=0xf48d8678793b2345c000abe9bbb8e57c32e84ce3b20de165475e3de572b3db7e  --profile latest

 aptos move run --function-id 0xf48d8678793b2345c000abe9bbb8e57c32e84ce3b20de165475e3de572b3db7e::governance::vote_proposal \
    --args string:proposal123 bool:true \
    --private-key $${PRIVATE_KEY_1} \
    --url https://fullnode.devnet.aptoslabs.com

aptos move run --function-id 0xf48d8678793b2345c000abe9bbb8e57c32e84ce3b20de165475e3de572b3db7e::governance::create_proposal \
    --args string:proposal123 string:"Fund project X" address:0x4bd606f80f5a812abfd7d8311098c435ff2a1d7de8531f8abb8240856e2f74a2 address:0x4bd606f80f5a812abfd7d8311098c435ff2a1d7de8531f8abb8240856e2f74a2 u64:1000 \
    --private-key $${PRIVATE_KEY_1} \
    --url https://fullnode.devnet.aptoslabs.com

aptos move run --function-id 0xf48d8678793b2345c000abe9bbb8e57c32e84ce3b20de165475e3de572b3db7e::governance::admin_init_module \
    --private-key $${PRIVATE_KEY_1} \
    --url https://fullnode.testnet.aptoslabs.com

aptos move run --function-id 0x66882b8bf7f4c93a76120f77438b16cba049fe8b2e9946ca50821d70a6ee1453::NewUserRegistry::initialize \
    --private-key $${PRIVATE_KEY_1} \
    --url https://fullnode.testnet.aptoslabs.com

aptos move run --function-id 0x66882b8bf7f4c93a76120f77438b16cba049fe8b2e9946ca50821d70a6ee1453::fungible::create_token \
    --args string:"USDC" string:"USDC" u8:6 string:"https://cryptologos.cc/logos/usd-coin-usdc-logo.png" string:"https://cryptologos.cc/logos/usd-coin-usdc-logo.png" \
    --private-key $${PRIVATE_KEY_1} \
    --url https://fullnode.testnet.aptoslabs.com

aptos move run --function-id 0x66882b8bf7f4c93a76120f77438b16cba049fe8b2e9946ca50821d70a6ee1453::fungible::mint \
    --args address:0xa69f3f7902a8d33daafb6a77dac287073f9ee4ae11cc79b14fe30c5eabe9a3ae string:"USDC" u64:1000 \
    --private-key $${PRIVATE_KEY_1} \
    --url https://fullnode.testnet.aptoslabs.com


