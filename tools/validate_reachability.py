import json
import os
from collections import Counter

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
IDS_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")
CONFIG_FILE = os.path.join(CURRENT_DIR, "dictionary_config.json")

# チェック対象のソースファイル
# ここにある熟語に使われている漢字だけを検査します
SOURCE_FILES = [
    "jukugo_source.txt",
    "jukugo_source_extra.txt"
]

def load_atomic_parts():
    if not os.path.exists(CONFIG_FILE):
        return set()
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return set(data.get("atomic_parts", []))

def get_target_kanjis():
    """ソースファイルから、実際にゲームで使う漢字リストを抽出"""
    targets = set()
    for filename in SOURCE_FILES:
        filepath = os.path.join(CURRENT_DIR, filename)
        if not os.path.exists(filepath):
            print(f"⚠️ ソースファイルが見つかりません: {filename}")
            continue
            
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                # コメント行や空行、データ形式でない行をスキップ
                if not line or line.startswith("#") or line.startswith("[") or "," not in line:
                    continue
                
                parts = line.split(",")
                jukugo = parts[0].strip()
                for char in jukugo:
                    if char not in "ー": # 長音などは除外
                        targets.add(char)
    return targets

def main():
    print("🔍 ゲーム内熟語の作成可能性チェック...")
    
    ATOMIC_PARTS = load_atomic_parts()
    TARGET_KANJIS = get_target_kanjis()
    
    print(f"📄 原子パーツ数: {len(ATOMIC_PARTS)}")
    print(f"🎯 ゲーム登場漢字: {len(TARGET_KANJIS)} 文字")

    if not os.path.exists(IDS_FILE):
        print("❌ 辞書ファイル(ids-map-auto.json)がありません")
        return

    with open(IDS_FILE, "r", encoding="utf-8") as f:
        ids_map = json.load(f)

    # 再帰チェック用キャッシュ
    memo = {}
    visited_path = set()

    def check_can_make(char):
        if char in memo: return memo[char]
        
        # 1. 原子パーツならOK
        if char in ATOMIC_PARTS:
            memo[char] = (True, None)
            return True, None
            
        # 2. 辞書にない
        if char not in ids_map:
            memo[char] = (False, "レシピなし")
            return False, "レシピなし"
            
        # 循環参照チェック
        if char in visited_path:
            return False, "循環参照"
        visited_path.add(char)

        # 3. 構成要素チェック
        parts = ids_map[char]
        for p in parts:
            ok, reason = check_can_make(p)
            if not ok:
                visited_path.remove(char)
                memo[char] = (False, f"「{p}」が作れない ({reason})")
                return False, f"「{p}」が作れない ({reason})"
        
        visited_path.remove(char)
        memo[char] = (True, None)
        return True, None

    # チェック実行
    error_list = []
    
    print("-" * 60)
    for char in sorted(list(TARGET_KANJIS)):
        ok, reason = check_can_make(char)
        if not ok:
            error_list.append((char, reason))
            print(f"❌ {char} : {reason}")

    print("-" * 60)
    if error_list:
        print(f"😱 合計 {len(error_list)} 文字が作成不可能です！")
        print("これらを tools/dictionary_config.json の manual_overrides に追加してください。")
    else:
        print("🎉 おめでとうございます！登場する全ての熟語が作成可能です！")

if __name__ == "__main__":
    main()