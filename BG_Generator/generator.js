const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const DATA = fs.readJsonSync('config.json');
const TEMP_DIR = path.join(__dirname, 'temp_frames');
const OUTPUT_DIR = path.join(__dirname, 'output');

async function renderTask(task, global, settings, browser) {
    console.log(`\n🎬 Rendering: ${task.name} [Type: ${task.type}]`);
    fs.emptyDirSync(TEMP_DIR);

    const page = await browser.newPage();
    await page.setViewport({ width: settings.width, height: settings.height });

    const htmlPath = `file://${path.join(__dirname, 'engine.html')}`;
    await page.goto(htmlPath);

    // تنفيذ منطق التوحيد والدمج داخل المتصفح
    await page.evaluate((t, g, s) => { window.init(t, g, s); }, task, global, settings);

    const totalFrames = settings.duration * settings.fps;
    
    for (let i = 0; i < totalFrames; i++) {
        const time = i / settings.fps;
        await page.evaluate((t) => { window.seekTo(t); }, time);
        
        const frameName = `frame_${String(i).padStart(5, '0')}.png`;
        await page.screenshot({ path: path.join(TEMP_DIR, frameName) });

        process.stdout.write(`\r   📸 Progress: ${Math.round((i/totalFrames)*100)}%`);
    }

    await page.close();

    const outputFile = path.join(OUTPUT_DIR, `${task.name}.mp4`);
    // جودة CRF 17 تعطي وضوحاً فائقاً
    const ffmpegCmd = `ffmpeg -y -framerate ${settings.fps} -i "${TEMP_DIR}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -crf 17 "${outputFile}"`;
    
    execSync(ffmpegCmd, { stdio: 'ignore' });
    console.log(`\n   ✅ Exported to output/${task.name}.mp4`);
}

async function main() {
    fs.ensureDirSync(OUTPUT_DIR);
    const browser = await puppeteer.launch({ headless: "new" });

    for (const task of DATA.tasks) {
        await renderTask(task, DATA.global, DATA.settings, browser);
    }

    await browser.close();
    console.log("\n✨ All videos generated successfully!");
}

main();