window.initEngine = (data) => {
    // 1. إعداد المسرح
    const viewport = document.getElementById('viewport');
    // طبقة الكاميرا: هي التي سنحركها لعمل Zoom/Pan
    const cameraLayer = document.getElementById('camera-layer'); 
    
    viewport.style.width = `${data.settings.width}px`;
    viewport.style.height = `${data.settings.height}px`;

    const masterTl = gsap.timeline({ paused: true });

    // ======================================================
    // 🎥 نظام الكاميرا الافتراضية (Virtual Camera System)
    // ======================================================
    // x, y: النقطة التي نريد التركيز عليها (بالبكسل)
    // scale: مقدار التقريب (1 = عادي، 3 = تقريب قوي)
    const moveCamera = (x, y, scale, duration, ease = "power2.inOut") => {
        // الحسابات لجعال النقطة (x,y) هي مركز الشاشة
        const vWidth = data.settings.width;
        const vHeight = data.settings.height;
        
        const targetX = (vWidth / 2) - (x * scale);
        const targetY = (vHeight / 2) - (y * scale);

        return gsap.to(cameraLayer, {
            x: targetX,
            y: targetY,
            scale: scale,
            duration: duration,
            ease: ease
        });
    };

    // ======================================================
    // 🎬 معالجة طبقات الفيديو (Video Sync)
    // ======================================================
    // بما أن Puppeteer يلتقط صوراً ثابتة، يجب أن نحرك وقت الفيديو يدوياً
    const videoElements = [];

    data.layers.forEach(layer => {
        let el;
        
        // --- نوع الفيديو (تسجيل الشاشة) ---
        if (layer.type === 'video') {
            el = document.createElement('video');
            el.src = layer.src;
            el.muted = true;
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.objectFit = 'cover';
            // إضافة الفيديو للمصفوفة للتحكم فيه لاحقاً
            videoElements.push({ dom: el, start: layer.start, trimStart: layer.trimStart || 0 });
        } 
        // --- النصوص والعناصر الأخرى ---
        else {
            el = document.createElement('div');
            // ... (نفس كود بناء النصوص من الرد السابق) ...
            if (layer.type === 'text') {
                el.innerText = layer.content;
                el.className = 'element text-element'; // تنسيق CSS
            }
             // ... إضافة splitText وغيرها ...
        }

        // التموضع
        el.id = layer.id;
        el.className += ' element';
        Object.assign(el.style, layer.style);
        
        // ملاحظة: كل شيء يضاف داخل طبقة الكاميرا
        if(layer.isFixed) {
            viewport.appendChild(el); // عناصر ثابتة لا تتأثر بالكاميرا (مثل اللوجو أو شريط التقدم)
        } else {
            // تحديد الموقع
            el.style.left = `${layer.x}px`;
            el.style.top = `${layer.y}px`;
            el.style.transform = "translate(-50%, -50%)";
            cameraLayer.appendChild(el);
        }

        // تطبيق الأنيمشن (GSAP)
        if (layer.animations) {
            layer.animations.forEach(anim => {
                // ... (نفس منطق استدعاء Effects من الرد السابق) ...
                // مثال: إضافة حركة الكاميرا
                if (anim.effect === 'cameraFocus') {
                    // هذا أنيمشن خاص ليس للعنصر، بل للكاميرا
                    masterTl.add(
                        moveCamera(layer.x, layer.y, anim.zoomLevel, anim.duration), 
                        anim.start
                    );
                }
            });
        }
    });

    // ======================================================
    // 🕹️ التحكم في الزمن (The Frame Controller)
    // ======================================================
    window.seekTo = (time) => {
        masterTl.seek(time);

        // تزامن الفيديوهات (Screen Recordings) يدوياً
        videoElements.forEach(v => {
            // الوقت النسبي للفيديو
            const videoTime = time - v.start + v.trimStart;
            
            if (videoTime >= 0 && videoTime < v.dom.duration) {
                v.dom.currentTime = videoTime;
            }
        });
    };
};