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
const { createClient } = require("@supabase/supabase-js");
import("node-fetch");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const supabase = createClient(process.env.SUPA_URL, process.env.SUPA_TOKEN);

// Map to store temporary data in
messages = new Map();

// Register the context menu command
client.once("ready", async () => {
  const reviewCommand = {
    name: "Review Art Contest Submission",
    type: ApplicationCommandType.Message,
  };

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  await guild.commands.create(reviewCommand);
  console.log("Review command registered");
});

client.on("interactionCreate", async (interaction) => {
  // Allow only users with the correct role to access the command
  if (
    !interaction.member.roles.cache.some(
      (role) => role.id === process.env.MODERATION_ROLE_ID
    )
  ) {
    await interaction.reply({
      content: "You do not have permission to use this command",
      ephemeral: true,
    });
    return null;
  }

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

    // temporarily store some data outside of the scope
    messages.set(interaction.user.id, {
      message: interaction.targetMessage.content,
      attachments: attachments,
      user: interaction.targetMessage.author.username,
      user_id: interaction.user.id,
    });

    // if there's no attachment, there's nothing to submit
    if (attachments.size == 0) {
      await interaction.reply({
        content: `No attachments found in message`,
        ephemeral: true,
      });
      return;
    }

    // Create text input fields
    const username = new TextInputBuilder()
      .setCustomId("userNameInput")
      .setLabel("Contestant")
      .setStyle(TextInputStyle.Short)
      .setValue(messages.get(interaction.user.id).user)
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
    // process submitted data from modal
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === `modal_${interaction.user.id}`
  ) {
    const userNameInput = interaction.fields.getTextInputValue("userNameInput");
    const descriptionInput =
      interaction.fields.getTextInputValue("descriptionInput");
    const excludedImages =
      interaction.fields.getTextInputValue("exclusionInput");

    // filter submission to only desired images
    excludedAttachments = new Set(
      excludedImages.split(",").map((i) => parseInt(i) - 1)
    );
    filteredAttachments = messages
      .get(interaction.user.id)
      .attachments.filter((_, index) => !excludedAttachments.has(index));

    // show message to user of succesful submission
    await interaction.reply({
      content: `Username: ${userNameInput}\nDescription: ${descriptionInput}\nExcluded Images: ${excludedImages}\nOriginal message: ${
        messages.get(interaction.user.id).message
      }\nAttachments: \n ${filteredAttachments
        .map((attachment, index) => `\t${index + 1}. ${attachment}`)
        .join("\n")}`,
      ephemeral: true,
    });

    // add entry to database using data from modal and original message, return is uuid of inserted row
    insertRes = await addEntry(
      userNameInput,
      messages.get(interaction.user.id).user_id,
      descriptionInput,
      filteredAttachments
    );

    // upload images, connect to uuid of previously inserted row using naming
    var uploadNum = 1;
    if (filteredAttachments) {
      for (const attachment of filteredAttachments) {
        var filePath = insertRes.id;
        if (filteredAttachments.length > 1) {
          filePath = `${insertRes.id}_${uploadNum}`;
        }
        await uploadFile(filePath, attachment);

        uploadNum++;
      }
    }
  }
});

// insert submission data into database
async function addEntry(user, user_id, description, attachments) {
  try {
    const { data, error } = await supabase
      .from("entries")
      .insert({
        discord_name: user,
        message: description,
        image_count: attachments.length,
        contest_id: "07fb9134-ea1b-45ea-aafd-1b72d80bc32c",
        canvote: true,
        discord_id: user_id,
      })
      .select("id");

    if (error) {
      console.error("error: ", error);
      return null;
    }

    console.log("inserted: ", data);
    return data[0];
  } catch (err) {
    console.error("unexpected error: ", err);
    return null;
  }
}

// upload images to bucket
async function uploadFile(filePath, fileUrl) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("failed to fetch: ", response.statusText);
    }

    const fileData = await response.arrayBuffer();
    const contentType = response.headers.get("content-type");

    const { data, error } = await supabase.storage
      .from("Submissions")
      .upload(filePath, fileData, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("error: ", error);
      return null;
    }

    console.log("File uploaded: ", filePath);
    return data;
  } catch (err) {
    console.error("unexpected: ", err);
    return null;
  }
}

client.login(process.env.DISCORD_TOKEN);
