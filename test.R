x<-  1
y<-2
year <- '2023-01-01'

tryCatch(
{ year <- year(ymd(year)) },
warning = function(w){ print(paste("Problem :", x, y,w)) },
error = function (e){ print(paste('C \' est la merde: ', x, y,e)) }
)
print(year)