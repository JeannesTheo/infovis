base_dir <- "/home/theojeannes/Dev/Scolaire/InfoVis/infovis/"
setwd(base_dir)
library(utils)
library(dplyr)

aggregate_data <- function(type) {
  dir <- paste0('./', type)

  if (!file.exists(dir)) {
    dir.create(dir)
    print(paste('Aucun dossier', type, 'trouvé'))
  }else {
    setwd(dir)
    csv_files <- list.files(pattern = '*.csv')
    datas <- data.frame()
    for (file in csv_files) {
      print(paste("Adding", file))
      datas <- rbind(datas,
      )
    }
    datas <- unique(datas)
    write.csv(datas, paste0('../', type, '.csv'), row.names = FALSE)
    setwd(base_dir)
  }
}
encode <- function (x) return (URLencode(repeated = FALSE,x, reserved = TRUE))
print('Start')

aggregate_data("songs")

songs <- read.csv('datav1/songs.csv')
album_ids <- lapply(unique(songs$id_album),encode)
artists_names <- lapply(unique(songs$name),encode)
write(unlist(album_ids), 'albums_id.txt')
writeLines(unlist(artists_names), 'artists_name.txt')

setwd('wasabi-2-0')
artists <- read.csv('datav1/artists.csv', header = TRUE, sep = ',', fill = TRUE, dec = '..')
artists_members <- read.csv('artist_members.csv', header = TRUE, sep = ',', fill = TRUE, dec = '..')
artists <- unique(right_join(artists,artists_members,"X_id..oid"))
setwd(base_dir)
file.copy("wasabi-2-0/album.csv", "datav1/albums.csv")
write.csv(artists, 'datav1/artists.csv',row.names = FALSE)
print('Done')
