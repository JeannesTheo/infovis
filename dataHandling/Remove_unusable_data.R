# Load the required library
library(dplyr)

# Read the final_data.csv file
final_data <- read.csv("../data/final_data.csv", header = TRUE)

# Filter rows where "latitude" is not missing
final_data <- final_data %>%
  filter(!is.na(latitude))

# Overwrite the existing CSV file with the filtered data
write.csv(final_data, "../data/final_data.csv", row.names = FALSE)
