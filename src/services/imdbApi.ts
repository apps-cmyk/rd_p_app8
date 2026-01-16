import { Movie, Person, SearchResult } from '../types/movie';
import axios from 'axios';
import { processMovieGenres } from '../utils/genres';
import { retryWithBackoff, isNetworkError } from '../utils/retryUtils';

class ImdbApiClient {
    private baseUrl = 'https://imdb236.p.rapidapi.com';
    private apiKey = '636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997';
    private cache = new Map<string, any>();
    private headers = {
        'x-rapidapi-key': '636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997',
        'x-rapidapi-host': 'imdb236.p.rapidapi.com'
    };

    private countryMap: { [key: string]: string } = {
        'AD': 'Andorra',
        'AE': 'United Arab Emirates',
        'AF': 'Afghanistan',
        'AG': 'Antigua and Barbuda',
        'AI': 'Anguilla',
        'AL': 'Albania',
        'AM': 'Armenia',
        'AN': 'Netherlands Antilles',
        'AO': 'Angola',
        'AQ': 'Antarctica',
        'AR': 'Argentina',
        'AS': 'American Samoa',
        'AT': 'Austria',
        'AU': 'Australia',
        'AW': 'Aruba',
        'AZ': 'Azerbaijan',
        'BA': 'Bosnia and Herzegovina',
        'BB': 'Barbados',
        'BD': 'Bangladesh',
        'BE': 'Belgium',
        'BF': 'Burkina Faso',
        'BG': 'Bulgaria',
        'BH': 'Bahrain',
        'BI': 'Burundi',
        'BJ': 'Benin',
        'BM': 'Bermuda',
        'BN': 'Brunei Darussalam',
        'BO': 'Bolivia',
        'BR': 'Brazil',
        'BS': 'Bahamas',
        'BT': 'Bhutan',
        'BU': 'Burma',
        'BV': 'Bouvet Island',
        'BW': 'Botswana',
        'BY': 'Belarus',
        'BZ': 'Belize',
        'CA': 'Canada',
        'CC': 'Cocos Islands',
        'CD': 'Congo',
        'CF': 'Central African Republic',
        'CG': 'Congo',
        'CH': 'Switzerland',
        'CI': 'Cote D\'Ivoire',
        'CK': 'Cook Islands',
        'CL': 'Chile',
        'CM': 'Cameroon',
        'CN': 'China',
        'CO': 'Colombia',
        'CR': 'Costa Rica',
        'CS': 'Serbia and Montenegro',
        'CU': 'Cuba',
        'CV': 'Cape Verde',
        'CX': 'Christmas Island',
        'CY': 'Cyprus',
        'CZ': 'Czech Republic',
        'DE': 'Germany',
        'DJ': 'Djibouti',
        'DK': 'Denmark',
        'DM': 'Dominica',
        'DO': 'Dominican Republic',
        'DZ': 'Algeria',
        'EC': 'Ecuador',
        'EE': 'Estonia',
        'EG': 'Egypt',
        'EH': 'Western Sahara',
        'ER': 'Eritrea',
        'ES': 'Spain',
        'ET': 'Ethiopia',
        'FI': 'Finland',
        'FJ': 'Fiji',
        'FK': 'Falkland Islands',
        'FM': 'Micronesia',
        'FO': 'Faeroe Islands',
        'FR': 'France',
        'GA': 'Gabon',
        'GB': 'United Kingdom',
        'GD': 'Grenada',
        'GE': 'Georgia',
        'GF': 'French Guiana',
        'GH': 'Ghana',
        'GI': 'Gibraltar',
        'GL': 'Greenland',
        'GM': 'Gambia',
        'GN': 'Guinea',
        'GP': 'Guadaloupe',
        'GQ': 'Equatorial Guinea',
        'GR': 'Greece',
        'GS': 'South Georgia and the South Sandwich Islands',
        'GT': 'Guatemala',
        'GU': 'Guam',
        'GW': 'Guinea-Bissau',
        'GY': 'Guyana',
        'HK': 'Hong Kong',
        'HM': 'Heard and McDonald Islands',
        'HN': 'Honduras',
        'HR': 'Croatia',
        'HT': 'Haiti',
        'HU': 'Hungary',
        'ID': 'Indonesia',
        'IE': 'Ireland',
        'IL': 'Israel',
        'IN': 'India',
        'IO': 'British Indian Ocean Territory',
        'IQ': 'Iraq',
        'IR': 'Iran',
        'IS': 'Iceland',
        'IT': 'Italy',
        'JM': 'Jamaica',
        'JO': 'Jordan',
        'JP': 'Japan',
        'KE': 'Kenya',
        'KG': 'Kyrgyz Republic',
        'KH': 'Cambodia',
        'KI': 'Kiribati',
        'KM': 'Comoros',
        'KN': 'St. Kitts and Nevis',
        'KP': 'North Korea',
        'KR': 'South Korea',
        'KW': 'Kuwait',
        'KY': 'Cayman Islands',
        'KZ': 'Kazakhstan',
        'LA': 'Lao People\'s Democratic Republic',
        'LB': 'Lebanon',
        'LC': 'St. Lucia',
        'LI': 'Liechtenstein',
        'LK': 'Sri Lanka',
        'LR': 'Liberia',
        'LS': 'Lesotho',
        'LT': 'Lithuania',
        'LU': 'Luxembourg',
        'LV': 'Latvia',
        'LY': 'Libyan Arab Jamahiriya',
        'MA': 'Morocco',
        'MC': 'Monaco',
        'MD': 'Moldova',
        'ME': 'Montenegro',
        'MG': 'Madagascar',
        'MH': 'Marshall Islands',
        'MK': 'Macedonia',
        'ML': 'Mali',
        'MM': 'Myanmar',
        'MN': 'Mongolia',
        'MO': 'Macao',
        'MP': 'Northern Mariana Islands',
        'MQ': 'Martinique',
        'MR': 'Mauritania',
        'MS': 'Montserrat',
        'MT': 'Malta',
        'MU': 'Mauritius',
        'MV': 'Maldives',
        'MW': 'Malawi',
        'MX': 'Mexico',
        'MY': 'Malaysia',
        'MZ': 'Mozambique',
        'NA': 'Namibia',
        'NC': 'New Caledonia',
        'NE': 'Niger',
        'NF': 'Norfolk Island',
        'NG': 'Nigeria',
        'NI': 'Nicaragua',
        'NL': 'Netherlands',
        'NO': 'Norway',
        'NP': 'Nepal',
        'NR': 'Nauru',
        'NU': 'Niue',
        'NZ': 'New Zealand',
        'OM': 'Oman',
        'PA': 'Panama',
        'PE': 'Peru',
        'PF': 'French Polynesia',
        'PG': 'Papua New Guinea',
        'PH': 'Philippines',
        'PK': 'Pakistan',
        'PL': 'Poland',
        'PM': 'St. Pierre and Miquelon',
        'PN': 'Pitcairn Island',
        'PR': 'Puerto Rico',
        'PS': 'Palestinian Territory',
        'PT': 'Portugal',
        'PW': 'Palau',
        'PY': 'Paraguay',
        'QA': 'Qatar',
        'RE': 'Reunion',
        'RO': 'Romania',
        'RS': 'Serbia',
        'RU': 'Russia',
        'RW': 'Rwanda',
        'SA': 'Saudi Arabia',
        'SB': 'Solomon Islands',
        'SC': 'Seychelles',
        'SD': 'Sudan',
        'SE': 'Sweden',
        'SG': 'Singapore',
        'SH': 'St. Helena',
        'SI': 'Slovenia',
        'SJ': 'Svalbard & Jan Mayen Islands',
        'SK': 'Slovakia',
        'SL': 'Sierra Leone',
        'SM': 'San Marino',
        'SN': 'Senegal',
        'SO': 'Somalia',
        'SR': 'Suriname',
        'SS': 'South Sudan',
        'ST': 'Sao Tome and Principe',
        'SU': 'Soviet Union',
        'SV': 'El Salvador',
        'SY': 'Syrian Arab Republic',
        'SZ': 'Swaziland',
        'TC': 'Turks and Caicos Islands',
        'TD': 'Chad',
        'TF': 'French Southern Territories',
        'TG': 'Togo',
        'TH': 'Thailand',
        'TJ': 'Tajikistan',
        'TK': 'Tokelau',
        'TL': 'Timor-Leste',
        'TM': 'Turkmenistan',
        'TN': 'Tunisia',
        'TO': 'Tonga',
        'TP': 'East Timor',
        'TR': 'Turkey',
        'TT': 'Trinidad and Tobago',
        'TV': 'Tuvalu',
        'TW': 'Taiwan',
        'TZ': 'Tanzania',
        'UA': 'Ukraine',
        'UG': 'Uganda',
        'UM': 'United States Minor Outlying Islands',
        'US': 'United States of America',
        'UY': 'Uruguay',
        'UZ': 'Uzbekistan',
        'VA': 'Holy See',
        'VC': 'St. Vincent and the Grenadines',
        'VE': 'Venezuela',
        'VG': 'British Virgin Islands',
        'VI': 'US Virgin Islands',
        'VN': 'Vietnam',
        'VU': 'Vanuatu',
        'WF': 'Wallis and Futuna Islands',
        'WS': 'Samoa',
        'XC': 'Czechoslovakia',
        'XG': 'East Germany',
        'XI': 'Northern Ireland',
        'XK': 'Kosovo',
        'YE': 'Yemen',
        'YT': 'Mayotte',
        'YU': 'Yugoslavia',
        'ZA': 'South Africa',
        'ZM': 'Zambia',
        'ZR': 'Zaire',
        'ZW': 'Zimbabwe',
    };

    private languageMap: { [key: string]: string } = {
        'aa': 'Afar',
        'ab': 'Abkhazian',
        'ae': 'Avestan',
        'af': 'Afrikaans',
        'ak': 'Akan',
        'am': 'Amharic',
        'an': 'Aragonese',
        'ar': 'Arabic',
        'as': 'Assamese',
        'av': 'Avaric',
        'ay': 'Aymara',
        'az': 'Azerbaijani',
        'ba': 'Bashkir',
        'be': 'Belarusian',
        'bg': 'Bulgarian',
        'bi': 'Bislama',
        'bm': 'Bambara',
        'bn': 'Bengali',
        'bo': 'Tibetan',
        'br': 'Breton',
        'bs': 'Bosnian',
        'ca': 'Catalan',
        'ce': 'Chechen',
        'ch': 'Chamorro',
        'co': 'Corsican',
        'cr': 'Cree',
        'cs': 'Czech',
        'cu': 'Church Slavic',
        'cv': 'Chuvash',
        'cy': 'Welsh',
        'da': 'Danish',
        'de': 'German',
        'dv': 'Divehi',
        'dz': 'Dzongkha',
        'ee': 'Ewe',
        'el': 'Greek',
        'en': 'English',
        'eo': 'Esperanto',
        'es': 'Spanish',
        'et': 'Estonian',
        'eu': 'Basque',
        'fa': 'Persian',
        'ff': 'Fulah',
        'fi': 'Finnish',
        'fj': 'Fijian',
        'fo': 'Faroese',
        'fr': 'French',
        'fy': 'Western Frisian',
        'ga': 'Irish',
        'gd': 'Gaelic',
        'gl': 'Galician',
        'gn': 'Guarani',
        'gu': 'Gujarati',
        'gv': 'Manx',
        'ha': 'Hausa',
        'he': 'Hebrew',
        'hi': 'Hindi',
        'ho': 'Hiri Motu',
        'hr': 'Croatian',
        'ht': 'Haitian',
        'hu': 'Hungarian',
        'hy': 'Armenian',
        'hz': 'Herero',
        'ia': 'Interlingua',
        'id': 'Indonesian',
        'ie': 'Interlingue',
        'ig': 'Igbo',
        'ii': 'Sichuan Yi',
        'ik': 'Inupiaq',
        'io': 'Ido',
        'is': 'Icelandic',
        'it': 'Italian',
        'iu': 'Inuktitut',
        'ja': 'Japanese',
        'jv': 'Javanese',
        'ka': 'Georgian',
        'kg': 'Kongo',
        'ki': 'Kikuyu',
        'kj': 'Kuanyama',
        'kk': 'Kazakh',
        'kl': 'Kalaallisut',
        'km': 'Central Khmer',
        'kn': 'Kannada',
        'ko': 'Korean',
        'kr': 'Kanuri',
        'ks': 'Kashmiri',
        'ku': 'Kurdish',
        'kv': 'Komi',
        'kw': 'Cornish',
        'ky': 'Kirghiz',
        'la': 'Latin',
        'lb': 'Luxembourgish',
        'lg': 'Ganda',
        'li': 'Limburgan',
        'ln': 'Lingala',
        'lo': 'Lao',
        'lt': 'Lithuanian',
        'lu': 'Luba-Katanga',
        'lv': 'Latvian',
        'mg': 'Malagasy',
        'mh': 'Marshallese',
        'mi': 'Maori',
        'mk': 'Macedonian',
        'ml': 'Malayalam',
        'mn': 'Mongolian',
        'mr': 'Marathi',
        'ms': 'Malay',
        'mt': 'Maltese',
        'my': 'Burmese',
        'na': 'Nauru',
        'nb': 'Bokmål, Norwegian; Norwegian Bokmål',
        'nd': 'Ndebele, North; North Ndebele',
        'ne': 'Nepali',
        'ng': 'Ndonga',
        'nl': 'Dutch',
        'nn': 'Norwegian Nynorsk; Nynorsk, Norwegian',
        'no': 'Norwegian',
        'nr': 'Ndebele, South; South Ndebele',
        'nv': 'Navajo',
        'ny': 'Chichewa',
        'oc': 'Occitan',
        'oj': 'Ojibwa',
        'om': 'Oromo',
        'or': 'Oriya',
        'os': 'Ossetian',
        'pa': 'Panjabi',
        'pi': 'Pali',
        'pl': 'Polish',
        'ps': 'Pushto',
        'pt': 'Portuguese',
        'qu': 'Quechua',
        'rm': 'Romansh',
        'rn': 'Rundi',
        'ro': 'Romanian',
        'ru': 'Russian',
        'rw': 'Kinyarwanda',
        'sa': 'Sanskrit',
        'sc': 'Sardinian',
        'sd': 'Sindhi',
        'se': 'Northern Sami',
        'sg': 'Sango',
        'si': 'Sinhala',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'sm': 'Samoan',
        'sn': 'Shona',
        'so': 'Somali',
        'sq': 'Albanian',
        'sr': 'Serbian',
        'ss': 'Swati',
        'st': 'Sotho, Southern',
        'su': 'Sundanese',
        'sv': 'Swedish',
        'sw': 'Swahili',
        'ta': 'Tamil',
        'te': 'Telugu',
        'tg': 'Tajik',
        'th': 'Thai',
        'ti': 'Tigrinya',
        'tk': 'Turkmen',
        'tl': 'Tagalog',
        'tn': 'Tswana',
        'to': 'Tonga',
        'tr': 'Turkish',
        'ts': 'Tsonga',
        'tt': 'Tatar',
        'tw': 'Twi',
        'ty': 'Tahitian',
        'ug': 'Uighur',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'uz': 'Uzbek',
        've': 'Venda',
        'vi': 'Vietnamese',
        'vo': 'Volapük',
        'wa': 'Walloon',
        'wo': 'Wolof',
        'xh': 'Xhosa',
        'yi': 'Yiddish',
        'yo': 'Yoruba',
        'za': 'Zhuang',
        'zh': 'Chinese',
        'zu': 'Zulu',
    };

    private getCountryName(code: string): string {
        return this.countryMap[code] || code;
    }

    private getLanguageName(code: string): string {
        return this.languageMap[code] || code;
    }

    private async makeRequest(endpoint: string, params?: any): Promise<any> {
        const cacheKey = `${endpoint}_${JSON.stringify(params)}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        return retryWithBackoff(async () => {
            const url = `${this.baseUrl}/api/imdb${endpoint}`;
            const options = {
                method: 'GET',
                url: url,
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': 'imdb236.p.rapidapi.com'
                },
                params: params,
                timeout: 10000, // 10 seconds timeout
            };

            const response = await axios.request(options);

            this.cache.set(cacheKey, response.data);
            return response.data;
        }, 3, 1000);
    }

    private async makeRequestWithoutCache(endpoint: string, params?: any): Promise<any> {
        return retryWithBackoff(async () => {
            const url = `${this.baseUrl}/api/imdb${endpoint}`;
            const options = {
                method: 'GET',
                url: url,
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': 'imdb236.p.rapidapi.com'
                },
                params: params,
                timeout: 10000, // 10 seconds timeout
            };

            const response = await axios.request(options);
            return response.data;
        }, 3, 1000);
    }

    async searchMovies(query: string): Promise<SearchResult> {
        const data = await this.makeRequestWithoutCache('/autocomplete', {
            query: query
        });

        const movieResults = Array.isArray(data) ? data.filter(item => item.type === 'movie') : [];

        const result = {
            movies: this.transformMovies(movieResults),
            totalResults: movieResults.length,
            hasMore: false,
        };
        return result;
    }

    async advancedSearch(params: {
        query?: string;
        type?: 'movie' | 'tv' | 'all';
        genre?: string;
        country?: string;
        rows?: number;
        sortOrder?: 'ASC' | 'DESC';
        sortField?: string;
    }): Promise<SearchResult> {
        try {
            const response = await axios.get('https://imdb236.p.rapidapi.com/api/imdb/search', {
                params: {
                    ...(params.query && { query: params.query }),
                    ...(params.type && { type: params.type }),
                    ...(params.genre && { genre: params.genre }),
                    ...(params.country && { country: params.country }),
                    rows: params.rows || 25,
                    sortOrder: params.sortOrder || 'DESC',
                    sortField: params.sortField || 'averageRating',
                },
                headers: this.headers,
                timeout: 10000,
            });

            const data = response.data;
            const movies = Array.isArray(data) ? data : [];

            return {
                movies: this.transformMovies(movies),
                totalResults: movies.length,
                hasMore: movies.length >= (params.rows || 25),
            };
        } catch (error: any) {
            console.error('Advanced search error:', error);

            // Check if it's a network error
            if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
                const networkError = new Error('NETWORK_ERROR');
                networkError.name = 'NetworkError';
                throw networkError;
            }

            return {
                movies: [],
                totalResults: 0,
                hasMore: false,
            };
        }
    }

    async getAutocomplete(query: string): Promise<Array<{ id: string; title: string; year?: number; poster?: string }>> {
        try {
            const response = await axios.get('https://imdb236.p.rapidapi.com/api/imdb/autocomplete', {
                params: { query },
                headers: this.headers,
                timeout: 10000,
            });

            const data = response.data;
            if (Array.isArray(data)) {
                return data.map((item: any) => ({
                    id: item.id || '',
                    title: item.primaryTitle || item.title || '',
                    year: item.startYear || item.year,
                    poster: item.primaryImage || item.poster,
                }));
            }
            return [];
        } catch (error: any) {
            console.error('Autocomplete error:', error);

            // Check if it's a network error
            if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
                const networkError = new Error('NETWORK_ERROR');
                networkError.name = 'NetworkError';
                throw networkError;
            }

            return [];
        }
    }

    async getTop250Movies(): Promise<Movie[]> {
        const data = await this.makeRequest('/top250-movies');
        return this.transformMovies(data || []);
    }

    async getMostPopularMovies(): Promise<Movie[]> {
        const data = await this.makeRequest('/most-popular-movies');
        return this.transformMovies(data || []);
    }


    async getBoxOfficeMovies(): Promise<Movie[]> {
        const data = await this.makeRequest('/top-box-office');
        return this.transformMovies(data || []);
    }

    async getMovieDetails(imdbId: string): Promise<Movie> {
        const data = await this.makeRequest(`/${imdbId}`);
        return this.transformMovie(data);
    }

    async getMovieRating(imdbId: string): Promise<number> {
        const data = await this.makeRequest(`/rating/${imdbId}`);
        return data.rating || 0;
    }

    async getMovieCast(imdbId: string): Promise<Person[]> {
        const data = await this.makeRequest(`/cast/${imdbId}`);
        return this.transformPersons(data.cast || []);
    }

    async getMovieDirectors(imdbId: string): Promise<Person[]> {
        const data = await this.makeRequest(`/directors/${imdbId}`);
        return this.transformPersons(data.directors || []);
    }

    async getMovieWriters(imdbId: string): Promise<Person[]> {
        const data = await this.makeRequest(`/writers/${imdbId}`);
        return this.transformPersons(data.writers || []);
    }

    async getSimilarMovies(imdbId: string): Promise<Movie[]> {
        const data = await this.makeRequest(`/similar/${imdbId}`);
        return this.transformMovies(data.similar || []);
    }

    async getMoviePoster(imdbId: string): Promise<string> {
        // Get movie details and extract primaryImage
        const data = await this.makeRequest(`/api/imdb/${imdbId}`);
        return data.primaryImage || '';
    }

    async getGenres(): Promise<string[]> {
        const data = await this.makeRequest('/genres');
        return data.map((genre: any) => genre.name || genre) || [];
    }

    async getCountries(): Promise<string[]> {
        const data = await this.makeRequest('/countries');
        return data.map((country: any) => country.name || country) || [];
    }

    async getLanguages(): Promise<string[]> {
        const data = await this.makeRequest('/languages');
        return data.map((language: any) => language.name || language) || [];
    }

    async getPersonDetails(personId: string): Promise<Person> {
        const data = await this.makeRequest(`/person/${personId}`);
        return this.transformPerson(data);
    }

    async getPersonFilmography(personId: string): Promise<Movie[]> {
        const data = await this.makeRequest(`/person/${personId}/filmography`);
        return this.transformMovies(data.filmography || []);
    }

    private transformMovies(movies: any[]): Movie[] {
        return movies.map(movie => this.transformMovie(movie));
    }

    private transformMovie(movie: any): Movie {

        const allPeople = movie.cast || [];
        const directors = allPeople.filter((person: any) => person.job === 'director');
        const writers = allPeople.filter((person: any) => person.job === 'writer');
        const actors = allPeople.filter((person: any) =>
            person.job === 'actor' || person.job === 'actress'
        );

        const crew = allPeople.filter((person: any) =>
            person.job === 'producer' ||
            person.job === 'composer' ||
            person.job === 'cinematographer' ||
            person.job === 'editor' ||
            person.job === 'casting_director' ||
            person.job === 'production_designer'
        );

        const transformed = {
            id: movie.id || '',
            title: movie.primaryTitle || '',
            year: movie.startYear || 0,
            rating: movie.averageRating || 0,
            poster: movie.primaryImage || '',
            plot: movie.description || '',
            genres: processMovieGenres(movie.genres),
            ageRating: movie.contentRating || 'N/A',
            country: this.getCountryName(movie.countriesOfOrigin?.[0] || '') || 'United States',
            language: this.getLanguageName(movie.spokenLanguages?.[0] || '') || 'English',
            duration: movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : '',
            directors: this.transformPersons(directors),
            writers: this.transformPersons(writers),
            cast: this.transformPersons(actors),
            crew: this.transformPersons(crew),
            similarMovies: this.transformMovies(movie.similarMovies || []),
        };


        return transformed;
    }

    private transformPersons(persons: any[]): Person[] {
        return persons.map(person => this.transformPerson(person));
    }

    private transformPerson(person: any): Person {
        return {
            id: person.id || '',
            name: person.fullName || person.name || '',
            photo: person.primaryImage || person.photo || person.image || '',
            bio: person.bio || person.biography || '',
            character: person.characters?.[0] || person.job || '',
        };
    }
}

export const imdbApi = new ImdbApiClient();
