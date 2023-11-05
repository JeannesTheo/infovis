# Load required libraries
install.packages("dplyr")
install.packages("tidyr")
library(dplyr)
library(tidyr)

base_dir <- "C:/Users/benja/OneDrive/Documents/visR/infovis/dataHandling"
setwd(base_dir)
setwd('data')

# Read the CSV file
data <- read.csv("albums.csv")

# Create a new column for the 10-year interval
filtered_data <- data %>%
  mutate(interval = 10 * ((as.numeric(publicationDate) - 1963) %/% 10) + 1963)

# Separate data into explicit and non-explicit
explicit_data <- filtered_data %>% filter(explicitLyrics == "True")
non_explicit_data <- filtered_data %>% filter(explicitLyrics == "")

# Create a function to find the country with the most Deezer fans for a specific year
find_max_deezer_fans_country <- function(data) {
  result <- data %>%
    group_by(interval, country) %>%
    summarize(total_deezerfan = sum(deezerFans)) %>%
    slice(which.max(total_deezerfan))
  return(result)
}

# Find the country with the most Deezer fans for each year in both explicit and non-explicit datasets
explicit_max_fans <- find_max_deezer_fans_country(explicit_data)
non_explicit_max_fans <- find_max_deezer_fans_country(non_explicit_data)

# Print the results
cat("Explicit Lyrics:\n")
print(explicit_max_fans)

cat("Non-Explicit Lyrics:\n")
print(non_explicit_max_fans)

# Write the results to separate CSV files
write.csv(explicit_max_fans, "explicit_max_deezer_fans_country.csv", row.names = FALSE)
write.csv(non_explicit_max_fans, "non_explicit_max_deezer_fans_country.csv", row.names = FALSE)


