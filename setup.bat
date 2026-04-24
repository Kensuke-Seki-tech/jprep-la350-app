@echo off
echo JPREP LA350 アプリ セットアップ
echo ================================
echo.
echo Node.js のバージョン確認...
node --version
npm --version
echo.
echo パッケージをインストール中...（数分かかります）
npm install
echo.
echo セットアップ完了！
echo.
echo 開発サーバーを起動します...
echo ブラウザで http://localhost:5173 を開いてください
echo.
npm run dev
