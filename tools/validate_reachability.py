import json
import os
from collections import Counter

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
IDS_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")
JUKUGO_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/jukugo-db-auto.json")
CONFIG_FILE = os.path.join(CURRENT_DIR, "dictionary_config.json")

def load_atomic_parts():
    if not os.path.exists(CONFIG_FILE):
        return set()
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return set(data.get("atomic_parts", []))

def main():
    print("🔍 到達可能性チェック＆根本原因分析...")
    
    ATOMIC_PARTS = load_atomic_parts()
    print(f"📄 原子パーツ定義数: {len(ATOMIC_PARTS)}")

    if not os.path.exists(IDS_FILE):
        print("❌ 辞書ファイルがありません")
        return

    with open(IDS_FILE, "r", encoding="utf-8") as f:
        ids_map = json.load(f)

    # 根本原因（どのパーツがないから作れないのか）を特定する関数
    def find_missing_root(char, visited):
        if char in visited: return None # 循環
        visited.add(char)
        
        if char in ATOMIC_PARTS: return None
        if char not in ids_map: return char # ★これが犯人（レシピなし、原子でもない）

        for p in ids_map[char]:
            missing = find_missing_root(p, visited)
            if missing: return missing
        
        return None

    # 全チェック
    missing_counter = Counter()
    broken_kanjis = []

    for kanji in ids_map.keys():
        root_cause = find_missing_root(kanji, set())
        if root_cause:
            broken_kanjis.append((kanji, root_cause))
            missing_counter[root_cause] += 1

    print("-" * 60)
    print(f"⚠️  【作成不可能】な漢字: {len(broken_kanjis)} 個")
    
    if broken_kanjis:
        print("\n📊 【重要】不足している「根本パーツ」ランキング (上位30件)")
        print("以下のパーツを dictionary_config.json に追加すると、多くのエラーが一気に解消します。")
        print("-" * 60)
        
        # 不足パーツを影響度順に表示
        for part, count in missing_counter.most_common(50):
            print(f"  ❌ 「{part}」を追加せよ -> これがないと {count} 個の漢字が作れません")

        print("-" * 60)
        print("📋 エラー詳細リスト (先頭20件のみ表示):")
        for k, r in broken_kanjis[:20]:
            print(f"  ・{k} (原因: {r} がない)")
            
    else:
        print("✅ 完璧です！全ての漢字が作成可能です。")

if __name__ == "__main__":
    main()