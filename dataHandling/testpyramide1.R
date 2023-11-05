base_dir <- "C:/Users/benja/OneDrive/Documents/visR/infovis/dataHandling"
setwd(base_dir)
install.packages("rlang")
install.packages("dplyr")
install.packages("stringr")
library(utils)
library(rlang)
library(dplyr)
library(stringr)

count_data <- function(input_file, save_file) {
  setwd('data')
  data <- read.csv(input_file, header = TRUE, sep = ',', fill = TRUE, dec = '.')
  # Step 2: Use dplyr to group and count unique combinations
  combinations_count <- data %>%
    group_by_all() %>%
    summarise(count = n())
  # Step 3: Write the results to a CSV file
  write.csv(combinations_count, save_file, row.names = FALSE)
  # write.csv(data, save_file, row.names = FALSE)
  setwd(base_dir)
}

setwd('data')
data <- read.csv('songs_filtered_dates.csv', header = TRUE, sep = ',', fill = TRUE, dec = '.')
data <- subset(data, select = c("genre", "explicitLyrics", "year","id_album"))
data_cleaned <- data[complete.cases(data),] # Seule la colonne des années a des trous, mais par précaution on enlève les lignes avec des NA
lst_years <- list()
cpt <- 0
for (i in seq_len(nrow(data_cleaned))) {
  tmp <- data_cleaned[i, "year"]
  if (tmp > 2023 || tmp < 1962) {
    cpt <- cpt + 1
    print(paste("Problem :", tmp))
    if (!(tmp %in% names(lst_years))) {
      lst_years[tmp] <- 0
    }
    lst_years[tmp] <- as.numeric(lst_years[tmp]) + 1
  }
}
data_cleaned <- subset(data_cleaned,year>1961 & year<2018)
write.csv(data_cleaned, 'valuepyr2.csv', row.names = FALSE)
setwd(base_dir)
count_data('valuepyr2.csv', 'valuepyr2_count.csv')
setwd('data')
data <- read.csv('valuepyr2_count.csv', header = TRUE, sep = ',', fill = TRUE, dec = '.')

