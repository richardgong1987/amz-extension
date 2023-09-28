npm run build

cd dist

rm auctions-yahoo-extension.zip

zip -r auctions-yahoo-extension.zip auctions-yahoo-extension/

mv auctions-yahoo-extension.zip ../../auctions-yahoo-admin-ui/public


cd ../../auctions-yahoo-admin-ui

pnpm run build:prod

rm ruoyi-admin-ui.zip

zip -r dist.zip dist/

open .
