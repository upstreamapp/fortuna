cp -R ../dist/@types ./
cp -R ../dist/client ./

# discard local changes
git checkout -- package-lock.json
 
npm version patch

npm pack

npm publish

npm version prerelease
 
git commit -am "pre version $(npm pkg get version | xargs echo)"

git push