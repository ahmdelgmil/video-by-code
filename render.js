const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// إعدادات الفيديو
const CONFIG = {
    fps: 30,
    duration: 5, // مدة الفيديو بالثواني (يمكن حسابها ديناميكياً)
    width: 1920,
    height: 1080,
    outputDir: 'frames_gsap',
    finalVideo: 'output_gsap.mp4',
    audioFile: 'input_video.wav' // ملف الصوت الأصلي
};

async function render() {
    console.log("🚀 تشغيل المتصفح...");
    
    // إعداد المجلدات
    fs.emptyDirSync(CONFIG.outputDir);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // لتخفيف الحمل
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: CONFIG.width, height: CONFIG.height });

    // فتح ملف HTML المحلي
    const htmlPath = `file://${path.join(__dirname, 'scene.html')}`;
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });

    console.log("🎨 بدء عملية الرندر (إطار بإطار)...");

    const totalFrames = Math.ceil(CONFIG.duration * CONFIG.fps);

    for (let i = 0; i < totalFrames; i++) {
        const currentTime = i / CONFIG.fps;

        // 1. تحريك الزمن داخل المتصفح لنقطة محددة
        await page.evaluate((time) => {
            if (window.seekTo) window.seekTo(time);
        }, currentTime);

        // 2. التقاط الصورة
        const fileName = `frame_${String(i).padStart(5, '0')}.png`;
        await page.screenshot({ 
            path: path.join(CONFIG.outputDir, fileName),
            type: 'png',
            omitBackground: false 
        });

        // شريط تقدم بسيط
        process.stdout.write(`\r📸 تم التقاط: ${i + 1}/${totalFrames}`);
    }

    await browser.close();
    console.log("\n🎬 تجميع الفيديو باستخدام FFmpeg...");

    // تجميع الفيديو مع الصوت
    // -hwaccel auto: يحاول استخدام كارت الشاشة إن وجد لتسريع العمل
    const ffmpegCmd = `ffmpeg -y -framerate ${CONFIG.fps} -i "${CONFIG.outputDir}/frame_%05d.png" -i "${CONFIG.audioFile}" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "${CONFIG.finalVideo}"`;
    
    try {
        execSync(ffmpegCmd, { stdio: 'inherit' });
        console.log(`✅ تم إنشاء الفيديو: ${CONFIG.finalVideo}`);
        // تنظيف الصور (اختياري)
        // fs.removeSync(CONFIG.outputDir);
    } catch (e) {
        console.error("❌ خطأ في FFmpeg:", e);
    }
}

render();