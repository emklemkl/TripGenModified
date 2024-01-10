#!/usr/bin/env bash

DBFILE="bike-sim-routes.json"
DBFILE2="bike-sim-routes-trimmed.json"
rm -d $DBFILE
rm -d $DBFILE2
JSONFILES="bike-routes/*.json"
THISFILENAME=$(basename "$0") # Get file name


echo "[" > "$DBFILE"
for JSON in $JSONFILES; do
    trip=$(jq '{ city: .city, trips: .trips[].coords }' "$JSON")
    echo "$trip," >> $DBFILE
done
echo "]" >> "$DBFILE"
# Check the exit status

# Get the second last row
lastRow=$(cat $DBFILE | wc -l) 
((lastRow-=1))

#Removes trailing comma on last entry, it will always be the second last row.
awk -v line_number="$lastRow" 'NR == line_number { sub(/,/, ""); } { print }' $DBFILE > $DBFILE2 

if [ $? -eq 0 ]; then
    
    echo "$THISFILENAME executed successfully."
else
    echo "$THISFILENAME encountered an error."
fi
