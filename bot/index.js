const {
  Client,
  GatewayIntentBits,
  ApplicationCommandType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionType,
} = require("discord.js");
require("dotenv/config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

messages = new Map();

// Register the context menu command
client.once("ready", async () => {
  const reviewCommand = {
    name: "Review Art Contest Submission",
    type: ApplicationCommandType.Message,
  };

  const guild = client.guilds.cache.get("172998246602506241");
  await guild.commands.create(reviewCommand);
  console.log("Review command registered");
});

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isMessageContextMenuCommand() &&
    interaction.commandName === "Review Art Contest Submission"
  ) {
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId(`modal_${interaction.user.id}`)
      .setTitle("Input Modal");

    attachments = [];
    interaction.targetMessage.attachments.forEach((e) => {
      attachments.push(e.attachment);
    });

    messages.set(interaction.user.id, {
      message: interaction.targetMessage.content,
      attachments: attachments,
      user: interaction.user.globalName,
    });

    console.log(messages);

    if (attachments.size == 0) {
      await interaction.reply({
        content: `No attachments found in message`,
        ephemeral: true,
      });
      return;
    }

    // Create a text input field
    const username = new TextInputBuilder()
      .setCustomId("userNameInput")
      .setLabel("Contestant")
      .setStyle(TextInputStyle.Short)
      .setValue(interaction.member.user.globalName)
      .setRequired(true);

    const description = new TextInputBuilder()
      .setCustomId("descriptionInput")
      .setLabel("Description")
      .setStyle(TextInputStyle.Paragraph)
      .setValue(messages.get(interaction.user.id).message)
      .setRequired(false);

    const excludedImages = new TextInputBuilder()
      .setCustomId("exclusionInput")
      .setLabel(
        `Exclude images (1-${
          messages.get(interaction.user.id).attachments.length
        })`
      )
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Empty to include all images, separate with comma")
      .setRequired(false);

    const usernameRow = new ActionRowBuilder().addComponents(username);
    const descriptionRow = new ActionRowBuilder().addComponents(description);
    const imagesRow = new ActionRowBuilder().addComponents(excludedImages);
    modal.addComponents(usernameRow, descriptionRow, imagesRow);

    // Show the modal to the user
    await interaction.showModal(modal);
  } else if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === `modal_${interaction.user.id}`
  ) {
    const userNameInput = interaction.fields.getTextInputValue("userNameInput");
    const descriptionInput =
      interaction.fields.getTextInputValue("descriptionInput");
    const excludedImages =
      interaction.fields.getTextInputValue("exclusionInput");

    excludedAttachments = new Set(
      excludedImages.split(",").map((i) => parseInt(i) - 1)
    );

    filteredAttachments = attachments.filter(
      (_, index) => !excludedAttachments.has(index)
    );

    await interaction.reply({
      content: `Username: ${userNameInput}\nDescription: ${descriptionInput}\nExcluded Images: ${excludedImages}\nOriginal message: ${
        messages.get(interaction.user.id).message
      }\nAttachments: \n ${filteredAttachments
        .map((attachment, index) => `\t${index + 1}. ${attachment}`)
        .join("\n")}`,
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
