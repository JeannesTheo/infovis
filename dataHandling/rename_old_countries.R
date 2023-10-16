# Load the required library
library(dplyr)

# Read the merged_songs_with_decades.csv file
merged_data <- read.csv("data/merged_songs_with_decades.csv", header = TRUE)

# Get the "country" column and rename specific country codes
merged_data$country <- recode(merged_data$country, "CS" = "RS", "UM" = "US", "YU" = "HR", "SU" = "RU")

# Overwrite the existing CSV file with the updated data
write.csv(merged_data, "data/merged_songs_with_decades.csv", row.names = FALSE)
