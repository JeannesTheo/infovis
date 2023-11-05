base_dir <- "C:/Users/QUENTIN B/DataspellProjects/infovis/"
setwd(base_dir)
# Load the required library
library(dplyr)

# Read the merged_songs.csv file
merged_data <- read.csv("../data/merged_songs.csv", header = TRUE)

merged_data$year <- as.numeric(as.character(merged_data$year))

# Create a new column "decade" based on the "year" column
merged_data <- merged_data %>%
  mutate(
    decade = floor(year / 10) * 10
  )

# Print the updated data
print(merged_data)

# Write the updated data back to a new CSV file if needed
write.csv(merged_data, "data/merged_songs_with_decades.csv", row.names = FALSE)