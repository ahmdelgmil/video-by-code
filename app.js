const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

// إعدادات الفيديو
const CONFIG = {
    width: 1920,
    height: 1080,
    fps: 30, // 30 إطار في الثانية
    duration: 60, // مدة الفيديو بالثواني (دقيقة كاملة)
    outputFile: 'linux_customization.mp4'
};

// محتوى HTML/CSS/JS الذي سيتم تشغيله داخل المتصفح
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/TextPlugin.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Fira+Code&display=swap');
        
        body { margin: 0; padding: 0; overflow: hidden; background: #1a1a1a; font-family: 'Inter', sans-serif; }
        
        /* الخلفية والشبكة */
        .desktop { width: 1920px; height: 1080px; position: relative; background: linear-gradient(135deg, #2c3e50, #000000); overflow: hidden; }
        .grid { position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background-image: linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px);
            background-size: 50px 50px; opacity: 0.3; }

        /* شريط العنوان العلوي */
        .top-bar { position: absolute; top: 0; width: 100%; height: 30px; background: rgba(0,0,0,0.5); display: flex; justify-content: space-between; align-items: center; padding: 0 20px; color: white; font-size: 14px; z-index: 100; }

        /* النوافذ */
        .window { position: absolute; background: #2d2d2d; border-radius: 10px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; opacity: 0; transform: scale(0.8); border: 1px solid #444; }
        .win-header { height: 40px; background: #3d3d3d; display: flex; align-items: center; padding: 0 15px; border-bottom: 1px solid #555; }
        .win-dots { display: flex; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red { background: #ff5f56; } .dot.yellow { background: #ffbd2e; } .dot.green { background: #27c93f; }
        .win-title { flex-grow: 1; text-align: center; color: #ccc; font-weight: bold; }
        .win-body { padding: 20px; color: white; height: calc(100% - 40px); box-sizing: border-box; }

        /* نافذة الإعدادات */
        #tweaks-win { width: 800px; height: 500px; top: 200px; left: 560px; }
        .toggle-row { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center; background: #333; padding: 10px; border-radius: 8px; }
        .toggle { width: 50px; height: 26px; background: #555; border-radius: 15px; position: relative; }
        .toggle-knob { width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; }
        
        /* الترمينال */
        #term-win { width: 700px; height: 400px; top: 300px; left: 610px; background: #0f0f0f; font-family: 'Fira Code', monospace; }
        .term-content { color: #0f0; font-size: 16px; line-height: 1.5; }
        
        /* الـ Dock السفلي */
        .dock { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(150px); 
            background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 15px; border-radius: 20px; display: flex; gap: 20px; border: 1px solid rgba(255,255,255,0.2); transition: width 0.3s; }
        .app-icon { width: 60px; height: 60px; background: #ccc; border-radius: 15px; position: relative; transition: transform 0.2s; }
        
        /* النصوص التوضيحية */
        .overlay-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
            font-size: 80px; font-weight: bold; color: white; text-shadow: 0 0 20px rgba(0,0,0,0.8); opacity: 0; text-align: center; width: 100%; }

        /* الماوس */
        .cursor { width: 20px; height: 20px; position: absolute; top: 0; left: 0; z-index: 9999; pointer-events: none; }
        .cursor svg { width: 100%; height: 100%; fill: white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }

    </style>
</head>
<body>
    <div class="desktop">
        <div class="grid"></div>
        <div class="top-bar">
            <span>Activities</span>
            <span>Jan 25 12:00 PM</span>
            <span>User</span>
        </div>

        <!-- النصوص -->
        <h1 class="overlay-text" id="title1">Linux Customization</h1>
        <h1 class="overlay-text" id="title2">Step 1: The Basics</h1>
        <h1 class="overlay-text" id="title3">Step 2: Terminal</h1>
        <h1 class="overlay-text" id="title4">The Result</h1>

        <!-- نافذة Tweaks -->
        <div class="window" id="tweaks-win">
            <div class="win-header">
                <div class="win-dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
                <div class="win-title">GNOME Tweaks</div>
            </div>
            <div class="win-body">
                <div class="toggle-row">
                    <span>Window Buttons</span>
                    <div class="toggle" id="t1"><div class="toggle-knob"></div></div>
                </div>
                <div class="toggle-row">
                    <span>Animations</span>
                    <div class="toggle" id="t2"><div class="toggle-knob"></div></div>
                </div>
                 <div class="toggle-row">
                    <span>Shell Theme</span>
                    <div class="toggle" id="t3"><div class="toggle-knob"></div></div>
                </div>
            </div>
        </div>

        <!-- نافذة الترمينال -->
        <div class="window" id="term-win">
             <div class="win-header" style="background:#222;">
                <div class="win-dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
                <div class="win-title">Terminal</div>
            </div>
            <div class="win-body">
                <div class="term-content">user@linux:~$ <span id="typewriter"></span><span class="cursor-blink">|</span></div>
            </div>
        </div>

        <!-- الـ Dock -->
        <div class="dock">
            <div class="app-icon" style="background: linear-gradient(45deg, #ff9966, #ff5e62);"></div>
            <div class="app-icon" style="background: linear-gradient(45deg, #56ab2f, #a8e063);"></div>
            <div class="app-icon" style="background: linear-gradient(45deg, #4568dc, #b06ab3);"></div>
            <div class="app-icon" style="background: linear-gradient(45deg, #11998e, #38ef7d);"></div>
            <div class="app-icon" style="background: #333;"></div>
        </div>

        <!-- الماوس -->
        <div class="cursor">
            <svg viewBox="0 0 24 24"><path d="M4,2 L20,18 L12,18 L16,24 L12,24 L8,18 L4,24 Z" /></svg>
        </div>
    </div>

    <script>
        // تسجيل الإضافات
        gsap.registerPlugin(TextPlugin);

        // إنشاء التايم لاين الرئيسي
        // نجعل التايم لاين متوقفاً مؤقتاً لنتحكم فيه من Node.js
        const tl = gsap.timeline({ paused: true });

        // === المشهد 1: المقدمة ===
        tl.to("#title1", { opacity: 1, duration: 1, y: -20, ease: "power2.out" })
          .to("#title1", { opacity: 0, duration: 0.5, delay: 2 });

        // === المشهد 2: الإعدادات ===
        tl.to("#title2", { opacity: 1, duration: 0.5 })
          .to("#title2", { opacity: 0, duration: 0.5, delay: 1 })
          
          // ظهور نافذة Tweaks
          .to("#tweaks-win", { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" })
          
          // حركة الماوس لتفعيل خيار
          .to(".cursor", { x: 750, y: 280, duration: 1.5, ease: "power2.inOut" })
          .to(".cursor", { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 }) // Click effect
          .to("#t1 .toggle-knob", { x: 24, duration: 0.2, backgroundColor: "#27c93f" }) // Toggle ON
          .to("#t1", { backgroundColor: "#27c93f", duration: 0.2 }, "<")
          
          .to(".cursor", { x: 750, y: 350, duration: 1 })
          .to(".cursor", { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
          .to("#t2 .toggle-knob", { x: 24, duration: 0.2, backgroundColor: "#27c93f" })
          .to("#t2", { backgroundColor: "#27c93f", duration: 0.2 }, "<")

          // إغلاق النافذة بتأثير (Genie Effect بسيط)
          .to("#tweaks-win", { scaleY: 0, scaleX: 0.1, y: 500, opacity: 0, duration: 0.8, ease: "power2.in" });

        // === المشهد 3: ظهور الدوك ===
        tl.to(".dock", { y: 0, duration: 1, ease: "elastic.out(1, 0.75)" }, "-=0.5")
          .from(".app-icon", { y: 50, opacity: 0, stagger: 0.1, duration: 0.5 }, "<+0.2");

        // === المشهد 4: الترمينال والكتابة ===
        tl.to("#title3", { opacity: 1, duration: 0.5 })
          .to("#title3", { opacity: 0, duration: 0.5, delay: 1 })
          
          .to("#term-win", { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" })
          .to(".cursor", { x: 800, y: 400, duration: 1 }) // Move cursor away
          
          // تأثير الكتابة
          .to("#typewriter", { text: "sudo dnf install gnome-tweaks", duration: 2, ease: "none" })
          .to(".term-content", { text: "user@linux:~$ sudo dnf install gnome-tweaks<br>[sudo] password for user:<br>Downloading packages...<br>Complete!", duration: 0.1, delay: 0.5 })
          .to("#typewriter", { text: "", duration: 0 }) // reset span
          .to(".term-content", { text: "user@linux:~$ sudo dnf install gnome-tweaks<br>[sudo] password for user:<br>Downloading packages...<br>Complete!<br>user@linux:~$ ./apply_mac_theme.sh", duration: 2, delay: 0.5 })
          
          // "تطبيق" الثيم وتغيير الخلفية
          .to(".desktop", { background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", duration: 2 }, "+=1")
          .to("#term-win", { opacity: 0, scale: 0.9, duration: 0.5 }, "<");

        // === المشهد 5: النتيجة النهائية ===
        tl.to("#title4", { opacity: 1, duration: 1, scale: 1.5 })
          .to(".dock", { scale: 1.1, duration: 0.5, yoyo: true, repeat: 1 })
          .to("#title4", { opacity: 0, duration: 2, delay: 3 }); // Fade out to end

        // دالة للتحكم في الوقت من الخارج
        window.seekTo = (time) => {
            tl.seek(time);
        };
    </script>
</body>
</html>
`;

(async () => {
    console.log('🎬 Starting video generation...');
    
    // 1. تشغيل المتصفح
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // تعيين حجم الصفحة
    await page.setViewport({ width: CONFIG.width, height: CONFIG.height });

    // 2. تحميل المحتوى
    await page.setContent(htmlContent);

    // انتظار تحميل GSAP
    await page.waitForFunction(() => window.gsap);

    // 3. إعداد FFmpeg
    // نستخدم pipe لإرسال الصور مباشرة لـ ffmpeg بدلاً من حفظها
    const ffmpeg = spawn('ffmpeg', [
        '-y', // الكتابة فوق الملفات القديمة
        '-f', 'image2pipe', // نوع المدخلات: صور عبر pipe
        '-vcodec', 'png', // تنسيق الصور القادمة
        '-r', CONFIG.fps, // معدل الإطارات
        '-i', '-', // المدخل هو stdin
        '-c:v', 'libx264', // ترميز الفيديو
        '-pix_fmt', 'yuv420p', // لتوافقية عالية مع المشغلات
        '-preset', 'ultrafast', // سرعة المعالجة (يمكن تغييرها لـ medium لجودة أعلى)
        '-crf', '18', // الجودة (أقل = أفضل)
        CONFIG.outputFile
    ]);

    ffmpeg.stderr.on('data', (data) => {
        // يمكن تفعيل هذا السطر لمراقبة الـ logs الخاصة بـ ffmpeg
        // console.log(`FFmpeg: ${data}`);
    });

    // 4. حلقة الرندر (Render Loop)
    const totalFrames = CONFIG.duration * CONFIG.fps;
    
    console.log(`🖼️ Rendering ${totalFrames} frames...`);

    for (let i = 0; i < totalFrames; i++) {
        const currentTime = i / CONFIG.fps;

        // تحريك الانيميشن للوقت المحدد
        await page.evaluate((t) => {
            window.seekTo(t);
        }, currentTime);

        // التقاط الصورة كـ Buffer
        const screenshotBuffer = await page.screenshot({ type: 'png' });

        // إرسال الصورة لـ FFmpeg
        ffmpeg.stdin.write(screenshotBuffer);

        // طباعة نسبة التقدم
        if (i % CONFIG.fps === 0) {
            const progress = ((i / totalFrames) * 100).toFixed(1);
            console.log(`⏳ Progress: ${progress}% (${i}/${totalFrames} frames)`);
        }
    }

    // 5. إنهاء العمليات
    ffmpeg.stdin.end(); // إخبار FFmpeg أننا انتهينا
    
    // ننتظر حتى ينتهي FFmpeg تماماً
    await new Promise((resolve) => {
        ffmpeg.on('close', resolve);
    });

    await browser.close();
    console.log(`✅ Video saved to ${CONFIG.outputFile}`);
})();