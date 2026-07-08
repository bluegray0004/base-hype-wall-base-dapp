// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseHypeWall {
    uint256 public constant MAX_MESSAGE_LENGTH = 64;
    uint256 public nextShoutId = 1;

    struct Shout {
        address author;
        string topic;
        string message;
        uint256 createdAt;
    }

    mapping(uint256 => Shout) private shouts;

    event ShoutPosted(
        uint256 indexed shoutId,
        address indexed author,
        string topic,
        string message
    );

    function postShout(
        string calldata topic,
        string calldata message
    ) external returns (uint256 shoutId) {
        require(bytes(topic).length > 0 && bytes(topic).length <= 40, "Invalid topic");
        require(bytes(message).length > 0 && bytes(message).length <= MAX_MESSAGE_LENGTH, "Invalid message");

        shoutId = nextShoutId++;
        shouts[shoutId] = Shout({
            author: msg.sender,
            topic: topic,
            message: message,
            createdAt: block.timestamp
        });

        emit ShoutPosted(shoutId, msg.sender, topic, message);
    }

    function getShout(
        uint256 shoutId
    )
        external
        view
        returns (
            address author,
            string memory topic,
            string memory message,
            uint256 createdAt
        )
    {
        Shout storage shout = shouts[shoutId];
        return (shout.author, shout.topic, shout.message, shout.createdAt);
    }
}
