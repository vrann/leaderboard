rm -rf /tmp/github-elastic
cp -rf ../backend /tmp/github-elastic
pushd /tmp
zip -r github-elastic.zip github-elastic/*
popd
mv /tmp/github-elastic.zip ../artifacts/
