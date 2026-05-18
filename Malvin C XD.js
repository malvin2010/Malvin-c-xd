bot.command('mediafire', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (!args.length) return ctx.reply('Gunakan: /mediafire <url>');

    try {
      const { data } = await axios.get(`https://www.velyn.biz.id/api/downloader/mediafire?url=${encodeURIComponent(args[0])}`);
      const { title, url } = data.data;

      const filePath = `/tmp/${title}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);

      const zip = new AdmZip();
      zip.addLocalFile(filePath);
      const zipPath = filePath + '.zip';
      zip.writeZip(zipPath);

      await ctx.replyWithDocument({ source: zipPath }, {
        filename: path.basename(zipPath),
        caption: '📦 File berhasil di-zip dari MediaFire'
      });

      
      fs.unlinkSync(filePath);
      fs.unlinkSync(zipPath);

    } catch (err) {
      console.error('[MEDIAFIRE ERROR]', err);
      ctx.reply('Terjadi kesalahan saat membuat ZIP.');
    }
  });
  
  
  
  bot.command('countryinfo', async (ctx) => {
    try {
      const input = ctx.message.text.split(' ').slice(1).join(' ');
      if (!input) {
        return ctx.reply('Masukkan nama negara setelah perintah.\n\nContoh:\n`/countryinfo Indonesia`', { parse_mode: 'Markdown' });
      }

      const res = await axios.post('https://api.siputzx.my.id/api/tools/countryInfo', {
        name: input
      });

      const { data } = res.data;

      if (!data) {
        return ctx.reply('Negara tidak ditemukan atau tidak valid.');
      }

      const caption = `
🌍 *${data.name}* (${res.data.searchMetadata.originalQuery})
📍 *Capital:* ${data.capital}
📞 *Phone Code:* ${data.phoneCode}
🌐 *Continent:* ${data.continent.name} ${data.continent.emoji}
🗺️ [Google Maps](${data.googleMapsLink})
📏 *Area:* ${data.area.squareKilometers} km²
🏳️ *TLD:* ${data.internetTLD}
💰 *Currency:* ${data.currency}
🗣️ *Languages:* ${data.languages.native.join(', ')}
🧭 *Driving Side:* ${data.drivingSide}
⚖️ *Government:* ${data.constitutionalForm}
🍺 *Alcohol Prohibition:* ${data.alcoholProhibition}
🌟 *Famous For:* ${data.famousFor}
      `.trim();

      await ctx.replyWithPhoto(
        { url: data.flag },
        {
          caption,
          parse_mode: 'Markdown',
        }
      );

     
      if (data.neighbors && data.neighbors.length) {
        const neighborText = data.neighbors.map(n => `🧭 *${n.name}*\n📍 [Maps](https://www.google.com/maps/place/${n.coordinates.latitude},${n.coordinates.longitude})`).join('\n\n');
        await ctx.reply(`🌐 *Negara Tetangga:*\n\n${neighborText}`, { parse_mode: 'Markdown' });
      }

    } catch (err) {
      console.error(err);
      ctx.reply('Gagal mengambil informasi negara. Coba lagi nanti atau pastikan nama negara valid.');
    }
  });
  
  
  
 bot.command("chat", async (ctx) => {
  if (!OPENAI_KEY || !OpenAI) return ctx.reply("⚠️ /chat butuh OPENAI_KEY di config.js");
  const prompt = ctx.message.text.split(" ").slice(1).join(" ");
  if (!prompt) return ctx.reply("❗ /chat <pesan>");
  try {
    const openai = new OpenAI({ apiKey: OPENAI_KEY });
    const r = await openai.chat.completions.create({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] });
    ctx.reply(r.choices[0].message.content.trim());
  } catch { ctx.reply("❌ Gagal menghubungi GPT."); }
});

bot.command("fixcode", async (ctx) => {
  if (!OPENAI_KEY || !OpenAI) return ctx.reply("⚠️ /fixcode butuh OPENAI_KEY di config.js");
  let code = ""; const rep = ctx.message.reply_to_message;
  if (rep?.text) code = rep.text; else code = ctx.message.text.split(" ").slice(1).join(" ");
  if (!code) return ctx.reply("❗ Reply ke kode atau /fixcode <kode>");
  try {
    const openai = new OpenAI({ apiKey: OPENAI_KEY });
    const prompt = `Perbaiki kode berikut agar bebas error dan rapi. Balas hanya dengan kode final:\n\n${code}`;
    const r = await openai.chat.completions.create({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] });
    ctx.reply("✅ Kode diperbaiki:\n\n" + r.choices[0].message.content.trim());
  } catch { ctx.reply("❌ Gagal memperbaiki kode."); }
});


bot.command("anime", async (ctx) => {
  try { const { data } = await axios.get("https://api.waifu.pics/sfw/waifu"); await ctx.replyWithPhoto(data.url); }
  catch { ctx.reply("❌ Gagal mengambil gambar anime"); }
});
bot.command("softanime", async (ctx) => {
  try { const cats=["neko","shinobu","megumin"]; const cat=cats[Math.floor(Math.random()*cats.length)];
    const { data } = await axios.get(`https://api.waifu.pics/sfw/${cat}`);
    await ctx.replyWithPhoto(data.url,{caption:`🐱 ${cat} (SFW)`});
  } catch { ctx.reply("❌ Gagal mengambil softanime"); }
});
bot.command("waifu", async (ctx) => {
  try { const { data } = await axios.get("https://api.waifu.pics/sfw/waifu"); await ctx.replyWithPhoto(data.url,{caption:"🌸 Waifu (SFW)"}); }
  catch { ctx.reply("❌ Gagal mengambil waifu"); }
});
bot.command("rdomquote", async (ctx) => {
  try { const { data } = await axios.get("https://animechan.xyz/api/random");
    ctx.reply(`💬 "${data.quote}"\n— ${data.character} (${data.anime})`);
  } catch { ctx.reply("❌ Gagal mengambil quote"); }
});
bot.command("info", async (ctx) => {
  const q = ctx.message.text.split(" ").slice(1).join(" ");
  if (!q) return ctx.reply("❗ /info <nama_anime>");
  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`);
    if (!data.data?.length) return ctx.reply("❌ Anime tidak ditemukan");
    const a = data.data[0];
    await ctx.replyWithPhoto(a.images?.jpg?.image_url, { caption: `📌 ${a.title}\n⭐ ${a.score ?? "-"}\n📖 ${a.synopsis ?? "-"}` });
  } catch { ctx.reply("❌ Gagal mengambil info anime"); }
});

// ================== TOURl (reply media → URL) ==================
bot.command("tourl", async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("❗ Reply ke media (foto/video/audio/doc/sticker) lalu kirim /tourl");
  try {
    const pick = r.photo?.slice(-1)[0]?.file_id || r.video?.file_id || r.document?.file_id || r.audio?.file_id || r.voice?.file_id || r.sticker?.file_id;
    if (!pick) return ctx.reply("❌ Tidak menemukan media valid.");
    const link = await ctx.telegram.getFileLink(pick);
    ctx.reply(`🔗 ${link}`);
  } catch { ctx.reply("❌ Gagal membuat URL media."); }
});


// ======================= STICKER → URL =====================
bot.command("sticker", async (ctx) => {
  const rep = ctx.message.reply_to_message;
  if (!rep || !rep.sticker) return ctx.reply("❗ Reply ke sticker Telegram.");
  try { const link = await ctx.telegram.getFileLink(rep.sticker.file_id); ctx.reply(`🔗 URL Sticker: ${link}`); }
  catch { ctx.reply("❌ Gagal ambil URL sticker."); }
});

// ======================= IP / GEO / DB =====================
bot.command("myip", async (ctx) => {
  try { const { data } = await axios.get("https://api.ipify.org?format=json"); ctx.reply(`🌐 IP Server: ${data.ip}`); }
  catch { ctx.reply("❌ Gagal ambil IP."); }
});
bot.command("country", async (ctx) => {
  const ip = ctx.message.text.split(" ")[1];
  if (!ip) return ctx.reply("❗ /country <ip>");
  try { const { data } = await axios.get(`https://ipapi.co/${ip}/json/`); ctx.reply(`🌐 IP: ${ip}\nNegara: ${data.country_name}\nKota: ${data.city}`); }
  catch { ctx.reply("❌ Gagal ambil info negara."); }
});
bot.command("ipwhois", async (ctx) => {
  const ip = ctx.message.text.split(" ")[1];
  if (!ip) return ctx.reply("❗ /ipwhois <ip>");
  try { const { data } = await axios.get(`https://ipwhois.app/json/${ip}`); ctx.reply(`🌐 IP: ${data.ip}\nASN: ${data.asn}\nISP: ${data.org}\nNegara: ${data.country}`); }
  catch { ctx.reply("❌ Gagal ambil WHOIS."); }
});
bot.command("getdbuse", async (ctx) => {
  const users = [{ id: 1, name: "Ggz" }, { id: 2, name: "Admin" }];
  ctx.reply(`📂 Database user:\n${JSON.stringify(users, null, 2)}`);
});

bot.command('gpt', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('Penggunaan: /gpt <teks>');

    try {
      const res = await fetch(`https://fastrestapis.fasturl.cloud/aillm/gpt-4o-turbo?ask=${encodeURIComponent(text)}`);
      const json = await res.json();

      if (!json || !json.result) {
        return ctx.reply('Gagal mendapatkan balasan dari AI.');
      }

      const replyText = `*RES YOY*\n\n\`\`\`\n${json.result}\n\`\`\``;

      await ctx.reply(replyText, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error(err);
      ctx.reply('Terjadi kesalahan saat memproses permintaan.');
    }
  });


  // /maintenance_status
  bot.command("maintenancestatus", (ctx) => {
    sessions = loadSessions();
    const status = sessions.maintenance ? "🔴 Sedang Maintenance" : "🟢 Normal";
    const msg = `ℹ️ Status bot: *${status}*\nPesan: ${sessions.customMessage || "-"}\nUsers terdaftar: ${sessions.users.length}`;
    ctx.reply(msg, { parse_mode: "Markdown" });
  });
  

// Command untuk aktifkan maintenance
bot.command("maintenanceon", (ctx) => {
  if (!config.adminIDs.includes(ctx.from.id.toString())) {
    return ctx.reply("❌ Kamu tidak punya izin untuk mengaktifkan maintenance.");
  }
  maintenance = true;
  ctx.reply("✅ Mode *Maintenance* telah diaktifkan.", { parse_mode: "Markdown" });
});



bot.command("nsfwimg", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    const prompt = args.join(" ");
    if (!prompt) {
      return ctx.reply("⚠️ Mohon sertakan prompt. Contoh:\n/nsfwimg furry antro nude on the beach");
    }

    const API_URL = "https://fastrestapis.fasturl.cloud/aiimage/nsfw";

    try {
      const response = await axios.get(API_URL, {
        params: { prompt },
        responseType: "arraybuffer",
        headers: { "accept": "image/png" },
        validateStatus: () => true,
      });

      switch (response.status) {
        case 200:
          return ctx.replyWithPhoto(
            { source: Buffer.from(response.data) },
            { caption: `Prompt: ${prompt}` }
          );

        case 400:
          return ctx.reply("❌ Bad Request: Prompt tidak ditemukan atau invalid.");

        case 403:
          return ctx.reply("🚫 Forbidden: Akses ditolak.");

        case 404:
          return ctx.reply("🔍 Not Found: Tidak ada gambar untuk prompt tersebut.");

        case 429:
          return ctx.reply("⏳ Too Many Requests: Terlalu banyak permintaan, coba lagi nanti.");

        case 500:
          return ctx.reply("💥 Internal Server Error: Terjadi kesalahan server.");

        default:
          return ctx.reply(`⚠️ Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      return ctx.reply("❌ Gagal menghubungi API, coba lagi nanti.");
    }
  });



bot.command('xnxx', async (ctx) => {
    const title = ctx.message.text.split(' ').slice(1).join(' ');
    if (!title) return ctx.reply('✏️ Masukkan judul:\nContoh: /xnxx Lari ada wibu');

    const reply = ctx.message.reply_to_message;
    if (!reply || !reply.photo) {
      return ctx.reply('📸 Balas perintah ini dengan sebuah foto!\nContoh:\n1. Kirim foto\n2. Reply dengan: /xnxx Judulnya');
    }

    try {
      const photo = reply.photo[reply.photo.length - 1]; // resolusi terbesar
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);

      const imageBuffer = (await axios.get(fileLink.href, { responseType: 'arraybuffer' })).data;

      const form = new FormData();
      form.append('title', title);
      form.append('image', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg',
      });

      const apiRes = await axios.post('https://api.siputzx.my.id/api/canvas/xnxx', form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer',
      });

      await ctx.replyWithPhoto({ source: Buffer.from(apiRes.data) });
    } catch (err) {
      console.error(err);
      ctx.reply('❌ Gagal membuat gambar XNXX. Coba lagi nanti.');
    }
  });
  
  
  bot.command('stiktok', async (ctx) => {
    // Ambil keyword dari teks perintah setelah /tiktok
    const keyword = ctx.message.text.split(' ').slice(1).join(' ');
    if (!keyword) {
      return ctx.reply('❌ Mohon masukkan kata kunci. Contoh: /stiktok sad');
    }

    try {
      // Request POST ke API TikTok
      const response = await axios.post('https://api.siputzx.my.id/api/s/tiktok', {
        query: keyword
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = response.data;
      if (!data.status || !data.data || data.data.length === 0) {
        return ctx.reply('⚠️ Tidak ditemukan video TikTok dengan kata kunci tersebut.');
      }

      // Ambil maksimal 3 video untuk balasan agar tidak terlalu panjang
      const videos = data.data.slice(0, 3);
      let replyText = `🔎 Hasil pencarian TikTok untuk: *${keyword}*\n\n`;

      videos.forEach((video, i) => {
        replyText += `🎬 *${video.title.trim()}*\n`;
        replyText += `👤 ${video.author.nickname} (@${video.author.unique_id})\n`;
        replyText += `▶️ [Link Video](${video.play})\n`;
        replyText += `🎵 Musik: ${video.music_info.title} - ${video.music_info.author}\n`;
        replyText += `⬇️ [Download WM](${video.wmplay})\n\n`;
      });

      ctx.replyWithMarkdown(replyText);

    } catch (error) {
      console.error(error);
      ctx.reply('❌ Terjadi kesalahan saat mengambil data TikTok.');
    }
  });


bot.command("videydl", async (ctx) => {
    const input = ctx.message.text.split(" ").slice(1).join(" ");
    
    if (!input || !input.startsWith("http")) {
      return ctx.reply(
        "❌ Kirim perintah dengan menyertakan URL video dari videy.co\nContoh: `/videydl https://videy.co/v?id=XXXX`",
        { parse_mode: "Markdown" }
      );
    }

    await ctx.reply("⏳ Sedang memproses video...");

    try {
      const res = await axios.post(
        "https://fastapi.acodes.my.id/api/downloader/videy",
        { text: input },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.status && res.data?.data) {
        await ctx.replyWithVideo(
          { url: res.data.data },
          { caption: "✅ Video berhasil diunduh dari videy.co!" }
        );
      } else {
        await ctx.reply("❌ Gagal mendapatkan video. Coba cek ulang link-nya.");
      }
    } catch (err) {
      console.error("VideyDL error:", err.message || err);
      ctx.reply("❌ Terjadi kesalahan saat memproses video.");
    }
  });


bot.command("animbrat", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1).join(" ");
    if (!args) {
      return ctx.reply(`❌ Masukkan teks untuk gambar!\n\nContoh:\n/animbrat Halo, aku user lucu | center | image`);
    }

    // Parsing format: /animbrat teks | posisi | mode
    const [text, position, mode] = args.split("|").map(v => v?.trim());

    if (!text) {
      return ctx.reply("❌ Teks tidak boleh kosong.");
    }

    try {
      const res = await axios.get("https://fastrestapis.fasturl.cloud/maker/animbrat", {
        responseType: "arraybuffer",
        params: {
          text,
          position: position || "center",
          mode: mode || "image"
        },
        headers: {
          accept: "image/png"
          // 'x-api-key': 'APIKEY' // opsional
        }
      });

      const buffer = Buffer.from(res.data, "binary");

      const fileType = (mode || "image").toLowerCase() === "animated" ? "video" : "photo";
      const caption = `🎭 Anime Brat\n📝 Teks: ${text}\n📍 Posisi: ${position || "center"}\n🎞️ Mode: ${mode || "image"}`;

      if (fileType === "photo") {
        await ctx.replyWithPhoto({ source: buffer }, { caption });
      } else {
        await ctx.replyWithAnimation({ source: buffer }, { caption });
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      ctx.reply("❌ Gagal membuat gambar Anime Brat. Pastikan format benar atau coba lagi nanti.");
    }
  });

bot.command("ceknegara", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("⚠️ Contoh: /ceknegara id");

  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${args}`);
    const c = res.data[0];

    let msg = `🏴 *Info Negara:*\n\n` +
              `• Nama: ${c.name.common}\n` +
              `• Ibu Kota: ${c.capital ? c.capital[0] : "-"}\n` +
              `• Populasi: ${c.population.toLocaleString()}\n` +
              `• Mata Uang: ${Object.values(c.currencies)[0].name} (${Object.keys(c.currencies)[0]})\n` +
              `• Bahasa: ${Object.values(c.languages).join(", ")}\n` +
              `• Timezone: ${c.timezones.join(", ")}`;

    ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    ctx.reply("❌ Kode negara tidak valid!");
  }
});

// bot.js

// CEK NOMOR TELEPON
bot.command("ceknum", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("⚠️ Contoh: /ceknum +6281234567890");

  try {
    const res = await axios.get(`https://api.apilayer.com/number_verification/validate?number=${args}`, {
      headers: { apikey: config.apilayerKey }
    });

    if (!res.data.valid) return ctx.reply("❌ Nomor tidak valid!");

    const msg = `📱 *Info Nomor:*\n\n` +
                `• Nomor: ${res.data.international_format}\n` +
                `• Negara: ${res.data.country_name} (${res.data.country_code})\n` +
                `• Operator: ${res.data.carrier}\n` +
                `• Tipe: ${res.data.line_type}`;

    ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    ctx.reply("❌ Gagal cek nomor (pastikan APIKEY Api sudah benar)");
  }
});

// CEK DOMAIN
bot.command("cekdomain", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("⚠️ Contoh: /cekdomain google.com");

  try {
    const res = await axios.get(`https://api.api-ninjas.com/v1/whois?domain=${args}`, {
      headers: { "X-Api-Key": config.apiNinjasKey }
    });

    const msg = `🌐 *Info Domain:*\n\n` +
                `• Domain: ${args}\n` +
                `• Registrar: ${res.data.registrar}\n` +
                `• Dibuat: ${res.data.creation_date}\n` +
                `• Expired: ${res.data.expiration_date}\n` +
                `• DNS: ${res.data.name_servers.join(", ")}`;

    ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    ctx.reply("❌ Gagal cek domain (pastikan APIKEY api- sudah benar)");
  }
});




  bot.command('gpt4o', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('Penggunaan: /gpt4o <teks>');

    try {
      const res = await fetch(`https://fastrestapis.fasturl.cloud/aillm/gpt-4o-turbo?ask=${encodeURIComponent(text)}`);
      const json = await res.json();

      if (!json || !json.result) {
        return ctx.reply('Gagal mendapatkan balasan dari AI.');
      }

      const replyText = `*B O C C H I   -   M D*\n\n\`\`\`\n${json.result}\n\`\`\``;

      await ctx.reply(replyText, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error(err);
      ctx.reply('Terjadi kesalahan saat memproses permintaan.');
    }
  });


const axios = require('axios');

module.exports = (bot) => {
  bot.command('githubstalk', async (ctx) => {
    const input = ctx.message.text.split(' ').slice(1).join(' ');
    if (!input) {
      return ctx.reply('Usage: /githubstalk <username>');
    }

    try {
      const response = await axios.post(
        'https://api.siputzx.my.id/api/stalk/github',
        { user: input },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      if (!data.status) {
        return ctx.reply('User not found or API error.');
      }

      const profile = data.data;

      let replyText = `GitHub Profile Info:\n\n`
