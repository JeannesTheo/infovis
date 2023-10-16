base_dir <- "C:/Users/QUENTIN B/DataspellProjects/infovis/"
setwd(base_dir)
# Load the required library
# Load the required library
library(dplyr)

# Read the albums.csv file
albums <- read.csv("../data/albums.csv", header = TRUE)

# Read the songs.csv file
songs <- read.csv("../data/songs_filtered_dates.csv", header = TRUE)

print("files read")

# Merge the albums and songs data based on the different column names
merged_data <- songs %>%
  left_join(albums %>% select(X_id..oid, country), by = c("id_album" = "X_id..oid"))

# Print the merged data to verify
print(merged_data)

# Write the merged data back to a new CSV file if needed
write.csv(merged_data, "../data/merged_songs.csv", row.names = FALSE)

print("file written")
