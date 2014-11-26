db.runCommand(
    {
        mapReduce: "airports",

        map: function ()
        {
            emit("count", 1);
        },

        reduce: function (key, values)
        {
            return Array.sum(values);
        },

        out: { merge: "airports_index" }
    });

db.runCommand(
    {
        mapReduce: "airports",

        map: function ()
        {
            function emitPrefixes(str, airport)
            {
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
                        var key = JSON.parse('{"prefix" : "' + substrings[s].substring(0, i).toLowerCase() + '"}');
                        var value = JSON.parse('{"matches": [{"code": "' + airport.code + '","name": "' + airport.name + '","city": "' + airport.city + '","country": "' + airport.country + '"}]}');
                        emit(key, value);
                    }

            }

            emitPrefixes(this.code, this);
            emitPrefixes(this.name, this);
        },

        reduce: function (key, values)
        {
            var matches = [];

            for (var i in values) {
                var value = values[i];
                for (var j in value.matches)
                    matches.push(value.matches[j]);
            }

            return { "matches": matches };
        },

        out: { merge: "airports_index" }
    });
