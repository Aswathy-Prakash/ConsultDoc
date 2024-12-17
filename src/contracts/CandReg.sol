pragma experimental ABIEncoderV2;
pragma solidity ^0.6.7;
// import "hardhat/console.sol";
contract CandReg {

    string public name;
    string public email;
    address public admin;
    mapping(string => string) private allowedRegNoms;

    constructor() public {
        admin = msg.sender;
        allowedRegNoms["doc1@gmail.com"] = "doc1";
        allowedRegNoms["doc2@gmail.com"] = "doc2";
        allowedRegNoms["doc3@gmail.com"] = "doc3";
    }

    uint256 public userCount = 0;

    struct UserSignup {
        uint256 id;
        string fullname;
        string email;
        bytes32 hashedPassword;
        address payable owner;
        string signature;
    }

    event CreateUser(
        uint256 id,
        string fullname,
        string email,
        string signature,
        address owner
    );

    mapping(string => bool) private emailExists;
    mapping(address => bool) private addressExists;
    mapping(bytes32 => bool) private accountExists;
    mapping(bytes32 => UserSignup) private users;

    function createUser(
        string calldata _fullname,
        string calldata _email,
        bytes32 _hashedPassword,
        string calldata _signature
    ) external {
        // Require a valid name and email
        require(bytes(_fullname).length > 0, "Name is required");
        require(bytes(_email).length > 0, "Email is required");

        // Require that the email does not already exist in the mapping
        require(emailExists[_email] == false, "Email already exists");

        // Require that the address does not already exist in the mapping
        require(addressExists[msg.sender] == false, "Address already exists");

        // Generate unique key based on name, email and address
        bytes32 accountKey = keccak256(abi.encodePacked(msg.sender, _email));
        require(accountExists[accountKey] == false, "Account already exists");

        UserSignup memory newUser = UserSignup({
        id: userCount,
        fullname: _fullname,
        email: _email,
        hashedPassword: _hashedPassword,
        signature: _signature,
        owner: msg.sender
        });

        users[accountKey] = newUser;
        emailExists[_email] = true;
        addressExists[msg.sender] = true;
        accountExists[accountKey] = true;

        emit CreateUser(
            userCount,
            _fullname,
            _email,
            _signature,
            msg.sender
        );

        userCount++;
    }

    function ulogin(
        string calldata _email,
        string calldata _password
    ) external view returns (bool) {
        // Require that the email exists in the mapping
        require(emailExists[_email], "Email does not exist");

        // Get the user data for the given email and address
        bytes32 accountKey = keccak256(abi.encodePacked(msg.sender, _email));
        UserSignup storage user = users[accountKey];

        // Check that the passwords match and that the account is the same
        bytes32 hashedPassword = keccak256(bytes(_password));
        if (user.hashedPassword == hashedPassword && user.owner == msg.sender) {
            // console.log(_email);
            return true;
        } else {
            return false;
        }
    }


    

////////////////////////////////////////////////////////////////////////////////////////////////
    struct DocSignup {
        uint256 id;
        string fullname;
        string email;
        string regnom;
        string specialization;
        bytes32 hashedPassword;
        address payable owner;
        string signature;
    }

    event CreateDoctor(
        uint256 id,
        string fullname,
        string email,
        string signature,
        address owner
    );

    uint256 public docCount = 0;
    mapping(uint256 => DocSignup) public doctors;
    mapping(string => uint256) public emailToDocCount; // Map email to docCount

    function createDoctor(
        string memory _fullname,
        string memory _email,
        string memory _regnom,
        string memory _specialization,
        bytes32 _hashedPassword,
        string memory _signature
    ) public {
        require(bytes(_fullname).length > 0, "Name is required");
        require(bytes(_email).length > 0, "Email is required");
        string memory allowedRegNom = allowedRegNoms[_email];
        require(keccak256(bytes(allowedRegNom)) == keccak256(bytes(_regnom)));
        require(emailToDocCount[_email] == 0, "Email already exists"); // Check email uniqueness
        
        docCount++;
        emailToDocCount[_email] = docCount; // Map email to docCount

        doctors[docCount] = DocSignup(
            docCount,
            _fullname,
            _email,
            _regnom,
            _specialization,
            _hashedPassword,
            msg.sender,
            _signature
        );

        emit CreateDoctor(docCount, _fullname, _email, _signature, msg.sender);
    }

    function dlogin(string calldata _email, string calldata _password) external view returns (bool) {
        uint256 doctorCount = emailToDocCount[_email]; 
        if (doctorCount == 0) {
            return false; // Email not found
        }
        DocSignup storage doctor = doctors[doctorCount];
        bytes32 hashedPassword = keccak256(bytes(_password));
        if (doctor.hashedPassword == hashedPassword && doctor.owner == msg.sender) {
            return true;
        } 
        else {
            return false;
        }
    }

    function getDoctorData() public view returns (DocSignup[] memory) {
        DocSignup[] memory allDoctors = new DocSignup[](docCount);
        for (uint256 i = 1; i <= docCount; i++) {
            allDoctors[i - 1] = doctors[i];
        }
        return allDoctors;
    }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
struct Record {
        string biometric;
        string medicationDetails;
        string symptoms;
        string image;
        address senderAccount;
        string recipientEmail;
        string signature;
    }

    mapping(string => Record[]) public recordsByRecipientEmail;

    event RecordAdded(
        string indexed senderAccount,
        string biometric,
        string medicationDetails,
        string symptoms,
        string image,
        string recipientEmail,
        string signature
    );

    function addRecord(
        string memory senderAccount,
        string memory biometric,
        string memory medicationDetails,
        string memory symptoms,
        string memory image,
        string memory recipientEmail,
        string memory _signature
    ) public {
        require(bytes(senderAccount).length > 0, "Sender's account number is required");
        require(bytes(biometric).length > 0, "Biometric data is required");
        require(bytes(recipientEmail).length > 0, "Recipient's email is required");

        Record memory newRecord = Record({
            biometric: biometric,
            medicationDetails: medicationDetails,
            symptoms: symptoms,
            image: image,
            senderAccount: msg.sender,
            recipientEmail: recipientEmail,
            signature: _signature
        });

        recordsByRecipientEmail[recipientEmail].push(newRecord);

        emit RecordAdded(senderAccount, biometric, medicationDetails, symptoms, image, recipientEmail, _signature);
    }

    function getRecordsByRecipientEmail(string memory recipientEmail) public view returns (Record[] memory) {
        return recordsByRecipientEmail[recipientEmail];
    }
////////////////////////////////////////////////////////////////////////////////////////////////
struct PrescribeRecord {
        address accno;
        address patacc;
        string date;
        string time;
        string prescribe;
        string signature;
    }
    mapping(address => mapping(string => bool)) private isMessagePrescribed;
    mapping(address => PrescribeRecord[]) public recordsByRecipientAddress;

    event PatientRecordAdded(
        address indexed patacc,
        address accno,
        string date,
        string time,
        string prescribe,
        string signature
    );

    function addPatientRecord(
        address patacc,
        address accno,
        string memory date,
        string memory time,
        string memory prescribe,
        string memory _signature
    ) public {
        require(patacc != address(0), "Recipient's account address is required");
        require(accno != address(0), "Recipient's account address is required");
        require(bytes(date).length > 0, "Date is required");
        require(bytes(time).length > 0, "Time is required");
        require(bytes(prescribe).length > 0, "Prescription data is required");
        // require(!isMessagePrescribed[patacc][prescribe], "Prescription message already prescribed for the given patient");

        PrescribeRecord memory newpatRecord = PrescribeRecord({
            patacc: patacc,
            accno: msg.sender,
            date: date,
            time: time, 
            prescribe: prescribe,
            signature: _signature
        });

        recordsByRecipientAddress[patacc].push(newpatRecord);

        emit PatientRecordAdded(patacc, msg.sender, date, time, prescribe, _signature);
    }

    function getRecordsByRecipientAddress(address patacc) public view returns (PrescribeRecord[] memory) {
        return recordsByRecipientAddress[patacc];
    }

}
