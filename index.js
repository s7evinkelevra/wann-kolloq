const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
const express = require('express');
const parse = require('date-fns/parse');

const app = express();

const events_path = "./public/csv/events.CSV";
const event_data_path = "./public/csv/event_data.CSV"
const events = [];
const event_data = [];

const lastModified = fs.statSync(events_path).mtime.toLocaleString('de-DE');

fs.createReadStream(events_path)
  .pipe(iconv.decodeStream('latin-1'))
  .pipe(csv({ separator: ';'}))
  .on('data', (data) => events.push(data))
  .on('end', () => {
    console.log(events);
  });

fs.createReadStream(event_data_path)
  .pipe(iconv.decodeStream('latin-1'))
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => event_data.push(data))
  .on('end', () => {
    console.log(event_data);
  });


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// serve all the static stuffs
app.use(express.static('./public'));

app.get("/", (req, res) => {
  const sorted_events = _.sortBy(events, [(row) => {
    return parse(row.date, "dd.LL.yyyy", new Date())
  }])

  const past_events = _.filter(sorted_events, (row) => {
    const parsed = parse(row.date, "dd.LL.yyyy", new Date())
    return parsed < new Date();
  })

  const future_events = _.filter(sorted_events, (row) => {
    const parsed = parse(row.date, "dd.LL.yyyy", new Date())
    return parsed >= new Date();
  })

  res.render('pages/table', {
    data: {
      past_events,
      future_events,
    },
    meta: {
      lastModified
    },
    event_data
  });
})



// provider injects the desiered port or (if in dev env) 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT);

