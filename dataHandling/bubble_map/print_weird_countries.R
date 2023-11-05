# Load the required library
library(dplyr)

# Read the final_data.csv file
final_data <- read.csv("../data/final_data.csv", header = TRUE)

# Filter rows where "country" and "latitude" are defined (not empty or missing)
filtered_data <- final_data %>%
  filter(!is.na(country) & is.na(latitude))

# Print the number of data points in filtered data
cat("Number of data points in filtered data:", nrow(filtered_data), "\n")

# Print the different values in the "country" column of filtered data
cat("Different values in the 'country' column of filtered data:\n")
unique_countries <- unique(filtered_data$country)
cat(paste(unique_countries, collapse = ", "), "\n")

# Print ONLY the "country" column of filtered data
# cat("Country column of filtered data:\n")
# print(filtered_data$country)
