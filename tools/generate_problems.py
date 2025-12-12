import json
import os
import uuid

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# 入力: 熟語のリスト (CSV形式: 漢字,読み,意味)
INPUT_JUKUGO_FILE = os.path.join(CURRENT_DIR, "jukugo_source.txt")
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
    難易度を計算するロジック
    """
    score = 0
    # 熟語の長さによる加点
    score += len(kanji_list)
    
    # 分解の深さによる加点
    for k in kanji_list:
        if k in ids_map:
            score += 1 # 1回分解できる
            parts = ids_map[k]
            for p in parts:
                if p in ids_map:
                    score += 1
    
    # 1〜5の5段階に丸める
    if score <= 3: return 1
    if score <= 5: return 2
    if score <= 7: return 3
    if score <= 9: return 4
    return 5

def main():
    ids_map = load_ids_map()
    if not ids_map: return

    jukugo_list = []
    
    print(f"📖 熟語リスト(CSV)を読み込み中: {INPUT_JUKUGO_FILE}")
    
    try:
        with open(INPUT_JUKUGO_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        count = 0
        for line in lines:
            line = line.strip()
            if not line: continue
            
            # カンマ区切りで分解 (漢字,読み,意味)
            parts = line.split(",")
            
            kanji = parts[0].strip()
            # 読み・意味がない場合のフォールバック
            reading = parts[1].strip() if len(parts) > 1 else "???"
            meaning = parts[2].strip() if len(parts) > 2 else ""

            difficulty = calculate_difficulty(list(kanji), ids_map)
            
            entry = {
                "id": str(uuid.uuid4())[:8],
                "kanji": kanji,
                "reading": reading,
                "meaning": meaning, # ★追加: 意味データ
                "difficulty": difficulty,
                "components": list(kanji)
            }
            jukugo_list.append(entry)
            count += 1
            
    except FileNotFoundError:
        print(f"⚠️ {INPUT_JUKUGO_FILE} が見つかりません。ファイルを作成してください。")
        return

    print(f"📦 {count} 件の熟語データを生成しました。")
    
    # 保存
    with open(OUTPUT_DB_FILE, "w", encoding="utf-8") as f:
        json.dump(jukugo_list, f, ensure_ascii=False, indent=2)
        
    print(f"✅ 保存完了: {OUTPUT_DB_FILE}")

if __name__ == "__main__":
    main()