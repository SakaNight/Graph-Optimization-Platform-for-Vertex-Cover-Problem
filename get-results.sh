#!/bin/bash

echo "Starting test..."

output_file="results.txt"
> "$output_file"  # Clear or create output file

while IFS= read -r line1 && IFS= read -r line2
do
    if [ "$(echo $line1 | cut -c1)" = "V" ]; then
        # Output vertex number
        echo "$line1" >> "$output_file"
        # Input both V and E lines to program and get results
        { echo "$line1"; echo "$line2"; } | ./build/ece650-prj >> "$output_file"
        echo "" >> "$output_file"  # Add blank line between test cases
    fi
done < "graphs.txt"

echo "Test completed. Results saved in results.txt"
