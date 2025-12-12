import json
import os

# ==========================================
# 設定
# ==========================================
# ファイルの場所を指定
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_IDS_FILE = os.path.join(CURRENT_DIR, "ids.txt")
INPUT_JOYO_FILE = os.path.join(CURRENT_DIR, "joyo.txt")
OUTPUT_JSON_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")

# これ以上分解しない「原子パーツ(部首)」
# ゲームバランスのため、これらは分解ルールを作りません
ATOMIC_PARTS = {
    "日", "月", "木", "山", "石", "田", "土", "火", "水", "金", 
    "力", "目", "口", "人", "イ", "女", "子", "言", "糸", "車", 
    "門", "雨", "貝", "馬", "魚", "鳥", "虫", "王", "弓", "矢",
    "刀", "牛", "手", "心", "尸", "广", "厂", "辶", "亠", "宀", "艹", "竹"
}

# IDS演算子（これらを除去して純粋なパーツだけ抽出する）
IDS_OPERATORS = r"[⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻]"

def load_joyo_kanji():
    """常用漢字セットを読み込む"""
    joyo_set = set()
    print(f"📄 読み込み中: {INPUT_JOYO_FILE}")
    try:
        with open(INPUT_JOYO_FILE, "r", encoding="utf-8") as f:
            content = f.read()
            for char in content:
                # 漢字の範囲(U+4E00〜)だけを抽出
                if "\u4e00" <= char <= "\u9fff":
                    joyo_set.add(char)
        print(f"✅ 常用漢字リストを読み込みました: {len(joyo_set)}文字")
    except FileNotFoundError:
        print("⚠️ joyo.txt が見つかりません。フィルタリングなしで実行します。")
    return joyo_set

def parse_ids_line(line):
    """IDSファイルの1行をパースする"""
    # 形式例: U+660E	明	⿰日月
    parts = line.strip().split("\t")
    if len(parts) < 3:
        return None
    
    kanji = parts[1]
    structure = parts[2]
    
    # 構成要素のみを抽出 (演算子を除去)
    components = [c for c in structure if c not in IDS_OPERATORS and c != kanji]
    
    return kanji, components

def main():
    joyo_set = load_joyo_kanji()
    dictionary = {}
    
    print(f"🔄 IDSデータ({INPUT_IDS_FILE})を解析中...")
    
    try:
        with open(INPUT_IDS_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith(";;"): continue # コメントスキップ
                
                result = parse_ids_line(line)
                if not result: continue
                
                kanji, components = result
                
                # フィルタリング条件:
                # 1. 常用漢字リストにある場合
                # 2. 構成要素がちょうど2つであること (ゲームの仕様)
                
                if joyo_set and kanji not in joyo_set:
                    continue
                
                if len(components) == 2:
                    # 原子パーツに含まれる漢字は、分解ルールを登録しない
                    if kanji in ATOMIC_PARTS:
                        continue
                        
                    dictionary[kanji] = components

    except FileNotFoundError:
        print(f"❌ エラー: {INPUT_IDS_FILE} が見つかりません。toolsフォルダに保存しましたか？")
        return

    # 結果の保存
    print(f"📦 {len(dictionary)} 件の合体ルールを生成しました。")
    
    # ディレクトリがなければ作る
    os.makedirs(os.path.dirname(OUTPUT_JSON_FILE), exist_ok=True)

    with open(OUTPUT_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(dictionary, f, ensure_ascii=False, indent=2)
        
    print(f"✅ 保存完了: {OUTPUT_JSON_FILE}")

if __name__ == "__main__":
    main()