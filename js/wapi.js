if (!window.Store) {
    (function () {
        function getStore(modules) {
        let foundCount = 0;
		let neededObjects = [
                { id: "Store", conditions: (module) => (module.default && module.default.Chat && module.default.Msg) ? module.default : null },
                { id: "MediaCollection", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.processAttachments) ? module.default : null },
                { id: "MediaProcess", conditions: (module) => (module.BLOB) ? module : null },
                { id: "Wap", conditions: (module) => (module.createGroup) ? module : null },
                { id: "ServiceWorker", conditions: (module) => (module.default && module.default.killServiceWorker) ? module : null },
                { id: "State", conditions: (module) => (module.STATE && module.STREAM) ? module : null },
                { id: "WapDelete", conditions: (module) => (module.sendConversationDelete && module.sendConversationDelete.length == 2) ? module : null },
                { id: "Conn", conditions: (module) => (module.default && module.default.ref && module.default.refTTL) ? module.default : null },
                // { id: "WapQuery", conditions: (module) => (module.queryExist) ? module : ((module.default && module.default.queryExist) ? module.default : null) },
                // { id: "WapQuery", conditions: (module) => (module.default && module.default.queryExist) ? module.default : null },
                {
                    id: "WapQuery",
                    conditions: (module) => (module.default && module.default.queryExist) ? module.default : null
                    },
                { id: "CryptoLib", conditions: (module) => (module.decryptE2EMedia) ? module : null },
                { id: "OpenChat", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.openChat) ? module.default : null },
                { id: "UserConstructor", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null },
                { id: "SendTextMsgToChat", conditions: (module) => (module.sendTextMsgToChat) ? module.sendTextMsgToChat : null },
                { id: "SendSeen", conditions: (module) => (module.sendSeen) ? module.sendSeen : null },
                { id: "sendDelete", conditions: (module) => (module.sendDelete) ? module.sendDelete : null }
            ];
        for (let idx in modules) {
            if ((typeof modules[idx] === "object") && (modules[idx] !== null)) {
                neededObjects.forEach((needObj) => {
                    if (!needObj.conditions || needObj.foundedModule)
                        return;
                    let neededModule = needObj.conditions(modules[idx]);
                    if (neededModule !== null) {
                        foundCount++;
                        needObj.foundedModule = neededModule;
                    }
                });

                if (foundCount == neededObjects.length) {
                    break;
                }
            }
        }

        let neededStore = neededObjects.find((needObj) => needObj.id === "Store");
        window.Store = neededStore.foundedModule ? neededStore.foundedModule : {};
        neededObjects.splice(neededObjects.indexOf(neededStore), 1);
        neededObjects.forEach((needObj) => {
            if (needObj.foundedModule) {
                window.Store[needObj.id] = needObj.foundedModule;
            }
        });
		
		window.Store.Chat.modelClass.prototype.sendMessage = function (e) {
			window.Store.SendTextMsgToChat(this, ...arguments);
		}		
		
        return window.Store;
    }

    const parasite = `parasite${Date.now()}`
    if (typeof webpackJsonp === 'function') webpackJsonp([], {[parasite]: (x, y, z) => getStore(z)}, [parasite]);
    else webpackChunkwhatsapp_web_client.push([[parasite], {}, function (o, e, t) {let modules = []; for (let idx in o.m) {modules.push(o(idx));} getStore(modules);}]);

        // if (typeof webpackJsonp === 'function') {
        //     webpackJsonp([], {'parasite': (x, y, z) => getStore(z)}, ['parasite']);
        // } else {
        //     let tag = new Date().getTime();
		// 	webpackChunkbuild.push([
		// 		["parasite" + tag],
		// 		{

		// 		},
		// 		function (o, e, t) {
		// 			let modules = [];
		// 			for (let idx in o.m) {
		// 				let module = o(idx);
		// 				modules.push(module);
		// 			}
		// 			getStore(modules);
		// 		}
		// 	]);
        // }

    })();
}

window.WAPI = {
    lastRead: {}
};

window.WAPI._serializeRawObj = (obj) => {
    if (obj) {
        return obj.toJSON();
    }
    return {}
};

/**
 * Serializes a chat object
 *
 * @param rawChat Chat object
 * @returns {{}}
 */

window.WAPI._serializeChatObj = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign(window.WAPI._serializeRawObj(obj), {
        kind         : obj.kind,
        isGroup      : obj.isGroup,
        contact      : obj['contact'] ? window.WAPI._serializeContactObj(obj['contact'])        : null,
        groupMetadata: obj["groupMetadata"] ? window.WAPI._serializeRawObj(obj["groupMetadata"]): null,
        presence     : obj["presence"] ? window.WAPI._serializeRawObj(obj["presence"])          : null,
        msgs         : null
    });
};

window.WAPI._serializeContactObj = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign(window.WAPI._serializeRawObj(obj), {
        formattedName      : obj.formattedName,
        isHighLevelVerified: obj.isHighLevelVerified,
        isMe               : obj.isMe,
        isMyContact        : obj.isMyContact,
        isPSA              : obj.isPSA,
        isUser             : obj.isUser,
        isVerified         : obj.isVerified,
        isWAContact        : obj.isWAContact,
        profilePicThumbObj : obj.profilePicThumb ? WAPI._serializeProfilePicThumb(obj.profilePicThumb): {},
        statusMute         : obj.statusMute,
        msgs               : null
    });
};

window.WAPI._serializeMessageObj = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign(window.WAPI._serializeRawObj(obj), {
        id            : obj.id._serialized,
        sender        : obj["senderObj"] ? WAPI._serializeContactObj(obj["senderObj"]): null,
        timestamp     : obj["t"],
        content       : obj["body"],
        isGroupMsg    : obj.isGroupMsg,
        isLink        : obj.isLink,
        isMMS         : obj.isMMS,
        isMedia       : obj.isMedia,
        isNotification: obj.isNotification,
        isPSA         : obj.isPSA,
        type          : obj.type,
        chat          : WAPI._serializeChatObj(obj['chat']),
        chatId        : obj.id.remote,
        quotedMsgObj  : WAPI._serializeMessageObj(obj['_quotedMsgObj']),
        mediaData     : window.WAPI._serializeRawObj(obj['mediaData'])
    });
};

window.WAPI._serializeNumberStatusObj = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign({}, {
        id               : obj.jid,
        status           : obj.status,
        isBusiness       : (obj.biz === true),
        canReceiveMessage: (obj.status === 200)
    });
};

window.WAPI._serializeProfilePicThumb = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign({}, {
        eurl   : obj.eurl,
        id     : obj.id,
        img    : obj.img,
        imgFull: obj.imgFull,
        raw    : obj.raw,
        tag    : obj.tag
    });
}

window.WAPI.createGroup = function (name, contactsId) {
    if (!Array.isArray(contactsId)) {
        contactsId = [contactsId];
    }

    return window.Store.Wap.createGroup(name, contactsId);
};

window.WAPI.leaveGroup = function (groupId) {
    groupId = typeof groupId == "string" ? groupId : groupId._serialized;
    var group = WAPI.getChat(groupId);
    return group.sendExit()
};


window.WAPI.getAllContacts = function (done) {
    const contacts = window.Store.Contact.map((contact) => WAPI._serializeContactObj(contact));

    if (done !== undefined) done(contacts);
    return contacts;
};

/**
 * Fetches all contact objects from store, filters them
 *
 * @param done Optional callback function for async execution
 * @returns {Array|*} List of contacts
 */
window.WAPI.getMyContacts = function (done) {
    const contacts = window.Store.Contact.filter((contact) => contact.isMyContact === true).map((contact) => WAPI._serializeContactObj(contact));
    if (done !== undefined) done(contacts);
    return contacts;
};

/**
 * Fetches contact object from store by ID
 *
 * @param id ID of contact
 * @param done Optional callback function for async execution
 * @returns {T|*} Contact object
 */
window.WAPI.getContact = function (id, done) {
    const found = window.Store.Contact.get(id);

    if (done !== undefined) done(window.WAPI._serializeContactObj(found))
    return window.WAPI._serializeContactObj(found);
};

/**
 * Fetches all chat objects from store
 *
 * @param done Optional callback function for async execution
 * @returns {Array|*} List of chats
 */
window.WAPI.getAllChats = function (done) {
    const chats = window.Store.Chat.map((chat) => WAPI._serializeChatObj(chat));

    if (done !== undefined) done(chats);
    return chats;
};

window.WAPI.haveNewMsg = function (chat) {
    return chat.unreadCount > 0;
};

window.WAPI.getAllChatsWithNewMsg = function (done) {
    const chats = window.Store.Chat.filter(window.WAPI.haveNewMsg).map((chat) => WAPI._serializeChatObj(chat));

    if (done !== undefined) done(chats);
    return chats;
};

/**
 * Fetches all chat IDs from store
 *
 * @param done Optional callback function for async execution
 * @returns {Array|*} List of chat id's
 */
window.WAPI.getAllChatIds = function (done) {
    const chatIds = window.Store.Chat.map((chat) => chat.id._serialized || chat.id);

    if (done !== undefined) done(chatIds);
    return chatIds;
};

/**
 * Fetches all groups objects from store
 *
 * @param done Optional callback function for async execution
 * @returns {Array|*} List of chats
 */
window.WAPI.getAllGroups = function (done) {
    const groups = window.Store.Chat.filter((chat) => chat.isGroup);

    if (done !== undefined) done(groups);
    return groups;
};

/**
 * Fetches chat object from store by ID
 *
 * @param id ID of chat
 * @param done Optional callback function for async execution
 * @returns {T|*} Chat object
 */
window.WAPI.getChat = function (id, done) {
    id = typeof id == "string" ? id : id._serialized;
    const found = window.Store.Chat.get(id);
    if (done !== undefined) done(found);
    return found;
}

window.WAPI.getChatByName = function (name, done) {
    const found = window.Store.Chat.find((chat) => chat.name === name);
    if (done !== undefined) done(found);
    return found;
};

window.WAPI.sendMessageWithThumb = function (thumb, url, title, description, chatId, done) {
    var chatSend = WAPI.getChat(chatId);
    if (chatSend === undefined) {
        if (done !== undefined) done(false);
        return false;
    }
    var linkPreview = {
        canonicalUrl: url,
        description : description,
        matchedText : url,
        title       : title,
        thumbnail   : thumb
    };
    chatSend.sendMessage(url, { linkPreview: linkPreview, mentionedJidList: [], quotedMsg: null, quotedMsgAdminGroupJid: null });
    if (done !== undefined) done(true);
    return true;
};

window.WAPI.getNewId = function () {
    var text     = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 20; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

window.WAPI.getChatById = function (id, done) {
    let found = WAPI.getChat(id);
    if (found) {
        found = WAPI._serializeChatObj(found);
    } else {
        found = false;
    }

    if (done !== undefined) done(found);
    return found;
};


/**
 * I return all unread messages from an asked chat and mark them as read.
 *
 * :param id: chat id
 * :type  id: string
 *
 * :param includeMe: indicates if user messages have to be included
 * :type  includeMe: boolean
 *
 * :param includeNotifications: indicates if notifications have to be included
 * :type  includeNotifications: boolean
 *
 * :param done: callback passed by selenium
 * :type  done: function
 *
 * :returns: list of unread messages from asked chat
 * :rtype: object
 */
window.WAPI.getUnreadMessagesInChat = function (id, includeMe, includeNotifications, done) {
    // get chat and its messages
    let chat     = WAPI.getChat(id);
    let messages = chat.msgs._models;

    // initialize result list
    let output = [];

    // look for unread messages, newest is at the end of array
    for (let i = messages.length - 1; i >= 0; i--) {
        // system message: skip it
        if (i === "remove") {
            continue;
        }

        // get message
        let messageObj = messages[i];

        // found a read message: stop looking for others
        if (typeof (messageObj.isNewMsg) !== "boolean" || messageObj.isNewMsg === false) {
            continue;
        } else {
            messageObj.isNewMsg = false;
            // process it
            let message = WAPI.processMessageObj(messageObj,
                    includeMe,
                    includeNotifications);

            // save processed message on result list
            if (message)
                output.push(message);
        }
    }
    // callback was passed: run it
    if (done !== undefined) done(output);
    // return result list
    return output;
}
;


/**
 * Load more messages in chat object from store by ID
 *
 * @param id ID of chat
 * @param done Optional callback function for async execution
 * @returns None
 */
window.WAPI.loadEarlierMessages = function (id, done) {
    const found = WAPI.getChat(id);
    if (done !== undefined) {
        found.loadEarlierMsgs().then(function () {
            done()
        });
    } else {
        found.loadEarlierMsgs();
    }
};

/**
 * Load more messages in chat object from store by ID
 *
 * @param id ID of chat
 * @param done Optional callback function for async execution
 * @returns None
 */
window.WAPI.loadAllEarlierMessages = function (id, done) {
    const found = WAPI.getChat(id);
    x = function () {
        if (!found.msgs.msgLoadState.noEarlierMsgs) {
            found.loadEarlierMsgs().then(x);
        } else if (done) {
            done();
        }
    };
    x();
};

window.WAPI.asyncLoadAllEarlierMessages = function (id, done) {
    done();
    window.WAPI.loadAllEarlierMessages(id);
};

window.WAPI.areAllMessagesLoaded = function (id, done) {
    const found = WAPI.getChat(id);
    if (!found.msgs.msgLoadState.noEarlierMsgs) {
        if (done) done(false);
        return false
    }
    if (done) done(true);
    return true
};

/**
 * Load more messages in chat object from store by ID till a particular date
 *
 * @param id ID of chat
 * @param lastMessage UTC timestamp of last message to be loaded
 * @param done Optional callback function for async execution
 * @returns None
 */

window.WAPI.loadEarlierMessagesTillDate = function (id, lastMessage, done) {
    const found = WAPI.getChat(id);
    x = function () {
        if (found.msgs.models[0].t > lastMessage) {
            found.loadEarlierMsgs().then(x);
        } else {
            done();
        }
    };
    x();
};


/**
 * Fetches all group metadata objects from store
 *
 * @param done Optional callback function for async execution
 * @returns {Array|*} List of group metadata
 */
window.WAPI.getAllGroupMetadata = function (done) {
    const groupData = window.Store.GroupMetadata.map((groupData) => groupData.all);

    if (done !== undefined) done(groupData);
    return groupData;
};

/**
 * Fetches group metadata object from store by ID
 *
 * @param id ID of group
 * @param done Optional callback function for async execution
 * @returns {T|*} Group metadata object
 */
window.WAPI.getGroupMetadata = async function (id, done) {
    let output = await window.Store.GroupMetadata.update(id);

    if (done !== undefined) done(output);
    return output;

};


/**
 * Fetches group participants
 *
 * @param id ID of group
 * @returns {Promise.<*>} Yields group metadata
 * @private
 */
window.WAPI._getGroupParticipants = async function (id) {
    const metadata = await WAPI.getGroupMetadata(id);
    return metadata.participants;
};

/**
 * Fetches IDs of group participants
 *
 * @param id ID of group
 * @param done Optional callback function for async execution
 * @returns {Promise.<Array|*>} Yields list of IDs
 */
window.WAPI.getGroupParticipantIDs = async function (id, done) {
    const output = (await WAPI._getGroupParticipants(id))
            .map((participant) => participant.id);

    if (done !== undefined) done(output);
    return output;
};

window.WAPI.getGroupAdmins = async function (id, done) {
    const output = (await WAPI._getGroupParticipants(id))
            .filter((participant) => participant.isAdmin)
            .map((admin) => admin.id);

    if (done !== undefined) done(output);
    return output;
};

/**
 * Gets object representing the logged in user
 *
 * @returns {Array|*|$q.all}
 */
window.WAPI.getMe = function (done) {
    const rawMe = window.Store.Contact.get(window.Store.Conn.me);

    if (done !== undefined) done(rawMe.all);
    return rawMe.all;
};

window.WAPI.isLoggedIn = function (done) {
    // Contact always exists when logged in
    const isLogged = window.Store.Contact && window.Store.Contact.checksum !== undefined;

    if (done !== undefined) done(isLogged);
    return isLogged;
};

window.WAPI.processMessageObj = function (messageObj, includeMe, includeNotifications) {
    if (messageObj.isNotification) {
        if (includeNotifications)
            return WAPI._serializeMessageObj(messageObj);
        else
            return;
        // System message
        // (i.e. "Messages you send to this chat and calls are now secured with end-to-end encryption...")
    } else if (messageObj.id.fromMe === false || includeMe) {
        return WAPI._serializeMessageObj(messageObj);
    }
    return;
};

window.WAPI.getAllMessagesInChat = function (id, includeMe, includeNotifications, done) {
    const chat     = WAPI.getChat(id);
    let   output   = [];
    const messages = chat.msgs._models;

    for (const i in messages) {
        if (i === "remove") {
            continue;
        }
        const messageObj = messages[i];

        let message = WAPI.processMessageObj(messageObj, includeMe, includeNotifications)
        if (message)
            output.push(message);
    }
    if (done !== undefined) done(output);
    return output;
};

window.WAPI.getAllMessageIdsInChat = function (id, includeMe, includeNotifications, done) {
    const chat     = WAPI.getChat(id);
    let   output   = [];
    const messages = chat.msgs._models;

    for (const i in messages) {
        if ((i === "remove")
                || (!includeMe && messages[i].isMe)
                || (!includeNotifications && messages[i].isNotification)) {
            continue;
        }
        output.push(messages[i].id._serialized);
    }
    if (done !== undefined) done(output);
    return output;
};

window.WAPI.getMessageById = function (id, done) {
    let result = false;
    try {
        let msg = window.Store.Msg.get(id);
        if (msg) {
            result = WAPI.processMessageObj(msg, true, true);
        }
    } catch (err) { }

    if (done !== undefined) {
        done(result);
    } else {
        return result;
    }
};

window.WAPI.ReplyMessage = function (idMessage, message, done) {
    var messageObject = window.Store.Msg.get(idMessage);
    if (messageObject === undefined) {
        if (done !== undefined) done(false);
        return false;
    }
    messageObject = messageObject.value();

    const chat = WAPI.getChat(messageObject.chat.id)
    if (chat !== undefined) {
        if (done !== undefined) {
            chat.sendMessage(message, null, messageObject).then(function () {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                var trials = 0;

                function check() {
                    for (let i = chat.msgs.models.length - 1; i >= 0; i--) {
                        let msg = chat.msgs.models[i];

                        if (!msg.senderObj.isMe || msg.body != message) {
                            continue;
                        }
                        done(WAPI._serializeMessageObj(msg));
                        return True;
                    }
                    trials += 1;
                    console.log(trials);
                    if (trials > 30) {
                        done(true);
                        return;
                    }
                    sleep(500).then(check);
                }
                check();
            });
            return true;
        } else {
            chat.sendMessage(message, null, messageObject);
            return true;
        }
    } else {
        if (done !== undefined) done(false);
        return false;
    }
};

window.WAPI.sendMessageToID = function (id, message, done) {
    try {
        window.getContact = (id) => {
            return Store.WapQuery.queryExist(id);
        }
        window.getContact(id).then(contact => {
            if (contact.status === 404) {
                done(true);
            } else {
                Store.Chat.find(contact.jid).then(chat => {
                    chat.sendMessage(message);
                    return true;
                }).catch(reject => {
                    if (WAPI.sendMessage(id, message)) {
                        done(true);
                        return true;
                    }else{
                        done(false);
                        return false;
                    }
                });
            }
        });
    } catch (e) {
        if (window.Store.Chat.length === 0)
            return false;

        firstChat = Store.Chat.models[0];
        var originalID = firstChat.id;
        firstChat.id = typeof originalID === "string" ? id : new window.Store.UserConstructor(id, { intentionallyUsePrivateConstructor: true });
        if (done !== undefined) {
            firstChat.sendMessage(message).then(function () {
                firstChat.id = originalID;
                done(true);
            });
            return true;
        } else {
            firstChat.sendMessage(message);
            firstChat.id = originalID;
            return true;
        }
    }
    if (done !== undefined) done(false);
    return false;
}

window.WAPI.sendMessage = function (id, message, done) {
    var chat = WAPI.getChat(id);
    if (chat !== undefined) {
        if (done !== undefined) {
            chat.sendMessage(message).then(function () {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                var trials = 0;

                function check() {
                    for (let i = chat.msgs.models.length - 1; i >= 0; i--) {
                        let msg = chat.msgs.models[i];

                        if (!msg.senderObj.isMe || msg.body != message) {
                            continue;
                        }
                        done(WAPI._serializeMessageObj(msg));
                        return True;
                    }
                    trials += 1;
                    console.log(trials);
                    if (trials > 30) {
                        done(true);
                        return;
                    }
                    sleep(500).then(check);
                }
                check();
            });
            return true;
        } else {
            chat.sendMessage(message);
            return true;
        }
    } else {
        if (done !== undefined) done(false);
        return false;
    }
};

window.WAPI.sendMessage2 = function (id, message, done) {
    var chat = WAPI.getChat(id);
    if (chat !== undefined) {
        try {
            if (done !== undefined) {
                chat.sendMessage(message).then(function () {
                    done(true);
                });
            } else {
                chat.sendMessage(message);
            }
            return true;
        } catch (error) {
            if (done !== undefined) done(false)
            return false;
        }
    }
    if (done !== undefined) done(false)
    return false;
};

window.WAPI.sendSeen = function (id, done) {
    var chat = window.WAPI.getChat(id);
    if (chat !== undefined) {
        if (done !== undefined) {
            Store.SendSeen(Store.Chat.models[0], false).then(function () {
                done(true);
            });
            return true;
        } else {
            Store.SendSeen(Store.Chat.models[0], false);
            return true;
        }
    }
    if (done !== undefined) done();
    return false;
};

function isChatMessage(message) {
    if (message.isSentByMe) {
        return false;
    }
    if (message.isNotification) {
        return false;
    }
    if (!message.isUserCreatedType) {
        return false;
    }
    return true;
}


window.WAPI.getUnreadMessages = function (includeMe, includeNotifications, use_unread_count, done) {
    const chats  = window.Store.Chat.models;
    let   output = [];

    for (let chat in chats) {
        if (isNaN(chat)) {
            continue;
        }

        let messageGroupObj = chats[chat];
        let messageGroup    = WAPI._serializeChatObj(messageGroupObj);

        messageGroup.messages = [];

        const messages = messageGroupObj.msgs._models;
        for (let i = messages.length - 1; i >= 0; i--) {
            let messageObj = messages[i];
            if (typeof (messageObj.isNewMsg) != "boolean" || messageObj.isNewMsg === false) {
                continue;
            } else {
                messageObj.isNewMsg = false;
                let message = WAPI.processMessageObj(messageObj, includeMe, includeNotifications);
                if (message) {
                    messageGroup.messages.push(message);
                }
            }
        }

        if (messageGroup.messages.length > 0) {
            output.push(messageGroup);
        } else { // no messages with isNewMsg true
            if (use_unread_count) {
                let n = messageGroupObj.unreadCount; // will use unreadCount attribute to fetch last n messages from sender
                for (let i = messages.length - 1; i >= 0; i--) {
                    let messageObj = messages[i];
                    if (n > 0) {
                        if (!messageObj.isSentByMe) {
                            let message = WAPI.processMessageObj(messageObj, includeMe, includeNotifications);
                            messageGroup.messages.unshift(message);
                            n -= 1;
                        }
                    } else if (n === -1) { // chat was marked as unread so will fetch last message as unread
                        if (!messageObj.isSentByMe) {
                            let message = WAPI.processMessageObj(messageObj, includeMe, includeNotifications);
                            messageGroup.messages.unshift(message);
                            break;
                        }
                    } else { // unreadCount = 0
                        break;
                    }
                }
                if (messageGroup.messages.length > 0) {
                    messageGroupObj.unreadCount = 0; // reset unread counter
                    output.push(messageGroup);
                }
            }
        }
    }
    if (done !== undefined) {
        done(output);
    }
    return output;
};

window.WAPI.getGroupOwnerID = async function (id, done) {
    const output = (await WAPI.getGroupMetadata(id)).owner.id;
    if (done !== undefined) {
        done(output);
    }
    return output;

};

window.WAPI.getCommonGroups = async function (id, done) {
    let output = [];

    groups = window.WAPI.getAllGroups();

    for (let idx in groups) {
        try {
            participants = await window.WAPI.getGroupParticipantIDs(groups[idx].id);
            if (participants.filter((participant) => participant == id).length) {
                output.push(groups[idx]);
            }
        } catch (err) {
            console.log("Error in group:");
            console.log(groups[idx]);
            console.log(err);
        }
    }

    if (done !== undefined) {
        done(output);
    }
    return output;
};


window.WAPI.getProfilePicSmallFromId = function (id, done) {
    window.Store.ProfilePicThumb.find(id).then(function (d) {
        if (d.img !== undefined) {
            window.WAPI.downloadFileWithCredentials(d.img, done);
        } else {
            done(false);
        }
    }, function (e) {
        done(false);
    })
};

window.WAPI.getProfilePicFromId = function (id, done) {
    window.Store.ProfilePicThumb.find(id).then(function (d) {
        if (d.imgFull !== undefined) {
            window.WAPI.downloadFileWithCredentials(d.imgFull, done);
        } else {
            done(false);
        }
    }, function (e) {
        done(false);
    })
};

window.WAPI.downloadFileWithCredentials = function (url, done) {
    let xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                let reader = new FileReader();
                reader.readAsDataURL(xhr.response);
                reader.onload = function (e) {
                    done(reader.result.substr(reader.result.indexOf(',') + 1))
                };
            } else {
                console.error(xhr.statusText);
            }
        } else {
            console.log(err);
            done(false);
        }
    };

    xhr.open("GET", url, true);
    xhr.withCredentials = true;
    xhr.responseType = 'blob';
    xhr.send(null);
};


window.WAPI.downloadFile = function (url, done) {
    let xhr = new XMLHttpRequest();


    xhr.onload = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                let reader = new FileReader();
                reader.readAsDataURL(xhr.response);
                reader.onload = function (e) {
                    done(reader.result.substr(reader.result.indexOf(',') + 1))
                };
            } else {
                console.error(xhr.statusText);
            }
        } else {
            console.log(err);
            done(false);
        }
    };

    xhr.open("GET", url, true);
    xhr.responseType = 'blob';
    xhr.send(null);
};

window.WAPI.getBatteryLevel = function (done) {
    if (window.Store.Conn.plugged) {
        if (done !== undefined) {
            done(100);
        }
        return 100;
    }
    output = window.Store.Conn.battery;
    if (done !== undefined) {
        done(output);
    }
    return output;
};

window.WAPI.deleteConversation = function (chatId, done) {
    let userId       = new window.Store.UserConstructor(chatId, {intentionallyUsePrivateConstructor: true});
    let conversation = WAPI.getChat(userId);

    if (!conversation) {
        if (done !== undefined) {
            done(false);
        }
        return false;
    }

    window.Store.sendDelete(conversation, false).then(() => {
        if (done !== undefined) {
            done(true);
        }
    }).catch(() => {
        if (done !== undefined) {
            done(false);
        }
    });

    return true;
};

window.WAPI.deleteMessage = function (chatId, messageArray, revoke=false, done) {
    let userId       = new window.Store.UserConstructor(chatId, {intentionallyUsePrivateConstructor: true});
    let conversation = WAPI.getChat(userId);

    if(!conversation) {
        if(done !== undefined) {
            done(false);
        }
        return false;
    }

    if (!Array.isArray(messageArray)) {
        messageArray = [messageArray];
    }

    if (revoke) {
        conversation.sendRevokeMsgs(messageArray, conversation);    
    } else {
        conversation.sendDeleteMsgs(messageArray, conversation);    
    }


    if (done !== undefined) {
        done(true);
    }

    return true;
};

window.WAPI.checkNumberStatus = function (id, done) {
    window.Store.WapQuery.queryExist(id).then((result) => {
        if( done !== undefined) {
            if (result.jid === undefined) throw 404;
            done(window.WAPI._serializeNumberStatusObj(result));
        }
    }).catch((e) => {
        if (done !== undefined) {
            done(window.WAPI._serializeNumberStatusObj({
                status: e,
                jid   : id
            }));
        }
    });

    return true;
};

/**
 * New messages observable functions.
 */
window.WAPI._newMessagesQueue     = [];
window.WAPI._newMessagesBuffer    = (sessionStorage.getItem('saved_msgs') != null) ? JSON.parse(sessionStorage.getItem('saved_msgs')) : [];
window.WAPI._newMessagesDebouncer = null;
window.WAPI._newMessagesCallbacks = [];

window.Store.Msg.off('add');
sessionStorage.removeItem('saved_msgs');

window.WAPI._newMessagesListener = window.Store.Msg.on('add', (newMessage) => {
    if (newMessage && newMessage.isNewMsg && !newMessage.isSentByMe) {
        let message = window.WAPI.processMessageObj(newMessage, false, false);
        if (message) {
            window.WAPI._newMessagesQueue.push(message);
            window.WAPI._newMessagesBuffer.push(message);
        }

        // Starts debouncer time to don't call a callback for each message if more than one message arrives
        // in the same second
        if (!window.WAPI._newMessagesDebouncer && window.WAPI._newMessagesQueue.length > 0) {
            window.WAPI._newMessagesDebouncer = setTimeout(() => {
                let queuedMessages = window.WAPI._newMessagesQueue;

                window.WAPI._newMessagesDebouncer = null;
                window.WAPI._newMessagesQueue     = [];

                let removeCallbacks = [];

                window.WAPI._newMessagesCallbacks.forEach(function (callbackObj) {
                    if (callbackObj.callback !== undefined) {
                        callbackObj.callback(queuedMessages);
                    }
                    if (callbackObj.rmAfterUse === true) {
                        removeCallbacks.push(callbackObj);
                    }
                });

                // Remove removable callbacks.
                removeCallbacks.forEach(function (rmCallbackObj) {
                    let callbackIndex = window.WAPI._newMessagesCallbacks.indexOf(rmCallbackObj);
                    window.WAPI._newMessagesCallbacks.splice(callbackIndex, 1);
                });
            }, 1000);
        }
    }
});

window.WAPI._unloadInform = (event) => {
    // Save in the buffer the ungot unreaded messages
    window.WAPI._newMessagesBuffer.forEach((message) => {
        Object.keys(message).forEach(key => message[key] === undefined ? delete message[key] : '');
    });
    sessionStorage.setItem("saved_msgs", JSON.stringify(window.WAPI._newMessagesBuffer));

    // Inform callbacks that the page will be reloaded.
    window.WAPI._newMessagesCallbacks.forEach(function (callbackObj) {
        if (callbackObj.callback !== undefined) {
            callbackObj.callback({ status: -1, message: 'page will be reloaded, wait and register callback again.' });
        }
    });
};

window.addEventListener("unload", window.WAPI._unloadInform, false);
window.addEventListener("beforeunload", window.WAPI._unloadInform, false);
window.addEventListener("pageunload", window.WAPI._unloadInform, false);

/**
 * Registers a callback to be called when a new message arrives the WAPI.
 * @param rmCallbackAfterUse - Boolean - Specify if the callback need to be executed only once
 * @param done - function - Callback function to be called when a new message arrives.
 * @returns {boolean}
 */
window.WAPI.waitNewMessages = function (rmCallbackAfterUse = true, done) {
    window.WAPI._newMessagesCallbacks.push({ callback: done, rmAfterUse: rmCallbackAfterUse });
    return true;
};

/**
 * Reads buffered new messages.
 * @param done - function - Callback function to be called contained the buffered messages.
 * @returns {Array}
 */
window.WAPI.getBufferedNewMessages = function (done) {
    let bufferedMessages = window.WAPI._newMessagesBuffer;
    window.WAPI._newMessagesBuffer = [];
    if (done !== undefined) {
        done(bufferedMessages);
    }
    return bufferedMessages;
};
/** End new messages observable functions **/

window.WAPI.sendImage = function (imgBase64, chatid, filename, caption, done) {
//var idUser = new window.Store.UserConstructor(chatid);
var idUser = new window.Store.UserConstructor(chatid, { intentionallyUsePrivateConstructor: true });
// create new chat
return Store.Chat.find(idUser).then((chat) => {
    var mediaBlob = window.WAPI.base64ImageToFile(imgBase64, filename);
    console.log('mediaBlob')
    var mc = new Store.MediaCollection(chat);
    mc.processAttachments([{file: mediaBlob}, 1], chat, 1).then(() => {
    console.log('mc.processFiles')
        var media = mc.models[0];
        console.log('media')
        media.sendToChat(chat, { 
	caption: caption });
        if (done !== undefined) {console.log('done'); done(true);}
    });
});
}

window.WAPI.base64ImageToFile = function (b64Data, filename) {
    var arr   = b64Data.split(',');
    var mime  = arr[0].match(/:(.*?);/)[1];
    var bstr  = atob(arr[1]);
    var n     = bstr.length;
    var u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type: mime});
};

/**
 * Send contact card to a specific chat using the chat ids
 *
 * @param {string} to '000000000000@c.us'
 * @param {string|array} contact '111111111111@c.us' | ['222222222222@c.us', '333333333333@c.us, ... 'nnnnnnnnnnnn@c.us']
 */
window.WAPI.sendContact = function (to, contact) {
    if (!Array.isArray(contact)) {
        contact = [contact];
    }
    contact = contact.map((c) => {
        return WAPI.getChat(c).__x_contact;
    });

    if (contact.length > 1) {
        window.WAPI.getChat(to).sendContactList(contact);
    } else if (contact.length === 1) {
        window.WAPI.getChat(to).sendContact(contact[0]);
    }
};

/**
 * Create an chat ID based in a cloned one
 *
 * @param {string} chatId '000000000000@c.us'
 */
window.WAPI.getNewMessageId = function (chatId) {
    var newMsgId = Store.Msg.models[0].__x_id.clone();

    newMsgId.fromMe      = true;
    newMsgId.id          = WAPI.getNewId().toUpperCase();
    newMsgId.remote      = chatId;
    newMsgId._serialized = `${newMsgId.fromMe}_${newMsgId.remote}_${newMsgId.id}`

    return newMsgId;
};

/**
 * Send Customized VCard without the necessity of contact be a Whatsapp Contact
 *
 * @param {string} chatId '000000000000@c.us'
 * @param {object|array} vcard { displayName: 'Contact Name', vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Contact Name;;;\nEND:VCARD' } | [{ displayName: 'Contact Name 1', vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Contact Name 1;;;\nEND:VCARD' }, { displayName: 'Contact Name 2', vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Contact Name 2;;;\nEND:VCARD' }]
 */
window.WAPI.sendVCard = function (chatId, vcard) {
    var chat    = Store.Chat.get(chatId);
    var tempMsg = Object.create(Store.Msg.models.filter(msg => msg.__x_isSentByMe)[0]);
    var newId   = window.WAPI.getNewMessageId(chatId);

    var extend = {
        ack     : 0,
        id      : newId,
        local   : !0,
        self    : "out",
        t       : parseInt(new Date().getTime() / 1000),
        to      : chatId,
        isNewMsg: !0,
    };

    if (Array.isArray(vcard)) {
        Object.assign(extend, {
            type     : "multi_vcard",
            vcardList: vcard
        });

        delete extend.body;
    } else {
        Object.assign(extend, {
            type   : "vcard",
            subtype: vcard.displayName,
            body   : vcard.vcard
        });

        delete extend.vcardList;
    }

    Object.assign(tempMsg, extend);

    chat.addAndSendMsg(tempMsg);
};
/**
 * Block contact 
 * @param {string} id '000000000000@c.us'
 * @param {*} done - function - Callback function to be called when a new message arrives.
 */
window.WAPI.contactBlock = function (id, done) {
    const contact = window.Store.Contact.get(id);
    if (contact !== undefined) {
        contact.setBlock(!0);
        done(true);
        return true;
    }
    done(false);
    return false;
}
/**
 * unBlock contact 
 * @param {string} id '000000000000@c.us'
 * @param {*} done - function - Callback function to be called when a new message arrives.
 */
window.WAPI.contactUnblock = function (id, done) {
    const contact = window.Store.Contact.get(id);
    if (contact !== undefined) {
        contact.setBlock(!1);
        done(true);
        return true;
    }
    done(false);
    return false;
}

/**
 * Remove participant of Group
 * @param {*} idGroup '0000000000-00000000@g.us'
 * @param {*} idParticipant '000000000000@c.us'
 * @param {*} done - function - Callback function to be called when a new message arrives.
 */
window.WAPI.removeParticipantGroup = function (idGroup, idParticipant, done) {
    window.Store.WapQuery.removeParticipants(idGroup, [idParticipant]).then(() => {
        const metaDataGroup = window.Store.GroupMetadata.update(id)
        checkParticipant = metaDataGroup.participants._index[idParticipant];
        if (checkParticipant === undefined) {
            done(true); return true;
        }
    })
}

/**
 * Promote Participant to Admin in Group
 * @param {*} idGroup '0000000000-00000000@g.us'
 * @param {*} idParticipant '000000000000@c.us'
 * @param {*} done - function - Callback function to be called when a new message arrives.
 */
window.WAPI.promoteParticipantAdminGroup = function (idGroup, idParticipant, done) {
    window.Store.WapQuery.promoteParticipants(idGroup, [idParticipant]).then(() => {
        const metaDataGroup = window.Store.GroupMetadata.update(id)
        checkParticipant = metaDataGroup.participants._index[idParticipant];
        if (checkParticipant !== undefined && checkParticipant.isAdmin) {
            done(true); return true;
        }
        done(false); return false;
    })
}

/**
 * Demote Admin of Group
 * @param {*} idGroup '0000000000-00000000@g.us'
 * @param {*} idParticipant '000000000000@c.us'
 * @param {*} done - function - Callback function to be called when a new message arrives.
 */
window.WAPI.demoteParticipantAdminGroup = function (idGroup, idParticipant, done) {
    window.Store.WapQuery.demoteParticipants(idGroup, [idParticipant]).then(() => {
        const metaDataGroup = window.Store.GroupMetadata.update(id)
        if (metaDataGroup === undefined) {
            done(false); return false;
        }
        checkParticipant = metaDataGroup.participants._index[idParticipant];
        if (checkParticipant !== undefined && checkParticipant.isAdmin) {
            done(false); return false;
        }
        done(true); return true;
    })
}

window.WAPI.sendMessageToID = function (id, message, done) {
    try {
        window.getContact = (id) => {
            return Store.WapQuery.queryExist(id);
        }
        return window.getContact(id).then(contact => {
            try{
                if (contact.status === 404) {
                    done(true);
                }if (contact.status === 400) {
                    Store.Chat.find(id).then(chat => {
                        window.Store.SendTextMsgToChat(chat, message).then(function (e) {
                    console.log(e);
                    (callback || Core.nop)({ status: e });
                });
        
                    })
                }
                else {
                console.log(contact.jid._serialized)
                numeroEnviadoMSG = contact.jid._serialized
                console.log('mandou aqui ')

                var idUser = new window.Store.UserConstructor(contact.jid._serialized, { intentionallyUsePrivateConstructor: true });
                // create new chat
                Store.Chat.find(idUser).then((chat) => {
                window.Store.SendTextMsgToChat(chat, message).then(function (e) {
                                console.log(e);
                                (callback || Core.nop)({ status: e });
                            });
                    });
                    return true
                }
            }catch(e){
                return false
            }
        });
    } catch (e) {
        return false
    }
}

function responda(user){
	if(user.length == 10){
		user = user.substring(0,2)+'9'+user.substring(2);
	}
    mensagem = JSON.parse(localStorage.getItem(user));
    
	nivel = localStorage.getItem(user+'nivel');
	console.log(user);
    if(mensagem!=undefined){
	console.log('if');
	window.WAPI.sendMessageToID("55"+user+"@c.us", mensagem[nivel]);
	localStorage.setItem(user+'nivel', parseInt(nivel)+1);
    }
}

window.WAPI.waitNewMessages(false, responder)
async function responder(data){
    await sleep(20000);
	user = data[0].from.user.substring(2);
	user2 = data[0].from.user.substring(2);
	if(user.length == 10){
		user = user.substring(0,2)+'9'+user.substring(2);
	}
    mensagem = JSON.parse(localStorage.getItem(user));    
	nivel = localStorage.getItem(user+'nivel');
	
	console.log(user);
	console.log(user2);
	console.log(mensagem);
	console.log(nivel);
	
	if(nivel==null || mensagem==null || nivel=="null" || mensagem=="null"){ 
		mensagem = JSON.parse(localStorage.getItem(user2));    
		nivel = localStorage.getItem(user2+'nivel');
		
		console.log("user2 Usando sem 9")
		if(mensagem!=undefined){
			console.log('if');
			window.WAPI.sendMessageToID("55"+user2+"@c.us", mensagem[nivel]);
			localStorage.setItem(user2+'nivel', parseInt(nivel)+1);
		}  
	}else{	
		console.log("user1 Usando com 9")
		if(mensagem!=undefined){
			console.log('if');
			window.WAPI.sendMessageToID(data[0].from._serialized, mensagem[nivel]);
			localStorage.setItem(user+'nivel', parseInt(nivel)+1);
		} 
	} 
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function criarContatoEmContatos(numero, nome, estabelecimento, origem, nivelSdr, nivelFallowUp, status){
	let contato = {"numero": numero, "nome": nome, "estabelecimento": estabelecimento, "orgiem": origem, "nivelSdr": nivelSdr, "nivelFallowUp": nivelFallowUp, "status": status}
	
	let search = "31993861616";
	let tem = false;
	for (var i=0 ; i < contatos.length ; i++)
	{
		if (contatos[i].numero == search) {
			tem = true
		}
	}

	if(tem == false){
		contatos.push(contato)
	}else{
		console.log("esse numero ja esta na planilha")
	}
}




async function iniciarContato(contato, nomeEstabelecimento, nomeResponsavel, cidade, concorrenteReferencia, nomeSdr){
			
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	concorrenteReferencia = replaceAll(concorrenteReferencia, "'", "");
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");


	
	let enviarPara = '55' + contato + '@c.us'
	let msg = 'Ol??, Este ?? o Whatsapp de ' + nomeResponsavel + ' respons??vel pelo ' + nomeEstabelecimento + '?'
	let msg1 = 'Meu nome ?? ' + nomeSdr + ' e estou falando da Cliente Fiel, somos uma plataforma de Delivery e j?? temos mais de 500 estabelecimentos cadastrados em nosso sistema. Cuidamos do delivery de empresas como '+concorrenteReferencia+', Aca?? Concept e Jah do A??a??, entre outras marcas da cidade '+cidade+'!\n\nTudo bem com voc???' 
	let msg2 = 'Gostaria de uns minutinhos da sua aten????o para falar sobre a nossa ferramente de automatiza????o de pedidos.\n\nTemos *atendente virtual para o seu whatsapp, aplicativos personalizados, card??pio digital*, entre outras funcionalidades para auxiliar e otimizar o seu estabelecimento.\n\nAcha que alguma dessas funcionalidades faz sentido para o seu neg??cio hoje?'
	let msg3 = 'Bom, para saber mais, acesse nosso site e conte-me o que achou:\n\nhttps://appclientefiel.com.br/?utm_source=dmh'
	
	
	window.WAPI.sendMessageToID(enviarPara, msg);
	
	localStorage.setItem(contato,JSON.stringify([ msg1 , msg2  , msg3])); 
	localStorage.setItem(contato+'nivel',0);
	console.log(contato+" CRIADA!")
}

function replaceAll(str, de, para){
    var pos = str.indexOf(de);
    while (pos > -1){
		str = str.replace(de, para);
		pos = str.indexOf(de);
	}
    return (str);
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function zerarTodasInfo(){
	localStorage.setItem("MsgEnviada"+dataEnvio.getDay()+"/"+dataEnvio.getMonth()+"/"+dataEnvio.getFullYear(), 0)
	localStorage.setItem("MsgEnviadaMes"+dataEnvio.getMonth()+ "/" + dataEnvio.getFullYear(), 0);
	localStorage.setItem("MsgEnviadaAno"+dataEnvio.getFullYear(), 0);	
	localStorage.setItem('ChegouFimRobo', 0);			
	localStorage.setItem('ChegouMetadeRobo', 0);			
	
}







//SITE

async function possoAjudar(contato, sdr = "Larissa"){
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');	
	
	let contatoEnviar = '55' + contato + '@c.us'
	let mensavemEnviar = 'Meu nome ?? '+sdr+' da empresa Cliente Fiel. Nossa empresa trabalha como parceiros de estabelecimentos do ramo de alimenta????o em todo o Brasil. Voc?? deixou uma mensagem em nosso site.\n\n*Posso ajudar?*'
	
	
	window.WAPI.sendMessageToID(contatoEnviar, mensavemEnviar);
}


async function oiTudoBem(contato, nomeEstabelecimento, nomeResponsavel){
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeResponsavel = replaceAll(nomeResponsavel, "'", "");
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");
	
	let contatoEnviar = '55' + contato + '@c.us'
	let mensavemEnviar = 'Ol??, Este ?? o Whatsapp de ' + nomeResponsavel + ' respons??vel pelo ' + nomeEstabelecimento + '?'	
	window.WAPI.sendMessageToID(contatoEnviar, mensavemEnviar);
}


async function iniciarContatoSite(contato, nomeEstabelecimento, nomeResponsavel, sdr = "Larissa"){

	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");


	
	let enviarPara = '55' + contato + '@c.us'
	let msg = 'Ol??, Este ?? o Whatsapp de '+nomeResponsavel+' respons??vel pelo '+nomeEstabelecimento+'?'
	let msg1 = 'Meu nome ?? '+sdr+' da empresa Cliente Fiel. Nossa empresa trabalha como parceiros de estabelecimentos do ramo de alimenta????o em todo o Brasil. Voc?? deixou uma mensagem em nosso site.\n\n*Posso ajudar?*'
	//let msg2 = 'Bom.. nesse momento da nossa conversa, seria interessante pegar algumas informa????es do seu neg??cio.\n\nAp??s isso, se for do seu interesse, a gente agenda uma liga????o para que um representante possa tirar todas as suas d??vidas.\n\n*Pode ser?*'
	//let msg3 = 'Interessante. Sendo assim, me conte:\n\n- Qual a m??dia de pedidos que voc?? recebe diariamente?'
	
	window.WAPI.sendMessageToID(enviarPara, msg);
	
	localStorage.setItem(contato,JSON.stringify([ msg1])); 
	localStorage.setItem(contato+'nivel',0);
	console.log(contato+" CRIADA!")
}


async function fallowup1(contato, nomeResponsavel, nomeEstabelecimento){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg = 'Oi '+nomeResponsavel+', tudo bem?'
	let msg1 = 'Passando para lembrar das nossas ferramentas.'
	let msg2 = 'Hoje trabalhamos com diversas ferramentas para delivery e atendimento. As principais para servi??o de entrega s??o os *Aplicativos Personalizados* e *Cardapio Digital* . Para o atendimento, trabalhamos com a Izza, ela automatiza seu whatsapp como uma *atendente virtual*.'
	
	
	window.WAPI.sendMessageToID(enviarPara, msg);
	await sleep(5000)
	window.WAPI.sendMessageToID(enviarPara, msg1);
	await sleep(5000)
	window.WAPI.sendMessageToID(enviarPara, msg2);
}


async function fallowup3(contato, nomeResponsavel, nomeEstabelecimento){	
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let enviarPara2 = '559' + contato + '@c.us'
	let msg = 'Oi '+nomeResponsavel+', tudo bem?'
	let msg1 = 'Passando para lembrar da atendente virtual que pode te ajudar bastante no atendimento do seus clientes.'
	let msg2 = 'Qualquer duvida estou a disposi????o!'
	
	
	window.WAPI.sendMessageToID(enviarPara, msg);
	await sleep(5000)
	window.WAPI.sendMessageToID(enviarPara, msg1);
	await sleep(5000)
	window.WAPI.sendMessageToID(enviarPara, msg2);
}


async function fallowup4(contato, nomeResponsavel, nomeEstabelecimento){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg = 'Oi '+nomeResponsavel+', tudo bem?'
	let msg1 = 'Bom... qualquer duvida estou a disposi????o viu? Entre em nosso site depois https://www.appclientefiel.com.br/'
	
	
	window.WAPI.sendMessageToID(enviarPara, msg);
	await sleep(5000)
	window.WAPI.sendMessageToID(enviarPara, msg1);
}

async function iniciarContatoIfood(contato, nomeEstabelecimento){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg = 'Ol??, esse ?? o contato do respons??vel pelo ' +nomeEstabelecimento
	let msg1 = 'Meu nome ?? Larissa, falo da Cliente Fiel.\n\nGostaria de uns minutinhos da sua aten????o para falar sobre a nossa ferramenta de automatiza????o de pedidos.\n\nTemos *atendente virtual para o seu whatsapp, aplicativos personalizados, card??pio digital*, entre outras funcionalidades para auxiliar e otimizar o seu estabelecimento.\n\nAcha que alguma dessas funcionalidades faz sentido para o seu neg??cio hoje?'
	let msg2 = 'Queria te convidar a dar uma olhada no nosso site para ter uma no????o de como podemos te ajudar a aumentar as suas vendas e que voc?? voltasse aqui para me contar, o que acha?\n\nhttps://appclientefiel.com.br/?utm_source=dmh'
	
	window.WAPI.sendMessageToID(enviarPara, msg);
	
	localStorage.setItem(contato,JSON.stringify([ msg1])); 
	localStorage.setItem(contato+'nivel',0);
	console.log(contato+" CRIADA!")
}

async function planilhaMotoBoy(contato, nomeEstabelecimento){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg = 'Ol??, tudo bem?\n\n?? O delivery de alimentos t??m se tornado um mercado em crescimento nos ??ltimos anos. Ainda mais com a correria da vida, o tempo para preparar refei????es est?? cada vez mais escasso e as pessoas acabam optando por pedir sua comida em restaurantes e at?? mesmo fazer compras online em supermercados. Com o objetivo de te ajudar a aumentar pedidos no seu delivery e fidelizar clientes, a *Cliente Fiel* preparou 3 dicas para voc?? colocar em pr??tica hoje mesmo! ??\nVenha conferir esse post em nosso blog sobre *3 Formas De Aumentar Pedidos Em Seu Delivery*\n\n???????? https://bit.ly/3fVk8P1'
	
	window.WAPI.sendMessageToID(enviarPara, msg);
}

async function iniciarContatoAiQFome(contato, nomeEstabelecimento){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg =  'Ol??, Este ?? o Whatsapp do respons??vel pelo ' + nomeEstabelecimento + '?'
	let msg2 = 'Meu nome ?? Bruno, falo da Cliente Fiel.\n\nGostaria de uns minutinhos da sua aten????o para falar sobre a nossa ferramenta de automatiza????o de pedidos.\n\nTemos *atendente virtual para o seu whatsapp, aplicativos personalizados, card??pio digital*, entre outras funcionalidades para auxiliar e otimizar o seu estabelecimento.\n\nAcha que alguma dessas funcionalidades faz sentido para o seu neg??cio hoje?'	
	
	localStorage.setItem(contato,JSON.stringify([msg2])); 
	localStorage.setItem(contato+'nivel',0);


	window.WAPI.sendMessageToID(enviarPara, msg);
}

async function enviarMVTecidosCliente(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = 'Oi, meu nome ?? Marco T??lio'
	let msg21 = 'Quais tipos de tecidos voces trabalham?'
	window.WAPI.sendMessageToID(enviarPara, msg1);
	await sleep('5000');
	window.WAPI.sendMessageToID(enviarPara, msg21);
	
	let msg2 = 'Voces compram tecidos no atacado, certo?'
	let msg3 = 'Sou da *Central de Relacionamento da MV Tecidos*. *www.mvtecidos.com.br*. So um instante que retorno a conversar com voc??s e mando um PDF de apresenta????o. Qual seu nome?'
	let msg4 = 'A MV TECIDOS ?? especializada em estamparia digital e artigos em geral. Atendemos todos os estados do Brasil. Ficarei feliz em poder conversar melhor com voc?? para entender a  sua demanda e oferecer os melhores tecidos com pre??os e condi????es especiais de pagamento.'
	localStorage.setItem(contato,JSON.stringify([msg2, msg3, msg4])); 
	localStorage.setItem(contato+'nivel',0);
}

async function fallowUpMVThais(contato){
	data = new Date()
	let enviarPara = contato

	let msg1 = ""

	if(data.getHours() < 13){
		msg1 = 'Bom diaaa, tudo bem?'
	}else {
		msg1 = 'Oii, joia?'
	}
	
	let msg2 = 'Estamos com muitas novidades na loja\n'
	let msg3 = 'Acompanhe nossa empresa no instagram https://www.instagram.com/mvtecidos/'
	let msg4 = 'Precisando de algum tecido, estarei a disposi????o para atender!'

	window.WAPI.sendMessageToID(enviarPara, msg1);
	await sleep(5000);
	window.WAPI.sendMessageToID(enviarPara, msg2);
	await sleep(5000);
	window.WAPI.sendMessageToID(enviarPara, msg3);
	await sleep(5000);
	window.WAPI.sendMessageToID(enviarPara, msg4);
}




async function backup1(tipo, nome, contato){
    contato = contato.replace(/([^\d])+/gim, '')
    await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Ola ${nome} tudo bem? Aqui ?? o Marco T??lio da MV Tecidos.`);
    await sleep(5000);
    await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Voltei aqui depois de um tempo para saber se voc?? est?? precisando de algum de nossos tecidos ou da estamparia digital.`);
    await sleep(5000);
    await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Hoje temos representantes para todas as regi??es do Brasil e tamb??m nosso Mostruario Online para atacado e varejo. Tudo isso voc?? encontra em nosso site *https://bit.ly/PosContato1*`);
    await sleep(5000);
    await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Lembrando tamb??m que nossa cole????o Urban Inverno 2021 ja est?? disponivel *https://bit.ly/PreenchimentoUrban*`);
    await sleep(10000);
}


async function distribuir(tipo, nome, cidade, contato, representante, minutos){
     switch (tipo) {
        case "cartaoVisitasSummer":
                await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Ola ${nome} tudo bem? Meu nome ?? Marco T??lio e vim confirmar se voc?? conseguiu conhecer a cole????o Summer da MV Tecidos. Tudo certinho?`);
            break;

	case "colecaoUrban":
                await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Ola ${nome} tudo bem? Meu nome ?? Marco T??lio e vim confirmar se voc?? conseguiu conhecer a cole????o Urban da MV Tecidos. Tudo certinho?`);
            break;


        case "buscarRepresentante":
                await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Ola ${nome} tudo bem? Meu nome ?? Marco T??lio e vim confirmar se voc?? conseguiu representante na MV TECIDOS. Tudo certinho?`);
            break;
        case "CadastroLojaVirtual":
                await cadastroSite(nome, cidade, contato, representante, minutos)
            break;
        case "PreenchimentoSite":
                await preenchimentoSite(nome, cidade, contato, representante, minutos)
            break;
        case "possiveisClientesCONVERSANDO":
                await fallowUpMV(nome, cidade, contato, representante, minutos)
            break;
        case "irB2B":
                await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Ola ${nome} tudo bem? Meu nome ?? Marco T??lio e vim confirmar se voc?? conseguiu conhecer nosso mostruario online *http://mostruario.mvtecidos.com.br/*. Posso te ajudar em mais alguma coisa?`);
            break;
        case "irB2C":
            await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Ola ${nome} tudo bem? Meu nome ?? Marco T??lio e vim confirmar se voc?? conseguiu conhecer nosso Outlet online *http://varejo.mvtecidos.com.br/*. Posso te ajudar em mais alguma coisa?`);
		break;
        case "Ola":
            await window.WAPI.sendMessageToID(`55${contato}@c.us`, `Ola ${nome} tudo bem?`);
        break;
            
     
     }
}

async function fallowUpMV(nomeEstabelecimento, cidade, contato, minutos){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = 'Oi, tudo bem?'
	let msg3 = 'Meu nome ?? Marco T??lio e trabalho na *www.instagram.com/mvtecidos*'
	let msg2 = 'Gostaria de saber se voc??s compram tecidos e quais tipos de tecidos voc??s compram.'
	let msg4 = 'Temos muito interesse em atende-los!'

    const resp = await window.WAPI.sendMessageToID(enviarPara, msg1);
    console.log("resp", resp)
    if(resp){
        await sleep(5000);
        window.WAPI.sendMessageToID(enviarPara, msg2);
        await sleep(5000);
        window.WAPI.sendMessageToID(enviarPara, msg3);
        await sleep(5000);
        window.WAPI.sendMessageToID(enviarPara, msg4);
        await sleep(minutos*60000);
    }

}


async function enviarMVTecidos(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = ''
	if(cidade){
		msg1 = 'Ol??, tudo bem? Esse ?? o whatsapp da empresa *' +  nomeEstabelecimento + '* de ' + cidade + '?'	
	}else{
		msg1 = 'Ol??, tudo bem? Esse ?? o whatsapp da empresa *' +  nomeEstabelecimento + '?'	
	}
	
	window.WAPI.sendMessageToID(enviarPara, msg1);


	let msg2 = 'Meu nome ?? Marco T??lio, sou da *Central de Relacionamento da MV Tecidos*. *www.mvtecidos.com.br*\n\n*Quais tipo de tecidos voc??s trabalham?*'
	let msg3 = 'So um instante que retorno a conversar com voc??s e mando um PDF de apresenta????o.\n\nVoces compram tecidos no atacado, certo?'
	let msg4 = 'A MV TECIDOS ?? especializada em estamparia digital e artigos em geral. Atendemos todos os estados do Brasil. Ficarei feliz em poder conversar melhor com voc?? para entender a  sua demanda e oferecer os melhores tecidos com pre??os e condi????es especiais de pagamento. Qual seu nome?'
	localStorage.setItem(contato,JSON.stringify([msg2, msg3, msg4])); 
	localStorage.setItem(contato+'nivel',0);
}

async function enviarMVConfeccao(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = 'Ol??, tudo bem? Esse ?? o whatsapp da empresa *' +  nomeEstabelecimento + '* de ' + cidade + '?'
	let msg2 = 'Meu nome ?? Marco T??lio, sou da empresa *MV Tecidos*. *www.mvtecidos.com.br*\n\nVoc??s s??o confec????o pr??pria ou revenda?'
	
	window.WAPI.sendMessageToID(enviarPara, msg1);
	await sleep(5000);
	window.WAPI.sendMessageToID(enviarPara, msg2);

	let msg3 = 'Estamos procurando confec????es pr??prias para apresentar a MV Tecidos. So um instante que retorno a conversar com voc??s.\n\nVoces compram tecidos no atacado, certo?'

	localStorage.setItem(contato,JSON.stringify([msg3])); 
	localStorage.setItem(contato+'nivel',0);


}


async function enviarMVConfeccao(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = 'Ol??, tudo bem? Esse ?? o whatsapp da empresa *' +  nomeEstabelecimento + '* de ' + cidade + '?'
	let msg2 = 'Meu nome ?? Marco T??lio, sou da empresa *MV Tecidos*. *www.mvtecidos.com.br*\n\nVoc??s s??o confec????o pr??pria ou revenda?'
	
	window.WAPI.sendMessageToID(enviarPara, msg1);
	await sleep(5000);
	window.WAPI.sendMessageToID(enviarPara, msg2);

	let msg3 = 'Estamos procurando confec????es pr??prias para apresentar a MV Tecidos. So um instante que retorno a conversar com voc??s.\n\nVoces compram tecidos no atacado, certo?'

	localStorage.setItem(contato,JSON.stringify([msg3])); 
	localStorage.setItem(contato+'nivel',0);


}

async function noticia1MV(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = 'Bom dia ' + nomeEstabelecimento + ', tudo bem?'	
	let msg2 = '*N??s da MV TECIDOS, sabemos que para ser diferente, precisamos fazer melhor!*\n\n*Por isso, preparamos uma s??rie de v??deos com relatos reais de nossos clientes.*\n\n*Tudo isso, para que voc?? n??o tenha d??vida de que n??s somos a sua melhor op????o.*\n\n#SerDiferenteFazerMelhor #MVTECIDOS\n\n*https://www.instagram.com/tv/CDbw-CdAokb/?igshid=8whf48cgs34q*'
	window.WAPI.sendMessageToID(enviarPara, msg1);
	await sleep(5000);
	window.WAPI.sendMessageToID(enviarPara, msg2);
}

async function noticia2MV(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg2 = 'Ola, tudo bem? Hoje a *MV Tecidos* come??ou a fazer o lan??amento da *Cole????o Classic* no Instagram *https://bit.ly/Cole????oClassicMVTecidos*'
	let msg3 = '*Saiu o 1?? v??deo da Cole????o Classic!!*\n\n*Uma cole????o atemporal, Classic foi inspirada em uma moda feita para durar, simples e sofisticada, o contraste entre o cl??ssico e o moderno resultam em lindas estampas, repletas de elementos apurados e irreverentes.*\n\n*A mistura de folhagens, florais, texturas e efeitos demostram riqueza em detalhes. As cores da cole????o revelam uma combina????o entre tons vivos e suaves.*\n\n*https://bit.ly/Cole????oClassicMVTecidos*\n\n#MVTECIDOS #Cole????oClassic'
	window.WAPI.sendMessageToID(enviarPara, msg2);
	await sleep(10000);
	window.WAPI.sendMessageToID(enviarPara, msg3);
}

async function qualTipoTecido(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = 'Oii, joia? Qual tipo de tecidos voc??s trabalham?'	
	window.WAPI.sendMessageToID(enviarPara, msg1);
}


async function compraTecidosMV(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = 'Voc??s compram tecidos no atacado?'	
	window.WAPI.sendMessageToID(enviarPara, msg1);
}

async function colecaoClassicMV(nomeEstabelecimento, cidade, contato){
	
	contato = replaceAll(contato, ' ', '');
	contato = replaceAll(contato, '-', '');
	contato = replaceAll(contato, '(', '');
	contato = replaceAll(contato, ')', '');
	contato = replaceAll(contato, '.', '');
	nomeEstabelecimento = replaceAll(nomeEstabelecimento, "'", "");

	
	cidade = replaceAll(cidade, "'", "");
	
	let enviarPara = '55' + contato + '@c.us'
	let msg1 = 'Boa tarde equipe *'+nomeEstabelecimento +'*, tudo bem? Aqui ?? Marco Tulio da *MV Tecidos*.'
	let msg2 = 'Venho avisar que j?? est?? sendo publicada em nosso instagram a *Cole????o Classic* da MV Tecidos!!\n\n*Confira em https://bit.ly/Cole????oClassicMVTecidos*\n\n#MVTECIDOS #Cole????oClassic'	
	window.WAPI.sendMessageToID(enviarPara, msg1);
	await sleep(20000);
	window.WAPI.sendMessageToID(enviarPara, msg2);
}

async function preenchimentoSite(nomeEstabelecimento, cidade, contatoOriginal, nomeContato, representante = "nenhum", time = 5){
    console.log("||>>>> INICIAR >>>",contatoOriginal)
	let contato = '55' + contatoOriginal + '@c.us'

	let comprimento = `Oi, ${nomeContato}. Identificamos seu preenchimento na loja virtual (loja.mvtecidos.com.br), voc?? permite que eu envie as novidades de cole????es, promo????es e novos produtos da *MV TECIDOS* aqui nesse whatsapp?`
	const resp = await window.WAPI.sendMessageToID(contato, comprimento);

    if(resp === true){
        await sleep(5000);
        window.WAPI.sendMessageToID(contato, 'Meu nome ?? Marco T??lio e estou aqui tamb??m para ajudar e tirar alguma d??vida sua.');
        await sleep(time*1000);
    }
    console.log("||>>>> FINALIZAR >>>", contatoOriginal)
}


async function cadastroSite(nomeEstabelecimento, cidade, contatoOriginal, nomeContato, representante = "nenhum", time = 5){
    console.log("||>>>> INICIAR >>>",contatoOriginal)
	let contato = '55' + contatoOriginal + '@c.us'

	let comprimento = `Oi, ${nomeContato}. Identificamos seu cadastro em nossa loja virtual (loja.mvtecidos.com.br) e n??o foi realizado nenhuma compra. Voc?? ficou com alguma dificuldade, d??vida ou n??o encontrou algum tecido que queira?`
	const resp = await window.WAPI.sendMessageToID(contato, comprimento);

    if(resp === true){
        await sleep(5000);
        window.WAPI.sendMessageToID(contato, 'Meu nome ?? Marco T??lio e estou aqui para ajudar.');
        await sleep(time*1000);
    }
    console.log("||>>>> FINALIZAR >>>", contatoOriginal)
}


function buscarContatoRepresentante(nome){
    var mensagem = ''
    switch (nome) {
        case "nenhum":
                mensagem+=``
            break;
        case 'Larissa':
                mensagem+=`*Contato Representante Larissa*: _https://bit.ly/RepresentanteMVLarissa_`
            break;
        case 'Polyana':
                mensagem+=`*Contato Representante Poliana*: _https://bit.ly/RepresentanteMVPolyana_`
            break;
        case 'Thais':
                mensagem+=`*Contato Representante Thais*: _https://bit.ly/RepresentanteMVThais_`
            break;
        case 'WELKER WERNERSBACH LIPAUS':
                mensagem+=`*Contato Representante Welker*: _https://bit.ly/RepresentanteMVWelker_`
            break;
        case 'BRUNO HENRIQUE OLIVEIRA VALERIANO':
                mensagem+=`*Contato Representante Bruno Henrique*: _https://bit.ly/RepresentanteMVBruno_`
            break;
        case 'TACIANO AUGUSTO MUNDIM PEQUENO MARTINS':
                mensagem+=`*Contato Representante Taciano*: _https://bit.ly/RepresentanteMVTaciano_`
            break;
        case 'GUILHERME GRASTIQUINI CAMARGOS':
                mensagem+=`*Contato Representante Guilherme*: _https://bit.ly/RepresentanteMVGuilherme_`
            break;
        case 'MATHEUS ANTONIO DA CRUZ':
                mensagem+=`*Contato Representante Matheus*: _https://bit.ly/RepresentanteMVMatheuzinho_`
            break;
        default:
                mensagem+=`*Chame seu representante e conhe??a nossa loja virtual*: _https://bit.ly/ConhecaNossaLojaVirtual_`
        }
    return mensagem
    
}
async function correcaoRepresentante(nomeEstabelecimento, cidade, contatoOriginal, nomeContato, representante = "nenhum", time = 5){
    console.log("||>>>> INICIAR >>>",contatoOriginal)
	let contato = '55' + contatoOriginal + '@c.us'

	let comprimento = `Oi, ${nomeContato}. Vou te mandar um novo contato de representante`
	const resp = await window.WAPI.sendMessageToID(contato, comprimento);

    if(resp === true){
        await sleep(5000);
        let mensagem = buscarContatoRepresentante(representante)
        
        window.WAPI.sendMessageToID(contato, mensagem);
        await sleep(time*1000);
    }else{

    }
    console.log("||>>>> FINALIZAR >>>", contatoOriginal)
}


async function newsClienteFiel(contato, site){
    console.log("||>>>> INICIAR >>>",contato)

	mensagem = `J?? criou o cupom de desconto do seu estabelecimento para a Black Friday?\n\nNo sistema administrativo, disponibilizamos imagens personalizadas Black Friday para 3 tipos de cupom:\n\n1?????? BLACKFRIDAY10%\n2?????? BLACKFRIDAY10R$\n3?????? BLACKFRIDAYFRETE\n\nCrie o cupom em Menu ?????? Cadastros ?????? Cupom de Incentivo ?????? Novo cupom \n\nDivulgue a _*imagem ( http://${site}/downloads/imagensTematicas )*_ nas suas redes sociais e envie notifica????o para seus clientes contando da promo????o! \n\nPara enviar notifica????o, acesse o sistema administrativo pelo link: \nMenu (canto esquerdo da tela) ?????? Enviar notifica????o*\n\n*As notifica????es s??o enviadas para as(os) clientes que tem o aplicativo do seu estabelecimento instalado no celular.\n\nQualquer d??vida, conte conosco! ????????`

    window.WAPI.sendImage(base64, contato ,"Black Friday")
    await sleep(3000);
    window.WAPI.sendMessageToID(contato, mensagem);
    await sleep(3000);

    console.log("||>>>> FINALIZAR >>>", contato)
}

var numeroEnviadoMSG


async function sendNewsletter(nome, contatoOriginal, time = 60){
    console.log("||>>>> INICIAR >>>",nome, contatoOriginal)
	let contato = '55' + contatoOriginal + '@c.us'

    const msg = `Bom dia, ${nome}! ??????????\nSemana come??ando com o p?? direito, repleta de dicas e informa????es para agregar ao seu neg??cio e expandir ainda mais seu conhecimento sobre o mundo da moda!\n\nJ?? foram conferir a newsletter da semana? Verifiquem a caixa de *spam* ou *promo????es* e lembrem-se de colocar nosso contato na sua agenda! ????`
	const resp = await window.WAPI.sendMessageToID(contato, msg);
    // frase = Math.floor(Math.random() * (6 - 1)) + 1;

    // comprimento=`Oii, tudo bem?`
	
	// const resp = await window.WAPI.sendMessageToID(contato, newsletter.cabecalho.replace("|NOME|", nome));

    // if(resp === true){
        await sleep(5000);

    //     for (let index = 0; index < newsletter.imgs.length; index++) {
    //         const news = newsletter.imgs[index];
    //         window.WAPI.sendImage(news.base64, numeroEnviadoMSG ,"news", news.link)
    //         // window.WAPI.sendImage(news.base64, numeroEnviadoMSG ,"news")
    //         await sleep(5000);
    //     }

    //     window.WAPI.sendMessageToID(contato, newsletter.rodape);
        
    //     await sleep(time*1000);
    // }else{
    //     console.log("NAO EXISTE")

    // }
    console.log("||>>>> FINALIZAR >>>", nome, contatoOriginal)
}


async function liveMV(contatoOriginal, tipo ,time = 60, nomeCliente = ''){
    console.log("||>>>> INICIAR >>>",contatoOriginal)
	let contato = '55' + contatoOriginal.replace(/\D/gim, '') + '@c.us'
    const mensagem = `????????????????????????????\n\n*Come??a AGORA (??s 19 horas) o MV Preview - Ver??o 22.*\n\n*Hoje (21) at?? o dia 24 ser??o realizadas Lives no Youtube da MV Tecidos, apresentando as tend??ncias para o ver??o 2022.*\n\n*Dia 24, Live da Estamparia, ser?? o lan??amento das Estampas Exclusivas da MV Tecidos.*\n\n*Aproveite os conte??dos e dicas para vc arrasar na melhor esta????o do ano!!*????\n\nLive de hoje acontecer?? no link\n*https://www.youtube.com/watch?v=wvtAM1U0zTA*\n\nAcompanhe pelo site\n*https://mvtecidos.com.br/lives* \n\n*OBS*: Caso voc?? n??o consiga clicar no link, ?? necess??rio que me mande uma mensagem para conseguir`
    nomeCliente = nomeCliente?.substring(0, nomeCliente?.indexOf(' '))
    await window.WAPI.sendMessageToID(contato, `Boaa noiteee ${nomeCliente}`);
    await window.WAPI.sendMessageToID(contato, mensagem);
    console.log("||>>>> FINALIZAR >>>", contatoOriginal)
}

async function newsMV(contatoOriginal, tipo ,time = 60, nomeCliente = ''){
    console.log("||>>>> INICIAR >>>",contatoOriginal)
	let contato = '55' + contatoOriginal.replace(/\D/gim, '') + '@c.us'

    if(nomeCliente === 'sem nome'){
        nomeCliente = ''
    }

    nomeCliente = nomeCliente?.substring(0, nomeCliente?.indexOf(' '))
    let comprimento=`Boa noiteee ${nomeCliente} tudo bem? Marco T??lio da MV Tecidos aqui.`

	
	const resp = await window.WAPI.sendMessageToID(contato, comprimento);
	console.log('resp', resp)

    if(resp === true){
        await sleep(100);
        let nome = ''
        let mensagem = ''

        switch (tipo) {
            case 'live':
                nome = 'live'
                mensagem = `????????????????????????????\n\n*AGORA ?? a Live da Estamparia Brisa, no youtube e instagram da MV Tecidos!!*\n\n*Ser??o apresentadas as Estampas Exclusicas da MV Tecidos e todas as tend??ncias de estamparia para o Ver??o 22!!*\n\n*Aproveite os conte??dos e dicas para vc arrasar na melhor esta????o do ano!!*????\n\n*Veja no v??deo os brindes que ser??o sorteados na LIVE!*\n\nhttps://instagram.com/mvtecidos/live/17926521580627266`
            break;
            case 'tiktok':
                nome = 'tiktok'
                mensagem = `???????????? *NOVIDADE* ????????????\n\nOl??a... Lan??amos agora nosso perfil na plataforma TikTok. Acompanha a gente por l?? tamb??m e veja v??deos como esse que mandei pra voc?? la na plataforma. \n\nAcesse: https://www.tiktok.com/@mvtecidos`
            break;
            case 'avisonewsletter':
                nome = '5MINUTOSLEITURA'
                mensagem = `???? CHEGAMOS! SUA NEWSLETTER DE MODA EST?? EM SEU EMAIL.\n\nA news de hoje foi bem completinha: tivemos indica????o de eventos, projetos sociais, filme levinho de assistir e uma super dica de tend??ncia de modelagem. Confiram o seu email!!\n\nLembrem-se de conferir a caixa de SPAM e adicionar a MV Tecidos na sua agenda! \n\nAinda n??o ?? cadastrado? Se inscreva gratuitamente!\n\nhttps://mvtecidos.com.br/newsletter/`
            break;
            case 'newsletter':
                nome = '5MINUTOSLEITURA'
                mensagem = `???????????? 5 MINUTOS DE LEITURA ????????????\n\n?? o que voc?? precisar?? fazer para se atualizar sobre o mundo da moda de forma GRATUITA!\n\nN??o, isso n??o ?? uma pegadinha. Vai funcionar da seguinte maneira: a equipe da MV Tecidos far?? uma curadoria das not??cias mais importantes e relevantes para voc?? e para o seu neg??cio, reunir?? em um ??nico email que ser?? enviado semanalmente e voc?? s?? precisa ler. Nossa newsletter sobre moda! ????????\n\nSer?? uma leitura r??pida e objetiva, mas sempre deixaremos o link com a mat??ria completa para voc?? ler na ??ntegra quando for do seu interesse, ok?\n\nGostou da ideia? Ent??o n??o perde tempo e cadastre-se atrav??s desse link abaixo ??????\n\nhttps://mvtecidos.us1.list-manage.com/subscribe?u=812faa08e237d7f2e40c4142a&id=52b10a0e52`
                break;
            case 'mostruario':
                nome = 'MOSTRUARIOMV'
                mensagem = `???????????? MOSTRUARIO ONLINE ????????????\n\nVoc?? j?? conhece o mostru??rio online da MV Tecidos? \n\nAgora voc?? tem acesso imediato a todas as novidades, promo????es, tecidos, estampas e bases dispon??veis\n\nEntre agora e solicite seu acesso para visualizar valores e as estampas da estamparia digital.\n\nhttps://mvtecidos.meuspedidos.com.br/solicitar-acesso\n\nCaso voc?? n??o consiga clicar no link, me mande uma mensagem que ficar?? dispon??vel. ????`
                break;
            case 'aquarela':
                nome = 'COLE????OAQUARELA'
                mensagem = `???????????? COLE????O AQUARELA ????????????\n\nA cole????o Aquarela foi desenvolvida inspirada na tend??ncia do ver??o 22, que consiste em estampas feitas com pinceladas e com um toque manual. Cores suaves transmitem muita leveza e frescor, j?? as cores mais vivas trazem toda a energia e o calor do ver??o, trazendo contraste e harmonia para a cole????o. Estampas como florais aquarelados, repletos de nuances maravilhosas v??o deixar a esta????o mais alegre do ano ainda mais exuberante.\n\n?????? Lan??amento oficial ?? hoje no Instagram (@mvtecidos) e no site (https://mvtecidos.meuspedidos.com.br/?categoria=2202966&representada=499691)\n\n?????? E nossa LIVE no Instagram explicando ainda mais nossa cole????o ser?? quinta, dia 20/05. Ative as notifica????es e n??o perca!\n\nCaso voc?? n??o consiga clicar no link, me mande uma mensagem que ficar?? dispon??vel. ????`
                break;
        
            default:
                break;
        }

        try {
            window.WAPI.sendImage(base64, numeroEnviadoMSG , nome)
            console.log(numeroEnviadoMSG)
        } catch (error) {
            
        }
        

        if(mensagem != ''){
            await sleep(500);
            window.WAPI.sendMessageToID(contato, mensagem);
        }
        
        
        await sleep(time*50);
    }else{

    }
    console.log("||>>>> FINALIZAR >>>", contatoOriginal)
}

const contato = WAPI.getAllChats()
var j = 1

function meusChats(){
    WAPI.getAllChats().forEach(e => {
        if(e.id && e.id.server === "c.us"){
            data = new Date(new Date(WAPI.getChat(e.id._serialized).msgs._last.__x_t).getTime() * 1000)
            
            nome = e.name ? e.name : e.contact.pushname ? e.contact.pushname : 'sem nome'

            console.log(nome, " || ", e.id._serialized, " || ", data.getDate()+"/"+data.getMonth()+"/"+data.getFullYear())
        }
    })
}

function mandarAosPoucos(tempo, qtd = 50){
	
	while(contato[contato.length-j].isGroup == true){
	    j++
	}	
	fallowUpMVThais(contato[contato.length-j].id._serialized)
	j++
	qtd--

	setInterval(() => {
    		
		if(qtd >=0 ){
			while(contato[contato.length-j].isGroup == true){
	    			j++
			}
		fallowUpMVThais(contato[contato.length-j].id._serialized)
		j++
		qtd--
		}else{console.log("terminou")}

	}, tempo*1000)
}





console.log('Fim whatsapp');

