const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const T4R1F = {
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘",
  F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝",
  K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢",
  P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧",
  U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬",
  Z: "𝗭"
};

const toFont = (text = "") =>
  text.toUpperCase().split("").map(c => T4R1F[c] || c).join("");

module.exports = {
  config: {
    name: "help",
    version: "1.20",
    author: "AHMED TARIF",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands"
    },
    longDescription: {
      en: "View command usage and list all commands"
    },
    category: "Inform",
    guide: {
      en: "help <page | command name>"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);

    // SHOW COMMAND INFO
    if (args[0] && isNaN(args[0])) {
      const commandName = args[0].toLowerCase();
      const command =
        commands.get(commandName) ||
        commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❌ Command "${commandName}" not found.`);
      }

      const cfg = command.config || {};
      const prefixRequired =
        cfg.prefix === false || cfg.noprefix === true ? "✗" : "✓";

      const response =
`╭─[ 𝐂𝐦𝐝.𝐈𝐧𝐟𝐨𝐫𝐦 ]───⚜
├‣📜 𝐍𝐚𝐦𝐞: ${cfg.name || commandName}${cfg.premium ? " ⚜" : ""}
├‣🪶 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${Array.isArray(cfg.aliases) ? cfg.aliases.join(", ") : "None"}
├‣🔬 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${cfg.version || "1.0"}
├‣⏳ 𝐂𝐨𝐮𝐧𝐭𝐃𝐨𝐰𝐧: ${cfg.countDown || 0}s
├‣👤 𝐂𝐫𝐞𝐝𝐢𝐭𝐬: ${cfg.author || "Unknown"}
├‣🔑 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧: ${roleTextToString(cfg.role)}
├‣📝 𝐆𝐮𝐢𝐝𝐞: ${
  cfg.guide?.en
    ?.replace(/{pn}/g, prefix)
    .replace(/{p}/g, cfg.name) || "No guide available"
}
╰‣📰 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${cfg.longDescription?.en || "No description"}

╭─✦ [ 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 ]
├‣🚩 Prefix Required: ${prefixRequired}
╰‣⚜ Premium: ${cfg.premium ? "✓ ⚜" : "✗"}`;

      const sent = await message.reply(response);
      setTimeout(() => message.unsend(sent.messageID), 80000);
      return;
    }

    // PAGE SYSTEM
    const page = parseInt(args[0]) || 1;
    const perPage = 5;

    const categories = {};

    for (const [name, cmd] of commands) {
      if (cmd.config?.role > role) continue;

      const category = cmd.config?.category || "Uncategorized";
      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }

    const categoryNames = Object.keys(categories);
    const totalPages = Math.ceil(categoryNames.length / perPage);

    const start = (page - 1) * perPage;
    const selected = categoryNames.slice(start, start + perPage);

    let msg = "";

    for (const category of selected) {
      msg += `╭──[ ${toFont(category)} ]`;

      const names = categories[category].sort();
      for (let i = 0; i < names.length; i += 2) {
        const line = names.slice(i, i + 2).map(name => {
          const cmd = commands.get(name);
          return `${name}${cmd?.config?.premium ? " ⚜" : ""}`;
        });
        msg += `\n│${line.join("     ")}`;
      }

      msg += `\n╰──────────↉\n`;
    }

    msg +=
`╭──[Inform]───⚜
├‣Total Cmd [${commands.size}]
├‣Prefix: [${prefix}]
├‣Page: ${page}/${totalPages}
├‣Next: ${prefix}help2 ${page + 1}
├‣Admin: AHMED TARIF ⚜
╰‣ m.me/61552422054139`;

    const sent = await message.reply(msg);
    setTimeout(() => message.unsend(sent.messageID), 80000);
  }
};

function roleTextToString(role) {
  if (role === 0) return "Everyone";
  if (role === 1) return "Group admin";
  if (role === 2) return "Bot admin";
  return "Unknown";
}
