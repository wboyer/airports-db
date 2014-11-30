// Use MapReduce to index the airports data by code/name/city/country prefixes up to 10 characters in length.

db.runCommand(
    {
        mapReduce: "airports",

        map: function ()
        {
            function emitPrefixes(str, airport)
            {
                if (!str)
                    return;

                var substrings = [];
                var regexp = /\w+/g;
                var word;
                var s;

                for (word = regexp.exec(str); word; word = regexp.exec(str)) {
                    for (s in substrings)
                        substrings[s] += ' ' + word[0];
                    substrings.push(word[0]);
                }

                for (s in substrings)
                    for (var i = 1; (i < 10) && (i <= substrings[s].length); i++) {
                        var key = {"prefix": substrings[s].substring(0, i).toLowerCase()};

                        var match = {"code": airport.code};

                        if (airport.name)
                            match.name = airport.name;

                        if (airport.city)
                            match.city = airport.city;

                        if (airport.country)
                            match.country = airport.country;

                        var value = { "matches": [ match ]};

                        emit(key, value);
                    }

            }

            emitPrefixes(this.code, this);
            emitPrefixes(this.name, this);
            emitPrefixes(this.city, this);
            emitPrefixes(this.country, this);
        },

        reduce: function (key, values)
        {
            var matches = [];
            var uniqueCodes = {};

            for (var i in values) {
                var value = values[i];

                for (var j in value.matches) {
                    var match = value.matches[j];
                    if (!match)
                        continue;

                    var code = match.code;
                    if (uniqueCodes[code])
                        continue;
                    uniqueCodes[code] = true;

                    matches.push(match);
                }
            }

            return { "matches": matches };
        },

        out: { merge: "airports_index" }
    }
);
