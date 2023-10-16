npm run build

cd dist

rm auctions-yahoo-extension.zip

zip -r auctions-yahoo-extension.zip auctions-yahoo-extension/

cp auctions-yahoo-extension.zip ../../auctions-yahoo-admin-ui/public
