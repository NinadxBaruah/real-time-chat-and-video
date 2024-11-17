

const friendsRoom = new Map();

function setFriendsRoom(id, client) {
    const stringId = id.toString();
    friendsRoom.set(stringId, client);
    return friendsRoom.get(stringId); 
}

function getFriendsRoom(id) {
    const stringId = id.toString();
    const client = friendsRoom.get(stringId);
    return client;
}



module.exports = { setFriendsRoom, getFriendsRoom , friendsRoom};