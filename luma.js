import { LumaAI } from "lumaai";
import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const client = new LumaAI({ authToken: process.env.LUMA_AI_API_KEY });

console.log("luma client: ", client);

async function textToVideo(prompt) {
  let generation = await client.generations.create({
    prompt: prompt,
  });

  let completed = false;

  while (!completed) {
    generation = await client.generations.get(generation.id);

    if (generation.state === "completed") {
      completed = true;
    } else if (generation.state === "failed") {
      throw new Error(`Generation failed: ${generation.failure_reason}`);
    } else {
      console.log("Dreaming...");
      await new Promise((r) => setTimeout(r, 3000)); // Wait for 3 seconds
    }
  }

  const videoUrl = generation.assets.video;

  const response = await fetch(videoUrl);
  const fileStream = fs.createWriteStream(`${generation.id}.mp4`);

  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  console.log(`File downloaded as ${generation.id}.mp4`);
}

async function imageToVideo(imageUrl, prompt, options = { loop: false }) {
  const generation = await client.generations.create({
    prompt: prompt,
    keyframes: {
      frame0: {
        type: "image",
        url: imageUrl,
      },
    },
  });

  let completed = false;

  while (!completed) {
    generation = await client.generations.get(generation.id);

    if (generation.state === "completed") {
      completed = true;
    } else if (generation.state === "failed") {
      throw new Error(`Generation failed: ${generation.failure_reason}`);
    } else {
      console.log("Dreaming...");
      await new Promise((r) => setTimeout(r, 3000)); // Wait for 3 seconds
    }
  }

  const videoUrl = generation.assets.video;

  const response = await fetch(videoUrl);
  const fileStream = fs.createWriteStream(`${generation.id}.mp4`);

  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  console.log(`File downloaded as ${generation.id}.mp4`);
}

async function extendVideo(videoId, prompt) {
  const generation = await client.generations.create({
    prompt: prompt,
    keyframes: {
      frame0: {
        type: "generation",
        id: videoId,
      },
    },
  });
}

export { textToVideo, imageToVideo, extendVideo };
