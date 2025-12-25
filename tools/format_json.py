import json
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(CURRENT_DIR, "dictionary_config.json")

def format_list_compact(lst, items_per_line=15, indent=4):
    """atomic_parts用: リストを適度な改行ありの横並び文字列にする"""
    if not lst:
        return "[]"
    
    lines = []
    current_line = []
    
    for i, item in enumerate(lst):
        current_line.append(f'"{item}"')
        
        if (i + 1) % items_per_line == 0 or (i + 1) == len(lst):
            line_str = ", ".join(current_line)
            if (i + 1) < len(lst):
                line_str += ","
            lines.append(" " * indent + line_str)
            current_line = []
            
    return "[\n" + "\n".join(lines) + "\n  ]"

def format_overrides_compact(overrides, indent=4):
    """manual_overrides用: 値のリスト["A", "B"]を必ず1行にする"""
    if not overrides:
        return "{}"
    
    lines = []
    # キーでソートして見やすくする
    for key, value in sorted(overrides.items()):
        # ensure_ascii=False で日本語をそのまま表示
        # リストをJSON文字列化すると ["A", "B"] という横並びの形になる
        val_str = json.dumps(value, ensure_ascii=False)
        lines.append(" " * indent + f'"{key}": {val_str}')
        
    return "{\n" + ",\n".join(lines) + "\n  }"

def main():
    if not os.path.exists(CONFIG_FILE):
        print(f"❌ ファイルが見つかりません: {CONFIG_FILE}")
        return

    print("🧹 JSONを見やすく整形中（レシピを横並びに変換）...")

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    atomic_parts = data.get("atomic_parts", [])
    manual_overrides = data.get("manual_overrides", {})

    # 1. atomic_parts の整形（1行12個くらいで折り返し）
    formatted_atomic = format_list_compact(atomic_parts, items_per_line=12, indent=4)

    # 2. manual_overrides の整形（値のリストを横一列にする！）
    formatted_overrides = format_overrides_compact(manual_overrides, indent=4)

    # 3. 全体を結合
    final_json = f"""{{
  "atomic_parts": {formatted_atomic},
  "manual_overrides": {formatted_overrides}
}}"""

    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        f.write(final_json)

    print("✨ 整形完了！ すべてのレシピが横一列で見やすくなりました。")

if __name__ == "__main__":
    main()