import json
import os

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_IDS_FILE = os.path.join(CURRENT_DIR, "ids.txt")
INPUT_JOYO_FILE = os.path.join(CURRENT_DIR, "joyo.txt")
# ▼ 設定ファイルのパス
CONFIG_FILE = os.path.join(CURRENT_DIR, "dictionary_config.json")
# ▼ 出力先
OUTPUT_JSON_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")

def load_config():
    """設定ファイル(JSON)を読み込む"""
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            # atomic_parts は検索を早くするために set型 に変換
            atomic = set(data.get("atomic_parts", []))
            overrides = data.get("manual_overrides", {})
            return atomic, overrides
    except FileNotFoundError:
        print(f"❌ 設定ファイルが見つかりません: {CONFIG_FILE}")
        return set(), {}

def load_joyo_kanji(atomic_parts):
    """「知っている漢字」リストを作成"""
    allowed_set = set(atomic_parts)
    try:
        with open(INPUT_JOYO_FILE, "r", encoding="utf-8") as f:
            for char in f.read():
                if char.strip(): allowed_set.add(char)
    except FileNotFoundError:
        pass
    
    for i in range(0x30A0, 0x30FF):
        allowed_set.add(chr(i))
    allowed_set.add("〆")
    allowed_set.add("々")
    
    return allowed_set

def parse_ids_file(filepath):
    """IDSファイルを全読み込み"""
    ids_db = {}
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith(";;"): continue
                parts = line.strip().split("\t")
                if len(parts) < 3: continue
                
                kanji = parts[1]
                structure = parts[2]
                components = [c for c in structure if c not in "⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻" and c != kanji]
                ids_db[kanji] = components
    except FileNotFoundError:
        print("❌ ids.txt がありません")
        return {}
    return ids_db

def smart_decompose(kanji, ids_db, allowed_set, atomic_parts, depth=0):
    """スマート分解ロジック"""
    if depth > 4: return None 

    # 原子パーツ or 定義なし -> そのまま
    if kanji in atomic_parts or kanji not in ids_db:
        return [kanji]

    components = ids_db[kanji]
    all_known = all(c in allowed_set for c in components)

    if all_known and len(components) <= 2:
        return components

    refined_components = []
    for comp in components:
        if comp in allowed_set:
            refined_components.append(comp)
        else:
            sub_comps = smart_decompose(comp, ids_db, allowed_set, atomic_parts, depth + 1)
            if sub_comps:
                refined_components.extend(sub_comps)
            else:
                return None

    if len(refined_components) > 4:
        return None

    return refined_components

def main():
    print("🔄 辞書を自動生成中（設定分離モード）...")
    
    # 1. 設定ファイル読み込み
    atomic_parts, manual_overrides = load_config()
    if not atomic_parts:
        print("⚠️ atomic_parts が空です。設定ファイルを確認してください。")

    allowed_set = load_joyo_kanji(atomic_parts)
    ids_db = parse_ids_file(INPUT_IDS_FILE)
    final_dictionary = {}
    
    # 2. 手動オーバーライドを適用
    for k, v in manual_overrides.items():
        final_dictionary[k] = v

    # 3. 自動分解
    count = 0
    skipped_count = 0
    target_kanjis = [k for k in allowed_set if k not in atomic_parts and k not in final_dictionary]

    for kanji in target_kanjis:
        clean_parts = smart_decompose(kanji, ids_db, allowed_set, atomic_parts)
        
        if clean_parts and 2 <= len(clean_parts) <= 4:
            if len(clean_parts) == 2:
                final_dictionary[kanji] = clean_parts
            else:
                current_parts = clean_parts[:]
                intermediate_base = f"&{kanji}"
                step = 0
                while len(current_parts) > 2:
                    p1 = current_parts.pop(0)
                    p2 = current_parts.pop(0)
                    inter_id = f"{intermediate_base}_{step}"
                    step += 1
                    final_dictionary[inter_id] = [p1, p2]
                    current_parts.insert(0, inter_id)
                final_dictionary[kanji] = current_parts
            count += 1
        else:
            skipped_count += 1

    print(f"📦 生成完了: {len(final_dictionary)} 漢字 (対象外: {skipped_count})")
    
    os.makedirs(os.path.dirname(OUTPUT_JSON_FILE), exist_ok=True)
    with open(OUTPUT_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(final_dictionary, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()