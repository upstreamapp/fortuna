node_version=$(node -v)
node_required_version="v16.17.0"

npm_version=$(npm -v)
npm_required_version="8.15.0"

echo "Node: $node_version"
echo "NPM: $npm_version"

if [[ "$node_version" != "$node_required_version" || "$npm_version" != "${npm_required_version}" ]]; then
echo -e "\033[33mNode version needs to be ${node_required_version} and NPM version needs to be ${npm_required_version} \033[0m"
echo -e "\033[33mRun \"nvm use ${node_required_version}\" to use correct version \033[0m"
exit 1
fi

echo -e "\nSweet, Node and NPM version requirement checks out\n"

exit 0