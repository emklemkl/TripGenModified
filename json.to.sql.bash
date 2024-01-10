#!/usr/bin/env bash

# This file is executed in setup.db.bash but it is capable of being executed on its own.
# The purpose of this script is to reformat json data generated using TripGenerator https://github.com/JuliaLind/TripGenerator-extended
# to a insert sql query for each trip object for easy access in the db.

TRIPS_JSONFILE="./bike-sim-routes-trimmed.json"
SIMULATION_TRIPS="./simulation-trips.sql"
DATABASE="./bikr.db"
DB_TABLE="simulate"
THISFILENAME=$(basename "$0") # Get file name

# Read the content of the JSON with jq
json=$(jq '.[]' "$TRIPS_JSONFILE")
# Loop through each object in the JSON array
    # sqlite3 $DATABASE <<EOF
data=""

for trip in $(echo "$json" | jq -c '.'); do
    city_id=$(echo "$trip" | jq -r '.city')
    trip=$(echo "$trip" | jq -r '.trips')

    # Concatenate data with commas
    data+="($city_id, '$trip'),"
done

# Replace the last comma with a semicolon
data=$(echo "INSERT INTO $DB_TABLE (city_id, bike_route) VALUES $data")

# Write the data to the file
echo "$data" > "$SIMULATION_TRIPS"
# echo "INSERT INTO $DB_TABLE (city_id, bike_route) VALUES" > "$SIMULATION_TRIPS"
# for trip in $(echo "$json" | jq -c '.'); do
#         city_id=$(echo "$trip" | jq -r '.city')
#         trip=$(echo "$trip" | jq -r '.trips')

#         # Insert data into simulate table
#         echo "($city_id, '$trip')," >> "$SIMULATION_TRIPS"
# done
#     echo ";" >> "$SIMULATION_TRIPS"

# Check the exit status
if [ $? -eq 0 ]; then
    
    echo "$THISFILENAME executed successfully."
else
    echo "$THISFILENAME encountered an error."
fi
