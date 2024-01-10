#!/usr/bin/env bash

FILE="node.js"
counter=0
for i in {1..7}
do
    echo "Iteration $i"
    node "main.js"
    sleep 60
done
if [ $? -eq 0 ]; then
    
    echo "$THISFILENAME executed successfully."
else
    echo "$THISFILENAME encountered an error."
fi
