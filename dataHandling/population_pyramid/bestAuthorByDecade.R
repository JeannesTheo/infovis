# Load required libraries
install.packages("dplyr")
install.packages("tidyr")
library(dplyr)
library(tidyr)

base_dir <- "C:/Users/benja/OneDrive/Documents/visR/infovis/dataHandling"
setwd(base_dir)
setwd('data')

# Read the CSV file into a data frame
data <- read.csv("albums.csv")

# Create a new column for the 10-year interval
filtered_data <- data %>%
  mutate(interval = 10 * ((as.numeric(publicationDate) - 1963) %/% 10) + 1963)

# Separate data into explicit and non-explicit songs
explicit_songs <- filtered_data %>%
  filter(explicitLyrics == "True")

non_explicit_songs <- filtered_data %>%
  filter(explicitLyrics == "")

# Function to find the top 5 songs with the most Deezer fans for each year
find_top5_deezerfan_songs <- function(data) {
  result <- data %>%
    group_by(interval) %>%
    slice_max(order_by = deezerFans, n = 5) %>%
    ungroup()
  return(result)
}

# Find the top 5 Deezer fan songs for explicit and non-explicit songs separately
explicit_top5_deezerfan <- find_top5_deezerfan_songs(explicit_songs)
non_explicit_top5_deezerfan <- find_top5_deezerfan_songs(non_explicit_songs)

# Select only relevant columns
columns_to_keep <- c("name", "deezerFans","interval")
explicit_top5_deezerfan <- select(explicit_top5_deezerfan, columns_to_keep)
non_explicit_top5_deezerfan <- select(non_explicit_top5_deezerfan, columns_to_keep)

# Print the results
cat("Top 5 Explicit Songs with Most Deezer Fans:\n")
print(explicit_top5_deezerfan)

cat("\nTop 5 Non-Explicit Songs with Most Deezer Fans:\n")
print(non_explicit_top5_deezerfan)

# Save the results to separate CSV files with relevant columns
write.csv(explicit_top5_deezerfan, "explicit_top5_deezerfan.csv", row.names = FALSE)
write.csv(non_explicit_top5_deezerfan, "non_explicit_top5_deezerfan.csv", row.names = FALSE)

