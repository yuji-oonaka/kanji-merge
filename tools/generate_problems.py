import json
import os
import uuid

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# 読み込むファイルのリスト
INPUT_FILES = [
    "jukugo_source.txt",       # メインデータ
    "jukugo_source_extra.txt"  # 追加データ
]

# 常用漢字リスト（同ディレクトリにあると想定）
JOYO_FILE = os.path.join(CURRENT_DIR, "joyo.txt")

INPUT_IDS_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")
OUTPUT_DB_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/jukugo-db-auto.json")

def load_ids_map():
    try:
        with open(INPUT_IDS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ ids-map-auto.json が見つかりません。パスを確認してください。")
        return {}

def load_joyo_set():
    if os.path.exists(JOYO_FILE):
        with open(JOYO_FILE, "r", encoding="utf-8") as f:
            # 改行などを除いてセットにする
            return set(f.read().replace("\n", "").replace("\r", ""))
    return None

def calculate_difficulty(kanji_list, ids_map):
    """
    分解の複雑さと文字数から難易度(1-10)を算出する
    """
    score = 0
    score += len(kanji_list) # 文字数ベース（2文字=2点, 4文字=4点）
    
    for k in kanji_list:
        if k in ids_map:
            score += 1 # 分解可能なら+1
            parts = ids_map[k]
            # さらに細かいパーツも分解可能なら加点（画数が多い/構造が複雑）
            for p in parts:
                if p in ids_map:
                    score += 1
    
    # スコアをそのまま難易度として採用（最大10に丸める）
    # 例: 
    #  「明」(2点) -> Lv2
    #  「花火」(4点) -> Lv4
    #  「魑魅魍魎」(10点以上) -> Lv10
    return min(10, max(1, score))

def process_file(filepath, ids_map, jukugo_list, joyo_set):
    """1つのファイルを処理してリストに追加する"""
    if not os.path.exists(filepath):
        print(f"⚠️ ファイルが見つかりません（スキップします）: {filepath}")
        return

    print(f"📖 読み込み中: {os.path.basename(filepath)}")
    
    with open(filepath, "r", encoding="utf-8") as f:
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

        # 常用漢字チェック
        if joyo_set:
            non_joyo = [c for c in kanji if c not in joyo_set]
            if non_joyo:
                # 警告を出すが、登録はする（意図的な難読語かもしれないため）
                print(f"   ⚠️ [Joyo外] {kanji} に常用外の文字が含まれています: {non_joyo}")

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

    joyo_set = load_joyo_set()
    if joyo_set:
        print(f"✅ 常用漢字リストを読み込みました ({len(joyo_set)}文字)")
    else:
        print("ℹ️ joyo.txt が見つからないため、常用漢字チェックをスキップします")

    jukugo_list = []
    
    # リストにある全ファイルを処理
    for filename in INPUT_FILES:
        filepath = os.path.join(CURRENT_DIR, filename)
        process_file(filepath, ids_map, jukugo_list, joyo_set)

    print(f"📦 合計 {len(jukugo_list)} 件の熟語データを生成しました。")
    
    os.makedirs(os.path.dirname(OUTPUT_DB_FILE), exist_ok=True)

    with open(OUTPUT_DB_FILE, "w", encoding="utf-8") as f:
        json.dump(jukugo_list, f, ensure_ascii=False, indent=2)
        
    print(f"✅ 保存完了: {OUTPUT_DB_FILE}")

if __name__ == "__main__":
    main()