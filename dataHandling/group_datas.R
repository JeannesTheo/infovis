base_dir <- "C:/Users/QUENTIN B/DataspellProjects/infovis/dataHandling"
setwd(base_dir)
# Load required library
library(dplyr)
library(tidyr)

# Read the CSV file into a data frame
data <- read.csv("data/final_data.csv")

# Group the data by country, latitude, and longitude
grouped_data <- data %>%
  group_by(country, latitude, longitude, explicitLyrics)

volume_count <- grouped_data %>%
  summarize(volume = n())

explicit_data <- volume_count %>% filter(explicitLyrics == 'True')
non_explicit_data <- volume_count %>% filter(explicitLyrics == 'False')

# Merge the explicit and non-explicit data into one line per group
result <- merge(explicit_data, non_explicit_data, by = c("country", "latitude", "longitude"), all = TRUE)

# Replace NA values with 0
result[is.na(result)] <- 0

# Rename columns
result <- result[, -c(4, 6)] # remove useless columns
colnames(result) <- c("country", "latitude", "longitude", "ExplicitVolume", "NonExplicitVolume")

result <- result %>%
  mutate(
    TotalVolume = ExplicitVolume + NonExplicitVolume,
    Ratio = (ExplicitVolume / TotalVolume)*100
  )

new_data <- read.csv("data/countries.csv")
new_data_selected <- new_data %>%
  select(country, name)

# Left join the new data with the existing result based on the "country" column
result_with_names <- left_join(result, new_data_selected, by = "country")


# Print the result
print(result_with_names)
write.csv(result_with_names, "data/all_data.csv", row.names = FALSE)
