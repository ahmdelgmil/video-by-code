const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const DATA = fs.readJsonSync('config.json');
const TEMP_DIR = path.join(__dirname, 'temp_frames');
const OUTPUT_DIR = path.join(__dirname, 'output');

async function renderTask(task, settings, browser) {
    console.log(`\n🎬 Rendering Task: ${task.name} (${task.type})`);
    fs.emptyDirSync(TEMP_DIR);

    const page = await browser.newPage();
    await page.setViewport({ width: settings.width, height: settings.height });

    const htmlPath = `file://${path.join(__dirname, 'engine.html')}`;
    await page.goto(htmlPath);

    // تهيئة التأثير
    await page.evaluate((t, s) => { window.init(t, s); }, task, settings);

    const totalFrames = settings.duration * settings.fps;
    
    for (let i = 0; i < totalFrames; i++) {
        const time = i / settings.fps;
        await page.evaluate((t) => { window.seekTo(t); }, time);
        
        const frameName = `frame_${String(i).padStart(5, '0')}.png`;
        await page.screenshot({ path: path.join(TEMP_DIR, frameName), type: 'png' });

        const progress = Math.round((i / totalFrames) * 100);
        process.stdout.write(`\r   📸 Progress: [${progress}%] Frame: ${i}/${totalFrames}`);
    }

    await page.close();

    // التجميع بواسطة FFmpeg
    const outputFile = path.join(OUTPUT_DIR, `${task.name}.mp4`);
    const ffmpegCmd = `ffmpeg -y -framerate ${settings.fps} -i "${TEMP_DIR}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 "${outputFile}"`;
    
    try {
        execSync(ffmpegCmd, { stdio: 'ignore' });
        console.log(`\n   ✅ Exported: ${task.name}.mp4`);
    } catch (err) {
        console.error(`\n   ❌ FFmpeg Error on ${task.name}:`, err.message);
    }
}

async function main() {
    console.log("🚀 Starting Pro Background Generator System...");
    fs.ensureDirSync(OUTPUT_DIR);

    const browser = await puppeteer.launch({ headless: "new" });

    for (const task of DATA.tasks) {
        await renderTask(task, DATA.settings, browser);
    }

    await browser.close();
    console.log("\n✨ All tasks completed successfully!");
}

main();