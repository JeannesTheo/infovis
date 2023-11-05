base_dir <- "C:/Users/QUENTIN B/DataspellProjects/infovis/dataHandling"
setwd(base_dir)
# Load required library
library(dplyr)

data <- read.csv("data/all_decade_data.csv")

data_1970 <- data[data$decade == 1970, ]
data_1980 <- data[data$decade == 1980, ]
data_1990 <- data[data$decade == 1990, ]
data_2000 <- data[data$decade == 2000, ]
data_2010 <- data[data$decade == 2010, ]

# Write each filtered dataset to separate CSV files
write.csv(data_1970, "data/decade_1970.csv", row.names = FALSE)
write.csv(data_1980, "data/decade_1980.csv", row.names = FALSE)
write.csv(data_1990, "data/decade_1990.csv", row.names = FALSE)
write.csv(data_2000, "data/decade_2000.csv", row.names = FALSE)
write.csv(data_2010, "data/decade_2010.csv", row.names = FALSE)

# Filter data for decades under 1970
data_under_1970 <- data[data$decade < 1970, ]

# Group by country and summarize the data
grouped_data <- data_under_1970 %>%
  group_by(country, latitude, longitude, name) %>%
  summarize(
    ExplicitVolume = sum(ExplicitVolume),
    NonExplicitVolume = sum(NonExplicitVolume),
    TotalVolume = sum(TotalVolume),
    Ratio = sum(ExplicitVolume) / sum(NonExplicitVolume)
  )

# Write the grouped data to a CSV file
write.csv(grouped_data, "data/decade_other.csv", row.names = FALSE)