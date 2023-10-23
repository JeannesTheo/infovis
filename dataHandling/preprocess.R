base_dir <- "/home/theojeannes/Dev/Scolaire/InfoVis/git/dataHandling"
setwd(base_dir)
# install.packages("stringr")
# install.packages("tidyverse")
# install.packages("babynames")
library(utils)
library(rlang)
library(dplyr)
library(lubridate)
library(stringr)

filter_columns <- function() {
  print('Starting filters')
  setwd('datav1')
  songs <- read.csv('songs.csv', header = TRUE, sep = ',', fill = TRUE, dec = '..')
  albums <- read.csv('albums.csv', header = TRUE, sep = ',', fill = TRUE, dec = '..')
  artists <- read.csv('artists.csv', header = TRUE, sep = ',', fill = TRUE, dec = '..')
  print('Datas loaded')
  songs$artist_name <- songs$name
  songs <- songs[, c('X_id', 'id_album', 'artist_name', 'title', 'genre', 'rank', 'explicitLyrics', 'publicationDate', 'releaseDate')]
  albums <- albums[, c('X_id..oid', "id_artist", "id_artist..oid", "name", "language", "country", "deezerFans")]
  artists <- artists[, c('X', "gender", "name", "members", "type", "members_id", "X_id..oid")]

  write.csv(songs, 'songs_filtered.csv', row.names = FALSE)
  write.csv(albums, 'albums_filtered.csv', row.names = FALSE)
  write.csv(artists, 'artists_filtered.csv', row.names = FALSE)
  setwd(base_dir)
  print('Filters done')
}

is_empty_string <- function(x) return(is_null(x) || is_na(x) || is_empty(x) || x == "")
is_empty_date <- function(x) return(is_empty_string(x) || x == '0000-00-00')
clean_date_string <- function(x) return(str_subset(x, "[\\[\\] ]", negate = TRUE))
options(warn = 2)

get_year <- function(x, y) {
  year <- 0
  x <- clean_date_string(x)
  y <- clean_date_string(y)
  if (!is_empty_date(x) || !is_empty_date(y)) {
    if (!is_empty_date(x))
      year <- x
    else
      year <- y
    tryCatch(
    { year <- year(ymd(year)) },
    warning = function (w){ print(paste("Problem :", x, y,w)) },
    error = function (e){ print(paste('C \' est la merde: ', x, y,e)) }
    )

  }
  return(switch(as.character(year), "0" = NA, "2100" = 2010, "4018" = 2018, year))
}

merging_dates <- function (input_file,save_file){
  setwd('datav1')
  print('Start merging dates')
  songs <- read.csv(input_file, header = TRUE, sep = ',', fill = TRUE, dec = '..')
  songs$year <- mapply(get_year, songs$publicationDate, songs$releaseDate)
  songs_a <- subset(songs, select = -c(releaseDate, publicationDate))
  write.csv(songs_a, save_file, row.names = FALSE)
  print('Done')
  setwd(base_dir)
}

clearing_text <- function (input_file,save_file,field){
  setwd('datav1')
  print(paste('Start clearing',field))
  data <- read.csv(input_file, header = TRUE, sep = ',', fill = TRUE, dec = '.')
  data <- data[!(data[[field]] == '' | is.na(data[[field]])), ]
  write.csv(data,save_file,row.names = FALSE)
  print('Done')
  setwd(base_dir)
}

split_genres <- function (x){
  x <- gsub("\\[", "", x)
  x <- gsub("\\]", "", x)
  x <- gsub("\\'", "", x)
  x <- trimws(x)
  return (str_split(x,', '))
}

get_genres <- function (input_file,output_file){
  setwd('data')
  print('Start')
  data <- read.csv(input_file, header = TRUE, sep = ',', fill = TRUE, dec = '.')
  genres <- unique(data$genre)
  genres_unique <- unique(unlist(lapply(genres,split_genres)))
  occurences_genres <- list()
  for (i in genres_unique){
    occurences_genres[[coll(i)]] <- 0
  }
  occurences_genres <- occurences_genres[-1]
  cpt <- 0
  print(paste0('Will save in ',output_file))
  genres_n <- data$genre
  genres_n <- genres_n[sapply(genres_n,function(x) !is_empty_string(x) & x !="[]")]
  print(paste0('Will go through ',length(genres_n),' genres'))
  for (i in genres_n){
    for (occ in names(occurences_genres)){
      occurences_genres[occ] <- str_count(i,occ) + occurences_genres[[occ]]
    }
    cpt <- cpt+1
    if (cpt%%5000==0){
      print(paste(format(Sys.time(),'%H:%M:%S'),cpt))
      write.csv(occurences_genres,output_file,row.names = FALSE)
    }
  }

  write.csv(occurences_genres,output_file,row.names = FALSE)
  print('Done')
  setwd(base_dir)
}

# merging_dates('songs_filtered.csv','songs_filtered_dates.csv')
# clearing_text('songs_filtered_dates.csv',save_file= 'songs_cleared.csv','title')
get_genres('songs_filtered_dates.csv',paste0('occurences_',format(Sys.time(),"%s"),'.csv'))