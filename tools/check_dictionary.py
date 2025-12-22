import json
import os

# パス設定
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# 生成された辞書データを読み込む
IDS_FILE = os.path.join(CURRENT_DIR, "../src/features/kanji-core/data/ids-map-auto.json")

def main():
    print("🔍 辞書データの整合性チェックを開始します...")
    
    if not os.path.exists(IDS_FILE):
        print(f"❌ ファイルが見つかりません: {IDS_FILE}")
        return

    with open(IDS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    risky_kanjis = []

    for kanji, parts in data.items():
        # 中間パーツ（&から始まるもの）はシステム側で処理するので無視してOK
        if kanji.startswith("&"):
            continue

        # パーツが3つ以上ある場合、ゲームシステムによっては合体できない可能性が高い
        if len(parts) >= 3:
            risky_kanjis.append((kanji, parts))

    print("-" * 40)
    if risky_kanjis:
        print(f"⚠️  修正推奨の漢字が {len(risky_kanjis)} 個見つかりました！")
        print("これらは「3つ以上の同時合体」が必要になっており、")
        print("ゲーム内で作れない可能性があります。")
        print("-" * 40)
        for k, v in risky_kanjis:
            print(f"・{k}: {v}")
        print("-" * 40)
        print("【修正方法】")
        print("tools/dictionary_config.json の manual_overrides に")
        print("2個ずつ合体させるレシピを追加してください。")
    else:
        print("✅ 問題のある漢字は見つかりませんでした！")
        print("すべての漢字が2パーツ以下の合体で構成されています。")

if __name__ == "__main__":
    main()