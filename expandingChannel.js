"use strict";
///<reference path="../node_modules/sinusbot/typings/global.d.ts" />
registerPlugin({
    name: "Expanding Channels",
    engine: ">= 1.0.0",
    version: "1.5.2",
    description: "automatic channel creation tool based on need",
    author: "Multivitamin <david.kartnaller@gmail.com",
    backends: ["ts3"],
    vars: [{
            type: "array",
            name: "channels",
            title: "Channels",
            default: [],
            vars: [{
                    type: "channel",
                    name: "parent",
                    title: "Parent Channel",
                    default: "0"
                }, {
                    type: "string",
                    name: "name",
                    title: "Channel Name, use % to indicate the position of the number eg ('Talk %' gets converted to 'Talk 1')",
                    default: ""
                }, {
                    type: "select",
                    name: "numerals",
                    title: "Use Romand or Decimal numbers to show the channel count",
                    options: ["Decimal", "Roman", "Binary"],
                    default: "0"
                }, {
                    type: "number",
                    name: "minKeep",
                    title: "Minimum amount of channels to keep",
                    default: 1
                }, {
                    type: "number",
                    name: "minfree",
                    title: "Minimum amount of free channels to generate (defaults to 1)",
                    default: 1
                }, {
                    type: "number",
                    name: "maximumChannels",
                    title: "Maximum amount of channels to create (0 = unlimited)",
                    default: 0
                }, {
                    type: "number",
                    name: "deleteDelay",
                    title: "Delay in seconds till the channel gets deleted after someone left (0 to disable)",
                    default: 0
                }, {
                    type: "select",
                    name: "deleteMode",
                    title: "Delete Mode",
                    options: [
                        "just delete",
                        "wait for bottom channels to empty"
                    ],
                    default: "0"
                }, {
                    type: "select",
                    name: "codec",
                    title: "Audio codec to use for the channel",
                    options: ["Opus Voice", "Opus Music"],
                    default: "0"
                }, {
                    type: "select",
                    name: "quality",
                    title: "Codec Quality to use for the channel",
                    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                    default: "9"
                }, {
                    type: "number",
                    name: "maxClients",
                    title: "maximum clients which are able to enter (-1 to disable)",
                    default: -1
                }, {
                    type: "string",
                    name: "topic",
                    title: "Channel Topic to set",
                    default: ""
                }, {
                    type: "multiline",
                    name: "description",
                    title: "Channel description:",
                    default: ""
                }, {
                    type: "checkbox",
                    name: "disableEncryption",
                    title: "disable voice encryption?",
                    default: false
                }, {
                    type: "array",
                    name: "names",
                    title: "Custom channel names",
                    default: [],
                    vars: [{
                            type: "number",
                            name: "number",
                            title: "number to replace",
                            default: -1
                        }, {
                            type: "string",
                            name: "value",
                            title: "channel name to use as replacement",
                            default: "__NO_TEXT_GIVEN__"
                        }]
                }, {
                    type: "array",
                    name: "permissions",
                    title: "Set Custom Permissions",
                    vars: [{
                            type: "string",
                            name: "name",
                            title: "Permission name (eg 'b_channel_create_child')",
                            default: "__INVALID__",
                        }, {
                            type: "number",
                            name: "value",
                            title: "Permission value",
                            default: 0,
                        }, {
                            type: "checkbox",
                            name: "skip",
                            title: "Set skip flag?",
                            default: false,
                        }, {
                            type: "checkbox",
                            name: "negate",
                            title: "Set negate flag?",
                            default: false,
                        }],
                    default: []
                }]
        }]
}, (_, { channels }) => {
    const event = require("event");
    const backend = require("backend");
    const INT32_MAX = 2147483647;
    class Roman {
        static upToTen(num, one, five, ten) {
            let value = "";
            switch (num) {
                case 0: return value;
                case 9: return one + ten;
                case 4: return one + five;
            }
            if (num >= 5)
                value = five, num -= 5;
            while (num-- > 0)
                value += one;
            return value;
        }
        static isValid(roman) {
            return (/^(M{0,3})(CM|DC{0,3}|CD|C{0,3})(XC|LX{0,3}|XL|X{0,3})(IX|VI{0,3}|IV|I{0,3})$/).test(roman.toUpperCase());
        }
        static toRoman(arabic) {
            arabic = Math.floor(arabic);
            if (arabic < 0)
                throw new Error("toRoman cannot express negative numbers");
            if (arabic > 3999)
                throw new Error("toRoman cannot express numbers over 3999");
            if (arabic === 0)
                return "nulla";
            let roman = "";
            roman += Roman.upToTen(Math.floor(arabic / 1000), "M", "", ""), arabic %= 1000;
            roman += Roman.upToTen(Math.floor(arabic / 100), "C", "D", "M"), arabic %= 100;
            roman += Roman.upToTen(Math.floor(arabic / 10), "X", "L", "C"), arabic %= 10;
            roman += Roman.upToTen(arabic, "I", "V", "X");
            return roman;
        }
        static toArabic(roman) {
            if (/^nulla$/i.test(roman) || !roman.length)
                return 0;
            const match = roman.toUpperCase().match(/^(M{0,3})(CM|DC{0,3}|CD|C{0,3})(XC|LX{0,3}|XL|X{0,3})(IX|VI{0,3}|IV|I{0,3})$/);
            if (!match)
                throw new Error("toArabic expects a valid roman number");
            let arabic = 0;
            arabic += match[1].length * 1000;
            if (match[2] === "CM") {
                arabic += 900;
            }
            else if (match[2] === "CD") {
                arabic += 400;
            }
            else {
                arabic += match[2].length * 100 + (match[2][0] === "D" ? 400 : 0);
            }
            if (match[3] === "XC") {
                arabic += 90;
            }
            else if (match[3] === "XL") {
                arabic += 40;
            }
            else {
                arabic += match[3].length * 10 + (match[3][0] === "L" ? 40 : 0);
            }
            if (match[4] === "IX") {
                arabic += 9;
            }
            else if (match[4] === "IV") {
                arabic += 4;
            }
            else {
                arabic += match[4].length * 1 + (match[4][0] === "V" ? 4 : 0);
            }
            return arabic;
        }
    }
    let DeleteMode;
    (function (DeleteMode) {
        DeleteMode["SIMPLE"] = "0";
        DeleteMode["WAIT_EMPTY"] = "1";
    })(DeleteMode || (DeleteMode = {}));
    let ExpandingChannelNumeral;
    (function (ExpandingChannelNumeral) {
        ExpandingChannelNumeral["DECIMAL"] = "0";
        ExpandingChannelNumeral["ROMAN"] = "1";
        ExpandingChannelNumeral["BINARY"] = "2";
    })(ExpandingChannelNumeral || (ExpandingChannelNumeral = {}));
    class ExpandingChannel {
        constructor(config) {
            this.channelOpts = {};
            this.channelName = config.name;
            this.parentChannel = config.parent;
            this.minimumKeep = config.minimumKeep;
            this.maximumChannels = config.maximumChannels;
            this.minimumFree = config.minimumFree;
            this.regex = config.regex;
            this.deleteDelay = config.deleteDelay;
            this.channelOpts = config.channelOpts;
            this.numeralMode = config.numeralMode;
            this.permissions = config.permissions;
            this.names = config.names;
            this.deleteMode = config.deleteMode;
            this.handleMoveEvent();
            setTimeout(() => this.checkFreeChannels(), 2 * 1000);
            setInterval(() => this.checkFreeChannels(), 60 * 1000);
        }
        /** register events */
        handleMoveEvent() {
            event.on("channelDelete", (channel, invoker) => {
                if (invoker && invoker.isSelf())
                    return;
                const parent = channel.parent();
                if (!parent || !parent.equals(this.parentChannel))
                    return;
                this.checkFreeChannels();
            });
            event.on("clientMove", ({ fromChannel, toChannel }) => {
                const toParent = toChannel && toChannel.parent();
                const fromParent = fromChannel && fromChannel.parent();
                if (toParent && toParent.equals(this.parentChannel)) {
                    this.checkFreeChannels();
                }
                else if (fromParent && fromParent.equals(this.parentChannel)) {
                    this.checkFreeChannels();
                }
            });
        }
        /** creates a new class from a configuration */
        static from(config) {
            if (!(/\%/).test(config.name))
                throw new Error(`Could not find channel identificator "%" in channel name "${config.name}"`);
            const parent = backend.getChannelByID(config.parent);
            if (!parent)
                throw new Error(`could not find parent channel id ${parent} on expanding channel with name "${config.name}"`);
            if (config.minfree < 1)
                throw new Error(`Minimum free Channels is smaller than 1! (${config.minfree})`);
            const channelOpts = {
                codec: config.codec === "0" ? 4 : 5,
                codecQuality: parseInt(config.quality, 10) + 1,
                maxClients: config.maxClients,
                description: config.description,
                topic: config.topic,
                encrypted: !config.disableEncryption
            };
            const permissions = (config.permissions || []).filter(perm => perm.name !== "__INVALID__").map(perm => {
                if (perm.name !== "i_icon_id")
                    return perm;
                return {
                    ...perm,
                    value: perm.value > INT32_MAX ? perm.value - 0xFFFFFFFF - 1 : perm.value
                };
            });
            const numeralMode = (() => {
                switch (config.numerals) {
                    case "0": return ExpandingChannelNumeral.DECIMAL;
                    case "1": return ExpandingChannelNumeral.ROMAN;
                    case "2": return ExpandingChannelNumeral.BINARY;
                    default: return ExpandingChannelNumeral.DECIMAL;
                }
            })();
            const deleteMode = (() => {
                switch (config.deleteMode) {
                    case "0": return DeleteMode.SIMPLE;
                    case "1": return DeleteMode.WAIT_EMPTY;
                    default: return DeleteMode.SIMPLE;
                }
            })();
            let maximumChannels = 0;
            if (config.maximumChannels > 0) {
                maximumChannels = config.minfree > config.maximumChannels ? config.minfree : config.maximumChannels;
            }
            return new ExpandingChannel({
                name: config.name,
                parent,
                minimumKeep: config.minfree > config.minKeep ? config.minfree : config.minKeep,
                minimumFree: config.minfree,
                maximumChannels,
                deleteDelay: config.deleteDelay * 1000,
                deleteMode,
                channelOpts,
                permissions,
                names: (config.names || []).filter(n => n.number > 0),
                numeralMode,
                regex: new RegExp(`^${config.name
                    .replace(/\(/g, "\\(").replace(/\)/g, "\\)")
                    .replace(/\]/g, "\\]").replace(/\[/g, "\\[")
                    .replace(/\^/g, "\\^").replace(/\./g, "\\.")
                    .replace(/\*/g, "\\*").replace(/\+/g, "\\+")
                    .replace(/\?/g, "\\?").replace(/\%/, "(.*)")}$`)
            });
        }
        /** retrieves a list of subchannels for the specified ExpandingChannel */
        getSubChannels() {
            return backend.getChannels().filter(channel => {
                const parent = channel.parent();
                if (!parent)
                    return false;
                return !!parent.equals(this.parentChannel);
            });
        }
        /**
         * gets all empty relevant channels
         */
        getEmptyChannels() {
            return this.getSubChannels().filter(c => c.getClientCount() === 0);
        }
        /** does a channel check and deletes channels if necessary */
        checkFreeChannels() {
            const channels = this.getSubChannels();
            this.updateChannels(channels);
            let freeChannels = this.getEmptyChannels().length;
            if (freeChannels > this.minimumFree && channels.length > this.minimumKeep) {
                if (this.deleteDelay === 0)
                    return this.deleteChannels();
                this.deleteWithDelay();
            }
            else if (freeChannels < this.minimumFree || channels.length < this.minimumKeep) {
                if (this.channelLimitReached(channels.length))
                    return;
                clearTimeout(this.deleteTimeout);
                this.createChannels(channels, freeChannels);
            }
            else {
                clearTimeout(this.deleteTimeout);
            }
        }
        /** checks if the amount of channel limit has been reached */
        channelLimitReached(amount) {
            return (this.maximumChannels > 0 && amount >= this.maximumChannels);
        }
        /** updates all channel names or deletes them if the name does not match */
        updateChannels(channels) {
            channels.map(channel => {
                const num = this.getNumberFromName(channel.name());
                if (num === 0)
                    return channel.delete();
                const name = this.getChannelName(num);
                if (name === channel.name())
                    return;
                channel.setName(name);
            });
        }
        /** starts a delay to delete channels */
        deleteWithDelay() {
            clearInterval(this.deleteTimeout);
            this.deleteTimeout = setTimeout(() => {
                this.deleteChannels();
            }, this.deleteDelay);
        }
        /** deletes some amount of channels */
        deleteChannels() {
            switch (this.deleteMode) {
                case DeleteMode.SIMPLE:
                    return this.deleteChannelsSimple();
                case DeleteMode.WAIT_EMPTY:
                    return this.deleteChannelsWaitEmpty();
            }
        }
        /** simply deletes all channels till required amount of keepchannels is reached */
        deleteChannelsSimple() {
            let channels = this.getSubChannels();
            const structure = this.getChannelStructureInfo(channels)
                .filter(({ channel }) => channel.getClientCount() === 0);
            while (structure.length >= this.minimumFree && channels.length >= this.minimumKeep) {
                const info = structure.pop();
                if (!info)
                    continue;
                channels = channels.filter(c => !c.equals(info.channel));
                info.channel.delete();
            }
        }
        /** delete only channels which are below the channel with users in them */
        deleteChannelsWaitEmpty() {
            let channels = this.getSubChannels();
            let structure = this.getChannelStructureInfo(channels).reverse();
            let totalEmpty = structure.filter(({ channel }) => channel.getClientCount() === 0).length;
            let flagClients = false;
            structure = structure.filter(({ channel }) => {
                flagClients = flagClients || channel.getClientCount() > 0;
                return !flagClients && channel.getClientCount() === 0;
            });
            while (totalEmpty > this.minimumFree &&
                channels.length > this.minimumKeep &&
                structure.length > 0) {
                const info = structure.shift();
                totalEmpty--;
                if (!info)
                    continue;
                channels = channels.filter(c => !c.equals(info.channel));
                info.channel.delete();
            }
        }
        /** creates the required amount of channels */
        createChannels(channels, freeChannels) {
            while ((freeChannels++ < this.minimumFree || channels.length < this.minimumKeep) && !this.channelLimitReached(channels.length)) {
                const structure = this.getChannelStructureInfo(channels);
                const num = this.getNextFreeNumber(structure);
                channels.push(this.createChannel(num, (num === 1 || structure.length === 0) ? "0" : structure[num - 2].channel.id()));
            }
        }
        /** get a set of channels with its channel order number */
        getChannelStructureInfo(channels) {
            return channels
                .map(c => ({ channel: c, n: this.getNumberFromName(c.name()) }))
                .sort((c1, c2) => c1.n - c2.n);
        }
        /** creates a channel and sets all necessary parameters */
        createChannel(num, position) {
            const channel = backend.createChannel({
                name: this.getChannelName(num),
                parent: this.parentChannel.id(),
                permanent: true,
                position,
                ...this.channelOpts
            });
            if (!channel)
                throw new Error("error while trying to create a channel!");
            this.permissions.forEach(perm => {
                const permission = channel.addPermission(perm.name);
                permission.setValue(perm.value);
                if (perm.skip)
                    permission.setSkip(true);
                if (perm.negate)
                    permission.setNegated(true);
                const ok = permission.save();
                if (!ok)
                    console.log(`there was a problem saving a permission!`, { perm });
            });
            return channel;
        }
        /** gets the next free channel number in the structure */
        getNextFreeNumber(structure) {
            const taken = structure.map(c => c.n);
            let i = 0;
            while (taken.includes(++i)) { }
            return i;
        }
        /**
         * retrieves the channels order number
         * @param name channel name to check
         */
        getNumberFromName(name) {
            const replacement = this.names.find(n => n.value === name);
            if (replacement)
                return replacement.number;
            const match = name.match(this.regex);
            if (!match)
                return 0;
            if ((/^\d+$/).test(match[1])) {
                return parseInt(match[1], 10);
            }
            else if (Roman.isValid(match[1])) {
                return Roman.toArabic(match[1]);
            }
            else if ((/^([01]{4} ?)*$/).test(match[1])) {
                return parseInt(match[1].split("").filter(char => ["0", "1"].includes(char)).join(""), 2);
            }
            else {
                return 0;
            }
        }
        /**
         * gets the actual name for this channel
         * @param num
         */
        getChannelName(num) {
            const name = this.names.find(n => n.number === num);
            if (name)
                return name.value;
            const str = (() => {
                switch (this.numeralMode) {
                    case ExpandingChannelNumeral.BINARY:
                        let str = num.toString(2);
                        if (str.length % 8 !== 0) {
                            str = new Array(8 - str.length % 8).fill("0").join("") + str;
                        }
                        return str.split("").map((s, i) => ((i + 1) % 4 === 0) ? `${s} ` : s).join("");
                    case ExpandingChannelNumeral.ROMAN:
                        return Roman.toRoman(num);
                    case ExpandingChannelNumeral.DECIMAL:
                    default:
                        return String(num);
                }
            })();
            return this.channelName.replace(/\%/, str);
        }
    }
    if (backend.isConnected()) {
        init();
    }
    else {
        event.on("connect", () => init());
    }
    function init() {
        channels.forEach(config => {
            ExpandingChannel.from(config);
        });
    }
});
