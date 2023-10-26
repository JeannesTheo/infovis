library(dplyr)
library(utils)
library(rlang)
library(stringr)
base_dir <- "/home/theojeannes/Dev/Scolaire/InfoVis/git/dataHandling"
setwd(base_dir)

split_songs <- function() {
  setwd('data')
  #Step 1: Read the original CSV file into a data frame
  data <- read.csv("songs_filtered_dates.csv")
  # Step 2: Select the columns you want to keep
  songs <- subset(data, select = c(explicitLyrics, artist_name, id_album))  # Exclude "Column1" and "Column2"
  # Step 3: Write the filtered data to a new CSV file
  #write.csv(songs, "parallel_set_songs.csv", row.names = FALSE)
  setwd(base_dir)
  return(songs)
}

split_artists <- function() {
  setwd('data')
  #Step 1: Read the original CSV file into a data frame
  data <- read.csv("artists.csv")
  # Step 2: Select the columns you want to keep
  artists <- subset(data, select = c(name, type, gender, location.country))  # Exclude "Column1" and "Column2"
  colnames(artists)[colnames(artists) == "name"] <- "artist_name"
  # Step 3: Write the filtered data to a new CSV file
  #write.csv(artists, "parallel_set_artists.csv", row.names = FALSE)
  setwd(base_dir)
  return(artists)
}

split_album <- function() {
  setwd('data')
  #Step 1: Read the original CSV file into a data frame
  data <- read.csv("albums.csv")
  # Step 2: Select the columns you want to keep
  albums <- subset(data, select = c(X_id..oid, explicitLyrics))
  colnames(albums)[colnames(albums) == "explicitLyrics"] <- "explicitAlbum"
  colnames(albums)[colnames(albums) == "X_id..oid"] <- "id_album"
  # Step 3: Write the filtered data to a new CSV file
  #write.csv(albums, "parallel_set_albums.csv", row.names = FALSE)
  setwd(base_dir)
  return(albums)
}

join_data <- function(songs, artists, albums) {
  setwd('data')
  joined_data <- inner_join(songs, artists, by = "artist_name")
  joined_data_2 <- inner_join(joined_data, albums, by = "id_album")
  final <- subset(joined_data_2, select = -c(id_album, artist_name))
  write.csv(final, "final.csv", row.names = FALSE)
  setwd(base_dir)
  return(final)
}

count_data <- function(final) {
  setwd('data')
  #data <- read.csv("parallel_set_songs.csv")
  # Step 2: Use dplyr to group and count unique combinations
  combinations_count <- final %>%
    group_by_all() %>%
    summarise(count = n())
  # Step 3: Write the results to a CSV file
  #write.csv(combinations_count, "parallel_set.csv", row.names = FALSE)
  write.csv(final, "parallel_set2", row.names = FALSE)
  setwd(base_dir)
}

count_without_country <- function() {
  setwd('data')
  final <- read.csv("final.csv")
  splited <- subset(final, select = -c(location.country))
  combinations_count <- splited %>%
    group_by_all() %>%
    summarise(count = n())
  # Step 3: Write the results to a CSV file
  write.csv(combinations_count, "parallel_set_filtered.csv", row.names = FALSE)
  setwd(base_dir)
}

delete_and_fill_lines <- function(input_file, save_file) {
  setwd('data')
  final <- read.csv(input_file, header = TRUE, sep = ',', fill = TRUE, dec = '.')
  #supprimer toutes les lignes qui n'ont pas de pays
  list_countries_empty <- sapply(final$location.country, is_empty_string)
  data <- final[!list_countries_empty,]
  # Spécifiez les colonnes que vous voulez vérifier pour les valeurs manquantes
  colonnes_a_verifier <- c("type", "gender", "explicitAlbum")
  # # Supprimez les lignes contenant des valeurs manquantes dans TOUTES les colonnes spécifiées
  list_all_empty <- apply(data[, colonnes_a_verifier], 1, function(x) all(is_empty_string(x)))
  data <- data[!list_all_empty,]
  data$type <- mapply(function(x, y) {
    ifelse(is_empty_string(x),
           ifelse(y == "Male" || y == "Female", "Person", "Group"),
           x)
  }, data$type, data$gender)

  data$explicitAlbum <- mapply(function (x,y){ ifelse(is_empty_string(x),
                                                      ifelse(y == "True", "True", "False"),
                                                      x)},data$explicitAlbum,data$explicitLyrics)

  data$gender <- mapply(function(x) {
    ifelse(is_empty_string(x), "Other", x)
  }, data$gender)

  # Sauvegardez le résultat dans un nouveau fichier CSV si nécessaire
  write.csv(data, save_file, row.names = FALSE)
  setwd(base_dir)
}

is_empty_string <- function(x) return(is_null(x) || is_na(x) || is_empty(x) || x == "")

print('Start')
delete_and_fill_lines(input_file='final.csv',save_file="filled_parallel_set.csv")
print('Done')
#songs <- split_songs()
#artists <- split_artists()
#albums <- split_album()
#final <- join_data(songs, artists, albums)
#count_data(final)
#count_without_country()

#setwd('data')
#data <- read.csv("parallel_set2.csv")
#f <- subset(data, select = -c(location.country))
#write.csv(f, "parallel_set3.csv", row.names = FALSE)