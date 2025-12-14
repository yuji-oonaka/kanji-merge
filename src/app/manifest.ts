import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '漢字合体 (Kanji Merge)', // ホーム画面での表示名
    short_name: '漢字合体',
    description: '漢字を触って発明する感覚的ロジックパズル',
    start_url: '/',
    display: 'standalone', // ★重要: これでブラウザのバーが消えてアプリっぽくなります
    background_color: '#f5f2eb',
    theme_color: '#3d3330',
    icons: [
      {
        src: '/icon-512.png', // publicフォルダの画像を指定
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}