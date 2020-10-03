#!/bin/bash

# https://stackoverflow.com/questions/23387256/shell-script-to-join-5-or-more-json-files-together

shopt -s nullglob
declare -a jsons
jsons=(*.json) # ${jsons[@]} now contains the list of files to concatenate
echo '[' > esou.json
if [ ${#jsons[@]} -gt 0 ]; then # if the list is not empty
  cat "${jsons[0]}" >> esou.json # concatenate the first file to the esou.json...
  unset 'jsons[0]'                     # and remove it from the list
  for f in "${jsons[@]}"; do         # iterate over the rest
      echo "," >>esou.json
      cat "$f" >>esou.json
  done
fi
echo ']' >>esou.json            # complete the esou.json

echo success
