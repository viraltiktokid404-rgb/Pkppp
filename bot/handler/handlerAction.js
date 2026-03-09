const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {

	const handlerEvents = require(process.env.NODE_ENV == 'development'
		? "./handlerEvents.dev.js"
		: "./handlerEvents.js"
	)(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {

		// Anti Inbox System
		if (
			global.GoatBot.config.antiInbox == true &&
			(event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
			(event.senderID || event.userID || event.isGroup == false)
		)
			return;

		const message = createFuncMessage(api, event);

		await handlerCheckDB(usersData, threadsData, event);

		// ===== WITHOUT PREFIX SYSTEM (nixPrefix + noPrefix) =====
		if (event.body) {
			const bodyTrim = event.body.trim();
			const commands = global.GoatBot.commands;
			const prefix = global.GoatBot.config.prefix;

			const cmdName = bodyTrim.split(/\s+/)[0].toLowerCase();
			const command = commands.get(cmdName);

			if (command && command.config && (command.config.nixPrefix === true || command.config.noPrefix === true)) {
				const processedBody = prefix + bodyTrim;

				event.body = processedBody;
				event.args = bodyTrim.split(/\s+/).slice(1);
			}
		}
		// =======================================

		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat)
			return;

		const {
			onAnyEvent,
			onFirstChat,
			onStart,
			onChat,
			onReply,
			onEvent,
			handlerEvent,
			onReaction,
			typ,
			presence,
			read_receipt
		} = handlerChat;

		onAnyEvent();

		switch (event.type) {

			case "message":
			case "message_reply":
			case "message_unsend":
				onFirstChat();
				onChat();
				onStart();
				onReply();
				break;

			case "event":
				handlerEvent();
				onEvent();
				break;

			case "message_reaction":
				onReaction();
				break;

			case "typ":
				typ();
				break;

			case "presence":
				presence();
				break;

			case "read_receipt":
				read_receipt();
				break;

			default:
				break;
		}
	};
};
