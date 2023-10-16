import json
import os
import time, calendar
import requests
import pandas as pd

FIELDS_ARTISTS = ['_id', 'name', 'type', 'gender']
FIELDS_ARTISTS_MEMBER = ['name', 'gender']
FIELDS_ALBUMS = ['_id', 'id_artist', 'title', 'country']

def get_albums(file_name_albums):
    base_url_albums = 'https://wasabi.i3s.unice.fr/api/v1/album/id/'
    cpt = 0
    cpt_global = 0
    list_albums = []
    list_albums_filtered = []
    with open(file_name_albums, 'r') as f:
        album_list = f.read().splitlines()
        f.close()
    i = 0
    nb_albums = len(album_list)
    while i < len(album_list):
        album_id = album_list[i]
        if cpt >= 100:
            cpt = save_albums(nb_albums, cpt_global, cpt, list_albums, list_albums_filtered)
        r = requests.get(base_url_albums + str(album_id))
        if r.status_code == 200:
            album = r.json()
            list_albums.append(album)
            album_filtered = {key: album.pop(key) for key in FIELDS_ALBUMS if key in album}
            list_albums_filtered.append(album_filtered)
            cpt += 1
            cpt_global += 1
            print(f'\tAlbum retrieved : {album_id}')
            i += 1
        elif r.status_code == 429:
            cpt = save_albums(nb_albums, cpt_global, cpt, list_albums, list_albums_filtered)
            for i in range(6):
                print(f'\tWaiting for {(6 - i) * 10} seconds')
                time.sleep(10)
        else:
            print(f'ALBUM_ERROR Error {r.status_code} for {str(album_id)}')
            i += 1
    save_albums(nb_albums, cpt_global, cpt, list_albums, list_albums_filtered)


def save_albums(nb_albums, cpt_global, cpt, list_albums, list_albums_filtered):
    save_data(list_albums_filtered, 'tmp_albums_filtered', cpt)
    save_data(list_albums, 'tmp_albums', cpt)
    print(f'Retrieved {cpt_global}/{nb_albums} albums')
    return 0


def save_data(data, file_name, nb):
    with open(file_name + '.json', 'w') as f:
        f.write(json.dumps(data, indent=1))
        f.close()
    print(f'Saved {nb} items in {file_name}.json')


def save_artists(nb_artists, cpt_global, cpt, list_artists, list_artists_filtered):
    save_data(list_artists_filtered, 'tmp_artists_filtered', cpt)
    save_data(list_artists, 'tmp_artists', cpt)
    print(f'Retrieved {cpt_global}/{nb_artists} artists')
    return 0


def get_artists(file_name_artists):
    base_url_artists = 'https://wasabi.i3s.unice.fr/api/v1/artist/name/'
    cpt = 0
    list_artists = []
    list_artists_filtered = []
    cpt_global = 0
    with open(file_name_artists, 'r') as f:
        artists_list = f.read().splitlines()
        f.close()
    i = 0
    nb_artists = len(artists_list)
    while i < len(artists_list):
        artist = artists_list[i]
        if cpt >= 100:
            cpt = save_artists(nb_artists, cpt_global, cpt, list_artists, list_artists_filtered)
        r = requests.get(base_url_artists + str(artist))
        if r.status_code == 200:
            cpt, cpt_global = add_artist(cpt, cpt_global, artist, list_artists, list_artists_filtered, r)
            i += 1
        elif r.status_code == 429:
            cpt = save_artists(nb_artists, cpt_global, cpt, list_artists, list_artists_filtered)
            for t in range(6):
                print(f'\tWaiting for {(6 - t) * 10} seconds')
                time.sleep(10)
        else:
            print(f'ARTIST_ERROR Error {r.status_code} for {str(artist)}')
            i += 1
    save_artists(nb_artists, cpt_global, cpt, list_artists, list_artists_filtered)


def add_artist(cpt, cpt_global, i, list_artists, list_artists_filtered, r):
    print(f'\tArtist retrieved : {i}')
    artist = r.json()
    list_artists.append(artist)
    artist_filtered = {key: artist.pop(key) for key in FIELDS_ARTISTS if key in artist}
    members = artist['members']
    artist_filtered['members'] = []
    for member in members:
        artist_filtered['members'].append(
            {key: member.pop(key) for key in FIELDS_ARTISTS_MEMBER if key in member})
    list_artists_filtered.append(artist_filtered)
    cpt += 1
    cpt_global += 1
    return cpt, cpt_global


def get_songs(nb_songs, start=0):
    json_responses = []
    base_url_songs = 'https://wasabi.i3s.unice.fr/api/v1/song_all/'
    cpt = start
    not_finished = True
    urlParams = '?project=_id,id_album,albumTitle,name,publicationDate,genre,releaseDate,explicitLyrics,award,rank,title'
    while cpt < nb_songs and not_finished:
        r = requests.get(base_url_songs + str(cpt) + urlParams)
        if r.status_code == 200:
            songs_list = r.json()
            nb_chansons_retrieved = len(songs_list)
            cpt += nb_chansons_retrieved
            print(f'Retrieved songs from {str(cpt - nb_chansons_retrieved)} to {str(cpt)}')
            if nb_chansons_retrieved == 0:
                not_finished = False
                print(f'No more songs to retrieved')
            json_responses += songs_list
        elif r.status_code == 429:
            with open('tmp.json', 'w') as f:
                f.write(json.dumps(json_responses, indent=1))
                f.close()
            print(f'Saved {str(cpt - start)} songs in tmp.json')
            for i in range(6):
                print(f'\tWaiting for {(6 - i) * 10} seconds')
                time.sleep(10)
        else:
            not_finished = False
            print(f'Error {r.status_code} for {base_url_songs + str(cpt)}')
    with open('tmp.json', 'w') as f:
        f.write(json.dumps(json_responses, indent=1))
        f.close()
    print(f'Finished retrieving songs from {str(start)} to {str(cpt)}')


def convert_to_csv(file_name, file_to_convert='tmp'):
    with open(file_to_convert + '.json', 'r') as f:
        data = json.load(f)
        df = pd.json_normalize(data, max_level=1)
        df.to_csv(file_name + ".csv",index=False,header=True)


if __name__ == '__main__':
    r = requests.get('https://wasabi.i3s.unice.fr/search/dbinfo')
    data = r.json()
    print(data)
    # nb_songs = data['nbSong']
    # convert_to_csv('wasabi-2-0/album','wasabi-2-0/json/album')
    # convert_to_csv('wasabi-2-0/artists','wasabi-2-0/json/artist-without-members')
    # convert_to_csv('wasabi-2-0/artist_members','wasabi-2-0/json/artist-members')

