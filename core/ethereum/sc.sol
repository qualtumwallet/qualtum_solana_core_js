pragma solidity ^0.8.20;

/**
 * @title PQVault
 */
contract PQVault {
    
    struct Vault {
        bytes32 dilithiumCommitment;
        uint256 balance;
        bool isInitialized;
    }

 
    mapping(address => Vault) public vaults;

    error InvalidDilithiumHash();
    error InsufficientBalance();
    error AlreadyInitialized();
    error NotInitialized();

    event VaultInitialized(address indexed user, bytes32 commitment);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    function initVault(bytes32 commitment) external {
        if (vaults[msg.sender].isInitialized) revert AlreadyInitialized();
        
        vaults[msg.sender] = Vault({
            dilithiumCommitment: commitment,
            balance: 0,
            isInitialized: true
        });

        emit VaultInitialized(msg.sender, commitment);
    }

  
    function deposit() external payable {
        if (!vaults[msg.sender].isInitialized) revert NotInitialized();
        
        vaults[msg.sender].balance += msg.value;
        
        emit Deposited(msg.sender, msg.value);
    }

  
    function withdraw(uint256 amount, bytes32 secretHash) external {
        Vault storage userVault = vaults[msg.sender];

        if (!userVault.isInitialized) revert NotInitialized();
        if (userVault.balance < amount) revert InsufficientBalance();

       
        bytes32 providedCommitment = sha256(abi.encodePacked(secretHash));

        if (userVault.dilithiumCommitment != providedCommitment) {
            revert InvalidDilithiumHash();
        }


        userVault.balance -= amount;

      
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }
}
