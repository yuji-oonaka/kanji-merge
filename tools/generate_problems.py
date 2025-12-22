import json
import os
import uuid

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# ★修正: 読み込むファイルのリスト
INPUT_FILES = [
    "jukugo_source.txt",       # メインデータ
    "jukugo_source_extra.txt"  # 追加データ
]

# 入力: 前回作った辞書（パーツ構成を確認するため）
INPUT_IDS_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")
# 出力: ゲーム用の問題DB
OUTPUT_DB_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/jukugo-db-auto.json")

def load_ids_map():
    """分解辞書を読み込む"""
    try:
        with open(INPUT_IDS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ ids-map-auto.json が見つかりません。先に辞書生成を行ってください。")
        return {}

def calculate_difficulty(kanji_list, ids_map):
    """
    分解の複雑さと文字数から難易度(1-10)を算出する
    （中間パーツも再帰的にカウントして精度を上げる）
    """
    score = 0
    score += len(kanji_list) # 文字数ベース
    
    # 構成コスト計算（原子パーツがいくつ必要か）
    def count_atomic_cost(char, depth=0):
        if depth > 5: return 1
        if char not in ids_map: return 1 # 分解できない＝コスト1
        
        parts = ids_map[char]
        cost = 0
        for p in parts:
            cost += count_atomic_cost(p, depth + 1)
        return cost

    for k in kanji_list:
        cost = count_atomic_cost(k)
        if cost >= 4: score += 3
        elif cost == 3: score += 2
        elif cost == 2: score += 1
    
    return min(10, max(1, score))

def process_file(filepath, ids_map, jukugo_list):
    """1つのファイルを処理してリストに追加する"""
    if not os.path.exists(filepath):
        print(f"⚠️ ファイルが見つかりません（スキップします）: {os.path.basename(filepath)}")
        return

    print(f"📖 読み込み中: {os.path.basename(filepath)}")
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        # 改行コードの揺らぎを吸収
        lines = content.replace("\r\n", "\n").replace("\r", "\n").split("\n")

    count = 0
    for line in lines:
        line = line.strip()
        if not line: continue
        if line.startswith("#"): continue

        if line.startswith("[") or line.startswith("-"): continue
        parts = line.split(",")
        if len(parts) < 1: continue

        kanji = parts[0].strip()
        if not kanji: continue

        # 重複チェック（既にリストにある熟語はスキップ）
        if any(j["kanji"] == kanji for j in jukugo_list):
            continue

        # 読み・意味がない場合のフォールバック
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