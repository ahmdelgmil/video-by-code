const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// تحميل الإعدادات
const timelineData = fs.readJsonSync('timeline.json');
const CONFIG = {
    ...timelineData.settings,
    outputDir: path.join(__dirname, 'temp_frames'),
    outputVideo: path.join(__dirname, 'output', 'final_video.mp4')
};

async function render() {
    console.log(`🎬 بدء المشروع: ${CONFIG.width}x${CONFIG.height} @ ${CONFIG.fps}fps`);
    
    // تنظيف
    fs.emptyDirSync(CONFIG.outputDir);
    fs.ensureDirSync(path.dirname(CONFIG.outputVideo));

    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    
    // ضبط حجم الشاشة بدقة
    await page.setViewport({ width: CONFIG.width, height: CONFIG.height, deviceScaleFactor: 1 });

    // تحميل ملف HTML
    const htmlUrl = `file://${path.join(__dirname, 'src', 'template.html')}`;
    await page.goto(htmlUrl, { waitUntil: 'networkidle0' });

    // حقن البيانات وتشغيل المحرك
    await page.evaluate((data) => {
        window.initEngine(data);
    }, timelineData);

    console.log("📸 جاري التقاط الإطارات...");

    const totalFrames = Math.ceil(CONFIG.duration * CONFIG.fps);

    for (let i = 0; i < totalFrames; i++) {
        const time = i / CONFIG.fps;
        
        // تحريك الزمن في المتصفح
        await page.evaluate((t) => { window.seekTo(t); }, time);

        // التقاط الصورة
        const frameNum = String(i).padStart(5, '0');
        await page.screenshot({
            path: path.join(CONFIG.outputDir, `frame_${frameNum}.png`),
            type: 'png'
        });

        // طباعة التقدم
        const progress = Math.round((i / totalFrames) * 100);
        process.stdout.write(`\r[${progress}%] Time: ${time.toFixed(2)}s`);
    }

    await browser.close();
    console.log("\n🎞️ جاري التجميع بـ FFmpeg...");

    // أمر FFmpeg (يدعم الصوت إذا كان موجوداً)
    let cmd = `ffmpeg -y -framerate ${CONFIG.fps} -i "${CONFIG.outputDir}/frame_%05d.png" `;
    if (fs.existsSync(CONFIG.audio)) {
        cmd += `-i "${CONFIG.audio}" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "${CONFIG.outputVideo}"`;
    } else {
        cmd += `-c:v libx264 -pix_fmt yuv420p "${CONFIG.outputVideo}"`;
    }

    try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(`\n✅ تم بنجاح! الفيديو موجود في: ${CONFIG.outputVideo}`);
        // fs.removeSync(CONFIG.outputDir); // حذف الصور المؤقتة
    } catch (e) {
        console.error("❌ حدث خطأ أثناء التجميع:", e.message);
    }
}

render();