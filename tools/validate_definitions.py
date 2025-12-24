import json
import os

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
IDS_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")
CONFIG_FILE = os.path.join(CURRENT_DIR, "dictionary_config.json")

SOURCE_FILES = [
    "jukugo_source.txt",
    "jukugo_source_extra.txt"
]

def load_json(filepath):
    if not os.path.exists(filepath):
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def get_game_kanjis():
    """ソースファイルからゲームで使用される全漢字を抽出"""
    targets = set()
    for filename in SOURCE_FILES:
        filepath = os.path.join(CURRENT_DIR, filename)
        if not os.path.exists(filepath):
            continue
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or line.startswith("[") or "," not in line:
                    continue
                parts = line.split(",")
                jukugo = parts[0].strip()
                for char in jukugo:
                    if char not in "ー":
                        targets.add(char)
    return targets

def main():
    print("🔍 漢字定義抜け漏れチェック...")

    config_data = load_json(CONFIG_FILE)
    atomic_parts = set(config_data.get("atomic_parts", []))
    ids_map = load_json(IDS_FILE)
    
    targets = get_game_kanjis()
    print(f"🎯 ゲーム登場漢字: {len(targets)} 文字")

    missing_definitions = []

    for char in sorted(list(targets)):
        # 1. 原子パーツならOK（これ以上分解しないのでレシピ不要）
        if char in atomic_parts:
            continue
        
        # 2. 辞書の「キー（見出し語）」として存在するか？
        if char not in ids_map:
            missing_definitions.append(char)

    print("-" * 60)
    if missing_definitions:
        print(f"😱 以下の {len(missing_definitions)} 文字は、レシピ定義がありません！")
        print("これらは合体で作れなかったり、謎のID（&XX_0）が表示される原因になります。")
        print("-" * 60)
        for char in missing_definitions:
            print(f"❌ {char}")
            
        print("-" * 60)
        print("【対策】 tools/dictionary_config.json の manual_overrides に追加してください。")
    else:
        print("✅ 完璧です！使用される全ての漢字に定義が存在します。")

if __name__ == "__main__":
    main()