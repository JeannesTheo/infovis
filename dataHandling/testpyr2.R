# Install and load the required libraries
install.packages("dplyr")
install.packages("tidyr")
library(dplyr)
library(tidyr)
base_dir <- "C:/Users/benja/OneDrive/Documents/visR/infovis/dataHandling"
setwd(base_dir)
setwd('data')
# Read the CSV file
data <- read.csv("duplwithgener.csv", header = FALSE, col.names = c("Genres", "Explicit", "Year", "Count"))
print(data)
# Remove unnecessary characters from the Genres column
data$Genres <- gsub("\\[|\\]|'|\\s+", "", data$Genres)
data$Genres <- strsplit(data$Genres, ",")

# Explode the Genres column to separate each genre into rows
data <- data %>%
  unnest(Genres)
# Convertir la colonne "Count" en valeurs numériques
data$Count <- as.numeric(data$Count)

# Convertir la colonne "Year" en valeurs numériques
data$Year <- as.numeric(data$Year)

# Créer une nouvelle variable pour les périodes de 10 ans
data$Year_Period <- cut(data$Year, breaks = seq(1960, 2020, by = 10), labels = FALSE)

# Grouper et résumer les données par Year_Period, Explicit et Genres
result <- data %>%
  group_by(Year_Period, Explicit, Genres) %>%
  summarise(Total = sum(Count))

# Trouver les genres avec le count le plus élevé pour chaque période de 5 ans, explicit et non-explicit
max_genre <- result %>%
  group_by(Year_Period, Explicit) %>%
  top_n(5, Total)

# Afficher les résultats
print(max_genre)

# Écrire les résultats dans un fichier CSV nommé "ma quiche loraine.csv"
write.csv(max_genre, file.path(base_dir, "ma quiche loraine.csv"), row.names = FALSE)
