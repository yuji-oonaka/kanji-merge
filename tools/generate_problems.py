import json
import os
import uuid

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# ★変更点: 読み込むファイルのリスト
INPUT_FILES = [
    "jukugo_source.txt",       # メインデータ
    "jukugo_source_extra.txt"  # 追加データ
]

INPUT_IDS_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")
OUTPUT_DB_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/jukugo-db-auto.json")

def load_ids_map():
    try:
        with open(INPUT_IDS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ ids-map-auto.json が見つかりません。")
        return {}

def calculate_difficulty(kanji_list, ids_map):
    score = 0
    score += len(kanji_list)
    for k in kanji_list:
        if k in ids_map:
            score += 1
            parts = ids_map[k]
            for p in parts:
                if p in ids_map:
                    score += 1
    
    if score <= 3: return 1
    if score <= 5: return 2
    if score <= 7: return 3
    if score <= 9: return 4
    return 5

def process_file(filepath, ids_map, jukugo_list):
    """1つのファイルを処理してリストに追加する"""
    if not os.path.exists(filepath):
        print(f"⚠️ ファイルが見つかりません（スキップします）: {filepath}")
        return

    print(f"📖 読み込み中: {os.path.basename(filepath)}")
    
    with open(filepath, "r", encoding="utf-8") as f:
        # 改行コードの揺らぎを吸収
        content = f.read()
        lines = content.replace("\r\n", "\n").replace("\r", "\n").split("\n")

    count = 0
    for line in lines:
        line = line.strip()
        if not line: continue
        if line.startswith("#"): continue
        
        parts = line.split(",")
        if len(parts) < 1: continue

        kanji = parts[0].strip()
        if not kanji: continue

        # 既存チェック（重複回避）
        if any(j["kanji"] == kanji for j in jukugo_list):
            continue

        reading = parts[1].strip() if len(parts) > 1 else "???"
        meaning = parts[2].strip() if len(parts) > 2 else ""
        sentence = parts[3].strip() if len(parts) > 3 else ""

        difficulty = calculate_difficulty(list(kanji), ids_map)
        
        entry = {
            "id": str(uuid.uuid4())[:8],
            "kanji": kanji,
            "reading": reading,
            "meaning": meaning,
            "difficulty": difficulty,
            "components": list(kanji),
            "sentence": sentence
        }
        jukugo_list.append(entry)
        count += 1
    
    print(f"   -> {count} 件追加")

def main():
    ids_map = load_ids_map()
    if not ids_map: return

    jukugo_list = []
    
    # リストにある全ファイルを処理
    for filename in INPUT_FILES:
        filepath = os.path.join(CURRENT_DIR, filename)
        process_file(filepath, ids_map, jukugo_list)

    print(f"📦 合計 {len(jukugo_list)} 件の熟語データを生成しました。")
    
    os.makedirs(os.path.dirname(OUTPUT_DB_FILE), exist_ok=True)

    with open(OUTPUT_DB_FILE, "w", encoding="utf-8") as f:
        json.dump(jukugo_list, f, ensure_ascii=False, indent=2)
        
    print(f"✅ 保存完了: {OUTPUT_DB_FILE}")

if __name__ == "__main__":
    main()