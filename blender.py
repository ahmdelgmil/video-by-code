import bpy

# ==========================================
# 1. البيانات المعالجة والجاهزة (تم قلب النصوص لك)
# ==========================================
json_data = [
  {
    "id": 0,
    "type": "text",
    "content": "ﺔﺴﻟ",
    "start": 0,
    "end": 0.74,
    "color": "#FFD700",
    "animation": "pop"
  },
  {
    "id": 1,
    "type": "text",
    "content": "ﻲﻧﺎﻌﺘﺑ",
    "start": 0.74,
    "end": 1.26,
    "color": "#FFFFFF",
    "animation": "slideUp"
  },
  {
    "id": 2,
    "type": "text",
    "content": "ﻲﻓ",
    "start": 1.26,
    "end": 1.36,
    "color": "#00FFFF",
    "animation": "zoomOut"
  },
  {
    "id": 3,
    "type": "text",
    "content": "ﻖﻄﻧ",
    "start": 1.36,
    "end": 1.64,
    "color": "#FF0055",
    "animation": "slideDown"
  },
  {
    "id": 4,
    "type": "text",
    "content": "،يزيلجنلإا",
    "start": 1.64,
    "end": 2.9,
    "color": "#FFD700",
    "animation": "pop"
  },
  {
    "id": 5,
    "type": "text",
    "content": "ﻲﻓ",
    "start": 2.9,
    "end": 2.98,
    "color": "#FFFFFF",
    "animation": "slideUp"
  },
  {
    "id": 6,
    "type": "text",
    "content": "،يدانقلا",
    "start": 2.98,
    "end": 4.18,
    "color": "#00FFFF",
    "animation": "zoomOut"
  },
  {
    "id": 7,
    "type": "text",
    "content": "،ﺔﻤﻠﻜﻟا",
    "start": 4.18,
    "end": 5.16,
    "color": "#FF0055",
    "animation": "slideDown"
  },
  {
    "id": 8,
    "type": "text",
    "content": "،ﺎﻫﺎﻨﻌﻣ",
    "start": 5.16,
    "end": 6.28,
    "color": "#FFD700",
    "animation": "pop"
  },
  {
    "id": 9,
    "type": "text",
    "content": "نﺎﻤﻛو",
    "start": 6.28,
    "end": 6.66,
    "color": "#FFFFFF",
    "animation": "slideUp"
  },
  {
    "id": 10,
    "type": "text",
    "content": "ﺎﻬﻘﻄﻧ",
    "start": 6.66,
    "end": 7.14,
    "color": "#00FFFF",
    "animation": "zoomOut"
  },
  {
    "id": 11,
    "type": "text",
    "content": "بﻮﺘﻜﻣ",
    "start": 7.14,
    "end": 7.64,
    "color": "#FF0055",
    "animation": "slideDown"
  },
  {
    "id": 12,
    "type": "text",
    "content": "،ﻚﻣاﺪﻗ",
    "start": 7.64,
    "end": 8.88,
    "color": "#FFD700",
    "animation": "pop"
  },
  {
    "id": 13,
    "type": "text",
    "content": "ﻒﻟأو",
    "start": 8.88,
    "end": 9.32,
    "color": "#FFFFFF",
    "animation": "slideUp"
  },
  {
    "id": 14,
    "type": "text",
    "content": "ﺔﻤﻠﻛ",
    "start": 9.32,
    "end": 10,
    "color": "#00FFFF",
    "animation": "zoomOut"
  },
  {
    "id": 15,
    "type": "text",
    "content": "ﺮﻴﻐﺘﻫ",
    "start": 10,
    "end": 10.62,
    "color": "#FF0055",
    "animation": "slideDown"
  },
  {
    "id": 16,
    "type": "text",
    "content": ".ﻚﺗﺎﻴﺣ",
    "start": 10.62,
    "end": 11.94,
    "color": "#FFD700",
    "animation": "pop"
  },
  {
    "id": 17,
    "type": "text",
    "content": "سرد",
    "start": 11.94,
    "end": 12.26,
    "color": "#FFFFFF",
    "animation": "slideUp"
  },
  {
    "id": 18,
    "type": "text",
    "content": "مﻮﻴﻟا",
    "start": 12.26,
    "end": 12.88,
    "color": "#00FFFF",
    "animation": "zoomOut"
  },
  {
    "id": 19,
    "type": "text",
    "content": "أﺪﺒﻳ",
    "start": 12.88,
    "end": 13.54,
    "color": "#FF0055",
    "animation": "slideDown"
  },
  {
    "id": 20,
    "type": "text",
    "content": ".نﻵا",
    "start": 13.54,
    "end": 14.04,
    "color": "#FFD700",
    "animation": "pop"
  }
]

# ==========================================
# 2. إعدادات السكربت (عدل مسار الخط فقط)
# ==========================================

# مسار الخط العربي (مهم جداً)
FONT_PATH = "C:\\Windows\\Fonts\\arial.ttf" 

BASE_FONT_SIZE = 120
FPS = 30

def hex_to_rgba(hex_value):
    hex_value = hex_value.lstrip('#')
    return tuple(int(hex_value[i:i+2], 16)/255.0 for i in (0, 2, 4)) + (1.0,)

def load_font_vse():
    try:
        return bpy.data.fonts.load(FONT_PATH)
    except:
        return None

# ==========================================
# 3. بناء التايم لاين
# ==========================================

def build_vse_timeline():
    scene = bpy.context.scene
    scene.render.fps = FPS
    
    if not scene.sequence_editor:
        scene.sequence_editor_create()
    
    seq = scene.sequence_editor
    
    # تنظيف التايم لاين القديم
    for strip in seq.sequences:
        if strip.type == 'TEXT':
            seq.sequences.remove(strip)
    
    font_data = load_font_vse()
    channel_index = 2 
    
    for item in json_data:
        text_content = item['content']
        start_frame = int(item['start'] * FPS)
        end_frame = int(item['end'] * FPS)
        
        # إنشاء الشريط
        strip = seq.sequences.new_effect(
            name=f"Txt_{item['id']}",
            type='TEXT',
            channel=channel_index,
            frame_start=start_frame,
            frame_end=end_frame
        )
        
        # الإعدادات
        strip.text = text_content
        strip.font_size = BASE_FONT_SIZE
        strip.color = hex_to_rgba(item['color'])
        strip.location[0] = 0.5
        strip.location[1] = 0.5
        strip.blend_type = 'ALPHA_OVER'
        
        if font_data:
            try:
                strip.font = font_data
            except:
                pass

        # ------------------------------------------------
        # الانيميشن
        # ------------------------------------------------
        anim_duration = 5 
        anim_type = item['animation']
        
        if anim_type == "pop":
            strip.font_size = 0
            strip.keyframe_insert(data_path="font_size", frame=start_frame)
            strip.font_size = int(BASE_FONT_SIZE * 1.2)
            strip.keyframe_insert(data_path="font_size", frame=start_frame + int(anim_duration/2))
            strip.font_size = BASE_FONT_SIZE
            strip.keyframe_insert(data_path="font_size", frame=start_frame + anim_duration)

        elif anim_type == "slideUp":
            strip.location[1] = 0.3 
            strip.keyframe_insert(data_path="location", index=1, frame=start_frame)
            strip.location[1] = 0.5
            strip.keyframe_insert(data_path="location", index=1, frame=start_frame + anim_duration)
            strip.blend_alpha = 0
            strip.keyframe_insert(data_path="blend_alpha", frame=start_frame)
            strip.blend_alpha = 1
            strip.keyframe_insert(data_path="blend_alpha", frame=start_frame + anim_duration)

        elif anim_type == "slideDown":
            strip.location[1] = 0.7
            strip.keyframe_insert(data_path="location", index=1, frame=start_frame)
            strip.location[1] = 0.5
            strip.keyframe_insert(data_path="location", index=1, frame=start_frame + anim_duration)

        elif anim_type == "zoomOut":
            strip.font_size = int(BASE_FONT_SIZE * 3)
            strip.keyframe_insert(data_path="font_size", frame=start_frame)
            strip.font_size = BASE_FONT_SIZE
            strip.keyframe_insert(data_path="font_size", frame=start_frame + anim_duration)

    print("✅ تم إنشاء التايم لاين! النصوص ستظهر صحيحة الآن.")

build_vse_timeline()