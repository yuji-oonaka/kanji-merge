import json
import os

# ==========================================
# 設定
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_IDS_FILE = os.path.join(CURRENT_DIR, "ids.txt")
INPUT_JOYO_FILE = os.path.join(CURRENT_DIR, "joyo.txt")
CONFIG_FILE = os.path.join(CURRENT_DIR, "dictionary_config.json") # ★設定ファイルのパス
OUTPUT_JSON_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")

def load_config():
    """設定JSONを読み込む"""
    if not os.path.exists(CONFIG_FILE):
        print(f"⚠️ 設定ファイルが見つかりません: {CONFIG_FILE}")
        # ファイルがない場合の最低限のフォールバック
        return set(["日", "月", "木"]), {}
    
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # JSONからリストを読み込み、セットに変換（検索高速化のため）
    atomic_parts = set(data.get("atomic_parts", []))
    manual_overrides = data.get("manual_overrides", {})
    
    print(f"📄 設定読込完了: 原子パーツ {len(atomic_parts)}個, 手動設定 {len(manual_overrides)}個")
    return atomic_parts, manual_overrides

def load_joyo_kanji(atomic_parts):
    """常用漢字 + 基本的なカタカナなどを読み込む"""
    allowed_set = set(atomic_parts) # 原子パーツは最初から許可リストに入れる
    try:
        with open(INPUT_JOYO_FILE, "r", encoding="utf-8") as f:
            for char in f.read():
                if char.strip(): allowed_set.add(char)
    except FileNotFoundError:
        pass
    
    # カタカナや一般的な記号も許可
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

def deep_decompose(kanji, ids_db, allowed_set, atomic_parts, depth=0):
    """再帰的に分解して、知っている文字(allowed_set)だけで構成されたリストを返す"""
    if depth > 5: return None # 深すぎたら諦める

    # 原子パーツ or 定義なし -> そのまま
    if kanji in atomic_parts or kanji not in ids_db:
        return [kanji]

    components = ids_db[kanji]
    refined_components = []
    
    for comp in components:
        # 原子パーツに含まれているなら、それ以上分解せずに採用
        if comp in atomic_parts:
            refined_components.append(comp)
        elif comp in allowed_set:
             # 知ってる文字だけど原子パーツではない場合、さらに分解トライ
             # （もし分解できなければそのまま使う）
            sub_comps = deep_decompose(comp, ids_db, allowed_set, atomic_parts, depth + 1)
            if sub_comps:
                refined_components.extend(sub_comps)
            else:
                refined_components.append(comp)
        else:
            # 知らない文字なら、さらに分解必須
            sub_comps = deep_decompose(comp, ids_db, allowed_set, atomic_parts, depth + 1)
            if sub_comps:
                refined_components.extend(sub_comps)
            else:
                return None # 分解不能

    # パーツ数が多すぎる(5個以上)はゲーム的に厳しいのでNG
    if len(refined_components) > 4:
        return None

    return refined_components

def main():
    print("🔄 辞書を自動生成中（JSON設定読込モード）...")
    
    # 1. 設定ファイル読み込み
    ATOMIC_PARTS, MANUAL_OVERRIDES = load_config()

    allowed_set = load_joyo_kanji(ATOMIC_PARTS)
    ids_db = parse_ids_file(INPUT_IDS_FILE)
    final_dictionary = {}
    
    # 2. 手動オーバーライドを適用
    for k, v in MANUAL_OVERRIDES.items():
        final_dictionary[k] = v

    # 3. 自動分解
    count = 0
    for kanji in allowed_set:
        if kanji in final_dictionary: continue
        if kanji in ATOMIC_PARTS: continue

        # atomic_partsも渡す
        clean_parts = deep_decompose(kanji, ids_db, allowed_set, ATOMIC_PARTS)
        
        # 2〜4要素なら採用
        if clean_parts and 2 <= len(clean_parts) <= 4:
            if len(clean_parts) == 2:
                final_dictionary[kanji] = clean_parts
            else:
                # 3要素以上は中間パーツ化 ( [A, B, C] -> A + &BC )
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

    print(f"📦 生成完了: {len(final_dictionary)} 漢字")
    
    os.makedirs(os.path.dirname(OUTPUT_JSON_FILE), exist_ok=True)
    with open(OUTPUT_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(final_dictionary, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()