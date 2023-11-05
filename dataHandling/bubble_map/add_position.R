base_dir <- "C:/Users/QUENTIN B/DataspellProjects/infovis/"
setwd(base_dir)
# Load the required library
library(dplyr)

# Read the merged_songs_with_decades.csv file
merged_songs <- read.csv("data/merged_songs_with_decades.csv", header = TRUE)

# Read the countries.csv file, but only select the "country," "latitude," and "longitude" columns
countries <- read.csv("data/countries.csv", header = TRUE) %>%
  select(country, latitude, longitude)

# Merge the two data frames based on the "country" column
final_data <- merged_songs %>%
  left_join(countries, by = "country")

# Print the updated data
print(final_data)

# Write the updated data back to a new CSV file if needed
write.csv(final_data, "../data/final_data.csv", row.names = FALSE)

